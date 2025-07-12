import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import razorpay
import logging
from datetime import datetime
from urllib.parse import unquote
import firebase_admin
from firebase_admin import credentials, firestore
from dateutil.relativedelta import relativedelta
from flask_cors import CORS
from google.cloud.firestore_v1 import DocumentSnapshot
from config import Config
from flask_mail import Mail, Message

# ---------- Logging Setup ----------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# ---------- Load Environment Variables ----------
load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)
mail = Mail(app)

# ---------- CORS Middleware ----------
ALLOWED_ORIGINS = ["http://localhost:3000",   # Admin site
    "http://localhost:3001",   # Parent Dashboard (you missed this)
    "https://parent-dashboard-chi.vercel.app" ]

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        origin = request.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 200

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

# ---------- Firebase Setup ----------
cred = credentials.Certificate(os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', 'serviceAccountKey.json'))
firebase_admin.initialize_app(cred)
db = firestore.client()

# ---------- Razorpay Setup ----------
razorpay_client = razorpay.Client(
    auth=(os.getenv('RAZORPAY_KEY_ID'), os.getenv('RAZORPAY_KEY_SECRET'))
)

# ---------- Helper Functions ----------
def month_to_sort_key(month_str):
    month_names = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]
    try:
        month, year = month_str.split()
        month_index = month_names.index(month) + 1
        return (int(year), month_index)
    except Exception as e:
        logger.error(f"Error converting month '{month_str}': {str(e)}")
        return (0, 0)

def convert_to_datetime(date_value):
    """Convert Firestore timestamp or string to datetime object"""
    if hasattr(date_value, 'to_datetime'):
        return date_value.to_datetime()
    elif isinstance(date_value, str):
        return datetime.strptime(date_value, '%Y-%m-%d %H:%M:%S')
    elif isinstance(date_value, datetime):
        return date_value
    else:
        raise ValueError(f"Unsupported date type: {type(date_value)}")

# ---------- Firestore Operations ----------
def get_pending_invoices(contact):
    invoices_ref = db.collection('fees')
    query = invoices_ref.where('contact', '==', contact).where('status', '==', 'pending')
    return [doc.to_dict() for doc in query.stream()]

def get_all_invoices(contact):
    invoices_ref = db.collection('fees')
    query = invoices_ref.where('contact', '==', contact)
    return [doc.to_dict() for doc in query.stream()]

def update_invoice_status(invoice_number, payment_id):
    invoices_ref = db.collection('fees')
    query = invoices_ref.where('invoice_number', '==', invoice_number).limit(1).stream()
    for doc in query:
        doc_ref = invoices_ref.document(doc.id)
        doc_ref.update({
            'status': 'paid',
            'payment_id': payment_id,
            'payment_date': firestore.SERVER_TIMESTAMP
        })
        return True
    return False

def generate_invoices_to_current(student_id, contact, last_paid_month=None):
    month_names = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]
    now = datetime.now()
    current_year = now.year
    current_month_index = now.month - 1

    if last_paid_month:
        paid_month, paid_year = last_paid_month.split()
        gen_year = int(paid_year)
        gen_month_index = month_names.index(paid_month)
        gen_month_index += 1
        if gen_month_index >= 12:
            gen_month_index = 0
            gen_year += 1
    else:
        gen_year = current_year
        gen_month_index = 0

    logger.info(f"Generating invoices from {month_names[gen_month_index]} {gen_year} to {month_names[current_month_index]} {current_year}")
    invoices_ref = db.collection('fees')
    new_invoices = []

    while (gen_year < current_year) or (gen_year == current_year and gen_month_index <= current_month_index):
        month_str = f"{month_names[gen_month_index]} {gen_year}"
        query = invoices_ref.where('student_id', '==', student_id).where('month', '==', month_str).limit(1).stream()
        exists = any(True for _ in query)
        if not exists:
            due_date = (datetime(gen_year, gen_month_index + 1, 1) + relativedelta(months=1, days=-1))
            new_invoice = {
                'student_id': student_id,
                'contact': contact,
                'invoice_number': f"INV-{gen_year}{gen_month_index+1:02d}",
                'month': month_str,
                'amount': 9500,
                'due_date': due_date.strftime('%Y-%m-%d'),
                'status': 'pending',
                'payment_id': None
            }
            new_invoices.append(new_invoice)
        gen_month_index += 1
        if gen_month_index >= 12:
            gen_month_index = 0
            gen_year += 1

    if new_invoices:
        batch = db.batch()
        for invoice in new_invoices:
            doc_ref = invoices_ref.document()
            batch.set(doc_ref, invoice)
        batch.commit()
    return len(new_invoices)

# ---------- API Routes ----------
@app.route('/api/unpaid-months/<mobile>', methods=['GET'])
def get_unpaid_months(mobile):
    try:
        mobile = unquote(mobile).strip()

        # Fetch student based on parent's mobile number
        students_ref = db.collection('students')
        query = students_ref.where('contact', '==', mobile).limit(1).stream()
        student_doc = next(query, None)

        if not student_doc:
            return jsonify({'success': False, 'message': 'Student not found'}), 404

        student = student_doc.to_dict()
        last_paid_month = student.get('last_paid_month')

        if not last_paid_month:
            return jsonify({'success': False, 'message': 'last_paid_month not available'}), 400

        # Define months list
        month_names = ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"]

        # Assume last_paid_month is in current year
        current_year = datetime.now().year
        current_month_index = datetime.now().month - 1
        last_paid_index = month_names.index(last_paid_month)

        # Build unpaid months from (last_paid_index + 1) to current month
        unpaid_months = []
        for i in range(last_paid_index + 1, current_month_index + 1):
            unpaid_months.append(f"{month_names[i]} {current_year}")

        return jsonify({'success': True, 'unpaidMonths': unpaid_months})

    except Exception as e:
        logger.error(f"Error in get_unpaid_months: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500



@app.route('/create-order', methods=['POST'])
def create_order():
    try:
        data = request.json
        amount = data.get('amount')
        logger.info(f"Received amount from frontend: {amount}")
        logger.info(f"Sending amount to Razorpay (in paise): {int(amount * 100)}")

        if not isinstance(amount, (int, float)) or amount <= 0:
            return jsonify({"error": "Invalid amount"}), 400
        
        order = razorpay_client.order.create({
            'amount': int(amount * 100),
            'currency': 'INR',
            'payment_capture': 1
        })
        
        return jsonify({
            "order_id": order["id"],
            "amount": int(amount*100),
            "currency": "INR",
            "key": os.getenv("RAZORPAY_KEY_ID")
        })
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        return jsonify({"error": "Payment processing failed"}), 500

@app.route('/update-payment-status', methods=['POST'])
def update_payment_status():
    try:
        data = request.json
        invoice_number = data.get('invoice_number')
        payment_id = data.get('payment_id')

        if not invoice_number or not payment_id:
            return jsonify({"success": False, "message": "Missing invoice_number or payment_id"}), 400

        fees_ref = db.collection('fees')
        query = fees_ref.where('invoice_number', '==', invoice_number).limit(1).stream()

        doc_id = None
        fee_data = None

        for doc in query:
            doc_id = doc.id
            fee_data = doc.to_dict()
            break

        if not doc_id or not fee_data:
            return jsonify({"success": False, "message": "Invoice not found"}), 404

        # ✅ Update the fees document
        fees_ref.document(doc_id).update({
            "paid": True,
            "payment_id": payment_id,
            "payment_date": firestore.SERVER_TIMESTAMP
        })

        # ✅ Update last_paid_month in students collection
        student_id = fee_data.get('student_id')
        paid_month = fee_data.get('month')  # example: "July 2025"
        if student_id and paid_month:
            students_ref = db.collection('students')
            student_query = students_ref.where('student_id', '==', student_id).limit(1).stream()
            for student_doc in student_query:
                students_ref.document(student_doc.id).update({
                    "last_paid_month": paid_month.split()[0]  # only the month name (e.g., "July")
                })
                break

        return jsonify({"success": True, "message": "Payment status updated and student record updated."})

    except Exception as e:
        logger.error(f"Error in update_payment_status: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/get-pending-after-payment/<contact>', methods=['GET'])
def get_pending_after_payment(contact):
    try:
        contact = unquote(contact).strip()

        # Get student record
        students_ref = db.collection('students')
        query = students_ref.where('contact', '==', contact).limit(1).stream()
        student_doc = next(query, None)

        if not student_doc:
            return jsonify({"success": False, "message": "Student not found"}), 404

        student = student_doc.to_dict()
        last_paid_month = student.get('last_paid_month')  # e.g. "May"

        if not last_paid_month:
            return jsonify({"success": False, "message": "No last_paid_month found"}), 400

        month_names = ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"]

        # ---- Setup month calculations ----
        try:
            start_index = month_names.index(last_paid_month.strip())
        except ValueError:
            return jsonify({"success": False, "message": "Invalid last_paid_month"}), 400

        current_month_index = datetime.now().month - 1
        current_year = datetime.now().year

        # If last_paid_month is same as current, nothing pending
        if start_index >= current_month_index:
            return jsonify({
                "success": True,
                "last_paid_month": last_paid_month,
                "pending_invoices": []
            })

        # ---- Create invoice list from (last_paid_month + 1) to current month ----
        pending_invoices = []
        for i in range(start_index + 1, current_month_index + 1):
            month_str = f"{month_names[i]} {current_year}"
            invoice_number = f"INV-{current_year}{i+1:02d}-{student['student_id']}"
            due_date = datetime(current_year, i+1, 1).strftime('%Y-%m-%d')

            pending_invoices.append({
                "invoice_number": invoice_number,
                "month": month_str,
                "amount": student.get('fees', 9500),
                "due_date": due_date,
                "status": "pending"
            })

        return jsonify({
            "success": True,
            "last_paid_month": last_paid_month,
            "pending_invoices": pending_invoices
        })

    except Exception as e:
        logger.error(f"Error in get_pending_after_payment: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/get-student-by-contact/<contact>', methods=['GET'])
def get_student_by_contact(contact):
    try:
        contact = unquote(contact).strip()
        students_ref = db.collection('students')
        query = students_ref.where('contact', '==', contact).limit(1).stream()
        student = None
        for doc in query:
            student = doc.to_dict()
            break
        if student:
            return jsonify(student)
        return jsonify({"error": "Student not found"}), 404
    except Exception as e:
        logger.error(f"Error in get_student_by_contact: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/dump-invoices')
def dump_invoices():
    invoices_ref = db.collection('fees')
    docs = invoices_ref.stream()
    invoices = [doc.to_dict() for doc in docs]
    return jsonify(invoices)

@app.route('/get_parent_name', methods=['POST'])
def get_parent_name():
    try:
        data = request.get_json()
        phone_number = data.get('phoneNumber')
        if not phone_number:
            return jsonify({"name": "Parent"})
        clean_number = phone_number
        if clean_number.startswith("+91"):
            clean_number = clean_number[3:]
        elif clean_number.startswith("+"):
            clean_number = clean_number[1:]
        print("Clean number for query:", clean_number)
        students_ref = db.collection("students")
        query = students_ref.where("contact", "==", clean_number).limit(1)
        results = query.get()
        if not results:
            return jsonify({"name": "Parent"})
        student_data = results[0].to_dict()
        parent_name = student_data.get("parent_name", "Parent")
        return jsonify({"name": parent_name})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-students-by-contact/<contact>', methods=['GET'])
def get_students_by_contact(contact):
    try:
        print("📞 Incoming contact:", contact)

        # Clean contact number
        if contact.startswith("+91"):
            contact = contact[3:]
        elif contact.startswith("+"):
            contact = contact[1:]

        contact = contact.strip()
        print("🔍 Cleaned contact:", contact)

        students_ref = db.collection("students")
        query = students_ref.where("contact", "==", contact)
        results = query.get()

        students = [doc.to_dict() for doc in results]
        print("📦 Found students:", students)

        return jsonify(students)
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500



@app.route('/get-student-by-id/<student_id>')
def get_student_by_id(student_id):
    ref = db.collection("students").where("student_id", "==", student_id).limit(1).stream()
    for doc in ref:
        return jsonify(doc.to_dict())
    return jsonify({"error": "Student not found"}), 404


@app.route('/api/report-status/<student_id>', methods=['GET'])
def get_report_status(student_id):
    try:
        date = request.args.get('date')
        if not date:
            return jsonify({'error': 'Date is required'}), 400

        # Look for an entry in attendance or daily_report
        date_str = date.strip()

        # Check attendance first
        attendance_ref = db.collection("attendance").document(date_str).collection("records")
        doc = attendance_ref.document(student_id).get()
        if doc.exists:
            attendance_data = doc.to_dict()
            status = attendance_data.get("status", "").lower()
            if status == "present":
                return jsonify({"status": "present"})
            elif status == "absent":
                return jsonify({"status": "absent"})

        # Optional: check if date is marked as holiday
        holiday_ref = db.collection("holidays").document(date_str)
        if holiday_ref.get().exists:
            return jsonify({"status": "holiday"})

        return jsonify({"status": "absent"})  # Default fallback
    except Exception as e:
        logger.error(f"Error in get_report_status: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/get-attendance-report/<student_id>', methods=['GET'])
def get_attendance_report(student_id):
    try:
        date = request.args.get('date')
        if not date:
            return jsonify({"error": "Date is required"}), 400

        doc_id = f"{student_id}_{date}"
        print(f"DEBUG: Looking for attendance_records document ID: '{doc_id}'")
        doc_ref = db.collection("attendance_records").document(doc_id)
        doc = doc_ref.get()

        if doc.exists:
            print(f"DEBUG: Found document for {doc_id}")
            return jsonify(doc.to_dict())
        else:
            print(f"DEBUG: No document found for {doc_id}")
            return jsonify({"status": "absent"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/submit-leave-request', methods=['POST'])
def submit_leave_request():
    try:
        data = request.json
        leave_requests_ref = firestore.client().collection('leave_requests')
        leave_requests_ref.add(data)
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/get-all-attendance/<student_id>', methods=['GET'])
def get_all_attendance(student_id):
    try:
        attendance_ref = db.collection('attendance_records')
        query = attendance_ref.where('student_id', '==', student_id)
        records = []
        for doc in query.stream():
            data = doc.to_dict()
            records.append({
                "date": data.get("date"),
                "status": data.get("status"),
                "time_in": data.get("time_in"),
                "time_out": data.get("time_out"),
            })
        # Sort by date (optional)
        records.sort(key=lambda x: x["date"], reverse=True)
        return jsonify({"records": records})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-parent-profile/<contact>', methods=['GET'])
def get_parent_profile(contact):
    try:
        # Clean phone number
        if contact.startswith("+91"):
            contact = contact[3:]
        elif contact.startswith("+"):
            contact = contact[1:]
        contact = contact.strip()

        # Search in students collection
        students_ref = db.collection("students")
        query = students_ref.where("contact", "==", contact).limit(1).stream()

        for doc in query:
            data = doc.to_dict()
            return jsonify({
                "fatherName": data.get("father_name", ""),
                "fatherContact": data.get("father_contact", ""),
                "motherName": data.get("mother_name", ""),
                "motherContact": data.get("mother_contact", ""),
                "address": data.get("address", ""),
                "profileImage": data.get("profile_image", ""),
            })

        return jsonify({}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# In app.py
@app.route('/get-child-profile/<student_id>', methods=['GET'])
def get_child_profile(student_id):
    try:
        students_ref = db.collection("students")
        doc = students_ref.document(student_id).get()
        if doc.exists:
            data = doc.to_dict()
            return jsonify({
                "profileImage": data.get("profile_image", ""),
                "name": data.get("name", ""),
                "dob": data.get("dob", ""),
                "bloodGroup": data.get("blood_group", ""),
                "nickName": data.get("nick_name", ""),
            })
        return jsonify({}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/update-child-profile/<student_id>', methods=['POST'])
def update_child_profile(student_id):
    try:
        data = request.json
        students_ref = db.collection("students")
        doc_ref = students_ref.document(student_id)
        doc_ref.update({
            "profile_image": data.get("profileImage", ""),
            "name": data.get("name", ""),
            "dob": data.get("dob", ""),
            "blood_group": data.get("bloodGroup", ""),
            "nick_name": data.get("nickName", ""),
        })
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
@app.route('/update-parent-profile/<contact>', methods=['POST'])
def update_parent_profile(contact):
    try:
        # Clean up contact number if needed
        if contact.startswith("+91"):
            contact = contact[3:]
        elif contact.startswith("+"):
            contact = contact[1:]
        contact = contact.strip()
        data = request.json
        students_ref = db.collection("students")
        # Find the first student with this contact (assuming one parent per contact)
        query = students_ref.where("contact", "==", contact).limit(1).stream()
        updated = False
        for doc in query:
            doc.reference.update({
                "father_name": data.get("fatherName", ""),
                "father_contact": data.get("fatherContact", ""),
                "mother_name": data.get("motherName", ""),
                "mother_contact": data.get("motherContact", ""),
                "address": data.get("address", ""),
                "profile_image": data.get("profileImage", ""),
            })
            updated = True
        if updated:
            return jsonify({"success": True}), 200
        return jsonify({"success": False, "error": "Parent not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/get-fees-by-student/<student_id>', methods=['GET'])
def get_fees_by_student(student_id):
    contact = request.args.get('contact', '').strip()
    fees_ref = db.collection('fees')
    query = fees_ref.where('student_id', '==', student_id)
    if contact:
        query = query.where('contact', '==', contact)
    invoices = []
    for doc in query.stream():
        data = doc.to_dict()
        # Ensure 'paid' field exists for each invoice
        if 'paid' not in data:
            data['paid'] = False
        invoices.append(data)
    return jsonify(invoices)

@app.route('/api/messages/send', methods=['POST'])
def send_message():
    data = request.get_json()
    from_id = data.get('from')
    content = data.get('content')
    timestamp = data.get('timestamp')

    # Compose email
    subject = f"New Message from {from_id}"
    body = f"Message: {content}\nSent at: {timestamp}"

    try:
        msg = Message(subject=subject,
                      recipients=['destination@gmail.com'],  # Replace with the fixed Gmail address
                      body=body)
        mail.send(msg)
        return jsonify({'success': True, 'message': 'Email sent!'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
