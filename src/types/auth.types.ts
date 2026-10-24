// Auth-related types. Shapes are designed to match what Supabase Auth +
// our Node/Express backend will eventually return — keep this file as the
// single source of truth when real auth is wired in.

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type AuthProvider = 'google' | 'mobile_otp';

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
  mobileNumber?: string;
  avatarUrl?: string;
}

/**
 * The frontend never decides `role` itself. This shape represents what the
 * backend/session will hand back after a successful login. Until real auth
 * is connected, `useAuth` seeds this from mock data only for UI development.
 */
export interface AuthSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AuthErrorShape {
  message: string;
  code?: string;
}
