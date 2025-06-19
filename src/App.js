import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';
import Login1 from './pages/Login1';
import Login2 from './pages/Login2';
import ParentDashboard from './pages/ParentDashboard';
import Childreport from './pages/Childreport';
import { auth } from './firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Report from './pages/Report';
import DailyReport from './pages/DailyReport';
import Feepayment from './pages/Feepayment';
import FeePaymentPendingPayment from './pages/feepyament_pendingpayment';
import CCTV from './pages/CCTV';
import Profile from './pages/Profile.jsx'
import Leaveform from './pages/Leaveform';
import Reports from "./pages/Reports";
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

  if (loading) {
    return <p>Loading...</p>;
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login1 />} />
        <Route path="/login2" element={<Login2 />} />
        <Route path="/parent-dashboard" element={user ? <ParentDashboard /> : <Navigate to="/login" />} />
        <Route path="/report/:childId" element={<Childreport />} />
        <Route path="/report" element={user ? <Report /> : <Navigate to="/login" />} />
        <Route path="/daily-report" element={user ? <DailyReport /> : <Navigate to="/login" />} />
        <Route path="/child-report" element={user ? <Childreport /> : <Navigate to="/login" />} />
        <Route path="/feepayment" element={user ? <Feepayment /> : <Navigate to="/login" />} />
        <Route path="/feepayment/pending" element={<FeePaymentPendingPayment />} />
        <Route path="/cctv" element={user ? <CCTV /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login1 />} />
         <Route path="/leaveform" element={<Leaveform />} />
          <Route path="/dashboard" element={<ParentDashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
      <div id="recaptcha-container"></div>
    </Router>
  );
}

export default App;
