import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';
import { MobileNumberInput } from '../../components/auth/MobileNumberInput';
import { AuthErrorState } from '../../components/auth/AuthErrorState';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes.constants';

export function LoginPage() {
  const navigate = useNavigate();
  const { requestOtp, loginWithGoogle, status, errorMessage } = useAuth();
  const [pendingNumber, setPendingNumber] = useState<string | null>(null);

  const handleMobileSubmit = async (mobileNumber: string) => {
    setPendingNumber(mobileNumber);
    await requestOtp(mobileNumber);
    navigate(ROUTES.OTP_VERIFY, { state: { mobileNumber } });
  };

  return (
    <AuthLayout>
      <h1 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">Sign in</h1>
      <p className="mt-1 text-sm text-slate-400">Access your medical records securely.</p>

      <div className="mt-5">
        <GoogleLoginButton onClick={loginWithGoogle} isLoading={status === 'loading' && !pendingNumber} />
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
        <span className="text-xs text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
      </div>

      <MobileNumberInput onSubmit={handleMobileSubmit} isLoading={status === 'loading' && !!pendingNumber} />

      {status === 'error' && errorMessage && (
        <div className="mt-4">
          <AuthErrorState message={errorMessage} />
        </div>
      )}

      <p className="mt-6 text-center text-xs text-slate-400">
        By continuing, you agree that your data is only shared with doctors you explicitly grant consent to.
      </p>
    </AuthLayout>
  );
}
