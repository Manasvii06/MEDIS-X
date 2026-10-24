import { Route, Navigate } from 'react-router-dom';
import { DoctorLayout } from '../layouts/DoctorLayout';
import { DoctorDashboardPage } from '../pages/doctor/DoctorDashboardPage';
import { DoctorPatientDetailPage } from '../pages/doctor/DoctorPatientDetailPage';
import { ProtectedRoute } from './ProtectedRoute';

export const doctorRoutes = (
  <Route
    path="/doctor"
    element={
      <ProtectedRoute allowedRoles={['DOCTOR']}>
        <DoctorLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<DoctorDashboardPage />} />
    <Route path="patient/:patientId" element={<DoctorPatientDetailPage />} />
  </Route>
);
