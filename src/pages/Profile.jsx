import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Bell,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { getAuth, signOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

const MobileProfileUI = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [parentName, setParentName] = useState('Parent');
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // 🔔 Fetch messages sent to this parent's phone number
  useEffect(() => {
    const mobile = localStorage.getItem('parentMobile');
    if (!mobile) return;

    const q = query(
      collection(db, "messages"),
      where("to", "==", mobile)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // sort newest first
      msgs.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());

      setNotifications(msgs);
      setNotificationCount(msgs.filter(msg => msg.read === false).length);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchParentName = async () => {
      const user = auth.currentUser;
      if (user?.phoneNumber) {
        try {
          const response = await fetch('http://localhost:5000/get_parent_name', {
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
  }, []);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await signOut(auth);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleMarkAsRead = async (msgId) => {
    try {
      await updateDoc(doc(db, "messages", msgId), { read: true });
      // UI will update automatically via onSnapshot
    } catch (err) {
      alert('Failed to mark as read');
    }
  };

  const menuItems = [
    { label: 'Parent Profile', onClick: () => navigate('/parent-profile') },
    { label: 'Child Profile', onClick: () => navigate('/child-profile') },
    { label: 'Notification', onClick: () => window.scrollTo({ top: 500, behavior: 'smooth' }) },
    { label: 'Send Message', onClick: () => navigate('/send-message') },
    { label: 'Logout', onClick: () => setShowLogoutConfirm(true) }
  ];

  // Separate unread and read notifications
  const unreadNotifications = notifications.filter(msg => msg.read === false);
  const readNotifications = notifications.filter(msg => msg.read === true);

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '375px',
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 20px 30px'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChevronLeft size={24} color="#666" />
        </button>
        <div style={{ position: 'relative' }}>
          <Bell size={24} color="#666" />
          {notificationCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -5,
              right: -5,
              backgroundColor: 'red',
              color: 'white',
              fontSize: 10,
              borderRadius: '50%',
              padding: '2px 6px',
              fontWeight: 'bold'
            }}>
              {notificationCount}
            </span>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <div style={{ textAlign: 'center', padding: '0 20px 40px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#e8e8e8',
          margin: '0 auto 20px'
        }} />
        <h2>Welcome {parentName}!</h2>
      </div>

      {/* Menu Items */}
      <div style={{ backgroundColor: '#fff' }}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 20px',
              borderBottom: index < menuItems.length - 1 ? '1px solid #f0f0f0' : 'none',
              cursor: 'pointer'
            }}
            onClick={item.onClick}
          >
            <span>{item.label}</span>
            <ChevronRight size={20} color="#ccc" />
          </div>
        ))}
      </div>

      {/* 🔔 Notifications Section */}
      <div style={{
        margin: '30px 20px',
        padding: '15px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: 10 }}>Messages from Teachers</h3>
        {notifications.length === 0 ? (
          <p style={{ fontSize: 14, color: '#666' }}>No messages yet.</p>
        ) : (
          <>
            {/* Unread */}
            {unreadNotifications.length > 0 && (
              <>
                <div style={{ fontWeight: 'bold', color: '#b45309', marginBottom: 6 }}>New</div>
                {unreadNotifications.map((msg) => (
                  <div key={msg.id} style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #eee',
                    background: '#fef9c3',
                    borderRadius: 6,
                    marginBottom: 8
                  }}>
                    <p style={{ fontSize: 14, margin: 0 }}><strong>From:</strong> {msg.from}</p>
                    <p style={{ fontSize: 14, margin: '4px 0' }}>{msg.message}</p>
                    <p style={{ fontSize: 12, color: '#888' }}>
                      {msg.timestamp?.toDate().toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleMarkAsRead(msg.id)}
                      style={{
                        background: '#22c55e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '5px 18px',
                        fontSize: 13,
                        cursor: 'pointer',
                        marginTop: 4
                      }}
                    >
                      Mark as read
                    </button>
                  </div>
                ))}
              </>
            )}
            {/* Read */}
            {readNotifications.length > 0 && (
              <>
                <div style={{ fontWeight: 'bold', color: '#6b7280', margin: '12px 0 6px' }}>Read</div>
                {readNotifications.map((msg) => (
                  <div key={msg.id} style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #eee'
                  }}>
                    <p style={{ fontSize: 14, margin: 0 }}><strong>From:</strong> {msg.from}</p>
                    <p style={{ fontSize: 14, margin: '4px 0' }}>{msg.message}</p>
                    <p style={{ fontSize: 12, color: '#888' }}>
                      {msg.timestamp?.toDate().toLocaleString()}
                    </p>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Logout Popup */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.35)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: '28px 24px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)', textAlign: 'center'
          }}>
            <div style={{ fontSize: 17, color: '#222', marginBottom: 18 }}>
              Are you sure you want to log out?
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
              <button onClick={handleLogout} style={{
                background: '#e53935', color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 22px', fontWeight: 600
              }}>Yes</button>
              <button onClick={() => setShowLogoutConfirm(false)} style={{
                background: '#eee', color: '#444', border: 'none',
                borderRadius: 8, padding: '8px 22px', fontWeight: 600
              }}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom padding + Nav */}
      <div style={{ height: '80px' }}></div>
      <BottomNav />
    </div>
  );
};

export default MobileProfileUI;
