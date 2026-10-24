export function AuthLoadingState({ label = 'Just a moment…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500 dark:border-slate-700 dark:border-t-brand-400" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
