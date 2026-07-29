import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import api from '../utils/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'sentryscope_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) {
          setToken(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem(STORAGE_KEY, data.token);
    flushSync(() => {
      setToken(data.token);
      setUser(data.user);
    });
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem(STORAGE_KEY, data.token);
    flushSync(() => {
      setToken(data.token);
      setUser(data.user);
    });
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    flushSync(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    initializing,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
