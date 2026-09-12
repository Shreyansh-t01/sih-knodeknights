import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ROLES, DEFAULT_VIEW_BY_ROLE } from '../utils/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(ROLES.CITIZEN);
  const [globalId, setGlobalId] = useState('GLOBAL-MMVY-00010001');
  const [activeDepartment, setActiveDepartmentState] = useState('Revenue_Department');
  const [token, setToken] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('mahasetu_token') : null;
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(true);
  
  // Track decisions in localStorage so approved/rejected applications persist across page reloads
  const [localDecisions, setLocalDecisions] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('mahasetu_decisions') : null;
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [liveCitizenProfile, setLiveCitizenProfile] = useState(null);

  // Fetch live authoritative citizen profile directly from Neon PostgreSQL via backend
  const fetchLiveCitizen = useCallback(async (targetGlobalId, activeToken) => {
    if (!targetGlobalId || !activeToken) return;
    try {
      const res = await fetch(`/api/auth/citizen/${encodeURIComponent(targetGlobalId)}`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setLiveCitizenProfile(data.profile);
      }
    } catch (err) {
      console.warn('[AuthContext] Could not load live citizen from Neon:', err.message);
    }
  }, []);

  useEffect(() => {
    if (token && globalId && role === ROLES.CITIZEN) {
      fetchLiveCitizen(globalId, token);
    }
  }, [token, globalId, role, fetchLiveCitizen]);

  const citizenInfo = {
    globalId: liveCitizenProfile?.global_id || currentUser?.global_id || globalId,
    legacyId: liveCitizenProfile?.legacy_id || currentUser?.legacy_id,
    name: liveCitizenProfile?.name || currentUser?.name || 'Verified Citizen',
    first_name: liveCitizenProfile?.first_name || currentUser?.first_name,
    last_name: liveCitizenProfile?.last_name || currentUser?.last_name,
    email: liveCitizenProfile?.email || currentUser?.email,
    mobile: liveCitizenProfile?.mobile || currentUser?.mobile,
    city: liveCitizenProfile?.city || currentUser?.city || 'Maharashtra',
    district: liveCitizenProfile?.district || currentUser?.district || 'Maharashtra',
    state: liveCitizenProfile?.state || currentUser?.state || 'Maharashtra',
    address: liveCitizenProfile?.address || currentUser?.address,
    applications: liveCitizenProfile?.applications || [],
  };

  /**
   * Perform Federated SSO login / token exchange with backend OIDC provider
   */
  const loginSSO = useCallback(async ({ identifier, password, pin, identityId, role: targetRole, department: targetDept }) => {
    setSsoLoading(true);
    try {
      const response = await fetch('/api/auth/sso/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
          pin,
          identityId,
          role: targetRole,
          department: targetDept,
        }),
      });

      if (!response.ok) {
        throw new Error(`SSO Login failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem('mahasetu_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setShowLoginGate(false);
        if (data.user.role) {
          setRole(data.user.role);
        }
        if (data.user.global_id) {
          setGlobalId(data.user.global_id);
        }
        if (data.user.department) {
          setActiveDepartmentState(data.user.department);
        }
        return data;
      }
    } catch (err) {
      console.error('[AuthContext] SSO Error:', err);
      throw err;
    } finally {
      setSsoLoading(false);
    }
  }, []);

  // When portal opens, prompt for Unified ID (or restore existing verified session)
  useEffect(() => {
    const existingToken = typeof window !== 'undefined' ? localStorage.getItem('mahasetu_token') : null;
    if (existingToken) {
      fetch('/api/auth/userinfo', {
        headers: { Authorization: `Bearer ${existingToken}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setRole(data.user.role);
            if (data.user.global_id) setGlobalId(data.user.global_id);
            if (data.user.department) setActiveDepartmentState(data.user.department);
            setIsAuthenticated(true);
            setShowLoginGate(false);
          } else {
            setShowLoginGate(true);
          }
        })
        .catch(() => setShowLoginGate(true));
    } else {
      setShowLoginGate(true);
    }
  }, []);

  const openLoginGate = () => setShowLoginGate(true);
  const closeLoginGate = () => {
    if (isAuthenticated) setShowLoginGate(false);
  };

  const logout = () => {
    localStorage.removeItem('mahasetu_token');
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowLoginGate(true);
  };

  const switchRole = (newRole) => {
    if (Object.values(ROLES).includes(newRole)) {
      setRole(newRole);
      loginSSO({ role: newRole, department: activeDepartment });
    }
  };

  const switchGlobalId = (newId) => {
    setGlobalId(newId);
    if (role === ROLES.CITIZEN) {
      let targetIdentityId = 'citizen_ananya';
      if (newId === 'GLOBAL-MMVY-00010002') targetIdentityId = 'citizen_rahul';
      else if (newId === 'GLOBAL-MMVY-00010003') targetIdentityId = 'citizen_sunita';
      loginSSO({ role: ROLES.CITIZEN, identityId: targetIdentityId });
    }
  };

  const setActiveDepartment = (newDept) => {
    setActiveDepartmentState(newDept);
    if (role === ROLES.DEPARTMENT_OFFICER || role === ROLES.DEPARTMENT_ADMIN) {
      loginSSO({ role, department: newDept });
    }
  };

  const recordDecision = (uarn, decision, applicationData = null) => {
    setLocalDecisions((prev) => {
      const updated = {
        ...prev,
        [uarn]: {
          decision,
          updatedAt: new Date().toISOString(),
          applicationData: applicationData || prev[uarn]?.applicationData,
        },
      };
      try {
        localStorage.setItem('mahasetu_decisions', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save decision to localStorage', e);
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        globalId,
        citizenInfo,
        activeDepartment,
        localDecisions,
        token,
        currentUser,
        ssoLoading,
        isAuthenticated,
        showLoginGate,
        openLoginGate,
        closeLoginGate,
        logout,
        loginSSO,
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

