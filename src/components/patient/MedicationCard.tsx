import { useState } from 'react';
import type { Medication } from '../../types/medication.types';
import { formatDate } from '../../utils/formatDate';
import { PillIcon, TrashIcon } from '../common/icons';

function isActive(endDate: string): boolean {
  if (!endDate || endDate === 'Not available') return true;
  const d = new Date(endDate);
  if (isNaN(d.getTime())) return true;
  return d.getTime() >= new Date().setHours(0, 0, 0, 0);
}

interface MedicationCardProps {
  medication: Medication;
  onDelete?: (med: Medication) => Promise<void> | void;
}

export function MedicationCard({ medication, onDelete }: MedicationCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const active = isActive(medication.endDate);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    const confirm = window.confirm(`Remove medication "${medication.name}"?`);
    if (!confirm) return;

    setIsDeleting(true);
    try {
      await onDelete(medication);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-200 dark:border-slate-700 dark:bg-slate-800">
      {/* Delete button */}
      {onDelete && (
        <button
          type="button"
          title="Delete medication"
          aria-label="Delete medication"
          disabled={isDeleting}
          onClick={handleDelete}
          className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition dark:border-slate-700 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 disabled:opacity-50"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}

      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <PillIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{medication.name}</p>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
              active
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20'
                : 'bg-slate-100 text-slate-500 ring-slate-400/20 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            {active ? 'Active (Ongoing dose)' : 'Completed dose'}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{medication.frequency}</p>
        <p className="mt-2 text-xs text-slate-400">
          {formatDate(medication.startDate)} → {formatDate(medication.endDate)} · {medication.durationDays} days
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Prescribed by <span className="font-medium text-slate-600 dark:text-slate-300">{medication.prescribedBy}</span> · {medication.hospital}
        </p>
        {medication.notes && (
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            {medication.notes}
          </p>
        )}
      </div>
    </div>
  );
}
