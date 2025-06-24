from pymongo import MongoClient
from datetime import datetime
from dateutil.relativedelta import relativedelta

client = MongoClient("mongodb://localhost:27017/")
db = client['mimansa_database']
invoices_collection = db['invoices']

month_names = ["January", "February", "March", "April", "May", "June",
               "July", "August", "September", "October", "November", "December"]

# CONFIGURE THESE VALUES
paid_month = "April"
paid_year = 2025
student_id = "STU2025001"
contact = "1234567890"

# Get current date (system will use today's date)
now = datetime.now()
current_year = now.year
current_month_index = now.month - 1  # 0-based index

# Calculate start position (month after last paid)
paid_month_index = month_names.index(paid_month)
gen_month_index = (paid_month_index + 1) % 12
gen_year = paid_year + (1 if paid_month_index == 11 else 0)

inserted_count = 0
print(f"Starting from: {month_names[gen_month_index]} {gen_year}")
print(f"Current month: {month_names[current_month_index]} {current_year}")

# Generate until current month
while (gen_year < current_year) or (gen_year == current_year and gen_month_index <= current_month_index):
    month_str = f"{month_names[gen_month_index]} {gen_year}"
    
    # Skip if invoice exists
    if invoices_collection.find_one({"student_id": student_id, "month": month_str}):
        print(f"Skipping existing invoice: {month_str}")
    else:
        # Calculate due date (last day of month)
        due_date = (datetime(gen_year, gen_month_index + 1, 1) + relativedelta(months=1, days=-1)).strftime('%Y-%m-%d')
        
        new_invoice = {
            "student_id": student_id,
            "contact": contact,
            "invoice_number": f"INV-{gen_year}{gen_month_index+1:02d}-{inserted_count+1}",
            "month": month_str,
            "amount": 9500,
            "due_date": due_date,
            "status": "pending",
            "payment_id": None
        }
        invoices_collection.insert_one(new_invoice)
        print(f"Inserted invoice for {month_str}")
        inserted_count += 1
    
    # Move to next month
    gen_month_index = (gen_month_index + 1) % 12
    if gen_month_index == 0:  # December to January transition
        gen_year += 1

print(f"Generated {inserted_count} invoices for {student_id}")
