import { EmptyState } from '../../components/common/EmptyState';
import { ShieldCheckIcon } from '../../components/common/icons';

// Placeholder only — admin screens (system-wide audit log, consent stats)
// come later. Route exists now so /admin/* doesn't need to be re-plumbed.
export function AdminPlaceholderPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <EmptyState
          title="Admin console coming soon"
          description="System-wide audit logs and consent analytics will live here."
          icon={<ShieldCheckIcon className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}
