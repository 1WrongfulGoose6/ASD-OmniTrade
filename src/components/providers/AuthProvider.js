'use client';

import React from 'react';
import PropTypes from 'prop-types';

const AuthContext = React.createContext({
  user: null,
  loading: false,
  refresh: async () => {},
  setUser: () => {},
});

export function AuthProvider({ initialUser = null, children }) {
  const [user, setUser] = React.useState(initialUser);
  const [loading, setLoading] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 403) {
          setUser(null);
        }
        return;
      }
      const data = await res.json().catch(() => ({}));
      setUser(data.user || null);
    } catch {
      // ignore fetch errors, keep existing state
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('auth:changed', handler);
    return () => window.removeEventListener('auth:changed', handler);
  }, [refresh]);

  const value = React.useMemo(
    () => ({ user, loading, refresh, setUser }),
    [user, loading, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  initialUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.string,
  }),
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  return React.useContext(AuthContext);
}

