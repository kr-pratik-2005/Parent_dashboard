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
import hmac
import hashlib
import base64
import json
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
if os.getenv("FLASK_ENV") == "production":
    ALLOWED_ORIGINS = [
        "https://admin.yourdomain.com",
        "https://parent-dashboard-chi.vercel.app"
    ]
else:
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://parent-dashboard-chi.vercel.app"
    ]

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
service_account_json = json.loads(os.environ['FIREBASE_SERVICE_ACCOUNT_JSON'])
cred = credentials.Certificate(service_account_json)
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
    if hasattr(date_value, 'to_datetime'):
        return date_value.to_datetime()
    elif isinstance(date_value, str):
        try:
            return datetime.strptime(date_value, '%Y-%m-%d %H:%M:%S')
        except:
            return datetime.strptime(date_value, '%Y-%m-%d')
    elif isinstance(date_value, datetime):
        return date_value
    else:
        raise ValueError(f"Unsupported date type: {type(date_value)}")

# ---------- Firestore Operations ----------
def get_pending_invoices(contact):
    invoices_ref = db.collection('fees')
    query = invoices_ref.where('contact', '==', contact).where('paid', '==', False)
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
            'paid': True,
            'payment_id': payment_id,
            'payment_date': firestore.SERVER_TIMESTAMP,
            'razorpay_invoice_link': None
        })
        return True
    return False

# ---------- Razorpay Webhook ----------


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
    return jsonify({"success": success})

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
        if 'paid' not in data:
            data['paid'] = False
        invoices.append(data)
    return jsonify(invoices)

@app.route('/get-students-by-contact/<contact>', methods=['GET'])
def get_students_by_contact(contact):
    try:
        if contact.startswith("+91"):
            contact = contact[3:]
        elif contact.startswith("+"):
            contact = contact[1:]
        contact = contact.strip()
        students_ref = db.collection("students")
        query = students_ref.where("contact", "==", contact)
        results = query.get()
        students = [doc.to_dict() for doc in results]
        return jsonify(students)
    except Exception as e:
        logger.error(f"Error in get_students_by_contact: {str(e)}")
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

@app.route('/generate-fees-invoices', methods=['POST', 'GET'])
def generate_fees_invoices():
    from datetime import datetime
    from google.cloud import firestore
    import razorpay

    month_names = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]

    def get_next_month(month_name):
        try:
            idx = month_names.index(month_name)
            next_idx = (idx + 1) % 12
            year = datetime.now().year
            if next_idx == 0 and idx == 11:
                year += 1
            return f"{month_names[next_idx]} {year}"
        except:
            return None

    try:
        students_ref = db.collection("students").stream()
        created_invoices = []

        for doc in students_ref:
            student = doc.to_dict()
            student_id = student.get("student_id")
            contact = student.get("contact")
            name = student.get("name")
            last_paid = student.get("last_paid_month")

            if not student_id or not contact or not last_paid:
                continue

            # Determine next month
            month_str = get_next_month(last_paid)
            if not month_str:
                continue

            # Prevent duplicates
            existing = db.collection("fees") \
                .where("student_id", "==", student_id) \
                .where("month", "==", month_str).get()

            if existing:
                continue

            # Create Razorpay invoice
            invoice = razorpay_client.invoice.create({
                "type": "link",
                "description": f"Tuition fees for {month_str}",
                "customer": {
                    "name": name,
                    "contact": f"+91{contact}"
                },
                "amount": 950000,  # ₹9500 in paise
                "currency": "INR",
                "receipt": f"#INV{student_id[-4:]}{month_str[:3].upper()}",
                "reminder_enable": True
            })
            time.sleep(1)  # Pause to avoid rate limiting

            db.collection("fees").add({
                "student_id": student_id,
                "contact": contact,
                "invoice_number": f"#INV{student_id[-4:]}{month_str[:3].upper()}",
                "month": month_str,
                "fee": 9500,
                "razorpay_invoice_id": invoice['id'],
                "razorpay_invoice_link": invoice['short_url'],
                "sent": True,
                "paid": False,
                "overdue": False,
                "created_at": firestore.SERVER_TIMESTAMP
            })

            created_invoices.append({
                "student_id": student_id,
                "month": month_str,
                "invoice_number": f"#INV{student_id[-4:]}{month_str[:3].upper()}"
            })

        return jsonify({
            "success": True,
            "generated_count": len(created_invoices),
            "invoices": created_invoices
        })

    except Exception as e:
        logger.error(f"Error in generate_fees_invoices: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/create_payment_link", methods=["POST"])
def create_payment_link():
    try:
        data = request.get_json()
        name = data["name"]
        amount = int(data["amount"]) * 100  # convert to paise
        email = data.get("email", "")
        contact = data.get("contact", "")
        notes = data.get("notes", {})  # <-- Accept notes from frontend

        # Create Razorpay payment link
        payment_link = razorpay_client.payment_link.create({
            "amount": amount,
            "currency": "INR",
            "accept_partial": False,
            "description": f"Fees Payment for {name}",
            "customer": {
                "name": name,
                "email": email,
                "contact": contact
            },
            "notify": {
                "sms": True,
                "email": True
            },
            "notes": notes,  # <-- Pass notes to Razorpay
            "callback_url": "https://example.com/payment-success",
            "callback_method": "get"
        })

        return jsonify(payment_link), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/razorpayWebhook", methods=["POST"])
def razorpay_webhook():
    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
    request_data = request.get_data()
    received_signature = request.headers.get("X-Razorpay-Signature")
    print("Received Razorpay request data:", request_data)

    if not webhook_secret or not received_signature:
        print("Missing webhook secret or signature header.")
        return jsonify({"error": "Webhooks not properly set"}), 403

    expected_signature = hmac.new(
        webhook_secret.encode('utf-8'),
        msg=request_data,
        digestmod=hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(received_signature, expected_signature):
        print("❌ Invalid webhook signature.")
        return jsonify({"error": "Invalid signature"}), 400

    # Parse payload
    payload = request.get_json()
    if not payload:
        print("❌ No payload in request.")
        return jsonify({"error": "No payload"}), 400

    print("Received Razorpay payload:", payload)
    event = payload.get("event")

    supported_events = ["payment.link.paid", "payment.captured", "payment_link.captured"]
    if event not in supported_events:
        print("⚠️ Unsupported event received:", event)
        return jsonify({"status": "ignored"}), 200

    # Extract notes and identifiers
    notes = None
    payment_link_id = None
    amount = None

    try:
        if event == "payment.link.paid":
            entity = payload["payload"]["payment_link"]["entity"]
            notes = entity.get("notes", {})
            payment_link_id = entity.get("id")
            amount = entity.get("amount_paid", 0) / 100
        else:  # payment.captured or payment_link.captured
            entity = payload["payload"]["payment"]["entity"]
            notes = entity.get("notes", {})
            payment_link_id = entity.get("id")
            amount = entity.get("amount", 0) / 100
    except Exception as e:
        print("❌ Error extracting data:", str(e))
        return jsonify({"error": "Parsing failed"}), 400

    student_id = notes.get("student_id") if notes else None
    month = notes.get("month") if notes else None

    if not student_id or not month:
        print("⚠️ Missing student_id or month in notes.")
        return jsonify({"error": "Missing data in notes"}), 400

    doc_id = f"{student_id}-{month}"
    print(f"📄 Updating Firestore document: {doc_id}")

    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate("path/to/firebase-service-account.json")
            firebase_admin.initialize_app(cred)
        db = firestore.client()

        fee_doc_ref = db.collection("fees").document(doc_id)
        fee_doc_ref.set({
            "paid": True,
            "paidAt": datetime.utcnow(),
            "razorpay_payment_link_id": payment_link_id,
            "amount": amount
        }, merge=True)

        print(f"✅ Firestore updated for {doc_id}")
        return jsonify({"status": "success"}), 200

    except Exception as e:
        print("🔥 Firestore update failed:", str(e))
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)