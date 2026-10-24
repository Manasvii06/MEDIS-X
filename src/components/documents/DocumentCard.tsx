import { useState } from 'react';
import type { MedicalDocument } from '../../types/document.types';
import { ApprovalStatusBadge, ProcessingStatusBadge } from '../common/StatusBadge';
import {
  FileTextIcon,
  ImageIcon,
  ExternalLinkIcon,
  StethoscopeIcon,
  XCircleIcon,
} from '../common/icons';
import { formatDate } from '../../utils/formatDate';

interface DocumentCardProps {
  document: MedicalDocument;
  onView: (doc: MedicalDocument) => void;
  onRequestApproval?: (doc: MedicalDocument) => Promise<void> | void;
}

export function DocumentCard({ document, onView, onRequestApproval }: DocumentCardProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const hasSummary = !!document.aiSummary?.text;
  const hasFileUrl = !!document.fileUrl && !document.fileUrl.startsWith('/mock-files/');

  const handleOpenOriginal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRequestApproval = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRequestApproval) return;
    setIsRequesting(true);
    try {
      await onRequestApproval(document);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-200 hover:shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-500/40">
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          {document.fileType === 'pdf' ? <FileTextIcon className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{document.documentLabel}</p>
          <p className="mt-0.5 truncate text-xs text-slate-400">{document.fileName}</p>
          <p className="mt-1 text-xs text-slate-400">Uploaded {formatDate(document.uploadedAt)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ApprovalStatusBadge status={document.approvalStatus} />
            {document.processingStatus !== 'completed' && (
              <ProcessingStatusBadge status={document.processingStatus} />
            )}
            {hasSummary && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                AI Summary Available
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
        {/* Request Doctor Approval: Only shown when approval has not been requested yet or rejected */}
        {onRequestApproval && document.approvalStatus === 'not_requested' && (
          <button
            type="button"
            disabled={isRequesting}
            onClick={handleRequestApproval}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition disabled:opacity-50"
          >
            <StethoscopeIcon className="h-3.5 w-3.5" />
            {isRequesting ? 'Requesting…' : 'Request Doctor Approval'}
          </button>
        )}

        {onRequestApproval && document.approvalStatus === 'rejected' && (
          <button
            type="button"
            disabled={isRequesting}
            onClick={handleRequestApproval}
            className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 disabled:opacity-50"
          >
            <XCircleIcon className="h-3.5 w-3.5 text-rose-600" />
            {isRequesting ? 'Re-requesting…' : 'Re-request Approval'}
          </button>
        )}

        {hasSummary && (
          <button
            type="button"
            onClick={() => onView(document)}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50/50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            <FileTextIcon className="h-3.5 w-3.5" />
            View AI Summary
          </button>
        )}

        {hasFileUrl && (
          <button
            type="button"
            onClick={handleOpenOriginal}
            className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-300"
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
            Open Original {document.fileType === 'pdf' ? 'PDF' : 'Image'}
          </button>
        )}
      </div>
    </div>
  );
}
