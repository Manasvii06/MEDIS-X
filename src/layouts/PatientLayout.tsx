import { NavLink, Outlet } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { LogoutButton } from '../components/auth/LogoutButton';
import { useAuth } from '../hooks/useAuth';
import { useActivePatient } from '../hooks/useActivePatient';
import { ROUTES } from '../constants/routes.constants';
import { UserIcon, FileTextIcon, UploadIcon, ActivityIcon, PillIcon } from '../components/common/icons';

const NAV_ITEMS = [
  { to: ROUTES.PATIENT_PROFILE, label: 'Profile', icon: UserIcon },
  { to: ROUTES.PATIENT_RECORDS, label: 'My Records', icon: FileTextIcon },
  { to: ROUTES.PATIENT_TIMELINE, label: 'Timeline', icon: ActivityIcon },
  { to: ROUTES.PATIENT_MEDICATIONS, label: 'Medications', icon: PillIcon },
  { to: ROUTES.PATIENT_UPLOAD, label: 'Upload', icon: UploadIcon },
];

export function PatientLayout() {
  const { logout } = useAuth();
  const { activePatientName, isViewingSelf } = useActivePatient();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-display text-sm font-bold text-white">I</div>
            <span className="font-display text-sm font-semibold text-slate-800 dark:text-slate-100">IMPS · Patient</span>
            {!isViewingSelf && (
              <span className="ml-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                Viewing {activePatientName}
              </span>
            )}
          </div>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton onClick={logout} />
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden dark:border-slate-800">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
