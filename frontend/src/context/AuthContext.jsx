import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('movie-explorer-user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(token, user) {
  if (token) localStorage.setItem('token', token);
  if (user) localStorage.setItem('movie-explorer-user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('movie-explorer-user');
  // Legacy keys from the first version of the app.
  localStorage.removeItem('username');
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));
  const toast = useToast();

  const logout = useCallback(
    (options = {}) => {
      clearSession();
      setToken(null);
      setUser(null);
      if (options.message) toast.info(options.message);
    },
    [toast]
  );

  const applySession = useCallback((session) => {
    if (!session?.token || !session?.user) {
      throw new Error('The server returned an incomplete session.');
    }
    persistSession(session.token, session.user);
    setToken(session.token);
    setUser(session.user);
    setLoading(false);
  }, []);

  /* Validate a stored session on first load. */
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    authApi
      .me(token)
      .then(({ user: freshUser }) => {
        if (cancelled) return;
        setUser(freshUser);
        persistSession(token, freshUser);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.status === 401) {
          clearSession();
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  /* Global "session expired" event fired by the API client. */
  useEffect(() => {
    const handleExpired = () => {
      if (!localStorage.getItem('token')) return;
      clearSession();
      setToken(null);
      setUser(null);
      toast.info('Your session expired. Please sign in again.');
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [toast]);

  const login = useCallback(
    async ({ identifier, password }) => {
      const session = await authApi.login({ identifier, password });
      applySession(session);
      return session.user;
    },
    [applySession]
  );

  const register = useCallback(
    async (payload) => {
      const session = await authApi.register(payload);
      applySession(session);
      return session.user;
    },
    [applySession]
  );

  const loginWithGoogle = useCallback(
    async (credential) => {
      const session = await authApi.google(credential);
      applySession(session);
      return session.user;
    },
    [applySession]
  );

  const updateProfile = useCallback(async (payload) => {
    const { user: updatedUser } = await authApi.updateProfile(payload);
    setUser(updatedUser);
    localStorage.setItem('movie-explorer-user', JSON.stringify(updatedUser));
    return updatedUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      loginWithGoogle,
      updateProfile,
      logout,
    }),
    [user, token, loading, login, register, loginWithGoogle, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}
