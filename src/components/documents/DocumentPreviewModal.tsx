import { useState } from 'react';
import type { MedicalDocument } from '../../types/document.types';
import { XIcon, FileTextIcon, ImageIcon, ExternalLinkIcon } from '../common/icons';
import { ApprovalStatusBadge } from '../common/StatusBadge';
import { AISummaryPanel } from './AISummaryPanel';
import { formatDateTime } from '../../utils/formatDate';

interface DocumentPreviewModalProps {
  document: MedicalDocument | null;
  onClose: () => void;
  reviewActions?: React.ReactNode;
}

export function DocumentPreviewModal({ document, onClose, reviewActions }: DocumentPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'summary' | 'ocr'>('summary');

  if (!document) return null;

  const hasFileUrl = !!document.fileUrl && !document.fileUrl.startsWith('/mock-files/');
  const hasSummary = !!document.aiSummary?.text;
  const hasOcr = !!document.extractedText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold text-slate-800 dark:text-slate-100">
                {document.documentLabel}
              </span>
              <span className="text-xs text-slate-400">({document.fileName})</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">Uploaded {formatDateTime(document.uploadedAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tab navigation & actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-6 py-2.5 dark:border-slate-700 dark:bg-slate-900/40">
          <div className="flex items-center gap-1.5">
            {hasSummary && (
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'summary'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                AI Summary
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'preview'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Original Document
            </button>

            {hasOcr && (
              <button
                type="button"
                onClick={() => setActiveTab('ocr')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'ocr'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                Extracted Text
              </button>
            )}
          </div>

          {hasFileUrl && (
            <button
              type="button"
              onClick={() => window.open(document.fileUrl, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-1.5 rounded-lg border border-brand-300 bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-xs hover:bg-brand-50 dark:border-slate-600 dark:bg-slate-800 dark:text-brand-300"
            >
              <ExternalLinkIcon className="h-3.5 w-3.5" />
              Open in new tab
            </button>
          )}
        </div>

        {/* Content body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <ApprovalStatusBadge status={document.approvalStatus} />
            {document.reviewedAt && (
              <span className="text-xs text-slate-400">Reviewed {formatDateTime(document.reviewedAt)}</span>
            )}
          </div>

          {document.approvalStatus === 'rejected' && document.rejectionReason && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <span className="font-semibold">Rejection reason: </span>
              {document.rejectionReason}
            </div>
          )}

          {/* AI Summary Tab */}
          {activeTab === 'summary' && (
            <div>
              <AISummaryPanel summary={document.aiSummary} />
            </div>
          )}

          {/* Original Document Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              {hasFileUrl ? (
                document.fileType === 'pdf' ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <iframe
                      src={document.fileUrl}
                      title={document.fileName}
                      className="h-96 w-full"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center rounded-xl bg-slate-50 p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                    <img
                      src={document.fileUrl}
                      alt={document.fileName}
                      className="max-h-96 w-auto rounded-lg object-contain shadow-xs"
                    />
                  </div>
                )
              ) : (
                <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-900">
                  {document.fileType === 'pdf' ? <FileTextIcon className="h-10 w-10" /> : <ImageIcon className="h-10 w-10" />}
                  <p className="mt-2 text-xs">File preview will load from server</p>
                </div>
              )}
              <p className="text-center text-xs text-slate-400">{document.fileName}</p>
            </div>
          )}

          {/* Extracted Text Tab */}
          {activeTab === 'ocr' && hasOcr && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">OCR Extracted Prescription Text</p>
              <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-xs text-slate-700 dark:text-slate-300">
                {document.extractedText}
              </pre>
            </div>
          )}
        </div>

        {reviewActions && (
          <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-700">{reviewActions}</div>
        )}
      </div>
    </div>
  );
}
