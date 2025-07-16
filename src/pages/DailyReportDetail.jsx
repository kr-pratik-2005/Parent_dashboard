import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const DailyReportDetail = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const queryParams = new URLSearchParams(useLocation().search);
  const dateParam = queryParams.get('date'); // Format: YYYY-MM-DD

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportDetail = async () => {
      setLoading(true);
      const docId = `${studentId}_${dateParam}`; // e.g. STU2025015_2025-07-16
      try {
        const docRef = doc(db, 'daily_reports', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setReport(docSnap.data());
        } else {
          setReport(null);
        }
      } catch (error) {
        console.error('Error fetching daily report:', error);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    if (studentId && dateParam) {
      fetchReportDetail();
    }
  }, [studentId, dateParam]);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading detailed report...</p>;
  if (!report) return <p style={{ textAlign: 'center', marginTop: '50px' }}>No detailed report found.</p>;

  return (
  <div style={{
    minHeight: '100vh',
    background: '#f4f6f8',
    paddingTop: 56
  }}>
    <div style={{
      maxWidth: 450,
      margin: '48px auto',
      background: '#fff',
      borderRadius: 18,
      boxShadow: '0 6px 32px rgba(60,72,100,0.08)',
      padding: '32px 28px',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch'
    }}>
      <h2 style={{
        textAlign: 'center',
        fontWeight: 600,
        fontSize: 24,
        marginBottom: 30,
        color: '#262a33'
      }}>Full Daily Report</h2>
      <div style={{
        display: 'grid',
        rowGap: 12,
        fontSize: 16,
        color: '#374151'
      }}>
        <div><strong>Date:</strong> {report.date || dateParam}</div>
        <div><strong>Time In:</strong> {report.inTime || '--'}</div>
        <div><strong>Time Out:</strong> {report.outTime || '--'}</div>
        <div><strong>Teacher's Note:</strong> {report.teacherNote || 'N/A'}</div>
        <div><strong>Meal:</strong> {report.meal || 'N/A'}</div>
        <div><strong>Snacks:</strong> {report.snacks || 'N/A'}</div>
        <div><strong>Poops:</strong> {report.poops ?? 'N/A'}</div>
        <div><strong>Diaper Changed:</strong> {report.diaperChanged ? 'Yes' : 'No'}</div>
        <div><strong>Sleep:</strong> {report.sleep ? `From ${report.sleepFrom} to ${report.sleepTo}` : 'No'}</div>
      </div>

      {report.feelings?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <strong>Feelings:</strong>
          <ul style={{ marginTop: 5, paddingLeft: 20 }}>
            {report.feelings.map((feeling, idx) => <li key={idx}>{feeling}</li>)}
          </ul>
        </div>
      )}

      {report.themeDetails?.some(item => item !== "") && (
        <div style={{ marginTop: 20 }}>
          <strong>Theme Details:</strong>
          <ul style={{ marginTop: 5, paddingLeft: 20 }}>
            {report.themeDetails.map((detail, idx) =>
              detail ? <li key={idx}>{detail}</li> : null
            )}
          </ul>
        </div>
      )}

      {report.incident && (report.incident.description || report.incident.comment) && (
        <div style={{ marginTop: 20 }}>
          <strong>Incident:</strong>
          <p style={{ marginBottom: 4 }}>{report.incident.description || ''}</p>
          <p style={{ color: '#6b7280', margin: 0, fontSize: 15 }}>{report.incident.comment || ''}</p>
        </div>
      )}

      {report.ouch && (report.ouch.incident || report.ouch.comment) && (
        <div style={{ marginTop: 20 }}>
          <strong>Ouch Report:</strong>
          <p style={{ marginBottom: 4 }}>{report.ouch.incident || ''}</p>
          <p style={{ color: '#ef4444', margin: 0, fontSize: 15 }}>{report.ouch.comment || ''}</p>
        </div>
      )}

      {report.photoURL && (
        <div style={{ marginTop: 20 }}>
          <strong>Image:</strong>
          <img src={report.photoURL} alt="Daily record" style={{ width: '100%', marginTop: 8, borderRadius: 10, boxShadow: '0 2px 16px rgba(60,72,100,0.08)' }} />
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: '32px',
          background: '#3b2f2f',
          color: '#fff',
          border: 'none',
          borderRadius: '20px',
          padding: '12px 22px',
          fontSize: 15,
          cursor: 'pointer',
          alignSelf: 'center'
        }}
      >
        ← Back to Report
      </button>
    </div>
  </div>
);

};

export default DailyReportDetail;
