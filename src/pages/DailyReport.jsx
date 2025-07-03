import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// Helper function to generate days array (5-day window)
// Helper to format date to YYYY-MM-DD in local time
const formatDateToYYYYMMDD = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function generateDaysArray(selectedDate) {
  const daysArr = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - i);
    daysArr.push({
      num: d.toLocaleDateString("en-US", { day: "2-digit" }),
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: new Date(d),
      active: d.toDateString() === selectedDate.toDateString()  // ✅ FIXED

    });
  }
  return daysArr;
}

// Helper to parse local date from YYYY-MM-DD string
const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper to format date as DD/MM/YYYY
const formatDateDDMMYYYY = (date) => {
  return date.toLocaleDateString("en-GB");
};

export default function RithikReport() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dateParam = queryParams.get("date");

  // Default to current day if no date param
  const getDefaultDate = () => {
    if (dateParam) return parseLocalDate(dateParam);
    return new Date();
  };

  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [days, setDays] = useState(generateDaysArray(getDefaultDate()));
  const [report, setReport] = useState(null);

  // Fetch report data when date/student changes
  useEffect(() => {
    const fetchReport = async () => {
      const formatted = formatDateToYYYYMMDD(selectedDate);  // ✅ FIXED
      console.log("Fetching report for:", formatted);

      const res = await fetch(`http://localhost:5000/get-attendance-report/${studentId}?date=${formatted}`);
      const data = await res.json();
      setReport(data);
    };
    fetchReport();
  }, [selectedDate, studentId]);

  // Update date when URL param changes
  useEffect(() => {
    const updatedDate = dateParam ? parseLocalDate(dateParam) : getDefaultDate();
    setSelectedDate(updatedDate);
    setDays(generateDaysArray(updatedDate));
  }, [dateParam]);

  // Update URL when date changes
  const updateURLWithDate = (newDate) => {
   const formatted = formatDateToYYYYMMDD(newDate);  // ✅ FIXED

    navigate(`/daily-report/${studentId}?date=${formatted}`, { replace: true });
  };

  // Date picker handler
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    setDays(generateDaysArray(date));
    updateURLWithDate(date);
  };

  // Day navigation click handler
  const handleDayClick = (index) => {
    const newDate = days[index].date;
    setSelectedDate(newDate);
    const updatedDays = days.map((d, i) => ({ ...d, active: i === index }));
    setDays(updatedDays);
    updateURLWithDate(newDate);
  };

  // Back button handler
  const handleBackClick = () => navigate("/parent-dashboard");

  // Destructure report data with defaults
  const status = report?.status;
  const { time_in = "--", time_out = "--" } = report || {};

  // UI rendering based on status
  let reportContent = null;
  if (status === "present") {
    reportContent = (
      <>
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
            <div className="rr-time-btn" style={{
              backgroundColor: '#fff',
              padding: '16px 24px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#333',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              width: '100%'
            }}>{time_in}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="rr-time-label" style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '12px'
            }}>Out</div>
            <div className="rr-time-btn" style={{
              backgroundColor: '#fff',
              padding: '16px 24px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#333',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              width: '100%'
            }}>{time_out}</div>
          </div>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 18
        }}>
          <div style={{
            background: '#FFD600',
            color: '#333',
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 24,
            boxShadow: '0 2px 4px rgba(0,0,0,0.12)'
          }}>A</div>
        </div>
      </>
    );
  } else if (status === "leave") {
    reportContent = (
      <div style={{ textAlign: 'center', marginTop: 60 }}>
        <div style={{ fontSize: 18, color: '#444', marginBottom: 24 }}>
          Student on Leave
        </div>
        <div style={{ color: '#666', marginBottom: 32 }}>
          {report?.reason
            ? `Reason: ${report.reason}`
            : "Your child was on leave for the selected date."}
        </div>
        <button
          style={{
            background: '#3b2f2f',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '12px 28px',
            fontSize: 15,
            cursor: 'pointer'
          }}
          onClick={() => setShowDatePicker(true)}
        >
          Select Another Date
        </button>
      </div>
    );
  } else if (status === "holiday") {
    reportContent = (
      <div style={{ textAlign: 'center', marginTop: 60 }}>
        <div style={{ fontSize: 18, color: '#444', marginBottom: 24 }}>
          School Holiday
        </div>
        <div style={{ color: '#666', marginBottom: 32 }}>
          {report?.holiday_name
            ? `The school was closed for ${report.holiday_name}.`
            : "The school was closed for a holiday on the selected date."}
        </div>
        <button
          style={{
            background: '#3b2f2f',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '12px 28px',
            fontSize: 15,
            cursor: 'pointer'
          }}
          onClick={() => setShowDatePicker(true)}
        >
          Select Another Date
        </button>
      </div>
    );
  } else {
    // For absent, missing, or any unknown status
    reportContent = (
      <div style={{ textAlign: 'center', marginTop: 60 }}>
        <div style={{ fontSize: 18, color: '#444', marginBottom: 24 }}>
          No data available
        </div>
        <div style={{ color: '#666', marginBottom: 32 }}>
          No attendance data is available for the selected date.
        </div>
        <button
          style={{
            background: '#3b2f2f',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '12px 28px',
            fontSize: 15,
            cursor: 'pointer'
          }}
          onClick={() => setShowDatePicker(true)}
        >
          Select Another Date
        </button>
      </div>
    );
  }

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
              backgroundImage: 'url("https://via.placeholder.com/60")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              marginBottom: 10,
            }} />
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
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          margin: '20px 0'
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
            onClick={() => setShowDatePicker(true)}
            role="button"
            tabIndex={0}
          >
            📅 {formatDateDDMMYYYY(selectedDate)}
          </div>
          {showDatePicker && (
            <div style={{
              position: 'absolute',
              top: 110,
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
              onClick={() => handleDayClick(index)}
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

        {/* Report Card */}
        <div className="rr-report-card" style={{
          backgroundColor: '#e5e7eb',
          borderRadius: '20px',
          padding: '30px 24px',
          minHeight: '320px',
          position: 'relative'
        }}>
          {reportContent}
        </div>
      </div>
    </div>
  );
}
