import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Loader } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import giraffeIcon from '../assets/Logo.png';

// --- Styles ---
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

// Invoice preview styles for download (make sure these visually match your template)
const invoicePreviewWrapper = {
  background: "#fff",
  width: 600,
  minHeight: 850,
  padding: "38px 44px 36px",
  borderRadius: 10,
  fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  color: "#202020",
  position: "relative",
  boxShadow: "0 4px 24px #0002"
};

const orange = "#e67e22";
const logoSize = 54;

const previewHeader = {
  display: 'flex',
  alignItems: 'start',
  justifyContent: 'space-between',
  marginBottom: 14,
  borderBottom: "none"
};

const previewRightTitle = {
  fontSize: 34,
  fontWeight: 400,
  letterSpacing: ".06em",
  color: "#222",
};

const orgTitle = {
  fontWeight: 700,
  fontSize: 22,
  letterSpacing: '.01em',
  display: 'block'
};
const orgSub = { fontWeight: 500, fontSize: 13 };

const sectionSplit = {
  display: 'flex',
  alignItems: 'start',
  marginBottom: 24,
  marginTop: 12
};

const sectionColumn = { flex: 1 };

const infoRow = { display: "flex", alignItems: "center", fontSize: 15, marginBottom: 3 };
const infoKey = { width: 105, color: "#222", fontWeight: 500 };

const previewTable = {
  width: "100%",
  borderCollapse: "collapse",
  margin: "24px 0 16px",
  fontSize: 16,
};

const previewTd = { padding: "8px 6px", borderBottom: "1px solid #eee" };

const footerWrap = {
  background: orange,
  color: "#fff",
  margin: "38px -44px -36px",
  padding: "14px 44px 13px",
  fontSize: 13,
  borderRadius: "0 0 10px 10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap"
};

const authSection = {
  float: "right",
  marginTop: 60,
  textAlign: "right",
};

const signatureStyle = {
  fontFamily: "'Sacramento', cursive",
  fontStyle: "italic",
  fontSize: 22,
  fontWeight: 400,
  marginBottom: 4,
};
const invoiceHeader = { fontSize: 24, fontWeight: 600, letterSpacing: 2, textAlign: 'center', marginBottom: 12 };
const invoiceFieldLabel = { fontWeight: 500, width: 100, color: '#444' };
const invoiceTable = { width: '100%', marginTop: 18, borderCollapse: 'collapse' };
const invoiceTableHeader = { borderBottom: '1px solid #eee', fontWeight: 500 };

const getParentName = (student) => {
  return student?.parent_name ||
    student?.father_name ||
    student?.mother_name ||
    ""; // fallback is empty
};
const getMobileNo = (student) => {
  return student?.contact ||
    student?.father_contact ||
    student?.mother_contact ||
    ""; // fallback is empty
};

export default function FeesPayment() {
  const [showHistory, setShowHistory] = useState(false);
  const [paidInvoices, setPaidInvoices] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const navigate = useNavigate();
  const [openInvoice, setOpenInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [invoiceForDownload, setInvoiceForDownload] = useState(null);

  // Load students from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('students');
    if (stored) {
      const stuArr = JSON.parse(stored);
      setStudents(stuArr);
      if (stuArr.length > 0) setSelectedStudent(stuArr[0]);
    }
  }, []);

  const fetchPaidInvoices = async () => {
    if (!selectedStudent) return;
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const q = query(
        collection(db, "fees"),
        where("contact", "==", selectedStudent.contact),
        where("paid", "==", true)
      );
      const qs = await getDocs(q);
      const result = [];
      qs.forEach(doc => {
        const data = doc.data();
        result.push(data);
      });
      setPaidInvoices(result);
      setShowHistory(true);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch pending invoices from Firestore for the selected student
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
        const q = query(
          collection(db, "fees"),
          where("contact", "==", selectedStudent.contact),
          where("paid", "==", false),
          where("sent", "==", true)
        );
        const querySnapshot = await getDocs(q);
        const result = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.razorpay_link && typeof data.razorpay_link === "string" && data.razorpay_link.length > 10) {
            result.push(data);
          }
        });
        setInvoices(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [selectedStudent]);

  const handleToggle = (invoiceNumber) => {
    setOpenInvoice(prev => prev === invoiceNumber ? null : invoiceNumber);
  };

  const handlePayNow = (invoice) => {
    if (invoice.razorpay_link) {
      window.open(invoice.razorpay_link, "_blank");
    }
  };

  // Generate and download the invoice PDF using html2canvas + jsPDF
  const handleDownload = async (invoice) => {
    setInvoiceForDownload(invoice);
    setTimeout(async () => {
      const input = document.getElementById('invoice-preview-html');
      if (!input) return;
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
      setInvoiceForDownload(null);
    }, 100);
  };

  const pending = invoices;


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

  // Invoice Preview Mini-component for PDF Download
  const InvoicePreview = ({ invoice, student }) => {
    let paymentDate = "";
    if (invoice.payment_date) {
      paymentDate =
        typeof invoice.payment_date === 'string'
          ? invoice.payment_date
          : new Date(invoice.payment_date.seconds * 1000).toLocaleDateString('en-IN', { day: "2-digit", month: "short", year: "numeric" });
    }
    return (
      <div id="invoice-preview-html" style={invoicePreviewWrapper}>
        {/* Top */}
        <div style={previewHeader}>
          <div style={{display: 'flex', alignItems: 'start'}}>
  <img
  src={giraffeIcon}
  alt="Giraffe Logo"
  style={{
    height: logoSize,      // use your logoSize variable, e.g. 54
    width: logoSize,
    marginRight: 10,
    objectFit: "contain"
  }}
/>


            <div>
              <div style={orgTitle}>Mimansa Kids</div>
              <div style={orgSub}>Early Childhood Care & Learning Center<br />Kondapur, Hyderabad</div>
              <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>
                Brand of Enoki Family Technologies Pvt. Ltd.<br />CIN: U85211TS2024PTC182698
              </div>
            </div>
          </div>
          <div style={previewRightTitle}>INVOICE</div>
        </div>
        {/* Split Line */}
        <div style={{height:1, background:"#ddd", margin:"15px 0"}}></div>
        {/* Billing and Info */}
        <div style={sectionSplit}>
          <div style={sectionColumn}>
            <div style={{color:"#222", fontWeight:700, fontSize:15}}>Invoice to:</div>
            <div style={{marginTop:2}}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>
  {getParentName(student) || "<Parent Name>"}
</div>
<div style={{ fontSize: 13, color: "#333" }}>
  Parent of {student?.name || "<Child Name>"}<br />
  {getMobileNo(student) || "<mobile_no>"}<br />
  {student?.address || "<address>"}
</div>

            </div>
          </div>
          <div style={sectionColumn}>
            <div style={infoRow}>
              <span style={infoKey}>Invoice#</span>
              <span>{invoice.invoice_number}</span>
            </div>
            <div style={infoRow}>
              <span style={infoKey}>Date</span>
              <span>{paymentDate || "-- / -- / ----"}</span>
            </div>
          </div>
        </div>
        {/* Table */}
        <table style={previewTable}>
          <thead>
            <tr style={{background:"#faf6ee", borderBottom:"1px solid #eee", fontWeight:700}}>
              <td style={{padding:"8px 6px"}}>Item</td>
              <td align="right" style={{padding:"8px 6px"}}>Quantity</td>
              <td align="right" style={{padding:"8px 6px"}}>Unit Price</td>
              <td align="right" style={{padding:"8px 6px"}}>Total</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={previewTd}>Daycare Fees for {invoice.month}</td>
              <td style={previewTd} align="right">1</td>
              <td style={previewTd} align="right">₹{invoice.fee}</td>
              <td style={previewTd} align="right">₹{invoice.fee}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <div style={{minWidth:240}}>
            <div style={{display: "flex", justifyContent:"space-between", margin: "2px 0", fontWeight: 600, fontSize: 17}}>
              <span>Subtotal</span>
              <span>₹{invoice.fee}</span>
            </div>
            <div style={{height:1, background:"#ccc", margin:"7px 0 5px"}}></div>
            <div style={{display: "flex", justifyContent:"space-between", fontSize: 21, fontWeight: 700}}>
              <span>Total</span>
              <span>₹{invoice.fee}</span>
            </div>
          </div>
        </div>
        {/* Thank You and Sign */}
        <div style={{margin:"38px 0 18px", display:'flex', justifyContent:"space-between"}}>
          <span style={{fontSize:16}}>Thank you for your business!</span>
          <div style={authSection}>
            <span style={signatureStyle}>Deepanshu</span>
            <div style={{ borderTop: "1px solid #bbb", fontSize:13, marginTop: 7, paddingTop: 1, textAlign:'right' }}>Authorized Signed</div>
          </div>
        </div>
        {/* Footer */}
        <div style={{...footerWrap,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    margin: 0,
    borderRadius: "0 0 10px 10px",}}>
          <span>
            Regd Address: 8-2-644/1/205 F.No. 205, Hiline Complex, Road No. 12, Banjara Hills Hyderabad- 500034 Telangana.
          </span>
          <span>
            +91 93478 37785 &nbsp; | &nbsp; info@mimansakids.com &nbsp; | &nbsp; www.mimansakids.com
          </span>
        </div>
      </div>
    );
  };
  return (
    <div style={containerStyle}>
      <div style={headerRowStyle}>
        <button onClick={() => navigate(-1)} style={headerBtnStyle}>←</button>
        <div style={headerTitleStyle}>Fees Payment</div>
        <span style={headerIconStyle} onClick={() => alert("Notifications")}>
          <Bell size={22} color="#666" />
        </span>
      </div>
      <div style={{ textAlign: 'right', marginBottom: 18 }}>
        <button
          style={{
            background: '#007bff',
            color: '#fff',
            border: 'none',
            padding: '9px 20px',
            borderRadius: 7,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "0 1px 4px #0002",
          }}
          onClick={fetchPaidInvoices}
        >
          View Payment History
        </button>
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
        <div key={inv.invoice_number} style={{
  background: "#f8f8f8",
  borderRadius: 8,
  padding: "14px 12px",
  marginBottom: 12,
  position: "relative"
}}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div>
      <span><b>{inv.month}</b></span>
      <span style={{ color: "#27ae60", marginLeft: 14 }}>₹ {inv.fee}</span>
    </div>
    <button
      style={{
        marginTop: "0",
        background: "#e67e22",
        color: "#fff",
        border: "none",
        padding: "7px 14px",
        borderRadius: 7,
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer"
      }}
      onClick={() => handleDownload(inv)}
    >
      Download Invoice
    </button>
  </div>
  <div style={{ fontSize: 14, color: "#777", marginTop: 10 }}>
    Paid on:{" "}
    {inv.payment_date
      ? (typeof inv.payment_date === 'string'
        ? inv.payment_date
        : (new Date(inv.payment_date.seconds * 1000)).toLocaleString('en-IN'))
      : "Unknown"}
  </div>
  <div style={{ fontSize: 13, color: "#aaa" }}>Invoice: {inv.invoice_number}</div>
</div>

      )) : (
        <div style={{ textAlign: "center", padding: 20 }}>No pending payments found</div>
      )}

      {/* Payment History Modal/Section */}
      {showHistory && (
        <div style={{
          position: "fixed",
          left: 0, top: 0, right: 0, bottom: 0,
          background: "#0006",
          display: "flex",
          zIndex: 99,
          alignItems: "center",
          justifyContent: "center",
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowHistory(false); }}
        >
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            minWidth: 320,
            maxWidth: "90vw",
            minHeight: 180,
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 8px 24px #0003"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 19 }}>Paid Payments</div>
              <button
                onClick={() => setShowHistory(false)}
                style={{ fontSize: 22, background: "none", border: "none", cursor: "pointer", color: "#666" }}
              >✕</button>
            </div>
            {historyLoading
              ? <div style={{ textAlign: "center" }}><Loader className="animate-spin" /><br />Loading...</div>
              : historyError
                ? <div style={{ color: "red", textAlign: "center" }}>{historyError}</div>
                : paidInvoices.length > 0
                  ? (
                    <div>
                      {paidInvoices
                        .sort((a, b) => (b.payment_date?.seconds || 0) - (a.payment_date?.seconds || 0))
                        .map(inv => (
                          <div key={inv.invoice_number} style={{
                            background: "#f8f8f8",
                            borderRadius: 8,
                            padding: "14px 12px",
                            marginBottom: 12,
                            position: "relative"
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span><b>{inv.month}</b></span>
                              <span style={{ color: "#27ae60" }}>₹ {inv.fee}</span>
                            </div>
                            <div style={{ fontSize: 14, color: "#777", marginTop: 4 }}>
                              Paid on:{" "}
                              {inv.payment_date
                                ? (typeof inv.payment_date === 'string'
                                  ? inv.payment_date
                                  : (new Date(inv.payment_date.seconds * 1000)).toLocaleString('en-IN'))
                                : "Unknown"}
                            </div>
                            <div style={{ fontSize: 13, color: "#aaa" }}>Invoice: {inv.invoice_number}
                            <button
                              style={{
                                marginTop: 8,
                                background: "#e67e22",
                                color: "#fff",
                                border: "none",
                                padding: "7px 14px",
                                borderRadius: 7,
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: "pointer",
                                float: "right",
                                marginLeft: 8,
                              }}
                              onClick={() => handleDownload(inv)}
                            >
                              Download Invoice
                            </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )
                  : <div style={{ color: "#888", textAlign: "center" }}>No payment history found.</div>
            }
            {/* Hidden Invoice Preview for Download */}
            {invoiceForDownload &&
              <div style={{position: 'fixed', left: -2000, top: 0, zIndex: -1000}}>
                {/* Hide offscreen for capture */}
                <InvoicePreview invoice={invoiceForDownload} student={selectedStudent} />
              </div>
            }
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
