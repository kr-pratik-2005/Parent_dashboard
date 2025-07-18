import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import giraffeIcon from '../assets/Logo.png';

const phoneNumber = sessionStorage.getItem('phoneNumber') || '';
const maskedNumber = phoneNumber.slice(-2);

export default function Login2() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleOtpChange = (index, value) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleProceed = async () => {
  const otpString = otp.join('');
  if (otpString.length !== 6) {
    setError('Please enter complete 6-digit OTP');
    return;
  }
  setError('');
  try {
    const result = await window.confirmationResult.confirm(otpString);

    const mobile = sessionStorage.getItem('phoneNumber'); // e.g. '+911234567890'
    const cleanMobile = mobile.replace('+91', '');
    localStorage.setItem('parentMobile', cleanMobile);

    // 🔥 NEW: Fetch students linked to this parent
    const res = await fetch(`https://mkfeez.mimansakids.com/get-students-by-contact/${cleanMobile}`);
    const students = await res.json();

    if (Array.isArray(students) && students.length > 0) {
      localStorage.setItem('students', JSON.stringify(students));

      navigate('/parent-dashboard');
    } else {
      alert('No student linked to this account.');
    }

  } catch (err) {
    setError('Invalid OTP. Please try again.');
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  }
};


  const handleResendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    // To implement resend, re-trigger the OTP sending logic from Login1 if needed
    // Or navigate back to Login1 for now:
    // navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#d8d2cf',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
        padding: '32px 24px',
        width: '100%',
        maxWidth: '340px',
        textAlign: 'center'
      }}>
        <img src={giraffeIcon} alt="giraffe" style={{ width: '60px', marginBottom: '16px' }} />
        <h2 style={{ fontWeight: 600, margin: '0 0 8px' }}>Enter Verification Code</h2>
        <p style={{ color: '#666', fontSize: '0.95rem', margin: '0 0 24px' }}>
          Please enter the 6-digit code sent to your mobile number
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              type="text"
              maxLength="1"
              value={digit}
              onChange={e => {
                // Get the actual value typed
                const inputVal = e.target.value;
                // If user is deleting, update with empty string
                if (inputVal === '') {
                  handleOtpChange(idx, '');
                } else if (/^\d$/.test(inputVal)) {
                  handleOtpChange(idx, inputVal);
                }
              }}
              onKeyDown={e => handleKeyDown(idx, e)}
              style={{
                width: '48px',
                height: '48px',
                border: `1.5px solid ${digit ? '#8B7355' : '#eee'}`,
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '1.5rem',
                background: '#f8f8f8',
                outline: 'none',
                letterSpacing: '2px'
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus={idx === 0}
            />
          ))}
        </div>
        {error && <div style={{ color: '#e06666', fontSize: '0.9rem', marginBottom: '12px' }}>{error}</div>}
        <div style={{ marginBottom: '24px', fontSize: '0.92rem', color: '#888' }}>
          Didn't receive the OTP?{' '}
          <span
            style={{ color: '#555', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            onClick={handleResendOtp}
          >
            Resend OTP
          </span>
        </div>
        <button
          onClick={handleProceed}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: '#8B7355',
            color: '#fff',
            fontSize: '1.1rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
        >
          Proceed
        </button>
      </div>
    </div>
  );
}