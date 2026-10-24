import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../layouts/AuthLayout';
import { OtpInput } from '../../components/auth/OtpInput';
import { AuthErrorState } from '../../components/auth/AuthErrorState';
import { AuthLoadingState } from '../../components/auth/AuthLoadingState';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes.constants';

export function OtpVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, status, errorMessage, user } = useAuth();
  const mobileNumber = (location.state as { mobileNumber?: string } | null)?.mobileNumber ?? 'your number';

  const handleComplete = async (code: string) => {
    await verifyOtp(mobileNumber, code);
  };

  // Once real auth is connected, route by the role the backend returns.
  if (user) {
    const target = user.role === 'DOCTOR' ? ROUTES.DOCTOR_DASHBOARD : ROUTES.PATIENT_PROFILE;
    navigate(target, { replace: true });
  }

  return (
    <AuthLayout>
      <h1 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">Verify OTP</h1>
      <p className="mt-1 text-sm text-slate-400">Enter the 6-digit code sent to {mobileNumber}</p>

      <div className="mt-6">
        {status === 'loading' ? <AuthLoadingState label="Verifying…" /> : <OtpInput onComplete={handleComplete} />}
      </div>

      {status === 'error' && errorMessage && (
        <div className="mt-4">
          <AuthErrorState message={errorMessage} />
        </div>
      )}

      <p className="mt-6 text-center text-xs text-slate-400">
        Didn't get a code? <button className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Resend OTP</button>
      </p>
    </AuthLayout>
  );
}
