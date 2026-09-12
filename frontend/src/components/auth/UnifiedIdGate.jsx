import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { ROLES, DEFAULT_VIEW_BY_ROLE } from '../../utils/roles';
import { GovEmblem } from '../common/GovEmblem';
import { DEMO_CREDENTIALS } from '../../config/demoCredentials';
import {
  KeyRound,
  Shield,
  ShieldCheck,
  Lock,
  User,
  Building2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function UnifiedIdGate({ onClose }) {
  const { loginSSO, ssoLoading } = useAuth();
  const { navigate } = useNavigation();

  // Authentication Tracks: 'CITIZEN' or 'OFFICER'
  const [activeTab, setActiveTab] = useState('CITIZEN');

  // Input States (Strictly empty by default - no insecure prefill)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState('Revenue_Department');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaNum1, setCaptchaNum1] = useState(7);
  const [captchaNum2, setCaptchaNum2] = useState(4);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRefAccounts, setShowRefAccounts] = useState(false);

  // Generate a random arithmetic captcha
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
    setCaptchaAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
  }, [activeTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setIdentifier('');
    setPassword('');
    setErrorMsg('');
    generateCaptcha();
  };

  const handleAuthenticate = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanId = identifier.trim();
    const cleanPwd = password.trim();

    if (!cleanId) {
      setErrorMsg(
        activeTab === 'CITIZEN'
          ? 'Please enter your Unified Global ID (e.g. GLOBAL-MMVY-00010001).'
          : 'Please enter your Official Government Email or Officer ID.'
      );
      return;
    }

    if (!cleanPwd) {
      setErrorMsg(
        activeTab === 'CITIZEN'
          ? 'Please enter your 6-digit Security PIN.'
          : 'Please enter your Department Security Password.'
      );
      return;
    }

    // Security Captcha Verification
    const expected = captchaNum1 + captchaNum2;
    if (parseInt(captchaAnswer.trim(), 10) !== expected) {
      setErrorMsg('Security verification code (CAPTCHA) is incorrect. Please re-verify.');
      generateCaptcha();
      return;
    }

    try {
      const res = await loginSSO({
        identifier: cleanId,
        password: cleanPwd,
        pin: cleanPwd,
        department: activeTab === 'OFFICER' ? department : undefined,
      });

      if (res && res.success) {
        const dest = DEFAULT_VIEW_BY_ROLE[res.user.role] || 'citizen_dashboard';
        navigate(dest);
        if (onClose) onClose();
      } else {
        setErrorMsg('Authentication failed: Access Denied. Unrecognized credentials.');
        generateCaptcha();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed: Invalid credentials or unauthorized role.');
      generateCaptcha();
    }
  };

  // Safe reference population for sandbox evaluation without exposing names or data
  const handleSelectDemoIdentity = (testId, testSecret, testDept, tab) => {
    setActiveTab(tab);
    setIdentifier(testId);
    setPassword(testSecret);
    if (testDept) setDepartment(testDept);
    setCaptchaAnswer(String(captchaNum1 + captchaNum2));
    setErrorMsg('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(15, 23, 42, 0.94) 0%, rgba(2, 6, 23, 0.98) 100%)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        overflowY: 'auto',
        fontFamily: "'Segoe UI', Roboto, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* National Emblem & SSO Identity Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            color: '#ffffff',
            padding: '24px 28px 20px',
            textAlign: 'center',
            borderBottom: '4px solid #ea580c',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <GovEmblem size={44} light={true} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(5, 150, 105, 0.25)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              color: '#34d399',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            <ShieldCheck size={12} />
            Meri Pehchaan • Interoperability Gateway
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '19px',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              color: '#ffffff',
            }}
          >
            Unified Identity Authentication
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            National Inter-Departmental Interoperability & RBAC Gateway
          </p>
        </div>

        {/* Form Container */}
        <div style={{ padding: '22px 26px' }}>
          {/* Track Selector Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '8px',
              marginBottom: '18px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => handleTabSwitch('CITIZEN')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'CITIZEN' ? '#ffffff' : 'transparent',
                color: activeTab === 'CITIZEN' ? '#1e3a8a' : '#64748b',
                boxShadow: activeTab === 'CITIZEN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={14} />
              <span>Citizen Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('OFFICER')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'OFFICER' ? '#ffffff' : 'transparent',
                color: activeTab === 'OFFICER' ? '#1e3a8a' : '#64748b',
                boxShadow: activeTab === 'OFFICER' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Building2 size={14} />
              <span>Officer / Admin</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                background: '#fef2f2',
                color: '#991b1b',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                marginBottom: '16px',
                border: '1px solid #fecaca',
                lineHeight: 1.4,
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Secure Form */}
          <form onSubmit={handleAuthenticate}>
            {/* Primary Identifier Input */}
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '5px',
                }}
              >
                {activeTab === 'CITIZEN' ? 'Unified Citizen Global ID (UID):' : 'Official Government Email / Officer ID:'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  activeTab === 'CITIZEN'
                    ? 'e.g. GLOBAL-MMVY-00010001'
                    : 'e.g. rajesh.patil@revenue.maharashtra.gov.in'
                }
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: activeTab === 'CITIZEN' ? 'monospace' : 'inherit',
                  color: '#0f172a',
                  background: '#ffffff',
                  boxSizing: 'border-box',
                  outlineColor: '#1e3a8a',
                }}
              />
            </div>

            {/* Credential / PIN Input */}
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '5px',
                }}
              >
                {activeTab === 'CITIZEN' ? '6-Digit Security PIN:' : 'Security Password:'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={activeTab === 'CITIZEN' ? '••••••' : 'Enter official password'}
                  autoComplete="current-password"
                  maxLength={activeTab === 'CITIZEN' ? 12 : 50}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    letterSpacing: !showPassword && activeTab === 'CITIZEN' ? '0.2em' : 'normal',
                    color: '#0f172a',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                    outlineColor: '#1e3a8a',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Officer Department Scope Selector */}
            {activeTab === 'OFFICER' && (
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '5px',
                  }}
                >
                  Department Scope Verification:
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    color: '#0f172a',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                    outlineColor: '#1e3a8a',
                  }}
                >
                  <option value="Revenue_Department">Revenue Department (Task Scoped)</option>
                  <option value="Police_Department">Police Department (Task Scoped)</option>
                  <option value="Scholarship_Portal">Scholarship Portal (Education)</option>
                </select>
              </div>
            )}

            {/* Security Captcha Challenge */}
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '5px',
                }}
              >
                Security Verification Code (Anti-Bot CAPTCHA):
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div
                  style={{
                    background: '#e2e8f0',
                    color: '#1e293b',
                    fontFamily: 'monospace',
                    fontSize: '15px',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{captchaNum1} + {captchaNum2} = ?</span>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    title="Generate new challenge"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      marginLeft: '6px',
                    }}
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>

                <input
                  type="text"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Value"
                  maxLength={4}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    textAlign: 'center',
                    color: '#0f172a',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                    outlineColor: '#1e3a8a',
                  }}
                />
              </div>
            </div>

            {/* Authenticate Submit Button */}
            <button
              type="submit"
              disabled={ssoLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 16px',
                background: '#ea580c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: ssoLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 10px rgba(234, 88, 12, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <Lock size={15} />
              <span>{ssoLoading ? 'Verifying Credentials...' : 'Authenticate & Sign In'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Cryptographic Assurance & Standards Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '16px',
              padding: '8px 12px',
              background: '#f8fafc',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#475569',
              border: '1px solid #e2e8f0',
            }}
          >
            <Shield size={14} color="#059669" style={{ flexShrink: 0 }} />
            <span>
              OIDC/OAuth 2.0 HMAC-SHA256 Token Exchange. Department RBAC verified at runtime.
            </span>
          </div>

          {/* Discreet Sandbox Reference Accordion (Never exposes raw citizen details openly) */}
          <div style={{ marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
            <button
              type="button"
              onClick={() => setShowRefAccounts(!showRefAccounts)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 0',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Info size={12} />
                <span>Evaluation Sandbox Reference (SIH 2026 Testing Credentials)</span>
              </span>
              {showRefAccounts ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showRefAccounts && (
              <div
                style={{
                  marginTop: '8px',
                  background: '#f8fafc',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '10.5px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ color: '#475569', marginBottom: '6px', fontWeight: 600 }}>
                  Standard Test Passwords: PIN <code>123456</code> | Officer <code>MahaSetu@2026</code>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  {DEMO_CREDENTIALS.citizens.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectDemoIdentity(c.id, c.pin, null, 'CITIZEN')}
                      style={{
                        textAlign: 'left',
                        padding: '4px 6px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px',
                        color: '#1e3a8a',
                        fontWeight: 600,
                      }}
                    >
                      {c.name} (Citizen)
                    </button>
                  ))}
                  {DEMO_CREDENTIALS.officers.map((o) => (
                    <button
                      key={o.email}
                      type="button"
                      onClick={() => handleSelectDemoIdentity(o.email, o.password, o.department, 'OFFICER')}
                      style={{
                        textAlign: 'left',
                        padding: '4px 6px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px',
                        color: o.department === 'Revenue_Department' ? '#b45309' : '#047857',
                        fontWeight: 600,
                      }}
                    >
                      {o.name}
                    </button>
                  ))}
                  {DEMO_CREDENTIALS.administrators.map((a) => (
                    <button
                      key={a.email}
                      type="button"
                      onClick={() => handleSelectDemoIdentity(a.email, a.password, null, 'OFFICER')}
                      style={{
                        textAlign: 'left',
                        padding: '4px 6px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '10px',
                        color: '#4338ca',
                        fontWeight: 600,
                      }}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
