import type { ApprovalStatus, ProcessingStatus } from '../types/document.types';

export function approvalStatusClasses(status: ApprovalStatus): string {
  switch (status) {
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20';
    case 'pending':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20';
    case 'rejected':
      return 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-400/20';
    case 'not_requested':
      return 'bg-slate-100 text-slate-600 ring-slate-400/20 dark:bg-slate-700 dark:text-slate-300';
  }
}

export function processingStatusClasses(status: ProcessingStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-400/20';
    case 'processing':
    case 'queued':
      return 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20';
    case 'failed':
      return 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-400/20';
  }
}
