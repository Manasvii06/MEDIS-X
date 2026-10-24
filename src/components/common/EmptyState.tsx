import type { ReactNode } from 'react';
import { InboxIcon } from './icons';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center dark:border-slate-700 dark:bg-slate-800/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
        {icon ?? <InboxIcon className="h-5 w-5" />}
      </div>
      <div>
        <p className="font-display text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
