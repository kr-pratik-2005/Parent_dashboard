import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login1 from './pages/Login1';
import Login2 from './pages/Login2';
import ParentDashboard from './pages/ParentDashboard';
import Childreport from './pages/Childreport';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import Report from './pages/Report';
import DailyReportContainer from './pages/DailyReportContainer'; // ✅ dynamic report loader
import Feepayment from './pages/Feepayment';
import FeePaymentPendingPayment from './pages/feepyament_pendingpayment';
import CCTV from './pages/CCTV';
import Profile from './pages/Profile';
import Leaveform from './pages/Leaveform';
import Reports from './pages/Reports';
import ParentDailyReports from './pages/ParentDailyReports'; // ✅ renamed route
import DailyReportRouter from './pages/DailyReportRouter';
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login1 />} />
        <Route path="/login" element={<Login1 />} />
        <Route path="/login2" element={<Login2 />} />

        {/* Protected Routes */}
        <Route 
          path="/parent-dashboard" 
          element={user ? <ParentDashboard /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/report/:childId" 
          element={user ? <Childreport /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/report" 
          element={user ? <Report /> : <Navigate to="/login" />} 
        />

        {/* ✅ Dynamic Daily Report based on attendance */}
        <Route 
          path="/daily-report/:childId" 
          element={user ? <DailyReportContainer /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/child-report" 
          element={user ? <Childreport /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/feepayment" 
          element={user ? <Feepayment /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/feepayment/pending" 
          element={user ? <FeePaymentPendingPayment /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/cctv" 
          element={user ? <CCTV /> : <Navigate to="/login" />} 
        />
        <Route path="/daily-report/:studentId" element={<DailyReportRouter />} />
        <Route 
          path="/profile" 
          element={user ? <Profile /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/leaveform" 
          element={user ? <Leaveform /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/dashboard" 
          element={user ? <ParentDashboard /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/reports" 
          element={user ? <Reports /> : <Navigate to="/login" />} 
        />

        {/* ✅ Optional: summary/overview reports */}
        <Route 
          path="/daily-report-overview" 
          element={user ? <ParentDailyReports /> : <Navigate to="/login" />} 
        />
      </Routes>

      <div id="recaptcha-container"></div>
    </Router>
  );
}

export default App;
