import type { ReactNode } from 'react';

interface AnalyticsStatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent?: 'brand' | 'navy' | 'accent';
}

const ACCENT_CLASSES: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
  navy: 'bg-slate-100 text-navy-600 dark:bg-slate-700 dark:text-slate-200',
  accent: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
};

export function AnalyticsStatCard({ label, value, icon, accent = 'brand' }: AnalyticsStatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${ACCENT_CLASSES[accent]}`}>{icon}</div>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}
