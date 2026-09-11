import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES, DEFAULT_VIEW_BY_ROLE } from '../utils/roles';
import { DEMO_IDENTITIES } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(ROLES.CITIZEN);
  const [globalId, setGlobalId] = useState('MAHA-TEST-102');
  const [activeDepartment, setActiveDepartment] = useState('Revenue_Department');
  
  // Track local decisions so approved/rejected applications remain visible in tabs even after
  // the backend pending endpoint drops them (since it only returns PENDING_CONSENT)
  const [localDecisions, setLocalDecisions] = useState({});

  const citizenInfo = DEMO_IDENTITIES.find((d) => d.globalId === globalId) || DEMO_IDENTITIES[0];

  const switchRole = (newRole) => {
    if (Object.values(ROLES).includes(newRole)) {
      setRole(newRole);
    }
  };

  const switchGlobalId = (newId) => {
    setGlobalId(newId);
  };

  const recordDecision = (uarn, decision, applicationData = null) => {
    setLocalDecisions((prev) => ({
      ...prev,
      [uarn]: {
        decision,
        updatedAt: new Date().toISOString(),
        applicationData: applicationData || prev[uarn]?.applicationData,
      },
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        globalId,
        citizenInfo,
        activeDepartment,
        localDecisions,
        switchRole,
        switchGlobalId,
        setActiveDepartment,
        recordDecision,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
