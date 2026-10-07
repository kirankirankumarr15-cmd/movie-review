import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { User } from '../types';
import { authApi, getToken, removeToken, setToken } from '../services/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Check stored token on mount
  useEffect(() => {
    const storedToken = getToken();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    authApi.me()
      .then(({ user: u }) => {
        if (isMounted.current) {
          setUser(u);
          setTokenState(storedToken);
        }
      })
      .catch(() => {
        removeToken();
        if (isMounted.current) {
          setUser(null);
          setTokenState(null);
        }
      })
      .finally(() => {
        if (isMounted.current) setIsLoading(false);
      });
  }, []);

  // Listen for session expiry events from the API client
  useEffect(() => {
    const handler = () => {
      setUser(null);
      setTokenState(null);
    };
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await authApi.login({ email, password });
    setToken(t);
    setTokenState(t);
    setUser(u);
  }, []);

  const register = useCallback(async (
    name: string, email: string, password: string, confirmPassword: string
  ) => {
    const { token: t, user: u } = await authApi.register({ name, email, password, confirmPassword });
    setToken(t);
    setTokenState(t);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
