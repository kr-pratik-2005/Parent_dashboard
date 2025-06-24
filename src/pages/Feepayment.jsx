import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Loader } from 'lucide-react';
import BottomNav from '../components/BottomNav';

// --- Style definitions ---
const containerStyle = { 
  maxWidth: 400, 
  margin: "0 auto", 
  background: "#f8f8f8", 
  minHeight: "100vh", 
  fontFamily: "sans-serif", 
  paddingBottom: 80 
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
  marginBottom: 16 
};

const searchInputStyle = { 
  flex: 1, 
  padding: "10px 14px", 
  border: "1px solid #ddd", 
  borderRadius: 8, 
  fontSize: 15, 
  background: "#fff" 
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
  cursor: "pointer" 
};

const pendingBoxStyle = { 
  background: "#dedede", 
  borderRadius: 12, 
  margin: "0 16px 16px 16px", 
  padding: "14px 16px", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "space-between" 
};

const pendingInfoStyle = { 
  color: "#444", 
  fontSize: 15 
};

const pendingCountStyle = { 
  fontWeight: 600, 
  color: "#222" 
};

const invoiceCardStyle = { 
  background: "#fff", 
  borderRadius: 14, 
  margin: "0 16px 18px 16px", 
  boxShadow: "0 1px 4px #0001", 
  padding: "18px 16px" 
};

const rowBetweenStyle = { 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "space-between" 
};

const amountStyle = { 
  fontWeight: 700, 
  fontSize: 18, 
  color: "#222" 
};

const statusPaidStyle = { 
  background: "#e6f5e6", 
  color: "#2d8a3c", 
  fontWeight: 600, 
  fontSize: 13, 
  borderRadius: 8, 
  padding: "3px 10px", 
  marginLeft: 8 
};

const statusDueStyle = { 
  background: "#fff4e6", 
  color: "#e67e22", 
  fontWeight: 600, 
  fontSize: 13, 
  borderRadius: 8, 
  padding: "3px 10px", 
  marginLeft: 8 
};

const invoiceBtnStyle = { 
  color: "#444", 
  fontWeight: 600, 
  fontSize: 15, 
  border: "none", 
  background: "none", 
  cursor: "pointer" 
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
  transition: "background 0.2s"
};

const detailsStyle = { 
  marginTop: 10, 
  color: "#666", 
  fontSize: 14, 
  borderTop: "1px solid #eee", 
  paddingTop: 10, 
  lineHeight: 1.6 
};

const debugPanelStyle = {
  background: "#f0f0f0",
  padding: "10px",
  borderRadius: "8px",
  margin: "10px 16px",
  fontSize: "14px",
  color: "#666"
};

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

export default function FeesPayment() {
  const navigate = useNavigate();
  const [openInvoice, setOpenInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState({});
  const [mobile, setMobile] = useState("");
  const API_URL = process.env.REACT_APP_API_URL;

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

        setDebugInfo(prev => ({...prev, step: "Fetching invoices", mobile: storedMobile}));

        const response = await fetch(`${API_URL}/get-pending-after-payment/${storedMobile}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        setDebugInfo(prev => ({...prev, 
          responseStatus: response.status, 
          invoiceCount: data.length,
          lastInvoice: data[0] ? data[0].month : "None"
        }));

        setInvoices(data);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setDebugInfo(prev => ({...prev, error: error.message}));
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, []);

  // Toggle invoice details
  const handleToggle = (month) => {
    setOpenInvoice((prev) => (prev === month ? null : month));
  };

  // Handle payment flow
  const handlePayFees = async (feeAmount, invoiceNumber) => {
    setIsProcessing(true);
    setDebugInfo(prev => ({...prev, 
      step: "Starting payment", 
      invoiceNumber,
      feeAmount
    }));

    try {
      // Create order via backend
      setDebugInfo(prev => ({...prev, step: "Creating payment order"}));
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
      setDebugInfo(prev => ({...prev, step: "Order created", orderId: order.id}));

      // Load Razorpay script
      setDebugInfo(prev => ({...prev, step: "Loading Razorpay script"}));
      const scriptLoaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");

      if (!scriptLoaded) {
        setDebugInfo(prev => ({...prev, error: "Razorpay script failed to load"}));
        alert("Razorpay payment system failed to load");
        return;
      }

      // Configure payment options
      const paymentOptions = {
        key: "rzp_test_ofNPcpgm5CLqie", // Replace with your Razorpay Key ID
        amount: order.amount,
        currency: order.currency,
        name: "Mimansa School",
        description: "Fee Payment",
        order_id: order.id,
        handler: async function (response) {
          setDebugInfo(prev => ({...prev, 
            step: "Payment successful", 
            paymentId: response.razorpay_payment_id
          }));

          // Update payment status in backend
          setDebugInfo(prev => ({...prev, step: "Updating payment status"}));
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
          setDebugInfo(prev => ({...prev, step: "Refreshing invoices"}));
          const refreshResponse = await fetch(`${API_URL}/get-pending-after-payment/${mobile}`);

          if (!refreshResponse.ok) {
            const errorText = await refreshResponse.text();
            throw new Error(`Refresh failed: ${errorText}`);
          }

          const newData = await refreshResponse.json();
          setInvoices(newData);
          setDebugInfo(prev => ({...prev, 
            step: "Data refreshed", 
            newInvoiceCount: newData.length
          }));

          alert(`✅ Payment Successful! ID: ${response.razorpay_payment_id}`);
        },
        modal: {
          ondismiss: function() {
            setDebugInfo(prev => ({...prev, step: "Payment cancelled"}));
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
        setDebugInfo(prev => ({...prev, 
          step: "Payment failed", 
          error: response.error.description
        }));
        alert(`❌ Payment Failed! Reason: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      setDebugInfo(prev => ({...prev, 
        step: "Payment error", 
        error: error.message
      }));
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