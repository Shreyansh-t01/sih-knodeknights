import React, { useState } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import ScrollReveal from './ScrollReveal';

export default function Hero({ onOpenRegister, onShowToast }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const typewriterWords = [
    'Building Your Future.',
    'Empowering 2.5L+ Scholars.',
    'Direct Benefit Transfer (DBT).',
    'Zero Paperwork Hassle.',
    'Fast-Track Verification.'
  ];

  const typedText = useTypewriter({
    words: typewriterWords,
    typeSpeed: 70,
    deleteSpeed: 38,
    delayBetween: 2200,
    loop: true
  });

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
    onShowToast(`Welcome, student ID ${loginId}! Logging in to your dashboard...`, 'success');
  };

  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="hero-grid">
          <ScrollReveal animation="fade-up" duration={700}>
            <div>
              <span className="eyebrow-pill">🏛 Government Scholarship Portal</span>
              <h2>
                Supporting Your Education.
                <span className="typewriter-container">
                  <em className="typewriter-text">{typedText}</em>
                  <span className="typewriter-cursor" aria-hidden="true"></span>
                </span>
              </h2>
              <p className="lead">
                This portal provides financial assistance to eligible students pursuing higher and professional education.
                Register online, verify your documents, track your application, and receive scholarship updates — all in one secure digital portal.
              </p>
              <div className="hero-actions">
                <a href="#schemes" className="btn btn-primary">
                  Apply for Scholarship →
                </a>
                <a href="#schemes" className="btn btn-white">
                  Explore Schemes
                </a>
                <a href="#tracker" className="btn btn-outline-light">
                  Track Application
                </a>
              </div>
              <ul className="hero-check">
                <li>
                  <span className="tick">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  Online Application
                </li>
                <li>
                  <span className="tick">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  Secure Verification
                </li>
                <li>
                  <span className="tick">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  Direct Benefit Transfer
                </li>
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="scale-up" delay={150} duration={750}>
            <div className="login-card">
              <div className="login-card-head">
                <h3>Student Login</h3>
                <span className="secure-tag">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  SECURE
                </span>
              </div>
              <p className="sub">Access your scholarship dashboard</p>
              <form id="heroLoginForm" onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="loginIdHero">Application ID / Mobile Number</label>
                  <input
                    type="text"
                    id="loginIdHero"
                    placeholder="Enter Application ID"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="loginPwHero">Password</label>
                  <div className="input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="loginPwHero"
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
                      onShowToast('Password reset link sent to your registered mobile/email', 'info');
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
              <div className="divider-or">OR</div>
              <div className="signup-note">
                New student?{' '}
                <button type="button" onClick={onOpenRegister}>
                  Create an Account
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
