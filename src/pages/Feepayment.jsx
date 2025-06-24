import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Loader } from 'lucide-react';
import BottomNav from '../components/BottomNav';

// --- Style definitions (add your own or keep as before) ---
const containerStyle = { maxWidth: 480, margin: "0 auto", padding: 16, background: "#f9f9f9", minHeight: "100vh" };
const headerRowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 };
const headerBtnStyle = { background: "none", border: "none", fontSize: 22, cursor: "pointer" };
const headerTitleStyle = { fontWeight: 700, fontSize: 18, flex: 1, textAlign: "center" };
const headerIconStyle = { cursor: "pointer", padding: 4 };
const searchRowStyle = { display: "flex", alignItems: "center", marginBottom: 16, gap: 8 };
const searchInputStyle = { flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ddd" };
const filterBtnStyle = { padding: "8px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" };
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

// Utility to load Razorpay script
function loadRazorpayScript(src) {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
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
  const [invoices, setInvoices] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState("");
  const razorpayScriptLoaded = useRef(false);

  // Use environment variable for API URL
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Fetch invoices on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedMobile = localStorage.getItem('parentMobile');
        setMobile(storedMobile);

        if (!storedMobile) {
          setError("Please login to view invoices");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/get-pending-after-payment/${storedMobile}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        setInvoices(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  // Toggle invoice details
  const handleToggle = (month) => {
    setOpenInvoice((prev) => (prev === month ? null : month));
  };

  // Handle payment flow
  const handlePayFees = async (feeAmount, invoiceNumber) => {
    setIsProcessing(true);

    try {
      // Create order via backend
      const orderResponse = await fetch(`${API_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: feeAmount }),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        throw new Error(`Order creation failed: ${errorText}`);
      }

      const order = await orderResponse.json();

      // Load Razorpay script only once
      if (!razorpayScriptLoaded.current) {
        const scriptLoaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!scriptLoaded) {
          alert("Razorpay payment system failed to load");
          setIsProcessing(false);
          return;
        }
        razorpayScriptLoaded.current = true;
      }

      // Configure payment options
      const paymentOptions = {
        key: "rzp_test_ofNPcpgm5CLqie", // Replace with your Razorpay Key ID for production
        amount: order.amount,
        currency: order.currency,
        name: "Mimansa School",
        description: "Fee Payment",
        order_id: order.id,
        handler: async function (response) {
          // Update payment status in backend
          const updateResponse = await fetch(`${API_URL}/update-payment-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              invoice_number: invoiceNumber,
              payment_id: response.razorpay_payment_id
            })
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Payment update failed: ${errorText}`);
          }

          // Refresh invoice list
          const refreshResponse = await fetch(`${API_URL}/get-pending-after-payment/${mobile}`);
          if (!refreshResponse.ok) {
            const errorText = await refreshResponse.text();
            throw new Error(`Refresh failed: ${errorText}`);
          }

          const newData = await refreshResponse.json();
          setInvoices(newData);
          alert(`✅ Payment Successful! ID: ${response.razorpay_payment_id}`);
        },
        modal: {
          ondismiss: function() {
            alert("Payment cancelled or window closed");
          }
        },
        prefill: {
          name: "Parent Name",
          email: "parent@example.com",
          contact: mobile || "9999999999"
        },
        theme: { color: "#e67e22" }
      };

      const rzp = new window.Razorpay(paymentOptions);
      rzp.on('payment.failed', function (response) {
        alert(`❌ Payment Failed! Reason: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      alert(`⚠️ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <Loader size={32} className="animate-spin" />
      <div>Loading invoices...</div>
    </div>
  );

  if (error) return (
    <div style={{ 
      textAlign: 'center', 
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{color: 'red', fontSize: 18}}>{error}</div>
      <button 
        style={payNowBtnStyle}
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );

  return (
    <div style={containerStyle}>
      {/* Header Row */}
      <div style={headerRowStyle}>
        <button onClick={() => navigate(-1)} style={headerBtnStyle} aria-label="Back">←</button>
        <div style={headerTitleStyle}>Fees Payment</div>
        <span style={headerIconStyle} onClick={() => alert("Notifications")} aria-label="Notifications" role="button">
          <Bell size={22} color="#666" />
        </span>
      </div>

      {/* Search Bar */}
      <div style={searchRowStyle}>
        <input 
          style={searchInputStyle} 
          placeholder="Search" 
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <button style={filterBtnStyle}>☰</button>
      </div>

      {/* Pending Payment Box */}
      <div style={pendingBoxStyle}>
        <div>
          <span style={{ fontSize: 21, marginRight: 10 }}>🕑</span>
          <span style={pendingInfoStyle}>
            Pending Payment<br />
            <span style={{ fontSize: 13, color: "#888" }}>
              You have <span style={pendingCountStyle}>
                {invoices.length} payment
              </span> pending
            </span>
          </span>
        </div>
        <button style={invoiceBtnStyle}>View &gt;</button>
      </div>

      {/* Invoice Cards */}
      {invoices.length > 0 ? (
        invoices.map((inv) => (
          <div key={inv.invoice_number} style={invoiceCardStyle}>
            <div style={rowBetweenStyle}>
              <span>
                <span style={amountStyle}>₹ {inv.amount}</span>
                <span style={inv.status === "paid" ? statusPaidStyle : statusDueStyle}>
                  {inv.status}
                </span>
              </span>
              {inv.status === "pending" ? (
                <button
                  style={isProcessing ? {...payNowBtnStyle, background: "#aaa"} : payNowBtnStyle}
                  onClick={() => handlePayFees(inv.amount, inv.invoice_number)}
                  disabled={isProcessing}
                >
                  {isProcessing ? 
                    <span style={{display: "flex", alignItems: "center", gap: "5px"}}>
                      <Loader size={16} /> Processing...
                    </span> : 
                    "Pay Now"
                  }
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
                  <b>{inv.invoice_number}</b>
                </div>
                <div style={{ marginTop: 4 }}>
                  Payment Date<br />
                  <b>{inv.payment_date || "Not paid yet"}</b>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: 20 }}>
          No pending payments found
          <div style={{marginTop: 10, fontSize: 14, color: "#666"}}>
            Future invoices will appear after your next payment
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
