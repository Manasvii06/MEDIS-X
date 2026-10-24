import { AlertTriangleIcon } from './icons';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 py-16 text-center dark:border-rose-900/40 dark:bg-rose-950/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm dark:bg-slate-800">
        <AlertTriangleIcon className="h-5 w-5" />
      </div>
      <p className="max-w-sm text-sm text-rose-700 dark:text-rose-300">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-rose-200 bg-white px-4 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-800 dark:text-rose-300"
        >
          Try again
        </button>
      )}
    </div>
  );
}
