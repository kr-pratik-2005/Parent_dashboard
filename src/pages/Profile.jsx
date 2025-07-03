import React, { useState,useEffect } from 'react';
import { 
  ChevronLeft, 
  Bell, 
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { getAuth, signOut } from 'firebase/auth';

const MobileProfileUI = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [parentName, setParentName] = useState('Parent');
    
    useEffect(() => {
      const fetchParentName = async () => {
        const user = auth.currentUser;
        console.log('User phone number:', user?.phoneNumber);
        if (user && user.phoneNumber) {
          try {
            const response = await fetch('http://localhost:5000/get_parent_name', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber: user.phoneNumber })
            });
            
            const data = await response.json();
            console.log('API Response:', data);
            if (data.name) setParentName(data.name);
          } catch (error) {
            console.error('Error fetching parent name:', error);
          }
        }
      };
  
      fetchParentName();
    },[]);
  // Logout handler (using Firebase)
  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await signOut(auth);
      navigate("/", { replace: true }); // Redirect to Login1
    } catch (error) {
      // Optionally handle error
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    { label: 'Parent Profile', onClick: () => navigate('/parent-profile') },
    { label: 'Child Profile', onClick: () => navigate('/child-profile') },
    
    { label: 'FAQ', onClick: () => navigate('/faq') },
    { label: 'Push Notification', onClick: () => navigate('/notifications') },
    { label: 'Logout', onClick: () => setShowLogoutConfirm(true) }
  ];

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
        padding: '20px 20px 30px',
        backgroundColor: '#f5f5f5'
      }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ChevronLeft size={24} color="#666" />
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
          aria-label="Notifications"
        >
          <Bell size={24} color="#666" />
        </button>
      </div>

      {/* Profile Section */}
      <div style={{
        textAlign: 'center',
        padding: '0 20px 40px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#e8e8e8',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='1.5'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}>
        </div>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '500',
          color: '#666',
          margin: '0'
        }}>
          Welcome {parentName}!
        </h2>
      </div>

      {/* Menu Items */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '0',
        margin: '0'
      }}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 20px',
              borderBottom: index < menuItems.length - 1 ? '1px solid #f0f0f0' : 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={item.onClick}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f8f8'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{
              fontSize: '16px',
              color: '#333',
              fontWeight: '400'
            }}>
              {item.label}
            </span>
            <ChevronRight size={20} color="#ccc" />
          </div>
        ))}
      </div>

      {/* Support Section */}
      <div style={{
        backgroundColor: '#666',
        margin: '20px',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <p style={{
          margin: '0 0 10px 0',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          If you have any query, please<br />reach out to us
        </p>
        <a href="mailto:support@mimansakids.com" style={{
          color: '#fff',
          textDecoration: 'underline',
          fontSize: '14px'
        }}>
          support@mimansakids.com
        </a>
      </div>

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '28px 24px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            textAlign: 'center',
            minWidth: 260,
          }}>
            <div style={{ fontSize: 17, color: '#222', marginBottom: 18 }}>
              Are you sure you want to log out?
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
              <button
                style={{
                  background: '#e53935',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 22px',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer'
                }}
                onClick={handleLogout}
              >
                Yes
              </button>
              <button
                style={{
                  background: '#eee',
                  color: '#444',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 22px',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer'
                }}
                onClick={() => setShowLogoutConfirm(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom spacing for fixed navigation */}
      <div style={{ height: '80px' }}></div>
      <BottomNav />
    </div>
  );
};

export default MobileProfileUI;
