import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import bgImage from '../assets/loginbg.png';
import giraffeIcon from '../assets/Logo.png';

export default function Login1() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setMobileNumber(value);
  };

  const setUpRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: (response) => {},
          'expired-callback': () => {
            window.recaptchaVerifier = null;
          }
        }
      );
    }
  };

  const handleLogin = async () => {
  setError('');
  if (!mobileNumber || mobileNumber.length < 10) {
    setError('Please enter a valid mobile number');
    return;
  }

  setLoading(true);
  try {
    setUpRecaptcha();
    const phoneNumber = `+91${mobileNumber}`;
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      window.recaptchaVerifier
    );

    window.confirmationResult = confirmationResult;
    sessionStorage.setItem('phoneNumber', phoneNumber);

    // 👇 Store the clean number for API use
    localStorage.setItem('parentMobile', mobileNumber);

    navigate('/login2');
  } catch (err) {
    setError(err.message || 'Failed to send OTP. Please try again.');
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  } finally {
    setLoading(false);
  }
};


  const isMobileInvalid = mobileNumber.length > 0 && mobileNumber.length < 10;

  return (
    <div style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'sans-serif',
      padding: '16px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '32px 24px',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center',
        color: '#333',
        boxSizing: 'border-box'
      }}>
        <img src={giraffeIcon} alt="giraffe" style={{ width: '60px', marginBottom: '16px' }} />
        <h2 style={{ margin: '0 0 8px', fontWeight: 'bold', fontSize: '1.5rem' }}>Sign In</h2>
        <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: '#666' }}>
          We will send you a confirmation code
        </p>

        {/* Phone Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '8px 0',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: '#fff'
        }}>
          <div style={{
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRight: '1px solid #ddd'
          }}>
            <img
              src="https://flagcdn.com/w40/in.png"
              alt="India Flag"
              style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '2px' }}
            />
            <span style={{ color: '#666', fontSize: '1rem' }}></span>
          </div>
          <input
            type="tel"
            placeholder="1234567890"
            value={mobileNumber}
            onChange={handleMobileChange}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              borderRadius: '0 8px 8px 0'
            }}
            maxLength={10}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>

        {isMobileInvalid && (
          <div style={{
            color: '#e06666',
            marginTop: '4px',
            marginBottom: '4px',
            fontSize: '0.95rem',
            textAlign: 'left'
          }}>
            Invalid mobile number
          </div>
        )}

        {/* Remember Me */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          margin: '16px 0',
          gap: '8px'
        }}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            style={{ margin: 0 }}
          />
          <label htmlFor="rememberMe" style={{
            fontSize: '0.9rem',
            color: '#666',
            cursor: 'pointer'
          }}>
            Remember me
          </label>
        </div>

        {error && (
          <div style={{ color: '#e06666', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <button onClick={handleLogin} style={buttonStyle} disabled={loading}>
          {loading ? 'Sending...' : 'Generate OTP'}
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  width: '100%',
  padding: '12px',
  marginTop: '8px',
  borderRadius: '8px',
  border: 'none',
  background: '#8B7355',
  color: '#fff',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background 0.2s ease-in-out'
};