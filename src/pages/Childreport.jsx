
import React, { useState } from 'react';


const CalendarComponent = ({ selectedDate, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [showDropdown, setShowDropdown] = useState(false); 

  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const selectedDay = selectedDate ? selectedDate.getDate() : new Date().getDate();

  const handleMonthChange = (e) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(e.target.value));
    setCurrentDate(newDate);
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  const handleYearChange = (e) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(e.target.value));
    setCurrentDate(newDate);
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  const handleDateChange = (e) => {
    const newDate = new Date(currentDate);
    newDate.setDate(parseInt(e.target.value));
    setCurrentDate(newDate);
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString('en-US', { month: 'long' })
  );
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  
  // Get the number of days in the current month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Navigate months
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Show only 5 days (Monday-Friday)
  const getWeekDates = () => {
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    const dayOfWeek = today.getDay();
    // Adjust so week starts from Monday
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    const dates = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    for (let i = 0; i < 5; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push({
        day: dayNames[i],
        date: String(date.getDate()).padStart(2, '0'),
        fullDate: date
      });
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // Responsive styles
  const dateContainerStyle = {
    backgroundColor: '#E8E8E8',
    borderRadius: '12px',
    padding: window.innerWidth <= 480 ? '12px 15px' : '15px 20px',
    margin: window.innerWidth <= 480 ? '10px 15px' : '15px 20px',
  };

  const monthYearHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: window.innerWidth <= 480 ? '12px' : '15px',
  };

  const monthYearStyle = {
    fontSize: window.innerWidth <= 480 ? '13px' : '14px',
    fontWeight: '500',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const navButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: window.innerWidth <= 480 ? '18px' : '16px',
    cursor: 'pointer',
    padding: window.innerWidth <= 480 ? '8px' : '5px',
    color: '#666',
    minWidth: '32px',
    minHeight: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const datesRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: window.innerWidth <= 480 ? '3px' : '5px',
  };

  const dateItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: window.innerWidth <= 480 ? '10px 4px' : '8px 6px',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    minWidth: window.innerWidth <= 480 ? '50px' : '40px',
    flex: 1,
  };

  const selectedDateStyle = {
    ...dateItemStyle,
    backgroundColor: '#333',
    color: 'white',
  };

  const dayStyle = {
    fontSize: window.innerWidth <= 480 ? '11px' : '12px',
    marginBottom: '4px',
    opacity: 0.7,
  };

  const dateNumberStyle = {
    fontSize: window.innerWidth <= 480 ? '15px' : '16px',
    fontWeight: '600',
  };

  const calendarIconStyle = {
    fontSize: window.innerWidth <= 480 ? '16px' : '14px',
    marginRight: '5px',
    cursor: 'pointer',
  };

  const dropdownStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#fff',
    padding: window.innerWidth <= 480 ? '20px' : '15px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    borderRadius: '12px',
    zIndex: 1000,
    width: window.innerWidth <= 480 ? '85%' : '300px',
    maxWidth: '320px',
    border: '1px solid #e0e0e0',
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  };

  const selectStyle = {
    width: '100%',
    padding: window.innerWidth <= 480 ? '12px 10px' : '8px 10px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: window.innerWidth <= 480 ? '16px' : '14px',
    backgroundColor: 'white',
  };

  return (
    <>
      <div style={dateContainerStyle}>
        {/* Month/Year Navigation */}
        <div style={monthYearHeaderStyle}>
          <button 
            style={navButtonStyle}
            onClick={() => navigateMonth(-1)}
          >
            ←
          </button>
          
          <div style={{ ...monthYearStyle, position: 'relative' }}>
            <span 
              style={calendarIconStyle} 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              📅
            </span>
            {currentMonth} {String(selectedDay).padStart(2, '0')}, {currentYear}
          </div>
          
          <button 
            style={navButtonStyle}
            onClick={() => navigateMonth(1)}
          >
            →
          </button>
        </div>

        {/* Only 5 Weekdays */}
        <div style={datesRowStyle}>
          {weekDates.map((item, index) => (
            <div
              key={index}
              style={parseInt(item.date) === selectedDay ? selectedDateStyle : dateItemStyle}
              onClick={() => {
                const newDate = new Date(item.fullDate);
                setCurrentDate(newDate);
                if (onDateSelect) {
                  onDateSelect(newDate);
                }
              }}
            >
              <div style={dayStyle}>{item.day}</div>
              <div style={dateNumberStyle}>{item.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dropdown Overlay and Modal */}
      {showDropdown && (
        <>
          <div style={overlayStyle} onClick={() => setShowDropdown(false)} />
          <div style={dropdownStyle}>
            <div style={{ 
              marginBottom: '15px', 
              fontSize: window.innerWidth <= 480 ? '16px' : '14px', 
              fontWeight: '600', 
              color: '#333',
              textAlign: 'center'
            }}>
              Select Date
            </div>
            
            <select 
              value={currentDate.getMonth()} 
              onChange={handleMonthChange} 
              style={selectStyle}
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            
            <select 
              value={selectedDay} 
              onChange={handleDateChange} 
              style={selectStyle}
            >
              {dates.map((date) => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
            
            <select 
              value={currentDate.getFullYear()} 
              onChange={handleYearChange} 
              style={selectStyle}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <button 
              onClick={() => setShowDropdown(false)}
              style={{
                width: '100%',
                padding: window.innerWidth <= 480 ? '14px 12px' : '10px 12px',
                backgroundColor: '#333',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: window.innerWidth <= 480 ? '16px' : '14px',
                cursor: 'pointer',
                marginTop: '5px',
                fontWeight: '500',
              }}
            >
              Done
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default CalendarComponent;