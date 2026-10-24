import type { Visit } from '../../types/visit.types';
import type { MedicalDocument } from '../../types/document.types';
import { DocumentCard } from '../documents/DocumentCard';
import { formatDate } from '../../utils/formatDate';
import { CalendarIcon, StethoscopeIcon, TrashIcon } from '../common/icons';

interface VisitGroupCardProps {
  visit: Visit;
  documents: MedicalDocument[];
  onViewDocument: (doc: MedicalDocument) => void;
  onDeleteVisit?: (visit: Visit) => Promise<void> | void;
  onRequestApproval?: (doc: MedicalDocument) => Promise<void> | void;
}

const VISIT_TYPE_CLASSES: Record<string, string> = {
  Initial: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  'Follow-up': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  Routine: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  Emergency: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
};

export function VisitGroupCard({
  visit,
  documents,
  onViewDocument,
  onDeleteVisit,
  onRequestApproval,
}: VisitGroupCardProps) {
  const handleDeleteVisit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteVisit) {
      onDeleteVisit(visit);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-slate-700 dark:text-slate-200">
            <StethoscopeIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-base font-bold text-slate-800 dark:text-slate-100">
                {visit.doctorName}
              </p>
              {visit.doctorSpecialization && visit.doctorSpecialization !== 'Not available' && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  · {visit.doctorSpecialization}
                </span>
              )}
            </div>

            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-slate-400">Hospital/Clinic: </span>
              <strong className="text-slate-700 dark:text-slate-200">{visit.hospital}</strong>
            </p>

            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-400">Reason for visit:</span>
              <span>{visit.reasonForVisit}</span>
            </div>
          </div>
        </div>

        {/* Right side: Badge, Date, and exactly ONE bin icon below date */}
        <div className="flex flex-col items-end gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${VISIT_TYPE_CLASSES[visit.visitType] || 'bg-slate-100 text-slate-600'}`}>
            {visit.visitType}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
            <CalendarIcon className="h-3.5 w-3.5" />
            {formatDate(visit.visitDate)}
          </span>

          {/* Only one bin icon below date */}
          {onDeleteVisit && (
            <button
              type="button"
              title="Delete record"
              aria-label="Delete record"
              onClick={handleDeleteVisit}
              className="mt-1.5 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition dark:border-slate-700 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Prescriptions & Documents ({documents.length})
        </p>
        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No document attached to this visit.</p>
        ) : (
          documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={onViewDocument}
              onRequestApproval={onRequestApproval}
            />
          ))
        )}
      </div>
    </div>
  );
}
