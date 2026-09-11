import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { ROLES, ROLE_LABELS, DEPARTMENTS, DEFAULT_VIEW_BY_ROLE } from '../../utils/roles';
import { DEMO_IDENTITIES } from '../../utils/constants';
import { UserCheck, Shield, Building, Award } from 'lucide-react';

export function RoleSwitcherBar() {
  const {
    role,
    globalId,
    activeDepartment,
    switchRole,
    switchGlobalId,
    setActiveDepartment,
  } = useAuth();
  const { navigate } = useNavigation();

  const handleRoleChange = (newRole) => {
    switchRole(newRole);
    navigate(DEFAULT_VIEW_BY_ROLE[newRole]);
  };

  return (
    <aside className="demo-bar" aria-label="SIH 2026 Evaluation Role Suite">
      <div className="demo-bar-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="demo-badge">SIH 2026 Prototype</span>
          <span style={{ color: '#cbd5e1', fontSize: '11px', fontWeight: 600 }}>
            Evaluation Mode • Role Experience:
          </span>
        </div>

        <div className="role-pill-group">
          {Object.values(ROLES).map((r) => (
            <button
              key={r}
              type="button"
              className={`role-pill-btn ${role === r ? 'active' : ''}`}
              onClick={() => handleRoleChange(r)}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="demo-bar-right">
        {role === ROLES.CITIZEN ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>
              Citizen Identifier:
            </span>
            <select
              className="demo-select"
              value={globalId}
              onChange={(e) => switchGlobalId(e.target.value)}
            >
              {DEMO_IDENTITIES.map((d) => (
                <option key={d.globalId} value={d.globalId}>
                  {d.globalId} ({d.name})
                </option>
              ))}
            </select>
          </div>
        ) : (role === ROLES.DEPARTMENT_OFFICER || role === ROLES.DEPARTMENT_ADMIN) ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>
              Department Scope:
            </span>
            <select
              className="demo-select"
              value={activeDepartment}
              onChange={(e) => setActiveDepartment(e.target.value)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
            <Shield size={12} color="#10b981" />
            <span>Platform-wide System Scope Active</span>
          </div>
        )}
      </div>
    </aside>
  );
}
