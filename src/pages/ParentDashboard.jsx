import React, { useState, useEffect } from 'react';
import giraffeIcon from '../assets/Logo.png';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { getAuth } from 'firebase/auth';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [unpaidMonths, setUnpaidMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parentName, setParentName] = useState('Parent');
  const auth = getAuth();

  // Multi-student support
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Load students from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('students');
    if (stored) {
      const stuArr = JSON.parse(stored);
      setStudents(stuArr);
      if (stuArr.length > 0) setSelectedStudent(stuArr[0]);
    }
  }, []);

  // Fetch parent name
  useEffect(() => {
    const fetchParentName = async () => {
      const user = auth.currentUser;
      if (user && user.phoneNumber) {
        try {
          const response = await fetch('https://mkfeez.mimansakids.com/get_parent_name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: user.phoneNumber })
          });
          const data = await response.json();
          if (data.name) setParentName(data.name);
        } catch (error) {
          console.error('Error fetching parent name:', error);
        }
      }
    };
    fetchParentName();
  }, [auth]);

  // Fetch unpaid months (fees) for selected student
 useEffect(() => {
  const fetchUnpaidMonths = async () => {
    if (!selectedStudent) {
      setUnpaidMonths([]);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://mkfeez.mimansakids.com/'}/get-fees-by-student/${selectedStudent.student_id}?contact=${selectedStudent.contact}`
      );
      if (response.ok) {
        const data = await response.json();
        // Only consider invoices where paid === false
        const pendingMonths = data
          .filter(inv => inv.paid === false)
          .map(inv => inv.month);
        setUnpaidMonths(pendingMonths);
      } else {
        console.error('Failed to fetch pending invoices');
      }
    } catch (error) {
      console.error('Error fetching pending invoices:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchUnpaidMonths();
}, [selectedStudent]);


  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  const formatUnpaidMonths = () => {
    if (unpaidMonths.length === 0) {
      const now = new Date();
      const month = now.toLocaleString('default', { month: 'long' });
      const year = now.getFullYear();
      return `You have cleared all the fees, as of ${month} ${year}`;
    }
    if (unpaidMonths.length === 1) {
      return `Due for ${unpaidMonths[0]} month fee is pending`;
    } else if (unpaidMonths.length === 2) {
      return `Due for ${unpaidMonths[0]} and ${unpaidMonths[1]} months fees are pending`;
    } else {
      const lastMonth = unpaidMonths[unpaidMonths.length - 1];
      const otherMonths = unpaidMonths.slice(0, -1).join(', ');
      return `Due for ${otherMonths}, and ${lastMonth} months fees are pending`;
    }
  };

  // Handle student selection
  const handleStudentChange = (e) => {
    const stu = students.find(s => s.student_id === e.target.value);
    setSelectedStudent(stu);
    setLoading(true); // Refetch unpaid months for new student
  };

  // Handle navigation to fees
  const handleFeesClick = () => {
    if (selectedStudent) {
      localStorage.setItem('selectedStudent', JSON.stringify(selectedStudent));
      navigate('/feepayment');
    } else {
      alert('Please select a child.');
    }
  };

  // Handle navigation to daily report
  const handleDailyReportClick = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toISOString().split('T')[0];

    if (selectedStudent) {
      navigate(`/daily-report/${selectedStudent.student_id}?date=${formattedDate}`);
    } else {
      alert('Please select a child.');
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .container { max-width: 100vw; padding: 16px 0 80px 0; }
          .gallery-img { width: 80px !important; margin: 0 0 0 12px !important; }
          .gallery-card { flex-direction: column; align-items: flex-start !important; }
          .action-grid { grid-template-columns: 1fr !important; }
          .reports-btn { width: 100% !important; max-width: 100% !important; }
        }
        @media (min-width: 601px) {
          .container { max-width: 420px; margin: 0 auto; padding: 32px 0 100px 0; }
          .gallery-img { width: 120px !important; margin: 0 0 0 24px !important; }
          .gallery-card { flex-direction: row; align-items: center !important; }
          .action-grid { grid-template-columns: 1fr 1fr; }
          .reports-btn { width: 60%; max-width: 220px; }
        }
      `}</style>
      <div className="container" style={{
        background: '#fff',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              borderRadius: '50%',
              background: '#FFE4B5',
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24
            }}>👶</div>
            <span style={{ color: '#333', fontWeight: 500, fontSize: 16 }}>
              Hi {parentName}, Welcome!
            </span>
          </div>
          <h2 style={{
            color: '#333',
            margin: 0,
            fontWeight: 600,
            fontSize: 22,
            lineHeight: 1.3
          }}>
            What did your baby<br />do today?
          </h2>
        </div>

        {/* Student Selector */}
        {students.length > 1 && (
          <div style={{ margin: '0 20px 18px 20px' }}>
            <select
              value={selectedStudent ? selectedStudent.student_id : ''}
              onChange={handleStudentChange}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '1rem'
              }}
            >
              {students.map(stu => (
                <option key={stu.student_id} value={stu.student_id}>{stu.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px 12px 20px'
        }}>
          <div style={{ color: '#888', fontSize: 15 }}>Today</div>
          <div style={{ fontWeight: 500, color: '#333', fontSize: 15 }}>{todayStr}</div>
        </div>

        {/* Gallery Card */}
        <div className="gallery-card" style={{
          background: '#6B5B73',
          borderRadius: 16,
          margin: '0 20px 18px 20px',
          padding: '18px 16px',
          display: 'flex',
          alignItems: 'center',
          color: '#fff',
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 10px 0',
              fontWeight: 600,
              fontSize: 16,
              lineHeight: 1.3
            }}>
              Follow baby's action<br />everyday!
            </h3>
            <button style={{
              background: '#fff',
              color: '#6B5B73',
              border: 'none',
              borderRadius: 16,
              padding: '8px 24px',
              fontWeight: 500,
              fontSize: 14,
              cursor: 'pointer'
            }}>
              View Gallery
            </button>
          </div>
          <img className="gallery-img"
            src={giraffeIcon}
            alt="giraffe"
            style={{
              width: 120,
              height: 'auto',
              marginLeft: 24,
              display: 'block'
            }}
          />
        </div>

        {/* Fee Notice */}
        {!loading && unpaidMonths.length > 0 && (
          <div style={{
            color: '#666',
            margin: '0 20px 18px 20px',
            fontSize: 14
          }}>
            • {formatUnpaidMonths()}{' '}
            <button
              onClick={handleFeesClick}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Pay now
            </button>
          </div>
        )}

        {loading && (
          <div style={{
            color: '#666',
            margin: '0 20px 18px 20px',
            fontSize: 14
          }}>
            • Loading payment status...
          </div>
        )}

        {!loading && unpaidMonths.length === 0 && (
          <div style={{
            color: '#4CAF50',
            margin: '0 20px 18px 20px',
            fontSize: 14
          }}>
            ✅ All fees are up to date!
          </div>
        )}

        {/* Main Grid */}
        <div className="action-grid" style={{
          display: 'grid',
          gap: 14,
          margin: '0 20px 20px 20px'
        }}>
          <button style={actionBtnStyle} onClick={handleDailyReportClick}>
            Daily<br />Report
          </button>
          <button style={actionBtnStyle} onClick={() => navigate('/cctv')}>
            CCTV
          </button>
          <button style={actionBtnStyle} onClick={handleFeesClick}>
            Fees
          </button>
          <button style={actionBtnStyle} onClick={() => navigate('/leaveform')}>
            Leave<br />Request
          </button>
        </div>

        {/* Reports */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <button
            className="reports-btn"
            style={{
              ...actionBtnStyle,
              width: '60%',
              maxWidth: 220,
              padding: '28px 0',
              fontWeight: 600
            }}
            onClick={() => navigate('/reports')}
          >
            Reports
          </button>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

const actionBtnStyle = {
  background: '#C0C0C0',
  border: 'none',
  borderRadius: 14,
  padding: '18px 0',
  fontWeight: 600,
  color: '#fff',
  fontSize: 15,
  cursor: 'pointer',
  transition: 'all 0.3s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  lineHeight: 1.2
};

export default ParentDashboard;
