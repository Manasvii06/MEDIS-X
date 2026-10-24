import { useEffect, useMemo, useState } from 'react';
import * as doctorService from '../../services/doctor.service';
import type { DoctorApprovalLogItem } from '../../services/doctor.service';
import * as documentService from '../../services/document.service';
import { AnalyticsStatCard } from '../../components/doctor/AnalyticsStatCard';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchInput } from '../../components/common/SearchInput';
import type { AsyncStatus } from '../../types/common.types';
import type { MedicalDocument } from '../../types/document.types';
import {
  CalendarIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon,
  PillIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExternalLinkIcon,
  EyeIcon,
  StethoscopeIcon,
} from '../../components/common/icons';
import { formatDate } from '../../utils/formatDate';

export function DoctorDashboardPage() {
  const [logItems, setLogItems] = useState<DoctorApprovalLogItem[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = () => {
    setStatus('loading');
    doctorService
      .getDoctorApprovalLog()
      .then((logs) => {
        setLogItems(logs);
        setStatus(logs.length === 0 ? 'empty' : 'success');
      })
      .catch((err) => {
        console.error('Error loading doctor log:', err);
        setStatus('error');
      });
  };

  useEffect(loadData, []);

  const handleApprove = async (documentId: string) => {
    setActionLoadingId(documentId);
    try {
      const updated = await documentService.approveDocument(documentId, 'Dr. Rhea Menon');
      if (updated) {
        setLogItems((prev) =>
          prev.map((item) =>
            item.documentId === documentId
              ? {
                  ...item,
                  approvalStatus: 'approved',
                  reviewedBy: 'Dr. Rhea Menon',
                  reviewedAt: new Date().toISOString(),
                  document: updated,
                }
              : item
          )
        );
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (documentId: string) => {
    if (!rejectReason.trim()) return;
    setActionLoadingId(documentId);
    try {
      const updated = await documentService.rejectDocument(
        documentId,
        'Dr. Rhea Menon',
        rejectReason.trim()
      );
      if (updated) {
        setLogItems((prev) =>
          prev.map((item) =>
            item.documentId === documentId
              ? {
                  ...item,
                  approvalStatus: 'rejected',
                  reviewedBy: 'Dr. Rhea Menon',
                  reviewedAt: new Date().toISOString(),
                  rejectionReason: rejectReason.trim(),
                  document: updated,
                }
              : item
          )
        );
        setRejectingDocId(null);
        setRejectReason('');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = useMemo(
    () => logItems.filter((i) => i.approvalStatus === 'pending').length,
    [logItems]
  );
  const approvedCount = useMemo(
    () => logItems.filter((i) => i.approvalStatus === 'approved').length,
    [logItems]
  );

  const filteredLogs = useMemo(() => {
    return logItems.filter((item) => {
      // Tab filter
      if (filter === 'pending' && item.approvalStatus !== 'pending') return false;
      if (filter === 'approved' && item.approvalStatus !== 'approved') return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesPatient = item.patient.name.toLowerCase().includes(q);
        const matchesDoctor = item.visit.doctorName.toLowerCase().includes(q);
        const matchesHospital = item.visit.hospital.toLowerCase().includes(q);
        const matchesMed = item.medications.some((m) =>
          m.name.toLowerCase().includes(q)
        );
        if (!matchesPatient && !matchesDoctor && !matchesHospital && !matchesMed) {
          return false;
        }
      }

      return true;
    });
  }, [logItems, filter, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-800 dark:text-slate-100">
            Doctor's Approval Log
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Incoming patient prescription requests. Review the generated AI summary and prescribed medications, then approve or reject.
          </p>
        </div>
      </div>

      {status === 'loading' && <LoadingSpinner label="Loading doctor approval log…" />}
      {status === 'error' && <ErrorState onRetry={loadData} />}

      {(status === 'success' || status === 'empty') && (
        <>
          {/* Analytics Stat Cards */}
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <AnalyticsStatCard
              label="Pending review"
              value={pendingCount}
              icon={<ClockIcon className="h-4 w-4" />}
              accent="accent"
            />
            <AnalyticsStatCard
              label="Doctor approved"
              value={approvedCount}
              icon={<ShieldCheckIcon className="h-4 w-4" />}
              accent="brand"
            />
            <AnalyticsStatCard
              label="Total prescriptions"
              value={logItems.length}
              icon={<CalendarIcon className="h-4 w-4" />}
              accent="navy"
            />
            <AnalyticsStatCard
              label="Active log"
              value="Common"
              icon={<StethoscopeIcon className="h-4 w-4" />}
              accent="brand"
            />
          </div>

          {/* Filter Tabs & Search */}
          <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('pending')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                }`}
              >
                Pending Review ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === 'all'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                }`}
              >
                All Logs ({logItems.length})
              </button>
            </div>

            <div className="w-full sm:w-72">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search patient, doctor, medicine…"
              />
            </div>
          </div>

          {/* Approval Log Items */}
          <div className="mt-4 space-y-4">
            {filteredLogs.length === 0 ? (
              <EmptyState
                title={
                  filter === 'pending'
                    ? 'No pending review requests'
                    : filter === 'approved'
                    ? 'No approved records yet'
                    : 'No prescription records found'
                }
                description="When a patient clicks 'Request Doctor Approval' on their record, it will appear here in the Doctor's Log for clinical approval."
                icon={<StethoscopeIcon className="h-6 w-6" />}
              />
            ) : (
              filteredLogs.map((item) => {
                const doc = item.document;
                const hasSummary = !!doc.aiSummary?.text;
                const isItemPending = item.approvalStatus === 'pending';
                const isItemApproved = item.approvalStatus === 'approved';
                const isItemRejected = item.approvalStatus === 'rejected';
                const isLoadingAction = actionLoadingId === item.documentId;

                return (
                  <div
                    key={item.documentId}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-brand-200 dark:border-slate-700 dark:bg-slate-800"
                  >
                    {/* Header: Patient Info & Prescription details */}
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-3.5 dark:border-slate-700">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-navy-50 font-display text-base font-bold text-navy-700 dark:bg-navy-950/60 dark:text-navy-300">
                          {item.patient.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-display text-base font-bold text-slate-800 dark:text-slate-100">
                              {item.patient.name}
                            </h2>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                              {item.patient.id}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>
                              Rx: <strong>{item.visit.doctorName}</strong>
                            </span>
                            {item.visit.hospital && item.visit.hospital !== 'Not available' && (
                              <span>· {item.visit.hospital}</span>
                            )}
                            <span>· Visit Date: {formatDate(item.visit.visitDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge & Timestamp */}
                      <div className="flex flex-col items-end gap-1 text-right">
                        {isItemPending && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20">
                            <ClockIcon className="h-3.5 w-3.5" />
                            Pending Review
                          </span>
                        )}
                        {isItemApproved && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20">
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                            Doctor Approved
                          </span>
                        )}
                        {isItemRejected && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-400/20">
                            <XCircleIcon className="h-3.5 w-3.5" />
                            Rejected
                          </span>
                        )}
                        {item.approvalStatus === 'not_requested' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            Not Requested
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          Uploaded {formatDate(doc.uploadedAt)}
                        </span>
                      </div>
                    </div>

                    {/* AI Summary Section */}
                    {hasSummary && (
                      <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-950/60 dark:bg-emerald-950/20">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          <SparklesIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Generated AI Summary
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                          {doc.aiSummary?.text}
                        </p>
                      </div>
                    )}

                    {/* Prescribed Medications Section */}
                    {item.medications.length > 0 && (
                      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            <PillIcon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                            Prescribed Medications ({item.medications.length})
                          </div>
                        </div>

                        <div className="mt-2.5 divide-y divide-slate-200/60 dark:divide-slate-700/60">
                          {item.medications.map((med, idx) => (
                            <div
                              key={med.id || idx}
                              className="flex flex-wrap items-center justify-between gap-2 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-400">
                                  {idx + 1}.
                                </span>
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                  {med.name}
                                </span>
                                {med.dosage && (
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    ({med.dosage})
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {med.frequency && (
                                  <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                                    {med.frequency}
                                  </span>
                                )}
                                {med.notes && (
                                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                    {med.notes}
                                  </span>
                                )}
                                {med.durationDays && (
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    {med.durationDays} days
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Original Document Links & Doctor Action Buttons */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5 dark:border-slate-700">
                      <div className="flex flex-wrap items-center gap-2">
                        {doc.fileUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              window.open(doc.fileUrl, '_blank', 'noopener,noreferrer')
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            <ExternalLinkIcon className="h-3.5 w-3.5" />
                            Open Original {doc.fileType === 'pdf' ? 'PDF' : 'Image'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                          Preview Document
                        </button>
                      </div>

                      {/* Doctor Action Buttons */}
                      <div className="flex items-center gap-2">
                        {rejectingDocId === item.documentId ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Reason for rejection…"
                              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                            />
                            <button
                              type="button"
                              disabled={isLoadingAction || !rejectReason.trim()}
                              onClick={() => handleReject(item.documentId)}
                              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingDocId(null);
                                setRejectReason('');
                              }}
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            {(!isItemApproved || item.approvalStatus === 'not_requested') && (
                              <button
                                type="button"
                                disabled={isLoadingAction}
                                onClick={() => handleApprove(item.documentId)}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50"
                              >
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                {isLoadingAction ? 'Approving…' : 'Approve Summary & Medications'}
                              </button>
                            )}

                            {!isItemRejected && (
                              <button
                                type="button"
                                disabled={isLoadingAction}
                                onClick={() => setRejectingDocId(item.documentId)}
                                className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                              >
                                <XCircleIcon className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            )}

                            {isItemApproved && (
                              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <CheckCircleIcon className="h-4 w-4" />
                                Approved by Dr. Rhea Menon
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Modal Preview */}
      <DocumentPreviewModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
}

export default DoctorDashboardPage;
