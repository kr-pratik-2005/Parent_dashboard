import React from 'react';
import giraffeIcon from '../assets/Logo.png';
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
    const navigate = useNavigate();

  const styles = `
    @media (max-width: 768px) {
      .mobile-padding { padding: 15px 20px !important; }
      .mobile-gap { gap: 12px !important; }
      .mobile-margin-bottom { margin-bottom: 15px !important; }
      .mobile-font-16 { font-size: 16px !important; }
      .mobile-font-20 { font-size: 20px !important; }
      .mobile-font-12 { font-size: 12px !important; }
      .mobile-font-14 { font-size: 14px !important; }
      .mobile-avatar { width: 40px !important; height: 40px !important; font-size: 18px !important; }
      .mobile-card-padding { padding: 20px !important; }
      .mobile-border-radius { border-radius: 12px !important; }
      .mobile-button-padding { padding: 8px 16px !important; }
      .mobile-button-radius { border-radius: 15px !important; }
      .mobile-emoji-size { width: 60px !important; height: 60px !important; font-size: 40px !important; }
      .mobile-grid-gap { gap: 15px !important; }
      .mobile-button-height { min-height: 80px !important; }
      .mobile-main-padding { padding: 20px !important; }
      .mobile-nav-padding { padding: 15px 0 !important; }
      .mobile-nav-font { font-size: 18px !important; }
      .mobile-nav-size { min-width: 44px !important; min-height: 44px !important; }
      .mobile-reports-width { width: 60% !important; }
    }
    
    @media (min-width: 769px) {
      .desktop-padding { padding: 20px 40px !important; }
      .desktop-gap { gap: 15px !important; }
      .desktop-margin-bottom { margin-bottom: 20px !important; }
      .desktop-font-18 { font-size: 18px !important; }
      .desktop-font-24 { font-size: 24px !important; }
      .desktop-font-14 { font-size: 14px !important; }
      .desktop-font-16 { font-size: 16px !important; }
      .desktop-avatar { width: 50px !important; height: 50px !important; font-size: 20px !important; }
      .desktop-card-padding { padding: 25px !important; }
      .desktop-border-radius { border-radius: 15px !important; }
      .desktop-button-padding { padding: 10px 20px !important; }
      .desktop-button-radius { border-radius: 20px !important; }
      .desktop-emoji-size { width: 80px !important; height: 80px !important; font-size: 50px !important; }
      .desktop-grid-gap { gap: 20px !important; }
      .desktop-button-height { min-height: 100px !important; }
      .desktop-main-padding { padding: 30px 40px !important; }
      .desktop-nav-padding { padding: 20px 0 !important; }
      .desktop-nav-font { font-size: 20px !important; }
      .desktop-nav-size { min-width: 50px !important; min-height: 50px !important; }
      .desktop-max-width { max-width: 1200px !important; margin: 0 auto !important; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'white',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div className="mobile-padding desktop-padding" style={{
          backgroundColor: 'white',
          borderBottom: 'none'
        }}>
          <div className="mobile-gap desktop-gap mobile-margin-bottom desktop-margin-bottom" style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <div className="mobile-avatar desktop-avatar" style={{
              borderRadius: '50%',
              backgroundColor: '#FFE4B5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              👶
            </div>
            <span className="mobile-font-16 desktop-font-18" style={{
              color: '#333',
              fontWeight: '400'
            }}>
              Hi Hema, Welcome!
            </span>
          </div>
          
          <h2 className="mobile-font-20 desktop-font-24" style={{
            color: '#333',
            margin: '0',
            fontWeight: '600',
            lineHeight: '1.3'
          }}>
            What did your baby<br />do today?
          </h2>
        </div>

        {/* Main Content */}
        <div className="mobile-main-padding desktop-main-padding desktop-max-width" style={{
          flex: 1,
          width: '100%'
        }}>
          {/* Follow Baby's Action Card */}
          <div className="mobile-card-padding desktop-card-padding mobile-border-radius desktop-border-radius" style={{
            backgroundColor: '#6B5B73',
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            position: 'relative',
            maxWidth: '90%',
            margin: '0 auto 15px auto'
          }}>
            <div style={{
              flex: 1
            }}>
              <h3 className="mobile-font-16 desktop-font-18" style={{
                margin: '0 0 15px 0',
                fontWeight: '600',
                lineHeight: '1.3'
              }}>
                Follow baby's action<br />everyday!
              </h3>
              <button className="mobile-button-padding desktop-button-padding mobile-button-radius desktop-button-radius mobile-font-12 desktop-font-14" style={{
                backgroundColor: 'white',
                color: '#6B5B73',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                View Gallery
              </button>
            </div>
            <div className="mobile-emoji-size desktop-emoji-size" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
  <img
    src={giraffeIcon}
    alt="giraffe"
    style={{
      width: '190px',
      marginBottom: '10px',    // Push down
      marginRight: '100px'     // Push left
    }}
  />
</div>

            </div>
          </div>

          {/* Note */}
          <p className="mobile-font-12 desktop-font-14" style={{
            color: '#666',
            marginBottom: '20px',
            fontStyle: 'normal'
          }}>
            • Due for may month fee is pending Pay now
          </p>

          {/* Action Buttons Grid */}
          <div className="mobile-grid-gap desktop-grid-gap" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            marginBottom: '20px',
            maxWidth: '80%',
            margin: '0 auto 20px auto'
          }}>
            <button
  className="mobile-border-radius desktop-border-radius mobile-button-height desktop-button-height mobile-font-14 desktop-font-16"
  style={{
    backgroundColor: '#C0C0C0',
    border: 'none',
    padding: '20px 15px',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    lineHeight: '1.2'
  }}
  onClick={() => navigate('/daily-report')} // ← React route path
>
  Daily<br />Report
</button>

            
            <button className="mobile-border-radius desktop-border-radius mobile-button-height desktop-button-height mobile-font-14 desktop-font-16" style={{
              backgroundColor: '#C0C0C0',
              border: 'none',
              padding: '20px 15px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              CCTV
            </button>
            
            <button className="mobile-border-radius desktop-border-radius mobile-button-height desktop-button-height mobile-font-14 desktop-font-16" style={{
              backgroundColor: '#C0C0C0',
              border: 'none',
              padding: '20px 15px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              Fees
            </button>
            
            <button className="mobile-border-radius desktop-border-radius mobile-button-height desktop-button-height mobile-font-14 desktop-font-16" style={{
              backgroundColor: '#C0C0C0',
              border: 'none',
              padding: '20px 15px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              lineHeight: '1.2'
            }}>
              Leave<br />Request
            </button>
          </div>

          {/* Reports Button */}
         <div
  style={{
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px',
  }}
>
  <button
    onClick={() => navigate('/child-report')} // 👈 Navigates to /report
    className="mobile-border-radius desktop-border-radius mobile-button-height desktop-button-height mobile-font-14 desktop-font-16"
    style={{
      backgroundColor: '#C0C0C0',
      border: 'none',
      padding: '20px 40px',
      fontWeight: '600',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '35%',
      maxWidth: '200px',
    }}
  >
    Reports
  </button>
</div>

        </div>

        {/* Bottom Navigation */}
        <div className="mobile-nav-padding desktop-nav-padding" style={{
          backgroundColor: 'white',
          borderTop: '1px solid #e0e0e0',
          marginTop: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            maxWidth: '100%',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <button className="mobile-nav-font desktop-nav-font mobile-nav-size desktop-nav-size" style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderBottom: '2px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🏠
            </button>
            
            <button className="mobile-nav-font desktop-nav-font mobile-nav-size desktop-nav-size" style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              📋
            </button>
            
            <button className="mobile-nav-font desktop-nav-font mobile-nav-size desktop-nav-size" style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              📹
            </button>
            
            <button className="mobile-nav-font desktop-nav-font mobile-nav-size desktop-nav-size" style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              👤
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ParentDashboard;