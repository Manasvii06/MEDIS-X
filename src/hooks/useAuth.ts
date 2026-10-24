import { useState, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import * as authService from '../services/auth.service';
import type { AuthStatus } from '../types/auth.types';

/**
 * Thin wrapper around AuthContext + auth.service. Pages should use this
 * hook instead of calling the service directly, so loading/error state
 * handling stays consistent everywhere.
 */
export function useAuth() {
  const { user, isAuthenticated, setUser } = useAuthContext();
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestOtp = useCallback(async (mobileNumber: string) => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      await authService.requestMobileOtp(mobileNumber);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }, []);

  const verifyOtp = useCallback(async (mobileNumber: string, otpCode: string) => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const loggedInUser = await authService.verifyMobileOtp(mobileNumber, otpCode);
      setUser(loggedInUser);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Invalid OTP.');
    }
  }, [setUser]);

  const loginWithGoogle = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const loggedInUser = await authService.loginWithGoogle();
      setUser(loggedInUser);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Google login failed.');
    }
  }, [setUser]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus('idle');
  }, [setUser]);

  return { user, isAuthenticated, status, errorMessage, requestOtp, verifyOtp, loginWithGoogle, logout };
}
