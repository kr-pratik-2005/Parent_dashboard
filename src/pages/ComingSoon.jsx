import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

const ComingSoon = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, Arial, sans-serif",
      maxWidth: 420,
      margin: "0 auto",
      position: "relative"
    }}>
      <button
        style={{
          background: "none",
          border: "none",
          position: "absolute",
          left: 18,
          top: 18,
          cursor: "pointer"
        }}
        onClick={() => navigate(-1)}
        aria-label="Back"
      >
        <ChevronLeft size={28} color="#666" />
      </button>
      <div style={{
        background: "#fff",
        borderRadius: 18,
        padding: "48px 28px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#a084e8", fontWeight: 700, fontSize: 28, marginBottom: 18 }}>Coming Soon</h2>
        <p style={{ color: "#888", fontSize: 17, marginBottom: 0 }}>
          This feature is under development.<br />Stay tuned!
        </p>
      </div>
      <div style={{ height: 80 }} />
      <BottomNav />
    </div>
  );
};

export default ComingSoon;
