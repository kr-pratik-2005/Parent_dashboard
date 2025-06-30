import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

function generateDaysArray(selectedDate) {
  const daysArr = [];
  for (let i = 4; i >=0; i--) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - i);
    daysArr.push({
      num: d.toLocaleDateString("en-US", { day: "2-digit" }),
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      active: i === 0
    });
  }
  return daysArr;
}

export default function StudentReportDashboard() {  
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [days, setDays] = useState(generateDaysArray(new Date()));
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const navigate = useNavigate();

  // Simulate data fetching based on selected date
useEffect(() => {
  const fetchAttendanceData = async () => {
    let dateObj;

    // Step 1: Check if selectedDate is a valid Date object
    if (selectedDate instanceof Date && !isNaN(selectedDate)) {
      dateObj = selectedDate;
    } else {
      try {
        dateObj = new Date(selectedDate);
        if (isNaN(dateObj)) throw new Error("Invalid date");
      } catch {
        console.error("Selected date is invalid:", selectedDate);
        return;
      }
    }

    // Step 2: Now it's safe to use
    const dateStr = dateObj.toISOString().split("T")[0];
    const day = dateObj.getDate();

    if (day % 3 === 0) {
      setAttendanceStatus({
        status: "present",
        time_in: "8:45 AM",
        time_out: "1:15 PM",
        grade: "A"
      });
    } else if (day % 3 === 1) {
      setAttendanceStatus({
        status: "leave",
        reason: "Medical appointment"
      });
    } else {
      setAttendanceStatus({
        status: "holiday",
        holiday_name: "Teachers' Day"
      });
    }
  };

  fetchAttendanceData();
}, [selectedDate]);


  const handleCalendarClick = () => setShowDatePicker(true);
  
  const handleDateChange = (date) => {
    
    setShowDatePicker(false);
    setDays(generateDaysArray(date));
  };
  
  const handleBackClick = () => navigate("/parent-dashboard");
  
  const handleDayClick = (index) => {
    const updatedDays = days.map((day, i) => ({
      ...day,
      active: i === index
    }));
    setDays(updatedDays);
    
    // Update selected date based on clicked day
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (index - days.findIndex(d => d.active)));
     // ✅ Use the prop function instead

  };

  // Render UI based on attendance status
  const renderReportCard = () => {
    if (!attendanceStatus) return <div>Loading report...</div>;
    
    switch(attendanceStatus.status) {
      // Inside the renderReportCard() function, replace the "present" case:

case "present":
  return (
    <div className="rr-report-card" style={styles.reportCard}>
      <h2 className="rr-report-title" style={styles.reportTitle}>
        Detailed Report
      </h2>
      <div style={styles.timeGrid}>
        <div style={styles.timeColumn}>
          <div className="rr-time-label" style={styles.timeLabel}>In</div>
          <div className="rr-time-btn" style={styles.timeValue}>
            {attendanceStatus.time_in}
          </div>
        </div>
        <div style={styles.timeColumn}>
          <div className="rr-time-label" style={styles.timeLabel}>Out</div>
          <div className="rr-time-btn" style={styles.timeValue}>
            {attendanceStatus.time_out}
          </div>
        </div>
      </div>
    </div>
  );

        
      
      default:
        return <div>No attendance data available</div>;
    }
  };

  return (
    <div style={styles.container}>
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
        <div className="rr-header" style={styles.header}>
          <div style={styles.backButton} onClick={handleBackClick} role="button" tabIndex={0}>
            ‹
          </div>
          <div style={styles.profileSection}>
            <div className="rr-profile-img" style={styles.profileImage}>
              <div style={styles.profileIcon}>👦</div>
            </div>
            <h1 className="rr-title" style={styles.title}>
              Rithik's Report
            </h1>
          </div>
        </div>

        {/* Date Badge */}
        <div style={styles.dateBadgeContainer}>
  <div className="rr-badge" style={styles.dateBadge} onClick={handleCalendarClick}>
    📅 {selectedDate instanceof Date ? selectedDate.toLocaleDateString() : "Invalid Date"}
  </div>
  {showDatePicker && (
    <div style={styles.datePickerContainer}>
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
        <div className="rr-date-nav" style={styles.dateNavigation}>
          {days.map((day, index) => (
            <div
              key={index}
              className={day.active ? "rr-day-btn-active" : "rr-day-btn"}
              style={{
                ...styles.dayButton,
                ...(day.active ? styles.activeDayButton : {})
              }}
              onClick={() => handleDayClick(index)}
            >
              <span style={styles.dayNumber}>{day.num}</span>
              <span style={styles.dayText}>{day.day}</span>
            </div>
          ))}
        </div>

        {/* Dynamic Report Card */}
        {renderReportCard()}
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#f5f5f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    boxSizing: 'border-box',
    overflowX: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '24px 20px 30px 20px',
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '38px',
    color: '#666',
    cursor: 'pointer',
  },
  profileSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  profileIcon: {
    fontSize: '32px',
  },
  title: {
    fontWeight: 500,
    color: '#333',
    margin: 0,
    fontSize: '18px',
  },
  dateBadgeContainer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    marginBottom: '20px',
    padding: '0 20px',
    boxSizing: 'border-box',
  },
  dateBadge: {
    backgroundColor: '#fff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#666',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    cursor: 'pointer',
  },
  datePickerContainer: {
    position: 'absolute',
    top: '110px',
    right: '20px',
    zIndex: 100,
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  dateNavigation: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '24px',
    gap: '8px',
    padding: '0 20px',
    boxSizing: 'border-box',
  },
  dayButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 8px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '50px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.09)',
    transition: 'all 0.2s ease',
  },
  activeDayButton: {
    backgroundColor: '#000',
    color: '#fff',
  },
  dayNumber: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '2px',
  },
  dayText: {
    fontSize: '12px',
    opacity: 0.8,
  },
  reportCard: {
    backgroundColor: '#e5e7eb',
    borderRadius: '20px',
    padding: '30px 24px',
    minHeight: '320px',
    position: 'relative',
    margin: '0 20px',
  },
  reportTitle: {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: '32px',
  },
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '18px',
    marginBottom: '40px',
  },
  timeColumn: {
    textAlign: 'center',
  },
  timeLabel: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '12px',
  },
  timeValue: {
    backgroundColor: '#fff',
    padding: '16px 24px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    width: '100%',
  },
  gradeContainer: {
    textAlign: 'center',
    marginTop: '20px',
  },
  gradeLabel: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  gradeValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  statusDescription: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  leaveReason: {
    textAlign: 'center',
    fontSize: '15px',
    color: '#d9534f',
    marginBottom: '30px',
  },
  holidayName: {
    textAlign: 'center',
    fontSize: '15px',
    color: '#5bc0de',
    marginBottom: '30px',
  },
  actionButton: {
    display: 'block',
    margin: '20px auto 0',
    padding: '12px 32px',
    backgroundColor: '#432623',
    color: '#fff',
    border: 'none',
    borderRadius: '24px',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'background-color 0.2s',
  },
};
