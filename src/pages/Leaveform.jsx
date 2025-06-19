import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";

function RequestSubmittedModal({ open, onClose }) {
  if (!open) return null;
  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.32);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .modal-content {
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 6px 32px rgba(0,0,0,0.18);
          padding: 32px 22px 24px 22px;
          width: 90vw;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .modal-checkmark {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #444;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }
        .modal-checkmark svg {
          width: 36px;
          height: 36px;
          color: #fff;
        }
        .modal-title {
          font-size: 21px;
          font-weight: 700;
          color: #222;
          margin-bottom: 7px;
          text-align: center;
        }
        .modal-subtitle {
          font-size: 15px;
          color: #888;
          margin-bottom: 24px;
          text-align: center;
        }
        .modal-confirm-btn {
          width: 100%;
          background: #bdbdbd;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px 0;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 0;
          cursor: pointer;
          transition: background .18s;
        }
        .modal-close-btn {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: -32px;
          background: #fff;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .modal-close-btn svg {
          width: 22px;
          height: 22px;
          color: #888;
        }
        @media (max-width: 400px) {
          .modal-content {
            padding: 22px 8px 18px 8px;
            max-width: 94vw;
          }
        }
      `}</style>
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-checkmark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="11" stroke="none" fill="none"/>
              <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="modal-title">Request Submitted</div>
          <div className="modal-subtitle">Thanks for your information</div>
          <button className="modal-confirm-btn" onClick={onClose}>
            Confirm
          </button>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="11" stroke="none" fill="none"/>
              <line x1="8" y1="8" x2="16" y2="16" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="8" x2="8" y2="16" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

const headerIconStyle = {
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  flexShrink: 0,
};

export default function Leaveform() {
  const [todayLeave, setTodayLeave] = useState(null);
  const [todayReason, setTodayReason] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const [futureFrom, setFutureFrom] = useState(today);
  const [futureTo, setFutureTo] = useState(today);

  const [futureReason, setFutureReason] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const dropdownOptions = [
    "Sick",
    "Doctor’s Appointment",
    "Family Emergency",
    "Others"
  ];

  // Automatically update "To" date when "From" date changes
  useEffect(() => {
    if (futureFrom > futureTo) {
      setFutureTo(futureFrom);
    }
  }, [futureFrom, futureTo]);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate dates
    if (futureFrom > futureTo) {
      alert("End date cannot be earlier than start date");
      return;
    }
    
    setModalOpen(true);
  };

  // Handle "From" date change
  const handleFromChange = (e) => {
    const newFrom = e.target.value;
    setFutureFrom(newFrom);
    
    // If new "From" date is after current "To" date, update "To" date
    if (newFrom > futureTo) {
      setFutureTo(newFrom);
    }
  };

  return (
    <div style={styles.bg}>
      <style>{`
        .leave-toggle-btn {
          padding: 6px 22px;
          border-radius: 20px;
          border: none;
          font-weight: 500;
          font-size: 15px;
          margin-right: 8px;
          margin-left: 0;
          background: #eee;
          color: #888;
          transition: all .15s;
        }
        .leave-toggle-btn.active {
          background: #444;
          color: #fff;
        }
        .dropdown-box {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #ddd;
          margin-bottom: 18px;
          margin-top: 6px;
          padding: 0;
          position: relative;
        }
        .dropdown-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          font-size: 16px;
          color: #444;
          cursor: pointer;
          justify-content: space-between;
        }
        .dropdown-list {
          position: absolute;
          left: 0;
          right: 0;
          top: 48px;
          background: #fff;
          border-radius: 0 0 14px 14px;
          border: 1px solid #eee;
          border-top: none;
          z-index: 10;
          box-shadow: 0 4px 18px rgba(0,0,0,0.05);
        }
        .dropdown-item {
          padding: 12px 16px;
          font-size: 16px;
          color: #444;
          cursor: pointer;
          transition: background .15s;
        }
        .dropdown-item:hover, .dropdown-item.selected {
          background: #f6f6f6;
        }
        .calendar-input {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 10px 12px 10px 38px;
          font-size: 15px;
          color: #444;
          width: 100%;
          outline: none;
        }
        .calendar-wrap {
          position: relative;
          width: 100%;
        }
        .calendar-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
        }
        .submit-btn {
          width: 100%;
          background: #bbb;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 14px 0;
          font-size: 18px;
          font-weight: 500;
          margin-top: 18px;
          cursor: pointer;
          transition: background .2s;
        }
        .submit-btn:active {
          background: #888;
        }
        @media (max-width: 480px) {
          .leave-req-container {
            max-width: 100vw !important;
            padding: 0 0 32px 0 !important;
          }
        }
      `}</style>
      <RequestSubmittedModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <form className="leave-req-container" style={styles.container} onSubmit={handleSubmit}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backBtn} aria-label="Back" type="button">{'‹'}</button>
          <span style={styles.headerTitle}>Leave request</span>
          <span
            style={headerIconStyle}
            onClick={() => alert("Notifications")}
            aria-label="Notifications"
            role="button"
          >
            <Bell size={22} color="#666" />
          </span>
        </div>

        {/* Today's date */}
        <div style={styles.topDateRow}>
          <div className="calendar-wrap" style={{ width: 140 }}>
            <span className="calendar-icon">
              <svg width="18" height="18" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="16" rx="4" />
                <path d="M16 3v4M8 3v4M3 9h18" />
              </svg>
            </span>
            <input
              className="calendar-input"
              type="text"
              value={new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: '2-digit',
                year: 'numeric'
              })}
              disabled
              readOnly
            />
          </div>
        </div>

        {/* Child is leave today */}
        <div style={styles.sectionLabel}>Child is leave today</div>
        <div style={styles.toggleRow}>
          <button
            type="button"
            className={`leave-toggle-btn${todayLeave === true ? " active" : ""}`}
            onClick={() => setTodayLeave(true)}
          >Yes</button>
          <button
            type="button"
            className={`leave-toggle-btn${todayLeave === false ? " active" : ""}`}
            onClick={() => setTodayLeave(false)}
          >No</button>
        </div>

        {/* Reason Dropdown */}
        <div style={{ ...styles.sectionLabel, marginTop: 20, marginBottom: 6 }}>
          Reason (Optional)
        </div>
        <div className="dropdown-box">
          <div
            className="dropdown-header"
            onClick={() => setDropdownOpen((o) => !o)}
            tabIndex={0}
          >
            <span>
              {dropdownValue || <span style={{ color: "#aaa" }}>Select reason</span>}
            </span>
            <span style={{ fontSize: 18, color: "#888" }}>▾</span>
          </div>
          {dropdownOpen && (
            <div className="dropdown-list">
              {dropdownOptions.map((option) => (
                <div
                  key={option}
                  className={`dropdown-item${dropdownValue === option ? " selected" : ""}`}
                  onClick={() => {
                    setDropdownValue(option);
                    setDropdownOpen(false);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Future Leave Section */}
        <div style={{ ...styles.sectionLabel, marginTop: 26 }}>
          Plan for future leave / vacation
        </div>
        <div style={styles.futureRow}>
          <div style={{ width: "38%" }}>
            <div style={styles.futureLabel}>From</div>
            <div className="calendar-wrap">
              <input
                className="calendar-input"
                type="date"
                value={futureFrom}
                onChange={handleFromChange}
                style={{ paddingLeft: 38, fontSize: 15 }}
                min={today} // Prevent selecting past dates
              />
            </div>
          </div>
          <div style={{ width: "38%" }}>
            <div style={styles.futureLabel}>To</div>
            <div className="calendar-wrap">
              <input
                className="calendar-input"
                type="date"
                value={futureTo}
                onChange={e => setFutureTo(e.target.value)}
                style={{ paddingLeft: 38, fontSize: 15 }}
                min={futureFrom} // Ensure "To" can't be before "From"
              />
            </div>
          </div>
        </div>

        {/* Future Reason */}
        <div style={{ ...styles.sectionLabel, marginTop: 18, marginBottom: 4 }}>
          Reason (Optional)
        </div>
        <textarea
          value={futureReason}
          onChange={e => setFutureReason(e.target.value)}
          style={styles.textarea}
          placeholder=""
          rows={3}
        />
        <div style={{ marginTop: 170 }}>
  <button className="submit-btn" type="submit">Submit</button>
</div>

      </form>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    background: "#fafafa",
    padding: 0,
    width: "100vw",
    fontFamily: 'Inter, Arial, sans-serif'
  },
  container: {
    maxWidth: 380,
    margin: "0 auto",
    padding: "0 0 40px 0",
    background: "#fafafa",
    minHeight: "100vh"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "28px 0 8px 0",
    marginBottom: 8
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: 32,
    color: "#888",
    cursor: "pointer",
    width: 40,
    height: 40,
    lineHeight: "40px"
  },
  headerTitle: {
    fontWeight: 600,
    fontSize: 18,
    color: "#444",
    flex: 1,
    textAlign: "center"
  },
  bellWrap: {
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  topDateRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 18,
    marginTop: 8
  },
  sectionLabel: {
    fontWeight: 500,
    fontSize: 15,
    color: "#444",
    marginBottom: 8
  },
  toggleRow: {
    display: "flex",
    gap: 10,
    marginBottom: 8
  },
  futureRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
    marginBottom: 6
  },
  futureLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4
  },
  textarea: {
    width: "100%",
    minHeight: 68,
    borderRadius: 14,
    border: "1px solid #ddd",
    padding: "10px 14px",
    fontSize: 15,
    color: "#444",
    background: "#fff",
    resize: "none",
    marginBottom: 0
  }
};
