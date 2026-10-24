import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { PatientProfile } from '../../types/patient.types';
import type { MedicalDocument } from '../../types/document.types';
import * as patientService from '../../services/patient.service';
import * as documentService from '../../services/document.service';
import { PatientProfileCard } from '../../components/patient/PatientProfileCard';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { AsyncStatus } from '../../types/common.types';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes.constants';

export function DoctorPatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
  const [actionState, setActionState] = useState<'idle' | 'saving'>('idle');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const load = () => {
    if (!patientId) return;
    setStatus('loading');
    Promise.all([patientService.getPatientById(patientId), documentService.getDocumentsForPatient(patientId)])
      .then(([patientData, docs]) => {
        // Backend will eventually 403 here if this doctor lacks consent —
        // the frontend just renders whatever it's given.
        setProfile(patientData);
        setDocuments(docs);
        setStatus(!patientData ? 'error' : docs.length === 0 ? 'empty' : 'success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, [patientId]);

  const { user } = useAuth();
  const currentDoctorId = user?.id || 'DOC-001';

  const handleApprove = async () => {
    if (!selectedDoc) return;
    setActionState('saving');
    const updated = await documentService.approveDocument(selectedDoc.id, currentDoctorId);
    if (updated) {
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setSelectedDoc(updated);
    }
    setActionState('idle');
  };

  const handleReject = async () => {
    if (!selectedDoc || !rejectReason.trim()) return;
    setActionState('saving');
    const updated = await documentService.rejectDocument(selectedDoc.id, currentDoctorId, rejectReason.trim());
    if (updated) {
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setSelectedDoc(updated);
    }
    setShowRejectForm(false);
    setRejectReason('');
    setActionState('idle');
  };

  return (
    <div>
      <Link to={ROUTES.DOCTOR_DASHBOARD} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
        ← Back to dashboard
      </Link>

      {status === 'loading' && <LoadingSpinner label="Loading patient record…" />}
      {status === 'error' && <ErrorState message="Unable to load this patient. You may not have active consent." onRetry={load} />}

      {(status === 'success' || status === 'empty') && profile && (
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <PatientProfileCard profile={profile} />

          <div>
            <h2 className="font-display text-base font-semibold text-slate-800 dark:text-slate-100">
              Uploaded documents & records
            </h2>
            <div className="mt-3 space-y-3">
              {documents.length === 0 ? (
                <EmptyState title="No documents yet" description="This patient hasn't uploaded anything for review." />
              ) : (
                documents.map((doc) => <DocumentCard key={doc.id} document={doc} onView={setSelectedDoc} />)
              )}
            </div>
          </div>
        </div>
      )}

      <DocumentPreviewModal
        document={selectedDoc}
        onClose={() => {
          setSelectedDoc(null);
          setShowRejectForm(false);
          setRejectReason('');
        }}
        reviewActions={
          selectedDoc && selectedDoc.approvalStatus === 'pending' ? (
            showRejectForm ? (
              <div className="space-y-2">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection…"
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || actionState === 'saving'}
                    className="flex-1 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Confirm reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={actionState === 'saving'}
                  className="flex-1 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionState === 'saving'}
                  className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {actionState === 'saving' ? 'Saving…' : 'Approve summary'}
                </button>
              </div>
            )
          ) : undefined
        }
      />
    </div>
  );
}
