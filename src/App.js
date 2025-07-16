import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login1 from './pages/Login1';
import Login2 from './pages/Login2';
import ParentDashboard from './pages/ParentDashboard';
import Childreport from './pages/Childreport';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AttendanceReport from './pages/AttendanceReport';
import Report from './pages/Report';
import ParentProfile from './pages/ParentProfile';
import Feepayment from './pages/Feepayment';
import FeePaymentPendingPayment from './pages/feepyament_pendingpayment';
import CCTV from './pages/CCTV';
import Profile from './pages/Profile';
import Leaveform from './pages/Leaveform';
import Reports from './pages/Reports';
import DailyReport from './pages/DailyReport';
import ChildProfile from './pages/ChildProfile';
import ComingSoon from './pages/ComingSoon';
import PaymentSuccess from './pages/PaymentSuccess';
import SendMessage from './pages/SendMessage';
import DailyReportDetail from './pages/DailyReportDetail';
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
        <Route 
  path="/daily-report/:studentId" 
  element={user ? <DailyReport /> : <Navigate to="/login" />} 
/>
<Route path="/coming-soon" element={<ComingSoon />} />
<Route
  path="/attendance-report/:studentId"
  element={user ? <AttendanceReport /> : <Navigate to="/login" />}
/>
       <Route path="/child-profile" element={<ChildProfile />} />


        <Route 
          path="/child-report" 
          element={user ? <Childreport /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/feepayment" 
          element={user ? <Feepayment /> : <Navigate to="/login" />} 
        />
        <Route path="/payment-success" element={<PaymentSuccess />} />


        <Route 
          path="/feepayment/pending" 
          element={user ? <FeePaymentPendingPayment /> : <Navigate to="/login" />} 
        />
        <Route
  path="/parent-profile"
  element={user ? <ParentProfile /> : <Navigate to="/login" />}
/>

        <Route 
          path="/cctv" 
          element={user ? <CCTV /> : <Navigate to="/login" />} 
        />
        
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
<Route path="/send-message" element={<SendMessage />} />
<Route path="/daily-report/:studentId/details" element={<DailyReportDetail />} />
       
      </Routes>

      <div id="recaptcha-container"></div>
    </Router>
  );
}

export default App;
