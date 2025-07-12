import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Loader } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const containerStyle = { maxWidth: 480, margin: "0 auto", padding: 16, background: "#f9f9f9", minHeight: "100vh" };
const headerRowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 };
const headerBtnStyle = { background: "none", border: "none", fontSize: 22, cursor: "pointer" };
const headerTitleStyle = { fontWeight: 700, fontSize: 18, flex: 1, textAlign: "center" };
const headerIconStyle = { cursor: "pointer", padding: 4 };
const searchRowStyle = { display: "flex", alignItems: "center", marginBottom: 16, gap: 8 };
const pendingBoxStyle = { background: "#fffbe6", borderRadius: 10, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" };
const pendingInfoStyle = { fontWeight: 600, fontSize: 16 };
const pendingCountStyle = { color: "#e67e22", fontWeight: 700 };
const invoiceBtnStyle = { background: "#e67e22", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 15 };
const invoiceCardStyle = { background: "#fff", borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: "0 2px 8px #0001" };
const rowBetweenStyle = { display: "flex", alignItems: "center", justifyContent: "space-between" };
const amountStyle = { fontWeight: 700, fontSize: 18, marginRight: 18 };
const statusPaidStyle = { background: "#eafbe6", color: "#27ae60", padding: "2px 10px", borderRadius: 6, fontWeight: 600, fontSize: 13 };
const statusDueStyle = { background: "#fff0f0", color: "#e74c3c", padding: "2px 10px", borderRadius: 6, fontWeight: 600, fontSize: 13 };
const payNowBtnStyle = { background: "#27ae60", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 15 };
const detailsStyle = { background: "#f8f8f8", borderRadius: 7, padding: 10, marginTop: 10, fontSize: 15 };
const filterBtnStyle = { padding: "8px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" };
const searchInputStyle = { flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ddd" };

export default function FeesPayment() {
  const navigate = useNavigate();
  const [openInvoice, setOpenInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Fetch students on mount
  const fetchInvoices = async (student) => {
  setLoading(true);
  try {
    const res = await fetch(
      `${API_URL}/get-fees-by-student/${student.student_id}?contact=${student.contact}`
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setInvoices(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  if (!selectedStudent) {
    setInvoices([]);
    setLoading(false);
    return;
  }
  fetchInvoices(selectedStudent);
}, [API_URL, selectedStudent]);

  useEffect(() => {
    const stored = localStorage.getItem('students');
    if (stored) {
      const stuArr = JSON.parse(stored);
      setStudents(stuArr);
      if (stuArr.length > 0) setSelectedStudent(stuArr[0]);
    }
  }, []);

  // Fetch invoices for selected student
  useEffect(() => {
    if (!selectedStudent) {
      setInvoices([]);
      setLoading(false);
      return;
    }
    const fetchInvoices = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch all fees for this student and parent
        const res = await fetch(
          `${API_URL}/get-fees-by-student/${selectedStudent.student_id}?contact=${selectedStudent.contact}`
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setInvoices(data); // data is an array of fee objects
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [API_URL, selectedStudent]);

  const handleToggle = (invoiceNumber) => {
    setOpenInvoice(prev => prev === invoiceNumber ? null : invoiceNumber);
  };
  const handleRefreshPayment = async (invoice) => {
  setLoading(true);
  try {
    // Call your backend to check payment status and update if paid
    const res = await fetch(`${API_URL}/refresh-payment-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoice_number: invoice.invoice_number })
    });
    const data = await res.json();
    if (data.paid) {
      alert("Payment confirmed! Invoice marked as paid.");
      fetchInvoices(selectedStudent);  // Refetch to update UI
    } else {
      alert("Payment not yet confirmed. Please try again in a few seconds.");
    }
  } catch (err) {
    alert("Error checking payment status. Try again.");
  }
  setLoading(false);
};


  const handlePayNow = (invoice) => {
    if (invoice.razorpay_invoice_link) {
      window.open(invoice.razorpay_invoice_link, "_blank");
    }
  };

  // Only show invoices for this student that have a razorpay_invoice_link and paid === false
  const pending = invoices.filter(
    inv => inv.razorpay_invoice_link && inv.paid === false
  );
  const paid = invoices.filter(
    inv => inv.paid === true
  );

  if (loading) return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <Loader className="animate-spin" />
      <div>Loading invoices...</div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <div style={{ color: "red" }}>{error}</div>
      <button style={payNowBtnStyle} onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={headerRowStyle}>
        <button onClick={() => navigate(-1)} style={headerBtnStyle}>←</button>
        <div style={headerTitleStyle}>Fees Payment</div>
        <span style={headerIconStyle} onClick={() => alert("Notifications")}>
          <Bell size={22} color="#666" />
        </span>
      </div>

      {/* Student selector */}
      {students.length > 1 && (
        <div style={searchRowStyle}>
          <select
            style={searchInputStyle}
            value={selectedStudent ? selectedStudent.student_id : ""}
            onChange={e => {
              const student = students.find(s => s.student_id === e.target.value);
              setSelectedStudent(student);
            }}
          >
            <option value="">Select Student</option>
            {students.map(student => (
              <option key={student.student_id} value={student.student_id}>{student.name}</option>
            ))}
          </select>
          <button style={filterBtnStyle}>☰</button>
          
        </div>
      )}

      {/* Show selected student name */}
      {selectedStudent && (
        <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 17 }}>
          Student: {selectedStudent.name}
        </div>
      )}

      <div style={pendingBoxStyle}>
        <div>
          <span style={{ fontSize: 21, marginRight: 10 }}>🕑</span>
          <span style={pendingInfoStyle}>
            Pending Payment<br />
            <span style={{ fontSize: 13, color: "#888" }}>
              You have <span style={pendingCountStyle}>{pending.length}</span> payment(s) pending
            </span>
          </span>
        </div>
      </div>

      {/* Pending Invoices */}
      {pending.length > 0 ? pending.map(inv => (
        <div key={inv.invoice_number} style={invoiceCardStyle}>
          <div style={rowBetweenStyle}>
            <span>
              <span style={amountStyle}>₹ {inv.fee}</span>
              <span style={statusDueStyle}>Pending</span>
            </span>
            <button
              style={payNowBtnStyle}
              onClick={() => handlePayNow(inv)}
            >
              Pay Now
            </button>
   

          </div>
         
          <div style={{ color: "#888", fontSize: 14, marginTop: 7 }}>
            Daycare Fee for {inv.month}
          </div>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              textDecoration: "underline",
              fontSize: 14,
              marginTop: 6,
              cursor: "pointer"
            }}
            onClick={() => handleToggle(inv.invoice_number)}
          >
            {openInvoice === inv.invoice_number ? "Hide Details" : "Show Details"}
          </button>
          {openInvoice === inv.invoice_number && (
            <div style={detailsStyle}>
              <div>Invoice Number<br /><b>{inv.invoice_number}</b></div>
              <div style={{ marginTop: 4 }}>Payment Date<br /><b>{inv.payment_date || "Not paid yet"}</b></div>
            </div>
          )}
        </div>
      )) : (
        <div style={{ textAlign: "center", padding: 20 }}>No pending payments found</div>
      )}

      {/* Paid Invoices (Optional: show below pending) */}
      {paid.length > 0 && (
        <>
          <h3 style={{ marginTop: 24, fontSize: 17, fontWeight: 600 }}>Paid Invoices</h3>
          {paid.map(inv => (
            <div key={inv.invoice_number} style={invoiceCardStyle}>
              <div style={rowBetweenStyle}>
                <span>
                  <span style={amountStyle}>₹ {inv.amount}</span>
                  <span style={statusPaidStyle}>Paid</span>
                </span>
              </div>
              <div style={{ color: "#888", fontSize: 14, marginTop: 7 }}>
                Daycare Fee for {inv.month}
              </div>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  textDecoration: "underline",
                  fontSize: 14,
                  marginTop: 6,
                  cursor: "pointer"
                }}
                onClick={() => handleToggle(inv.invoice_number)}
              >
                {openInvoice === inv.invoice_number ? "Hide Details" : "Show Details"}
              </button>
              {openInvoice === inv.invoice_number && (
                <div style={detailsStyle}>
                  <div>Invoice Number<br /><b>{inv.invoice_number}</b></div>
                  <div style={{ marginTop: 4 }}>Payment Date<br /><b>{inv.payment_date || "Not paid yet"}</b></div>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <BottomNav />
    </div>
  );
}
