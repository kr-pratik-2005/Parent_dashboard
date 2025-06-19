import React from "react";

const RequestSubmittedModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.32);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .modal-content {
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 6px 32px rgba(0,0,0,0.18);
          padding: 32px 22px 24px 22px;
          width: 90vw;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .modal-checkmark {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #444;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }
        .modal-checkmark svg {
          width: 36px;
          height: 36px;
          color: #fff;
        }
        .modal-title {
          font-size: 21px;
          font-weight: 700;
          color: #222;
          margin-bottom: 7px;
          text-align: center;
        }
        .modal-subtitle {
          font-size: 15px;
          color: #888;
          margin-bottom: 24px;
          text-align: center;
        }
        .modal-confirm-btn {
          width: 100%;
          background: #bdbdbd;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px 0;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 0;
          cursor: pointer;
          transition: background .18s;
        }
        .modal-close-btn {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: -32px;
          background: #fff;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .modal-close-btn svg {
          width: 22px;
          height: 22px;
          color: #888;
        }
        @media (max-width: 400px) {
          .modal-content {
            padding: 22px 8px 18px 8px;
            max-width: 94vw;
          }
        }
      `}</style>
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-checkmark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="11" stroke="none" fill="none"/>
              <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="modal-title">Request Submitted</div>
          <div className="modal-subtitle">Thanks for your information</div>
          <button className="modal-confirm-btn" onClick={onConfirm || onClose}>
            Confirm
          </button>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="11" stroke="none" fill="none"/>
              <line x1="8" y1="8" x2="16" y2="16" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="8" x2="8" y2="16" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default RequestSubmittedModal;
