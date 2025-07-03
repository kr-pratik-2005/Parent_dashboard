import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get payment details from navigation state
  const { amount, paymentId, orderId, invoiceNumber } = location.state || {};

  // If no state (user visits directly), redirect to dashboard
  React.useEffect(() => {
    if (!amount || !paymentId) {
      navigate('/parent-dashboard');
    }
  }, [amount, paymentId, navigate]);

  const handleDownloadInvoice = () => {
    // Add your download invoice logic here
    console.log('Download invoice for:', invoiceNumber);
  };

  const handleGoBack = () => {
    navigate('/parent-dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      {/* Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        fontSize: '17px',
        fontWeight: '600',
        color: '#000'
      }}>
        <span>9:41</span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {/* Signal bars */}
          <div style={{
            display: 'flex',
            gap: '2px',
            alignItems: 'end'
          }}>
            <div style={{ width: '3px', height: '4px', backgroundColor: '#000', borderRadius: '1px' }}></div>
            <div style={{ width: '3px', height: '6px', backgroundColor: '#000', borderRadius: '1px' }}></div>
            <div style={{ width: '3px', height: '8px', backgroundColor: '#000', borderRadius: '1px' }}></div>
            <div style={{ width: '3px', height: '10px', backgroundColor: '#000', borderRadius: '1px' }}></div>
          </div>
          {/* WiFi icon */}
          <div style={{
            width: '15px',
            height: '12px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'conic-gradient(from 0deg, transparent 50%, #000 50%)',
              borderRadius: '50% 50% 0 0',
              transform: 'rotate(-45deg)'
            }}></div>
          </div>
          {/* Battery icon */}
          <div style={{
            width: '24px',
            height: '12px',
            border: '1px solid #000',
            borderRadius: '2px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              right: '-2px',
              top: '3px',
              width: '1px',
              height: '6px',
              backgroundColor: '#000',
              borderRadius: '0 1px 1px 0'
            }}></div>
            <div style={{
              width: '80%',
              height: '100%',
              backgroundColor: '#000',
              borderRadius: '1px'
            }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px 20px 20px',
        textAlign: 'center'
      }}>
        {/* Header Text */}
        <h1 style={{
          fontSize: '20px',
          fontWeight: '400',
          color: '#000',
          margin: '0 0 60px 0'
        }}>
          Your payment
        </h1>

        {/* Success Icon */}
        <div style={{
          width: '120px',
          height: '120px',
          backgroundColor: '#d1d5db',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '40px'
        }}>
          <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
            <path 
              d="M3 15L15 25L37 5" 
              stroke="#000" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Success Text */}
        <h2 style={{
          fontSize: '18px',
          fontWeight: '400',
          color: '#000',
          margin: '0 0 16px 0'
        }}>
          Payment Successful
        </h2>

        {/* Amount */}
        <div style={{
          fontSize: '24px',
          fontWeight: '400',
          color: '#000',
          marginBottom: '40px'
        }}>
          ₹ {amount ? amount.toLocaleString() : '0'}
        </div>

        {/* Action Buttons (M M) */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '60px'
        }}>
          <button style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#d1d5db',
            border: 'none',
            borderRadius: '50%',
            fontSize: '18px',
            fontWeight: '500',
            color: '#000',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            M
          </button>
          <button style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#d1d5db',
            border: 'none',
            borderRadius: '50%',
            fontSize: '18px',
            fontWeight: '500',
            color: '#000',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            M
          </button>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }}></div>

        {/* Download Invoice Button */}
        <button 
          onClick={handleDownloadInvoice}
          style={{
            width: '100%',
            maxWidth: '320px',
            padding: '16px',
            backgroundColor: '#9ca3af',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#fff',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          Download Invoice
        </button>

        {/* Go Back Button */}
        <button 
          onClick={handleGoBack}
          style={{
            width: '100%',
            maxWidth: '320px',
            padding: '16px',
            backgroundColor: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#000',
            cursor: 'pointer',
            marginBottom: '40px'
          }}
        >
          Go Back
        </button>

        {/* Bottom Indicator */}
        <div style={{
          width: '134px',
          height: '5px',
          backgroundColor: '#000',
          borderRadius: '3px',
          marginBottom: '8px'
        }}></div>
      </div>
    </div>
  );
}
