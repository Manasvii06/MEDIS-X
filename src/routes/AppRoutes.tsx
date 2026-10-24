import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { OtpVerificationPage } from '../pages/auth/OtpVerificationPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { patientRoutes } from './PatientRoutes';
import { doctorRoutes } from './DoctorRoutes';
import { adminRoutes } from './AdminRoutes';
import { ROUTES } from '../constants/routes.constants';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.OTP_VERIFY} element={<OtpVerificationPage />} />

      {patientRoutes}
      {doctorRoutes}
      {adminRoutes}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
