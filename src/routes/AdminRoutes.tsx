import { Route } from 'react-router-dom';
import { AdminPlaceholderPage } from '../pages/admin/AdminPlaceholderPage';
import { ProtectedRoute } from './ProtectedRoute';

export const adminRoutes = (
  <Route
    path="/admin"
    element={
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminPlaceholderPage />
      </ProtectedRoute>
    }
  />
);
