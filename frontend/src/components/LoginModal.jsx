import React, { useState, useEffect, useRef } from 'react';

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, onShowToast }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loginId.trim()) {
      onShowToast('Please enter your Application ID or Mobile Number', 'warning');
      return;
    }
    if (!password.trim()) {
      onShowToast('Please enter your password', 'warning');
      return;
    }
    onShowToast(`Authentication successful for ${loginId}. Redirecting...`, 'success');
    onClose();
  };

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      id="loginModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="loginModalTitle">
        <button
          type="button"
          className="modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="modal-head">
          <span className="tag">🔒 Secure Login</span>
          <h3 id="loginModalTitle">Student Login</h3>
          <p>Access your scholarship dashboard &amp; live application details</p>
        </div>

        <form id="modalLoginForm" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="modalLoginId">Application ID / Mobile Number</label>
            <input
              ref={inputRef}
              type="text"
              id="modalLoginId"
              placeholder="Enter Application ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="modalLoginPw">Password</label>
            <div className="input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="modalLoginPw"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="pw-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-links">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onShowToast('Password reset instructions dispatched to your contact info', 'info');
              }}
            >
              Forgot Password?
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onShowToast('Enter your registered Aadhaar / Roll number to retrieve Application ID', 'info');
              }}
            >
              Forgot Application ID?
            </a>
          </div>

          <button type="submit" className="btn btn-navy btn-block">
            Login to Dashboard
          </button>
        </form>

        <p className="modal-switch">
          New student?{' '}
          <button
            type="button"
            id="switchToRegister"
            onClick={onSwitchToRegister}
          >
            Create an Account
          </button>
        </p>
      </div>
    </div>
  );
}
