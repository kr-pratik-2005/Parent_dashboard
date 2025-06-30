import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import DailyReport from './DailyReport';
import DailyReport_absent from './DailyReport_absent';
import DailyReport_holiday from './DailyReport_holiday';

const DailyReportRouter = () => {
  const { studentId } = useParams();
  const query = new URLSearchParams(useLocation().search);
  const date = query.get("date");

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/report-status/${studentId}?date=${date}`);
        const data = await response.json();
        setStatus(data.status);
      } catch (err) {
        console.error('Failed to fetch report status', err);
        setStatus('absent'); // fallback
      } finally {
        setLoading(false);
      }
    };

    if (studentId && date) {
      fetchReportStatus();
    }
  }, [studentId, date]);

  if (loading) return <div>Loading report...</div>;

  if (status === 'present') return <DailyReport studentId={studentId} date={date} />;
  if (status === 'holiday') return <DailyReport_holiday studentId={studentId} date={date} />;
  return <DailyReport_absent studentId={studentId} date={date} />;
};

export default DailyReportRouter;
