// DailyReportContainer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import DailyReport from './DailyReport';
import DailyReportHoliday from './DailyReport_holiday';
import DailyReportAbsent from './DailyReport_absent';


const DailyReportContainer = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { childId } = useParams();
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // Format date to YYYY-MM-DD
        const dateStr = selectedDate.toISOString().split('T')[0];
        
        // Reference to the attendance document
        const docRef = doc(db, 'attendance', `${childId}_${dateStr}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setAttendanceData(docSnap.data());
        } else {
          // Check if it's a holiday
          const holidayRef = doc(db, 'holidays', dateStr);
          const holidaySnap = await getDoc(holidayRef);
          
          if (holidaySnap.exists()) {
            setAttendanceData({ status: 'holiday', ...holidaySnap.data() });
          } else {
            setAttendanceData({ status: 'absent' });
          }
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedDate, childId]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {attendanceData?.status === 'present' && (
        <DailyReport 
          data={attendanceData} 
          selectedDate={selectedDate} 
          onDateChange={handleDateChange} 
        />
      )}
      
      {attendanceData?.status === 'holiday' && (
        <DailyReportHoliday 
          data={attendanceData} 
          selectedDate={selectedDate} 
          onDateChange={handleDateChange} 
        />
      )}
      
      {attendanceData?.status === 'absent' && (
        <DailyReportAbsent 
          selectedDate={selectedDate} 
          onDateChange={handleDateChange} 
        />
      )}
    </div>
  );
};

export default DailyReportContainer;
