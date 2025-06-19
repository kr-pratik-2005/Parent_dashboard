import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from '../components/BottomNav';
import { Bell } from 'lucide-react';

// --- Style definitions ---
const containerStyle = {
  maxWidth: 400,
  margin: "0 auto",
  background: "#f8f8f8",
  minHeight: "100vh",
  fontFamily: "sans-serif",
  paddingBottom: 80, // extra space for nav bar
};
const headerIconStyle = {
  width: 24,
  height: 24,
  cursor: "pointer",
  color: "#666",
  fontSize: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};


const searchRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "0 16px",
  marginBottom: 16,
};

const searchInputStyle = {
  flex: 1,
  padding: "10px 14px",
  border: "1px solid #ddd",
  borderRadius: 8,
  fontSize: 15,
  background: "#fff",
};

const filterBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "none",
  background: "#eee",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 19,
  cursor: "pointer",
};

const pendingBoxStyle = {
  background: "#dedede",
  borderRadius: 12,
  margin: "0 16px 16px 16px",
  padding: "14px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const pendingInfoStyle = {
  color: "#444",
  fontSize: 15,
};

const pendingCountStyle = {
  fontWeight: 600,
  color: "#222",
};

const invoiceCardStyle = {
  background: "#fff",
  borderRadius: 14,
  margin: "0 16px 18px 16px",
  boxShadow: "0 1px 4px #0001",
  padding: "18px 16px",
};

const rowBetweenStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const amountStyle = {
  fontWeight: 700,
  fontSize: 18,
  color: "#222",
};

const statusPaidStyle = {
  background: "#e6f5e6",
  color: "#2d8a3c",
  fontWeight: 600,
  fontSize: 13,
  borderRadius: 8,
  padding: "3px 10px",
  marginLeft: 8,
};

const statusDueStyle = {
  background: "#fff4e6",
  color: "#e67e22",
  fontWeight: 600,
  fontSize: 13,
  borderRadius: 8,
  padding: "3px 10px",
  marginLeft: 8,
};

const invoiceBtnStyle = {
  color: "#444",
  fontWeight: 600,
  fontSize: 15,
  border: "none",
  background: "none",
  cursor: "pointer",
};

const payNowBtnStyle = {
  color: "#fff",
  background: "#e67e22",
  fontWeight: 600,
  fontSize: 15,
  border: "none",
  borderRadius: 8,
  padding: "6px 18px",
  cursor: "pointer",
};

const detailsStyle = {
  marginTop: 10,
  color: "#666",
  fontSize: 14,
  borderTop: "1px solid #eee",
  paddingTop: 10,
  lineHeight: 1.6,
};

const headerRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 16px 0 16px',
  background: 'transparent'
};

const headerTitleStyle = {
  fontWeight: 600,
  fontSize: 20,
  color: "#444",
  flex: 1,
  textAlign: 'center'
};

const headerBtnStyle = {
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  fontSize: 22,
  display: 'flex',
  alignItems: 'center',
  color: '#444',
  minWidth: 32
};

export default function FeesPayment() {
  const navigate = useNavigate();
  const [openInvoice, setOpenInvoice] = useState(null);

  const invoices = [
    {
      month: "Apr 2025",
      amount: "₹ 9,500",
      status: "Paid",
      statusStyle: statusPaidStyle,
      invoiceNumber: "EFT/EG/apr25/005",
      paymentDate: "April 05, 2025"
    },
    {
      month: "Mar 2025",
      amount: "₹ 9,500",
      status: "Due",
      statusStyle: statusDueStyle,
      invoiceNumber: "EFT/EG/mar25/005",
      paymentDate: "March 05, 2025"
    },
    {
      month: "Feb 2025",
      amount: "₹ 9,500",
      status: "Paid",
      statusStyle: statusPaidStyle,
      invoiceNumber: "EFT/EG/feb25/005",
      paymentDate: "February 05, 2025"
    }
  ];

  const handleToggle = (month) => {
    setOpenInvoice(openInvoice === month ? null : month);
  };

  return (
    <div style={containerStyle}>
      {/* Header Row with Back and Notification */}
      <div style={headerRowStyle}>
        <button
          onClick={() => navigate(-1)}
          style={headerBtnStyle}
          aria-label="Back"
        >
          ←
        </button>
        <div style={headerTitleStyle}>Fees Payment</div>
        <span
  style={headerIconStyle}
  onClick={() => alert("Notifications")}
  aria-label="Notifications"
  role="button"
>
  <Bell size={22} color="#666" />
</span>

      </div>

      {/* Search Bar */}
      <div style={searchRowStyle}>
        <input style={searchInputStyle} placeholder="Search" />
        <button style={filterBtnStyle}>☰</button>
      </div>

      {/* Pending Payment Box */}
      <div style={pendingBoxStyle}>
        <div>
          <span style={{ fontSize: 21, marginRight: 10 }}>🕑</span>
          <span style={pendingInfoStyle}>
            Pending Payment<br />
            <span style={{ fontSize: 13, color: "#888" }}>
              You have <span style={pendingCountStyle}>2 payment</span> pending
            </span>
          </span>
        </div>
        <button style={invoiceBtnStyle}>View &gt;</button>
      </div>

      {/* Invoice Cards */}
      {invoices.map((inv) => (
        <div key={inv.month} style={invoiceCardStyle}>
          <div style={rowBetweenStyle}>
            <span>
              <span style={amountStyle}>{inv.amount}</span>
              <span style={inv.statusStyle}>{inv.status}</span>
            </span>
            {inv.status === "Due" ? (
              <button
  style={payNowBtnStyle}
  onClick={() => navigate('/feepayment/pending')}
>
  Pay Now
</button>

            ) : (
              <button
                style={invoiceBtnStyle}
                onClick={() => handleToggle(inv.month)}
              >
                Invoice {openInvoice === inv.month ? "▲" : "▼"}
              </button>
            )}
          </div>
          <div style={{ color: "#888", fontSize: 14, marginTop: 7 }}>
            Daycare Fee for {inv.month}
          </div>
          {openInvoice === inv.month && (
            <div style={detailsStyle}>
              <div>
                Invoice Number<br />
                <b>{inv.invoiceNumber}</b>
              </div>
              <div style={{ marginTop: 4 }}>
                Payment Date<br />
                <b>{inv.paymentDate}</b>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
