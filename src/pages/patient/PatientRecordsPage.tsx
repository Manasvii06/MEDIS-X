import { useEffect, useMemo, useState } from 'react';
import type { MedicalDocument } from '../../types/document.types';
import type { Visit } from '../../types/visit.types';
import * as documentService from '../../services/document.service';
import * as visitService from '../../services/visit.service';
import { VisitGroupCard } from '../../components/patient/VisitGroupCard';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';
import { ConfirmDialogModal } from '../../components/common/ConfirmDialogModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchInput } from '../../components/common/SearchInput';
import type { AsyncStatus } from '../../types/common.types';
import { useActivePatient } from '../../hooks/useActivePatient';

export function PatientRecordsPage() {
  const { activePatientId, activePatientName, isViewingSelf } = useActivePatient();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = () => {
    setStatus('loading');
    Promise.all([
      documentService.getDocumentsForPatient(activePatientId),
      visitService.getVisitsForPatient(activePatientId),
    ])
      .then(([docs, visitList]) => {
        setDocuments(docs);
        setVisits(visitList);
        setStatus(visitList.length === 0 && docs.length === 0 ? 'empty' : 'success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(loadData, [activePatientId]);

  const handleDeleteVisit = (visit: Visit) => {
    setVisitToDelete(visit);
  };

  const handleConfirmDelete = async () => {
    if (!visitToDelete) return;
    setIsDeleting(true);
    try {
      const ok = await visitService.deleteVisit(visitToDelete.id);
      if (ok) {
        setVisitToDelete(null);
        loadData();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRequestApproval = async (doc: MedicalDocument) => {
    const updated = await documentService.requestApproval(doc.id);
    if (updated) {
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    }
  };


  const visibleVisits = useMemo(() => {
    if (!search.trim()) return visits;
    const term = search.toLowerCase();
    return visits.filter(
      (v) =>
        v.doctorName.toLowerCase().includes(term) ||
        v.reasonForVisit.toLowerCase().includes(term) ||
        v.hospital.toLowerCase().includes(term)
    );
  }, [visits, search]);

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-800 dark:text-slate-100">
            {isViewingSelf ? 'My Records' : `${activePatientName}'s Records`}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Every saved prescription and visit record. Click the bin icon below the date to delete a record.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by doctor, reason…" />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {status === 'loading' && <LoadingSpinner label="Loading records…" />}
        {status === 'error' && <ErrorState onRetry={loadData} />}
        {(status === 'success' || status === 'empty') && visibleVisits.length === 0 && (
          <EmptyState
            title="No records found"
            description="Upload a printed prescription to extract details, generate an AI summary, and update your records."
          />
        )}

        {status === 'success' &&
          visibleVisits.map((visit) => {
            const visitDocs = documents.filter(
              (d) => visit.documentIds.includes(d.id) || d.visitId === visit.id
            );
            return (
              <VisitGroupCard
                key={visit.id}
                visit={visit}
                documents={visitDocs}
                onViewDocument={setSelectedDoc}
                onDeleteVisit={handleDeleteVisit}
                onRequestApproval={handleRequestApproval}
              />
            );
          })}
      </div>

      <DocumentPreviewModal document={selectedDoc} onClose={() => setSelectedDoc(null)} />

      {/* Delete Record Confirmation Popup */}
      <ConfirmDialogModal
        isOpen={!!visitToDelete}
        title="Delete Medical Record?"
        description={
          visitToDelete ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to delete this record from{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {visitToDelete.doctorName !== 'Not available' ? visitToDelete.doctorName : 'Prescription'}
                </strong>
                {visitToDelete.hospital !== 'Not available' && (
                  <span> ({visitToDelete.hospital})</span>
                )}
                ?
              </p>
              <p className="text-xs text-slate-400">
                This will permanently remove the prescription, its uploaded file, AI summary, and associated medications from your profile and timeline.
              </p>
            </div>
          ) : null
        }
        confirmLabel="Delete Record"
        cancelLabel="Cancel"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setVisitToDelete(null);
        }}
      />
    </div>
  );
}

export default PatientRecordsPage;
