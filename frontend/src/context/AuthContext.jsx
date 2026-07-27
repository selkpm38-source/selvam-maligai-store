import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, setAccessToken } from '../api/axiosClient.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'selvam-user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  });
  const [accessToken, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyToken = (token) => {
    setToken(token);
    setAccessToken(token);
  };

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    applyToken(data.data.accessToken);
    setUser(data.data.user || null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data.user || null));
    return data.data.user || null;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout failures and clear client state anyway
    }
    setUser(null);
    applyToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const refreshSession = async () => {
    const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!storedUser) {
      applyToken(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await authApi.refresh();
      applyToken(data.data.accessToken);
      setUser(storedUser);
    } catch {
      setUser(null);
      applyToken(null);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const isAuthenticated = Boolean(user && accessToken);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
