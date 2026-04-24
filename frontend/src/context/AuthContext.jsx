import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);
const USER_STORAGE_KEY = 'user';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const storeUser = useCallback((nextUser) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  // On mount, re-hydrate user from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!token) {
      localStorage.removeItem(USER_STORAGE_KEY);
      setLoading(false);
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    authAPI.me()
      .then(({ data }) => storeUser(data.user))
      .catch(() => clearAuth())
      .finally(() => setLoading(false));
  }, [clearAuth, storeUser]);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    storeUser(data.user);
    return data.user;
  }, [storeUser]);

  const signup = useCallback(async (formData) => {
    const { data } = await authAPI.signup(formData);
    localStorage.setItem('token', data.token);
    storeUser(data.user);
    return data.user;
  }, [storeUser]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    const { data } = await authAPI.me();
    storeUser(data.user);
  }, [storeUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
