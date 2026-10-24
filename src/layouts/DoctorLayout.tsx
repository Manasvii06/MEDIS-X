import { NavLink, Outlet } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { LogoutButton } from '../components/auth/LogoutButton';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes.constants';

export function DoctorLayout() {
  const { logout, user } = useAuth();
  const doctorName = user?.name || 'Dr. Rhea Menon';
  const specialization = 'Cardiologist';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-500 font-display text-sm font-bold text-white">I</div>
            <span className="font-display text-sm font-semibold text-slate-800 dark:text-slate-100">IMPS · Doctor</span>
          </div>
          <NavLink
            to={ROUTES.DOCTOR_DASHBOARD}
            className={({ isActive }) =>
              `hidden rounded-lg px-3 py-1.5 text-sm font-medium sm:block ${
                isActive ? 'bg-navy-500/10 text-navy-600 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            Approval Log
          </NavLink>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{doctorName}</p>
              <p className="text-xs text-slate-400">{specialization}</p>
            </div>
            <ThemeToggle />
            <LogoutButton onClick={logout} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
