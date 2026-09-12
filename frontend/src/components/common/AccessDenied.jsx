import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { DEFAULT_VIEW_BY_ROLE, ROLE_LABELS } from '../../utils/roles';
import { ShieldAlert, ArrowLeft, Lock, UserX } from 'lucide-react';

export function AccessDenied({ pageId, requiredRoles = [] }) {
  const { role, currentUser } = useAuth();
  const { navigate } = useNavigation();

  const handleReturn = () => {
    navigate(DEFAULT_VIEW_BY_ROLE[role] || 'citizen_home');
  };

  return (
    <div style={{
      maxWidth: '720px',
      margin: '40px auto',
      padding: '32px',
      background: '#ffffff',
      border: '1px solid #fee2e2',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.08)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc2626'
        }}>
          <ShieldAlert size={28} />
        </div>
        <div>
          <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '4px',
            marginBottom: '4px'
          }}>
            HTTP 403 • Access Denied
          </span>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#111827', fontWeight: 700 }}>
            Role-Based Access Control (RBAC) Violation
          </h2>
        </div>
      </div>

      <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', marginBottom: '20px' }}>
        Your authenticated session does not have the required role privileges to access the route 
        <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', margin: '0 4px', color: '#1f2937' }}>{pageId}</code>.
        Access across government digital platform boundaries is restricted by national interoperability security policies.
      </p>

      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        fontSize: '13px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: '8px' }}>
          <span style={{ color: '#6b7280', fontWeight: 600 }}>Active Subject:</span>
          <span style={{ color: '#111827', fontWeight: 600 }}>{currentUser?.name || 'Authenticated User'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: '8px' }}>
          <span style={{ color: '#6b7280', fontWeight: 600 }}>Your Role:</span>
          <span style={{ color: '#dc2626', fontWeight: 700 }}>{ROLE_LABELS[role] || role}</span>
        </div>
        {currentUser?.department && (
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontWeight: 600 }}>Department Scope:</span>
            <span style={{ color: '#111827' }}>{currentUser.department}</span>
          </div>
        )}
        {requiredRoles.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px' }}>
            <span style={{ color: '#6b7280', fontWeight: 600 }}>Permitted Roles:</span>
            <span style={{ color: '#047857', fontWeight: 600 }}>{requiredRoles.map(r => ROLE_LABELS[r] || r).join(', ')}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={handleReturn}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: '#1e3a8a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          Return to Authorized Dashboard
        </button>
      </div>
    </div>
  );
}
