import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from 'lucide-react';
import Logo from '../assets/Logo.png'; // adjust the path if needed

// ...
const avatarsStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 0, // no space between
  marginBottom: 40,
};


const containerStyle = {
  minHeight: "100vh",
  width: "100vw",
  margin: 0,
  padding: 0,
  background: "#f5f5f5",
  fontFamily: "sans-serif",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  boxSizing: "border-box",
};

const cardStyle = {
  maxWidth: 375,
  width: "100%",
  background: "white",
  minHeight: 805,
  boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
  borderRadius: 16,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const headerRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px",
  borderBottom: "1px solid #e5e5e5",
  background: "white",
};

const headerIconStyle = {
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
};

const headerTitleStyle = {
  flex: 1,
  textAlign: "center",
  fontSize: 18,
  fontWeight: 600,
  color: "#333",
};

const contentStyle = {
  padding: "24px 20px",
  flex: 1,
  display: "flex",
  flexDirection: "column",
};

const pendingTextStyle = {
  color: "#666",
  fontSize: 16,
  marginBottom: 8,
  textAlign: "center",
};

const amountStyle = {
  fontSize: 32,
  fontWeight: 700,
  color: "#333",
  marginBottom: 20,
  textAlign: "center",
};


const avatarStyle = {
  width: 48,
  height: 48,
  backgroundColor: "#d1d5db",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 600,
  color: "#666",
  fontSize: 16,
  overflow: "hidden", 
};

const feeDetailsTitleStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: "#333",
  marginBottom: 20,
};

const feeItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 16,
};

const feeDescriptionStyle = {
  color: "#666",
  fontSize: 15,
  lineHeight: 1.4,
};

const feeAmountStyle = {
  fontWeight: 600,
  color: "#333",
  fontSize: 15,
};

const subtotalStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: 8,
  marginBottom: 16,
};

const subtotalTextStyle = {
  color: "#666",
  fontSize: 15,
};

const subtotalAmountStyle = {
  fontWeight: 600,
  color: "#333",
  fontSize: 15,
};

const dividerStyle = {
  height: 1,
  backgroundColor: "#e5e5e5",
  margin: "16px 0",
};

const totalPaymentStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 32,
};

const totalTextStyle = {
  fontWeight: 600,
  color: "#333",
  fontSize: 16,
};

const totalAmountStyle = {
  fontWeight: 700,
  color: "#333",
  fontSize: 18,
};

const payButtonStyle = {
  width: "100%",
  backgroundColor: "#9ca3af",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: 16,
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  transition: "background-color 0.2s, transform 0.1s",
};

export default function FeePaymentPendingPayment() {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerRowStyle}>
          <span
            style={headerIconStyle}
            onClick={() => navigate(-1)}
            aria-label="Back"
            role="button"
          >
            ←
          </span>
          <span style={headerTitleStyle}>Fee Summary</span>
          <span
            style={headerIconStyle}
            onClick={() => alert("Notifications")}
            aria-label="Notifications"
            role="button"
          >
            <Bell size={22} color="#666" />
          </span>
        </div>

        {/* Main Content */}
        <div style={contentStyle}>
          <div style={pendingTextStyle}>Your pending payment</div>
          <div style={amountStyle}>₹ 9,500</div>
          



<div style={avatarsStyle}>
  <div style={avatarStyle}>M</div>
  <img
    src={Logo}
    alt="Logo"
    style={{
      ...avatarStyle,
      objectFit: "cover",
      background: "#fff", // optional, for a white circle background
      padding: 4 // optional, adjust for best appearance
    }}
  />
</div>


          {/* Fee Details Section */}
          <div>
            <div style={feeDetailsTitleStyle}>Fee Details :</div>
            <div style={feeItemStyle}>
              <div style={feeDescriptionStyle}>
                <div>Daycare Fee for</div>
                <div>April 2025</div>
              </div>
              <div style={feeAmountStyle}>₹ 9,500</div>
            </div>
            <div style={subtotalStyle}>
              <span style={subtotalTextStyle}>Sub Total</span>
              <span style={subtotalAmountStyle}>₹ 9,500</span>
            </div>
            <div style={dividerStyle}></div>
            <div style={totalPaymentStyle}>
              <span style={totalTextStyle}>Total payment</span>
              <span style={totalAmountStyle}>₹ 9,500</span>
            </div>
          </div>
          <button
            style={payButtonStyle}
            onClick={() => alert("Pay Now clicked")}
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
}
