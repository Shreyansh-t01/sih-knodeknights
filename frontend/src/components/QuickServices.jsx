import React from 'react';

export default function QuickServices({ onOpenRegister }) {
  return (
    <div className="quick-services">
      <div className="container">
        <div className="qs-grid">
          <div
            className="qs-item"
            role="button"
            tabIndex={0}
            onClick={onOpenRegister}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onOpenRegister();
            }}
          >
            <span className="qs-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
                <path d="m9 15 2 2 4-4" />
              </svg>
            </span>
            <h4>New Registration</h4>
            <p>Create student account</p>
          </div>

          <a className="qs-item" href="#tracker">
            <span className="qs-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <h4>Track Application</h4>
            <p>Check current status</p>
          </a>

          <a className="qs-item" href="#eligibility">
            <span className="qs-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2Z" />
              </svg>
            </span>
            <h4>Upload Documents</h4>
            <p>Submit required files</p>
          </a>

          <a className="qs-item" href="#tracker">
            <span className="qs-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </span>
            <h4>Payment Status</h4>
            <p>Track scholarship credit</p>
          </a>

          <a className="qs-item" href="#help">
            <span className="qs-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3ZM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3Z" />
              </svg>
            </span>
            <h4>Help Desk</h4>
            <p>Get student support</p>
          </a>
        </div>
      </div>
    </div>
  );
}
