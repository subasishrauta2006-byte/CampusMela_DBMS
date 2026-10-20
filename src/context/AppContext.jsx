import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import db from '../db/database';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [dbStatus, setDbStatus] = useState(db.getConnectionStatus());
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campushub_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const refresh = useCallback(async () => {
    await db.syncFromBackend();
    setDbStatus(db.getConnectionStatus());
    setRefreshKey(k => k + 1);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const loginUser = useCallback((user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('campushub_user', JSON.stringify(user));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    addToast(`Welcome back, ${user.name}! (${user.role})`);
  }, [addToast]);

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('campushub_user');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    addToast('You have signed out successfully.', 'info');
  }, [addToast]);

  return (
    <AppContext.Provider value={{
      db,
      refreshKey,
      refresh,
      toasts,
      addToast,
      dbStatus,
      currentUser,
      loginUser,
      logoutUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
