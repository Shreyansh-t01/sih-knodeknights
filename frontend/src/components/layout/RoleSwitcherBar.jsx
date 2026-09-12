import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/roles';
import { KeyRound, Shield, CheckCircle2, Building2, Lock, LogOut } from 'lucide-react';

export function RoleSwitcherBar() {
  const {
    role,
    globalId,
    activeDepartment,
    currentUser,
    token,
    openLoginGate,
    logout,
  } = useAuth();

  return (
    <aside className="demo-bar" aria-label="Meri Pehchaan SSO Security Bar">
      <div className="demo-bar-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="demo-badge"
            style={{
              background: '#047857',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <KeyRound size={12} />
            Meri Pehchaan SSO
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '11.5px' }}>
            <Lock size={12} color="#10b981" />
            <span style={{ color: '#cbd5e1', fontWeight: 600 }}>RBAC Enforcement Active:</span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <span style={{ color: '#94a3b8' }}>Active Role:</span>
            <strong style={{ color: '#f59e0b' }}>{ROLE_LABELS[role] || role}</strong>
            {currentUser?.department && (
              <>
                <span style={{ color: '#475569' }}>|</span>
                <span style={{ color: '#94a3b8' }}>Dept:</span>
                <span style={{ color: '#38bdf8' }}>{currentUser.department.replace(/_/g, ' ')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="demo-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '2px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#e2e8f0',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <span style={{ color: '#94a3b8' }}>Unified ID:</span>
          <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
            {currentUser?.global_id || globalId || currentUser?.sub || 'Authenticated'}
          </strong>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#94a3b8' }}>Subject:</span>
          <span style={{ color: '#cbd5e1' }}>{currentUser?.sub || 'demo-user'}</span>
          <CheckCircle2 size={13} color="#10b981" />
        </div>

        <button
          type="button"
          onClick={openLoginGate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: '#1e3a8a',
            border: '1px solid #3b82f6',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <KeyRound size={11} />
          <span>Switch Identity</span>
        </button>

        <button
          type="button"
          onClick={logout}
          title="Sign out of active session"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <LogOut size={11} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
