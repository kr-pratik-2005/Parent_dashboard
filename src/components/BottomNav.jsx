import React from 'react';
import { useNavigate } from 'react-router-dom';

const navBtnStyle = {
  background: 'none',
  border: 'none',
  outline: 'none',
  boxShadow: 'none',
  padding: '0',
  margin: '0',
  cursor: 'pointer',
  fontSize: 28,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  minWidth: 44,
  minHeight: 44,
  color: '#444'
};

const navLabelStyle = {
  fontSize: 11,
  marginTop: 2,
  color: '#888',
  fontWeight: 500,
  letterSpacing: 0.2,
  lineHeight: 1.1
};

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .bottom-nav-bar {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 0;
          width: 100vw;
          max-width: 420px;
          background: #fff;
          border-top: 1px solid #e0e0e0;
          box-shadow: 0 -2px 12px rgba(0,0,0,0.04);
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 62px;
          z-index: 100;
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
      <nav className="bottom-nav-bar">
        <button
          style={navBtnStyle}
          onClick={() => navigate('/parent-dashboard')}
          aria-label="Home"
        >
          <span role="img" aria-label="Home">🏠</span>
          <span style={navLabelStyle}>Home</span>
        </button>
        <button
          style={navBtnStyle}
          onClick={() => navigate('/feepayment')}
          aria-label="Fee Payment"
        >
          <span role="img" aria-label="Fee Payment">📋</span>
          <span style={navLabelStyle}>Fees</span>
        </button>
        <button
          style={navBtnStyle}
          onClick={() => navigate('/cctv')}
          aria-label="CCTV"
        >
          <span role="img" aria-label="CCTV">📹</span>
          <span style={navLabelStyle}>CCTV</span>
        </button>
        <button
          style={navBtnStyle}
          onClick={() => navigate('/profile')}
          aria-label="Profile"
        >
          <span role="img" aria-label="Profile">👤</span>
          <span style={navLabelStyle}>Profile</span>
        </button>
      </nav>
    </>
  );
};

export default BottomNav;
