import { Route } from 'react-router-dom';
import { PatientLayout } from '../layouts/PatientLayout';
import { PatientProfilePage } from '../pages/patient/PatientProfilePage';
import { PatientRecordsPage } from '../pages/patient/PatientRecordsPage';
import { PatientUploadPage } from '../pages/patient/PatientUploadPage';
import { PatientTimelinePage } from '../pages/patient/PatientTimelinePage';
import { PatientMedicationsPage } from '../pages/patient/PatientMedicationsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { Navigate } from 'react-router-dom';

export const patientRoutes = (
  <Route
    path="/patient"
    element={
      <ProtectedRoute allowedRoles={['PATIENT']}>
        <PatientLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<Navigate to="profile" replace />} />
    <Route path="profile" element={<PatientProfilePage />} />
    <Route path="records" element={<PatientRecordsPage />} />
    <Route path="timeline" element={<PatientTimelinePage />} />
    <Route path="medications" element={<PatientMedicationsPage />} />
    <Route path="upload" element={<PatientUploadPage />} />
  </Route>
);
