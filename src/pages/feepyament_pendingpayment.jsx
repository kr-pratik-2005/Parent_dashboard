import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from 'lucide-react';
import Logo from '../assets/Logo.png';

// --- Styles (same as your original, omitted for brevity) ---
const avatarsStyle = { display: "flex", justifyContent: "center", alignItems: "center", gap: 0, marginBottom: 40 };
const containerStyle = { minHeight: "100vh", width: "100vw", margin: 0, padding: 0, background: "#f5f5f5", fontFamily: "sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", boxSizing: "border-box" };
const cardStyle = { maxWidth: 375, width: "100%", background: "white", minHeight: 805, boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" };
const headerRowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e5e5e5", background: "white" };
const headerIconStyle = { width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 };
const headerTitleStyle = { flex: 1, textAlign: "center", fontSize: 18, fontWeight: 600, color: "#333" };
const contentStyle = { padding: "24px 20px", flex: 1, display: "flex", flexDirection: "column" };
const pendingTextStyle = { color: "#666", fontSize: 16, marginBottom: 8, textAlign: "center" };
const amountStyle = { fontSize: 32, fontWeight: 700, color: "#333", marginBottom: 20, textAlign: "center" };
const avatarStyle = { width: 48, height: 48, backgroundColor: "#d1d5db", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "#666", fontSize: 16, overflow: "hidden" };
const feeDetailsTitleStyle = { fontSize: 16, fontWeight: 600, color: "#333", marginBottom: 20 };
const feeItemStyle = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 };
const feeDescriptionStyle = { color: "#666", fontSize: 15, lineHeight: 1.4 };
const feeAmountStyle = { fontWeight: 600, color: "#333", fontSize: 15 };
const subtotalStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, marginBottom: 16 };
const subtotalTextStyle = { color: "#666", fontSize: 15 };
const subtotalAmountStyle = { fontWeight: 600, color: "#333", fontSize: 15 };
const dividerStyle = { height: 1, backgroundColor: "#e5e5e5", margin: "16px 0" };
const totalPaymentStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 };
const totalTextStyle = { fontWeight: 600, color: "#333", fontSize: 16 };
const totalAmountStyle = { fontWeight: 700, color: "#333", fontSize: 18 };
const payButtonStyle = { width: "100%", backgroundColor: "#e67e22", color: "white", border: "none", borderRadius: 8, padding: 16, fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "background-color 0.2s, transform 0.1s" };

// Utility to load Razorpay script
function loadRazorpayScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function FeePaymentPendingPayment() {
  const navigate = useNavigate();
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  // Fetch pending invoices after last paid month
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const mobile = localStorage.getItem('parentMobile');
        if (!mobile) {
          setError("Please login to view pending payments");
          setLoading(false);
          return;
        }
        const response = await fetch(`https://mkfeez.mimansakids.com/get-pending-after-payment/${mobile}`);
        if (!response.ok) throw new Error("Failed to fetch pending invoices");
        const data = await response.json();
        setPendingInvoices(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  // Payment handler for each invoice
  const handlePayNow = async (amount, invoiceNumber) => {
    setIsPaying(true);
    try {
      // Create order via backend
      const response = await fetch("https://mkfeez.mimansakids.com/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error("Failed to create payment order");
      const order = await response.json();

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!scriptLoaded) {
        alert("Razorpay payment system failed to load");
        return;
      }
      const storedMobile = localStorage.getItem('parentMobile');
const contact = storedMobile || "";

console.log("Contact being sent to Razorpay:", contact); // <--- ADD THIS LINE
      // Configure payment options
      const options = {
        key: order.key, // Replace with your Razorpay Key ID
        amount: order.amount,
        currency: order.currency,
        name: "Your School Name",
        description: "Fee Payment",
        order_id: order.order_id,

        handler: async function (response) {
  // Update payment status in backend
  console.log('Razorpay handler called', response);
  await fetch('https://mkfeez.mimansakids.com/update-payment-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invoice_number: invoiceNumber,
      payment_id: response.razorpay_payment_id
    })
  });
  
  // Navigate to success page with payment data
  navigate('/payment-success', {
    state: {
      amount: amount,
      paymentId: response.razorpay_payment_id,
      orderId: response.razorpay_order_id,
      invoiceNumber: invoiceNumber
    }
  });
},

        modal: {
          ondismiss: function() {
            alert("Payment cancelled or window closed");
          }
        },
        prefill: {
          name: "Parent Name",
          email: "parent@example.com",
          contact: contact
        },
        theme: { color: "#e67e22" }
      };
      console.log("parentMobile in localStorage:", 
      localStorage.getItem('parentMobile'));
      console.log("🧾 Razorpay Options:", options);
      console.log("🪟 Opening Razorpay window now...");

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(`❌ Payment Failed! Reason: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      alert(`⚠️ Error: ${error.message}`);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerRowStyle}>
          <span style={headerIconStyle} onClick={() => navigate(-1)} aria-label="Back" role="button">←</span>
          <span style={headerTitleStyle}>Pending Payments</span>
          <span style={headerIconStyle} onClick={() => alert("Notifications")} aria-label="Notifications" role="button">
            <Bell size={22} color="#666" />
          </span>
        </div>
        <div style={contentStyle}>
          {loading ? (
            <div style={{ textAlign: "center", marginTop: 60 }}>Loading pending invoices...</div>
          ) : error ? (
            <div style={{ color: "red", textAlign: "center", marginTop: 60 }}>{error}</div>
          ) : pendingInvoices.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 60 }}>No pending payments! 🎉</div>
          ) : (
            pendingInvoices.map((inv) => (
              <div key={inv.invoice_number} style={{ marginBottom: 40 }}>
                <div style={pendingTextStyle}>Pending for {inv.month}</div>
                <div style={amountStyle}>₹ {inv.amount}</div>
                <div style={avatarsStyle}>
                  <div style={avatarStyle}>M</div>
                  <img src={Logo} alt="Logo" style={{ ...avatarStyle, objectFit: "cover", background: "#fff", padding: 4 }} />
                </div>
                <div>
                  <div style={feeDetailsTitleStyle}>Fee Details :</div>
                  <div style={feeItemStyle}>
                    <div style={feeDescriptionStyle}>
                      <div>Daycare Fee for</div>
                      <div>{inv.month}</div>
                    </div>
                    <div style={feeAmountStyle}>₹ {inv.amount}</div>
                  </div>
                  <div style={subtotalStyle}>
                    <span style={subtotalTextStyle}>Sub Total</span>
                    <span style={subtotalAmountStyle}>₹ {inv.amount}</span>
                  </div>
                  <div style={dividerStyle}></div>
                  <div style={totalPaymentStyle}>
                    <span style={totalTextStyle}>Total payment</span>
                    <span style={totalAmountStyle}>₹ {inv.amount}</span>
                  </div>
                </div>
                <button
                  style={payButtonStyle}
                  onClick={() => handlePayNow(inv.amount, inv.invoice_number)}
                  disabled={isPaying}
                >
                  {isPaying ? "Processing..." : "Pay Now"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
