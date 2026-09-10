import React, { useState, useEffect, useRef } from 'react';

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, onShowToast }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!name.trim()) {
      onShowToast('Please enter your full name as per Aadhaar', 'warning');
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      onShowToast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }
    if (!email.trim()) {
      onShowToast('Please enter a valid email address', 'warning');
      return;
    }
    if (!password.trim() || password.length < 6) {
      onShowToast('Password must be at least 6 characters', 'warning');
      return;
    }

    onShowToast(`Account created for ${name}! OTP sent to ${mobile} for mobile verification.`, 'success');
    onClose();
  };

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      id="registerModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="registerModalTitle">
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
          <span className="tag">📝 New Account</span>
          <h3 id="registerModalTitle">Create Student Account</h3>
          <p>Register once to apply and track all state higher education scholarships</p>
        </div>

        <form id="registerForm" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="regName">Full Name (as per Aadhaar)</label>
            <input
              ref={inputRef}
              type="text"
              id="regName"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="regMobile">Mobile Number</label>
            <input
              type="tel"
              id="regMobile"
              placeholder="10-digit mobile number"
              maxLength="10"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="field">
            <label htmlFor="regEmail">Email Address</label>
            <input
              type="email"
              id="regEmail"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="regPw">Create Password</label>
            <input
              type="password"
              id="regPw"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Register Student Account
          </button>
        </form>

        <p className="modal-switch">
          Already registered?{' '}
          <button
            type="button"
            id="switchToLogin"
            onClick={onSwitchToLogin}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
