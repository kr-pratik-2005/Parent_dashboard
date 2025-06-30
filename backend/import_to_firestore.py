import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase app
cred = credentials.Certificate('serviceAccountKey.json')  # Update path to your service account key
firebase_admin.initialize_app(cred)
db = firestore.client()

# Sample invoice data (6 invoices)
invoices = [
    # Student 1 invoices
    {
        "student_id": "STU2025001",
        "contact": "1234567890",
        "invoice_number": "INV-202504-1",
        "month": "April 2025",
        "amount": 9500,
        "due_date": "2025-04-30",
        "status": "paid",
        "payment_id": "pay_Ql69aZaoYSuP5b",
        "payment_date": datetime(2025, 4, 10, 12, 0, 0)
    },
    {
        "student_id": "STU2025001",
        "contact": "1234567890",
        "invoice_number": "INV-202505-2",
        "month": "May 2025",
        "amount": 9500,
        "due_date": "2025-05-30",
        "status": "pending",
        "payment_id": "",
        "payment_date": None
    },
    {
        "student_id": "STU2025001",
        "contact": "1234567890",
        "invoice_number": "INV-202506-3",
        "month": "June 2025",
        "amount": 9500,
        "due_date": "2025-06-30",
        "status": "pending",
        "payment_id": "",
        "payment_date": None
    },
    
    # Student 2 invoices
    {
        "student_id": "STU2025002",
        "contact": "9876543210",
        "invoice_number": "INV-202504-4",
        "month": "April 2025",
        "amount": 9000,
        "due_date": "2025-04-30",
        "status": "paid",
        "payment_id": "pay_Abc123XYZ",
        "payment_date": datetime(2025, 4, 12, 10, 30, 0)
    },
    {
        "student_id": "STU2025002",
        "contact": "9876543210",
        "invoice_number": "INV-202505-5",
        "month": "May 2025",
        "amount": 9000,
        "due_date": "2025-05-30",
        "status": "paid",
        "payment_id": "pay_Def456UVW",
        "payment_date": datetime(2025, 5, 15, 14, 45, 0)
    },
    {
        "student_id": "STU2025002",
        "contact": "9876543210",
        "invoice_number": "INV-202506-6",
        "month": "June 2025",
        "amount": 9000,
        "due_date": "2025-06-30",
        "status": "pending",
        "payment_id": "",
        "payment_date": None
    }
]

# Sample student data (3 students)
students = [
    {
        "student_id": "STU2025001",
        "name": "Rahul Sharma",
        "grade": "Grade 5",
        "parent_name": "Priya Sharma",
        "contact": "1234567890",
        "email": "priya@example.com",
        "joined_date": datetime(2023, 6, 1)
    },
    {
        "student_id": "STU2025002",
        "name": "Anita Verma",
        "grade": "Grade 4",
        "parent_name": "Sunil Verma",
        "contact": "9876543210",
        "email": "sunil@example.com",
        "joined_date": datetime(2024, 1, 15)
    },
    {
        "student_id": "STU2025003",
        "name": "Vikram Patel",
        "grade": "Grade 3",
        "parent_name": "Neha Patel",
        "contact": "8765432109",
        "email": "neha@example.com",
        "joined_date": datetime(2024, 3, 10)
    }
]

# Function to add invoices to Firestore
def add_invoices(invoices):
    batch = db.batch()
    invoices_ref = db.collection('invoices')
    
    for invoice in invoices:
        doc_ref = invoices_ref.document(invoice['invoice_number'])
        # Convert datetime to Firestore timestamp
        if invoice.get('payment_date') and isinstance(invoice['payment_date'], datetime):
            invoice['payment_date'] = firestore.SERVER_TIMESTAMP
        
        batch.set(doc_ref, invoice)
    
    batch.commit()
    print(f"Added {len(invoices)} invoices to Firestore.")

# Function to add students to Firestore
def add_students(students):
    batch = db.batch()
    students_ref = db.collection('students')
    
    for student in students:
        doc_ref = students_ref.document(student['student_id'])
        # Convert datetime to Firestore timestamp
        if student.get('joined_date') and isinstance(student['joined_date'], datetime):
            student['joined_date'] = firestore.SERVER_TIMESTAMP
        
        batch.set(doc_ref, student)
    
    batch.commit()
    print(f"Added {len(students)} students to Firestore.")

# Add this after the students and invoices data

# 7. Attendance state data
attendance_data = [
    # Present record
    {
        "student_id": "STU2025001",
        "date": "2025-05-01",
        "status": "present",
        "time_in": "8:00 AM",
        "time_out": "1:00 PM",
        "grade": "A"
    },
    
    # Leave record
    {
        "student_id": "STU2025001",
        "date": "2025-05-02",
        "status": "leave",
        "reason": "Sick leave"
    },
    
    # Holiday record
    {
        "student_id": "STU2025001",
        "date": "2025-05-03",
        "status": "holiday",
        "holiday_name": "Independence Day"
    }
]

# 8. Function to add attendance records
def add_attendance_records(records):
    batch = db.batch()
    attendance_ref = db.collection('attendance_records')
    for record in records:
        # Create unique ID: studentId_date
        doc_id = f"{record['student_id']}_{record['date']}"
        doc_ref = attendance_ref.document(doc_id)
        batch.set(doc_ref, record)
    batch.commit()
    print(f"Added {len(records)} attendance records to Firestore.")

# 9. Call the new function
add_attendance_records(attendance_data)

# Execute the imports
if __name__ == "__main__":
    add_invoices(invoices)
    add_students(students)
    print("Data import completed successfully!")
