import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

// ---- COMPONENT ----
function generateDaysArray(selectedDate) {
  const daysArr = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + i);
    daysArr.push({
      num: d.toLocaleDateString("en-US", { day: "2-digit" }),
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      active: i === 0
    });
  }
  return daysArr;
}

export default function RithikReport() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [days, setDays] = useState(generateDaysArray(new Date()));
  const navigate = useNavigate();

  const handleCalendarClick = () => setShowDatePicker(true);
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    setDays(generateDaysArray(date));
  };
  const handleBackClick = () => {
    navigate("/parent-dashboard");
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 600px) {
          .rr-container { max-width: 100vw; padding: 0 0 40px 0; }
          .rr-header { padding: 18px 12px 22px 12px; }
          .rr-profile-img { width: 48px !important; height: 48px !important; }
          .rr-title { font-size: 16px !important; }
          .rr-badge { font-size: 13px !important; padding: 7px 12px !important; }
          .rr-date-nav { gap: 4px !important; }
          .rr-day-btn, .rr-day-btn-active { min-width: 40px !important; font-size: 13px !important; padding: 8px 4px !important; }
          .rr-report-card { margin: 0 8px !important; padding: 18px 8px !important; min-height: 240px !important; }
          .rr-report-title { font-size: 16px !important; margin-bottom: 22px !important; }
          .rr-time-label { font-size: 14px !important; }
          .rr-time-btn { font-size: 15px !important; padding: 12px 8px !important; }
        }
        @media (min-width: 601px) {
          .rr-container { max-width: 420px; margin: 0 auto; padding: 0 0 60px 0; }
          .rr-header { padding: 24px 20px 30px 20px; }
          .rr-profile-img { width: 60px !important; height: 60px !important; }
          .rr-title { font-size: 18px !important; }
          .rr-badge { font-size: 14px !important; padding: 8px 16px !important; }
          .rr-date-nav { gap: 8px !important; }
          .rr-day-btn, .rr-day-btn-active { min-width: 50px !important; font-size: 14px !important; padding: 12px 8px !important; }
          .rr-report-card { margin: 0 20px !important; padding: 30px 24px !important; min-height: 400px !important; }
          .rr-report-title { font-size: 18px !important; margin-bottom: 40px !important; }
          .rr-time-label { font-size: 16px !important; }
          .rr-time-btn { font-size: 16px !important; padding: 16px 24px !important; }
        }
      `}</style>

      <div className="rr-container">
        {/* Header */}
        <div className="rr-header" style={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }}>
          <div
            style={{
              fontSize: '38px',
              color: '#666',
              cursor: 'pointer',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            onClick={handleBackClick}
            role="button"
            tabIndex={0}
            aria-label="Go back"
          >
            ‹
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div className="rr-profile-img" style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundImage: 'linear-gradient(45deg, #ff6b35, #f7931e, #4CAF50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
              position: 'relative'
            }}>
              <div style={{
                width: 30,
                height: 30,
                backgroundColor: '#fff',
                borderRadius: '50%'
              }} />
            </div>
            <h1 className="rr-title" style={{
              fontWeight: 500,
              color: '#333',
              margin: 0,
              fontSize: 18
            }}>
              Rithik's Report
            </h1>
          </div>
        </div>

        {/* Date Badge */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          width: "100%",
          marginBottom: '20px'
        }}>
          <div
            className="rr-badge"
            style={{
              backgroundColor: '#fff',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              color: '#666',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              cursor: 'pointer'
            }}
            onClick={handleCalendarClick}
            role="button"
            tabIndex={0}
          >
            📅 {selectedDate.toLocaleDateString()}
          </div>
          {showDatePicker && (
            <div style={{
              position: 'absolute',
              top: 110,
              right: 20,
              zIndex: 100
            }}>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                inline
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
          )}
        </div>

        {/* Date Navigation */}
        <div className="rr-date-nav" style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '24px',
          gap: 8
        }}>
          {days.map((day, index) => (
            <div
              key={index}
              className={day.active ? "rr-day-btn-active" : "rr-day-btn"}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 8px',
                borderRadius: '12px',
                backgroundColor: day.active ? '#000' : '#fff',
                color: day.active ? '#fff' : '#333',
                fontSize: '14px',
                fontWeight: '500',
                minWidth: '50px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.09)'
              }}
            >
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '2px'
              }}>{day.num}</span>
              <span style={{
                fontSize: '12px',
                opacity: 0.8
              }}>{day.day}</span>
            </div>
          ))}
        </div>

        {/* Detailed Report Card */}
        <div className="rr-report-card" style={{
          backgroundColor: '#e5e7eb',
          borderRadius: '20px',
          padding: '30px 24px',
          minHeight: '320px',
          position: 'relative'
        }}>
          <h2 className="rr-report-title" style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: '500',
            color: '#4b5563',
            marginBottom: '32px'
          }}>
            Detailed Report
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '18px',
            marginBottom: '40px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div className="rr-time-label" style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '12px'
              }}>In</div>
              <button className="rr-time-btn" style={{
                backgroundColor: '#fff',
                padding: '16px 24px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#333',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                width: '100%'
              }}>9:00 Am</button>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="rr-time-label" style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '12px'
              }}>Out</div>
              <button className="rr-time-btn" style={{
                backgroundColor: '#fff',
                padding: '16px 24px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#333',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                width: '100%'
              }}>1:00 Pm</button>
            </div>
          </div>
          {/* Add more report details here as needed */}
        </div>
      </div>
    </div>
  );
}
