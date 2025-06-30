import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateSelector({ selectedDate, onDateChange }) {
  return (
    <div className="date-selector">
      <DatePicker
        selected={selectedDate}
        onChange={onDateChange}
        dateFormat="MMMM d, yyyy"
        className="date-picker"
      />
    </div>
  );
}
