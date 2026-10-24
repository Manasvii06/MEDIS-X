import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constants';
import type { UserRole } from '../../types/auth.types';

/**
 * DEV-ONLY utility. Lets the team preview Patient/Doctor/Admin screens
 * without a real login flow, since role is not decided by the frontend.
 * Rendered only when `import.meta.env.DEV` is true — remove this component
 * once real Supabase Auth + backend role resolution is connected.
 */
const DEV_USERS: Record<UserRole, { id: string; name: string }> = {
  PATIENT: { id: 'PATIENT-001', name: 'Aditi Sharma' },
  DOCTOR: { id: 'DOC-001', name: 'Dr. Rhea Menon' },
  ADMIN: { id: 'ADMIN-001', name: 'Admin' },
};

export function DevRoleSwitcher() {
  if (!import.meta.env.DEV) return null;

  const { user, setUser } = useAuthContext();
  const navigate = useNavigate();

  const setRole = (role: UserRole) => {
    setUser({ id: DEV_USERS[role].id, role, name: DEV_USERS[role].name });
    navigate(role === 'PATIENT' ? ROUTES.PATIENT_PROFILE : role === 'DOCTOR' ? ROUTES.DOCTOR_DASHBOARD : ROUTES.ADMIN_ROOT);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs shadow-lg dark:border-amber-700 dark:bg-amber-950">
      <span className="font-semibold text-amber-700 dark:text-amber-300">DEV role:</span>
      {(Object.keys(DEV_USERS) as UserRole[]).map((role) => (
        <button
          key={role}
          onClick={() => setRole(role)}
          className={`rounded-full px-2 py-0.5 font-medium ${
            user?.role === role
              ? 'bg-amber-600 text-white'
              : 'text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900'
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );
}
