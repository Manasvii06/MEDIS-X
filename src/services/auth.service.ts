import type { AuthProvider, AuthUser } from '../types/auth.types';
import { API_BASE_URL } from '../constants/api.constants';

const SESSION_STORAGE_KEY = 'medis_auth_user';

export async function loginWithGoogle(): Promise<AuthUser> {
  throw new Error('Google login is not connected yet. Please use Mobile OTP login (use code 123456).');
}

export async function requestMobileOtp(mobileNumber: string): Promise<{ sent: boolean }> {
  if (!mobileNumber || mobileNumber.trim().length < 6) {
    throw new Error('Please provide a valid mobile number.');
  }
  return { sent: true };
}

export async function verifyMobileOtp(
  mobileNumber: string,
  otpCode: string
): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobileNumber, otpCode }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || 'Invalid OTP. Please enter 123456.');
  }

  const data = await res.json();
  const user: AuthUser = data.user;

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('Could not store session in localStorage:', err);
  }

  return user;
}

export async function logout(): Promise<void> {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear session from localStorage:', err);
  }
}

export async function getCurrentSession(): Promise<AuthUser | null> {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(user: AuthUser): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('Could not store session:', err);
  }
}

export type { AuthProvider };
