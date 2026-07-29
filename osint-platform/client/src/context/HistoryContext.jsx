import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setEntries([]);
      setLoaded(false);
      return undefined;
    }

    async function load() {
      try {
        const { data } = await api.get('/history');
        if (!cancelled) setEntries(data.entries || []);
      } catch {
        // History is a convenience feature — leave entries empty rather than
        // blocking the dashboard if the request fails.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const logInvestigation = useCallback(async ({ type, target, risk = 'low', summary, profilesFound = 0 }) => {
    const tempId = `temp-${Date.now()}`;
    const optimistic = { id: tempId, type, target, risk, summary, timestamp: new Date().toISOString() };
    setEntries((prev) => [optimistic, ...prev]);

    try {
      const { data } = await api.post('/history', { type, target, risk, summary, profilesFound });
      setEntries((prev) => prev.map((e) => (e.id === tempId ? data.entry : e)));
    } catch {
      // Keep the optimistic local entry for this session even if the
      // server write failed — it'll just not survive a reload.
    }
  }, []);

  const clearHistory = useCallback(async () => {
    setEntries([]);
    try {
      await api.delete('/history');
    } catch {
      // Best effort — local state is already cleared.
    }
  }, []);

  return (
    <HistoryContext.Provider value={{ entries, logInvestigation, clearHistory, loaded }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
