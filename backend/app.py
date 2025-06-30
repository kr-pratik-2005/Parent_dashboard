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

# ---------- CORS Middleware ----------
ALLOWED_ORIGINS = ["http://localhost:3000", "https://parent-dashboard-chi.vercel.app"]

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
    invoices_ref = db.collection('invoices')
    query = invoices_ref.where('contact', '==', contact).where('status', '==', 'pending')
    return [doc.to_dict() for doc in query.stream()]

def get_all_invoices(contact):
    invoices_ref = db.collection('invoices')
    query = invoices_ref.where('contact', '==', contact)
    return [doc.to_dict() for doc in query.stream()]

def update_invoice_status(invoice_number, payment_id):
    invoices_ref = db.collection('invoices')
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
    invoices_ref = db.collection('invoices')
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
        pending_invoices = get_pending_invoices(mobile)
        unpaid_months = [inv['month'] for inv in pending_invoices]
        return jsonify({
            'success': True,
            'unpaidMonths': unpaid_months
        })
    except Exception as e:
        logger.error(f"Error in get_unpaid_months: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

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
    data = request.json
    invoice_number = data.get('invoice_number')
    payment_id = data.get('payment_id')
    
    success = update_invoice_status(invoice_number, payment_id)
    if success:
        invoices_ref = db.collection('invoices')
        query = invoices_ref.where('invoice_number', '==', invoice_number).limit(1).stream()
        paid_invoice = None
        for doc in query:
            paid_invoice = doc.to_dict()
            break
        if paid_invoice:
            generate_invoices_to_current(
                student_id=paid_invoice['student_id'],
                contact=paid_invoice['contact'],
                last_paid_month=paid_invoice['month']
            )
        return jsonify({"success": True})
    return jsonify({"success": False}), 400

@app.route('/get-pending-after-payment/<contact>', methods=['GET'])
def get_pending_after_payment(contact):
    try:
        contact = unquote(contact).strip()
        all_invoices = get_all_invoices(contact)
        if not all_invoices:
            students_ref = db.collection('students')
            query = students_ref.where('contact', '==', contact).limit(1).stream()
            student = None
            for doc in query:
                student = doc.to_dict()
                break
            if not student:
                return jsonify({"last_paid_month": None, "pending_invoices": []})
            generate_invoices_to_current(
                student_id=student['student_id'],
                contact=contact,
                last_paid_month=None
            )
            all_invoices = get_all_invoices(contact)

        paid_invoices = [inv for inv in all_invoices if inv.get('status') == 'paid' and inv.get('payment_date')]
        last_paid_invoice = None
        if paid_invoices:
            last_paid_invoice = max(paid_invoices, key=lambda x: convert_to_datetime(x['payment_date']))

        if last_paid_invoice:
            generate_invoices_to_current(
                student_id=last_paid_invoice['student_id'],
                contact=contact,
                last_paid_month=last_paid_invoice['month']
            )
            all_invoices = get_all_invoices(contact)

        if last_paid_invoice:
            last_paid_key = month_to_sort_key(last_paid_invoice['month'])
            pending_invoices = [
                inv for inv in all_invoices
                if inv['status'] == 'pending' and month_to_sort_key(inv['month']) > last_paid_key
            ]
        else:
            pending_invoices = [inv for inv in all_invoices if inv['status'] == 'pending']

        pending_invoices.sort(key=lambda x: month_to_sort_key(x['month']))

        return jsonify({
            "last_paid_month": last_paid_invoice['month'] if last_paid_invoice else None,
            "pending_invoices": [
                {
                    "invoice_number": inv.get("invoice_number"),
                    "month": inv.get("month"),
                    "amount": inv.get("amount"),
                    "due_date": inv.get("due_date"),
                    "status": inv.get("status")
                } for inv in pending_invoices
            ]
        })
    except Exception as e:
        logger.error(f"Error in get_pending_after_payment: {str(e)}")
        return jsonify({"error": str(e)}), 500

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
    invoices_ref = db.collection('invoices')
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
        date = request.args.get('date')  # e.g., "2025-05-02"
        if not date:
            return jsonify({"error": "Date is required"}), 400

        # Fetch attendance for that student on that date
        doc_ref = db.collection("attendance").document(student_id).collection("records").document(date)
        doc = doc_ref.get()

        if doc.exists:
            return jsonify(doc.to_dict())
        else:
            return jsonify({"status": "absent"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
