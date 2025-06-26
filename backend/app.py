import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import razorpay
from pymongo import MongoClient
from datetime import datetime
from dateutil.relativedelta import relativedelta
import logging
import re
from urllib.parse import unquote

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

# ---------- MongoDB Setup ----------
mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(mongo_uri)
db = client['mimansa_database']
students_collection = db['students']
invoices_collection = db['invoices']

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

    new_invoices = []
    while (gen_year < current_year) or (gen_year == current_year and gen_month_index <= current_month_index):
        month_str = f"{month_names[gen_month_index]} {gen_year}"
        if not invoices_collection.find_one({"student_id": student_id, "month": month_str}):
            due_date = (datetime(gen_year, gen_month_index + 1, 1) + relativedelta(months=1, days=-1))
            new_invoice = {
                "student_id": student_id,
                "contact": contact,
                "invoice_number": f"INV-{gen_year}{gen_month_index+1:02d}",
                "month": month_str,
                "amount": 9500,
                "due_date": due_date.strftime('%Y-%m-%d'),
                "status": "pending",
                "payment_id": None
            }
            new_invoices.append(new_invoice)
        gen_month_index += 1
        if gen_month_index >= 12:
            gen_month_index = 0
            gen_year += 1

    if new_invoices:
        invoices_collection.insert_many(new_invoices)
    return len(new_invoices)

# ---------- Routes ----------
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
            'amount': int(amount * 100),  # amount in paise
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
    result = invoices_collection.update_one(
        {"invoice_number": invoice_number},
        {"$set": {
            "status": "paid",
            "payment_id": payment_id,
            "payment_date": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }}
    )
    if result.modified_count > 0:
        paid_invoice = invoices_collection.find_one({"invoice_number": invoice_number})
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
        all_invoices = list(invoices_collection.find({"contact": contact}))
        
        if not all_invoices:
            student = students_collection.find_one({"contact": contact})
            if not student:
                return jsonify({"last_paid_month": None, "pending_invoices": []})
            generate_invoices_to_current(
                student_id=student['student_id'],
                contact=contact,
                last_paid_month=None
            )
            all_invoices = list(invoices_collection.find({"contact": contact}))

        paid_invoices = [inv for inv in all_invoices if inv.get('status') == 'paid' and inv.get('payment_date')]
        last_paid_invoice = max(paid_invoices, key=lambda x: datetime.strptime(x['payment_date'], '%Y-%m-%d %H:%M:%S')) if paid_invoices else None

        if last_paid_invoice:
            generate_invoices_to_current(
                student_id=last_paid_invoice['student_id'],
                contact=contact,
                last_paid_month=last_paid_invoice['month']
            )
            all_invoices = list(invoices_collection.find({"contact": contact}))

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
        return jsonify({"error": str(e)}), 500

@app.route('/get-student-by-contact/<contact>', methods=['GET'])
def get_student_by_contact(contact):
    try:
        contact = unquote(contact).strip()
        student = students_collection.find_one({"contact": contact}, {"_id": 0})
        if student:
            return jsonify(student)
        return jsonify({"error": "Student not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/dump-invoices')
def dump_invoices():
    docs = list(invoices_collection.find({}, {"_id": 0}))
    return jsonify(docs)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
