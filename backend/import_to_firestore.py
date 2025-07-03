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

# Sample student data (3 students) with parent profile fields
# Sample student data (3 students) with parent profile fields and additional child info
students = [
    {
        "student_id": "STU2025001",
        "name": "Rahul Sharma",
        "grade": "Grade 5",
        "parent_name": "Priya Sharma",
        "contact": "1234567890",
        "email": "priya@example.com",
        "joined_date": datetime(2023, 6, 1),
        "father_name": "Rahul Sharma",
        "father_contact": "1234567890",
        "mother_name": "Priya Sharma",
        "mother_contact": "1234567890",
        "address": "123, 1st street, hyderabad",
        "profile_image": "",
        "dob": "2013-07-15",  # YYYY-MM-DD
        "blood_group": "A+",
        "nick_name": "Rahi"
    },
    {
        "student_id": "STU2025002",
        "name": "Anita Verma",
        "grade": "Grade 4",
        "parent_name": "Sunil Verma",
        "contact": "9876543210",
        "email": "sunil@example.com",
        "joined_date": datetime(2024, 1, 15),
        "father_name": "Sunil Verma",
        "father_contact": "9876543210",
        "mother_name": "Anita Verma",
        "mother_contact": "9876543210",
        "address": "456, 2nd avenue, mumbai",
        "profile_image": "",
        "dob": "2014-11-02",
        "blood_group": "B+",
        "nick_name": "Ani"
    },
    {
        "student_id": "STU2025003",
        "name": "Vikram Patel",
        "grade": "Grade 3",
        "parent_name": "Neha Patel",
        "contact": "8765432109",
        "email": "neha@example.com",
        "joined_date": datetime(2024, 3, 10),
        "father_name": "Vikram Patel",
        "father_contact": "8765432109",
        "mother_name": "Neha Patel",
        "mother_contact": "8765432109",
        "address": "789, 3rd road, delhi",
        "profile_image": "",
        "dob": "2015-05-20",
        "blood_group": "O+",
        "nick_name": "Vicky"
    }
]

   

# Attendance data
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

def add_students(students):
    batch = db.batch()
    students_ref = db.collection('students')
    for student in students:
        doc_ref = students_ref.document(student['student_id'])
        if student.get('joined_date') and isinstance(student['joined_date'], datetime):
            student['joined_date'] = firestore.SERVER_TIMESTAMP
        batch.set(doc_ref, student)
    batch.commit()
    print(f"Added {len(students)} students to Firestore.")

def add_attendance_records(records):
    batch = db.batch()
    attendance_ref = db.collection('attendance_records')
    for record in records:
        doc_id = f"{record['student_id']}_{record['date']}"
        doc_ref = attendance_ref.document(doc_id)
        batch.set(doc_ref, record)
    batch.commit()
    print(f"Added {len(records)} attendance records to Firestore.")

if __name__ == "__main__":
    add_invoices(invoices)
    add_students(students)
    add_attendance_records(attendance_data)
    print("Data import completed successfully!")
