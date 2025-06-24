import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import razorpay
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from dateutil.relativedelta import relativedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)

# CORS setup
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# MongoDB setup
mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(mongo_uri)
db = client['mimansa_database']
students_collection = db['students']
invoices_collection = db['invoices']

# Razorpay setup
razorpay_client = razorpay.Client(
    auth=(os.getenv('RAZORPAY_KEY_ID'), os.getenv('RAZORPAY_KEY_SECRET'))
)

# Helper functions
def month_to_sort_key(month_str):
    """Convert 'April 2025' to sortable key (2025, 4)"""
    month_names = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]
    try:
        month, year = month_str.split()
        return (int(year), month_names.index(month) + 1)
    except:
        return (0, 0)  # Fallback
@app.route('/')
def health_check():
    return "Backend is running!", 200

def generate_invoices_to_current(student_id, contact, last_paid_month):
    """Generate invoices from last_paid+1 to current month"""
    month_names = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]

    # Parse last paid month
    paid_month, paid_year = last_paid_month.split()
    paid_year = int(paid_year)
    paid_month_index = month_names.index(paid_month)

    now = datetime.now()
    current_year = now.year
    current_month_index = now.month - 1  # 0-based index

    new_invoices = []

    # Start from next month after last paid
    gen_year = paid_year
    gen_month_index = paid_month_index + 1
    if gen_month_index >= 12:
        gen_month_index = 0
        gen_year += 1

    while (gen_year < current_year) or (gen_year == current_year and gen_month_index <= current_month_index):
        month_str = f"{month_names[gen_month_index]} {gen_year}"

        # Only create if it doesn't exist
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

        # Move to next month
        gen_month_index += 1
        if gen_month_index >= 12:
            gen_month_index = 0
            gen_year += 1

    if new_invoices:
        invoices_collection.insert_many(new_invoices)
    return len(new_invoices)

# API Endpoints
@app.route('/create-order', methods=['POST'])
def create_order():
    try:
        data = request.json
        amount = data.get('amount')
        if not isinstance(amount, (int, float)) or amount <= 0:
            return jsonify({"error": "Invalid amount"}), 400
        order = razorpay_client.order.create({
            'amount': int(amount * 100),
            'currency': 'INR',
            'payment_capture': 1
        })
        return jsonify(order)
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
            # Only generate up to current month
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
        logger.info(f"Fetching pending invoices for contact: {contact}")
        
        # Get all invoices for contact
        all_invoices = list(invoices_collection.find({"contact": contact}, {"_id": 0}))
        
        if not all_invoices:
            return jsonify([])
        
        # Find last paid invoice
        last_paid = None
        paid_invoices = [inv for inv in all_invoices if inv.get('status') == 'paid']
        
        if paid_invoices:
            # Get most recent paid invoice
            last_paid = max(paid_invoices, key=lambda x: 
                datetime.strptime(x.get('payment_date', '2000-01-01 00:00:00'), '%Y-%m-%d %H:%M:%S')
            )
        
        # If no paid invoices, return all pending
        if not last_paid:
            return jsonify([inv for inv in all_invoices if inv['status'] == 'pending'])
        
        # Filter pending invoices after last paid
        last_paid_key = month_to_sort_key(last_paid['month'])
        pending_invoices = [
            inv for inv in all_invoices
            if inv['status'] == 'pending' and 
            month_to_sort_key(inv['month']) > last_paid_key
        ]
        
        # Sort by month
        pending_invoices.sort(key=lambda x: month_to_sort_key(x['month']))
        return jsonify(pending_invoices)
        
    except Exception as e:
        logger.error(f"Error fetching pending invoices: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/get-student-by-contact/<contact>', methods=['GET'])
def get_student_by_contact(contact):
    try:
        student = students_collection.find_one({"contact": contact}, {"_id": 0})
        if student:
            return jsonify(student)
        return jsonify({"error": "Student not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching student: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(port=5000, debug=True)
