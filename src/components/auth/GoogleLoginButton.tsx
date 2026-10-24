interface GoogleLoginButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function GoogleLoginButton({ onClick, isLoading }: GoogleLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.5 12.3c0-.85-.08-1.67-.22-2.45H12v4.63h6.46c-.28 1.48-1.13 2.74-2.4 3.58v3h3.88c2.27-2.09 3.56-5.17 3.56-8.76Z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1C3.24 21.3 7.28 24 12 24Z" />
        <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29v-3.1H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.1Z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
      </svg>
      {isLoading ? 'Connecting…' : 'Continue with Google'}
    </button>
  );
}
