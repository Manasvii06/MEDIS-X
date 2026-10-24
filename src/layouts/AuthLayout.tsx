import type { ReactNode } from 'react';
import { ThemeToggle } from '../components/common/ThemeToggle';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 font-display text-lg font-bold text-white">
            I
          </div>
          <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">IMPS</p>
          <p className="text-sm text-slate-400">Intelligent Medical Profile System</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {children}
        </div>
      </div>
    </div>
  );
}
