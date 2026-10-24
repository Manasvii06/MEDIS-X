import { LogOutIcon } from '../common/icons';

interface LogoutButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function LogoutButton({ onClick, isLoading }: LogoutButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    >
      <LogOutIcon className="h-4 w-4" />
      {isLoading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
