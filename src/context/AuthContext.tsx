import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '../types/auth.types';
import * as authService from '../services/auth.service';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('medis_auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const setUser = (newUser: AuthUser | null) => {
    setUserState(newUser);
    if (newUser) {
      authService.saveSession(newUser);
    } else {
      authService.logout();
    }
  };

  useEffect(() => {
    // Check if session can be refreshed
    authService.getCurrentSession().then((session) => {
      if (session && (!user || user.id !== session.id)) {
        setUserState(session);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
  return ctx;
}
