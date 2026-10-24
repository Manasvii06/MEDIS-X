import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes.constants';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <p className="font-display text-4xl font-bold text-slate-300 dark:text-slate-700">404</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">This page doesn't exist.</p>
      <Link to={ROUTES.LOGIN} className="mt-2 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
        Back to login
      </Link>
    </div>
  );
}
