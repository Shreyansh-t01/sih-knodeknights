import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { DEFAULT_VIEW_BY_ROLE } from '../utils/roles';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const { role } = useAuth();
  const [currentPage, setCurrentPage] = useState(DEFAULT_VIEW_BY_ROLE[role] || 'citizen_home');
  const [pageParams, setPageParams] = useState({});

  // Sync state when role changes if current page is not relevant to new role
  useEffect(() => {
    const defaultPage = DEFAULT_VIEW_BY_ROLE[role] || 'citizen_home';
    setCurrentPage(defaultPage);
    setPageParams({});
  }, [role]);

  // Read initial hash if available
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const [page, queryString] = hash.split('?');
        if (page) {
          setCurrentPage(page);
          if (queryString) {
            const params = Object.fromEntries(new URLSearchParams(queryString));
            setPageParams(params);
          }
        }
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const navigate = (pageId, params = {}) => {
    setCurrentPage(pageId);
    setPageParams(params);
    let hash = `#${pageId}`;
    if (Object.keys(params).length > 0) {
      const query = new URLSearchParams(params).toString();
      hash += `?${query}`;
    }
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        pageParams,
        navigate,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
