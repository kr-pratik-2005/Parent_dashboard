import React, { useState, useEffect, useRef } from "react";
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

function loadRazorpayScript(src) {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function FeesPayment() {
  const navigate = useNavigate();
  const [openInvoice, setOpenInvoice] = useState(null);
  const [invoices, setInvoices] = useState({ last_paid_month: null, pending_invoices: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState("");
  const [processingInvoiceNumber, setProcessingInvoiceNumber] = useState(null);
  const razorpayScriptLoaded = useRef(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedMobile = localStorage.getItem('parentMobile');
        if (!storedMobile) throw new Error("Please login to view invoices");
        setMobile(storedMobile);

        const res = await fetch(`${API_URL}/get-pending-after-payment/${storedMobile}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const handleToggle = (month) => {
    setOpenInvoice(prev => prev === month ? null : month);
  };

  const handlePayFees = async (amount, invoiceNumber) => {
    console.log("🔍 Sending amount to backend:", amount); 
  setProcessingInvoiceNumber(invoiceNumber);
  try {
    // Send CORRECT amount (₹9500) to backend
    const orderRes = await fetch(`${API_URL}/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amount }) // Send full amount (9500)
    });
    const order = await orderRes.json();
    console.log("📦 Order response from backend:", order);

    if (!razorpayScriptLoaded.current) {
      const loaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!loaded) throw new Error("Failed to load Razorpay");
      razorpayScriptLoaded.current = true;
    }
    console.log("Razorpay init config:", {
  key: razorpayKey,
  amount: order.amount,
  currency: order.currency,
  order_id: order.order_id,

});

const storedMobile = localStorage.getItem('parentMobile');
const contact = storedMobile || "";

    const rzp = new window.Razorpay({
      key: order.key,
      amount: order.amount, // Already in paise (backend multiplied by 100)
      currency: order.currency,
      name: "Mimansa School",
      description: "Fee Payment",
      order_id: order.order_id,
      handler: async function (response) {
        await fetch(`${API_URL}/update-payment-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            invoice_number: invoiceNumber, 
            payment_id: response.razorpay_payment_id 
          })
        });

        const refreshed = await fetch(`${API_URL}/get-pending-after-payment/${storedMobile}`);
        setInvoices(await refreshed.json());
        alert(`✅ Payment Successful! ID: ${response.razorpay_payment_id}`);
      },
      modal: {
        ondismiss: () => alert("Payment cancelled"),
      },
      prefill: {
        name: "Parent Name",
        email: "parent@example.com",
        contact: contact 
      },
      theme: { color: "#e67e22" }
    });

    rzp.on("payment.failed", function (response) {
      alert(`❌ Payment Failed! Reason: ${response.error.description}`);
    });

    rzp.open();
  } catch (err) {
    alert(`⚠️ Error: ${err.message}`);
    console.error("Payment error:", err); // Add detailed logging
  } finally {
    setProcessingInvoiceNumber(null);
  }
};


  const pending = invoices.pending_invoices || [];

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

      <div style={searchRowStyle}>
  <input
    style={searchInputStyle}
    placeholder="Search"
    value=""
    readOnly
  />
  <button style={filterBtnStyle}>☰</button>
</div>


      {invoices.last_paid_month && (
        <div style={{ marginBottom: 16 }}>Last paid month: <strong>{invoices.last_paid_month}</strong></div>
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
        <button style={invoiceBtnStyle}>View &gt;</button>
      </div>

      {pending.length > 0 ? pending.map(inv => (
        <div key={inv.invoice_number} style={invoiceCardStyle}>
          <div style={rowBetweenStyle}>
            <span>
              <span style={amountStyle}>₹ {inv.amount}</span>
              <span style={inv.status === "paid" ? statusPaidStyle : statusDueStyle}>{inv.status}</span>
            </span>
            <button
              style={processingInvoiceNumber === inv.invoice_number ? { ...payNowBtnStyle, background: "#aaa" } : payNowBtnStyle}
              onClick={() => handlePayFees(inv.amount, inv.invoice_number)}
              disabled={processingInvoiceNumber === inv.invoice_number}
            >
              {processingInvoiceNumber === inv.invoice_number ? <><Loader size={14} /> Processing...</> : "Pay Now"}
            </button>
          </div>
          <div style={{ color: "#888", fontSize: 14, marginTop: 7 }}>
            Daycare Fee for {inv.month}
          </div>
          {openInvoice === inv.month && (
            <div style={detailsStyle}>
              <div>Invoice Number<br /><b>{inv.invoice_number}</b></div>
              <div style={{ marginTop: 4 }}>Payment Date<br /><b>{inv.payment_date || "Not paid yet"}</b></div>
            </div>
          )}
        </div>
      )) : (
        <div style={{ textAlign: "center", padding: 20 }}>No pending payments found</div>
      )}

      <BottomNav />
    </div>
  );
}
