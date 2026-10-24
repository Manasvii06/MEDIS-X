import { Link } from 'react-router-dom';
import type { QueuePatientSummary } from '../../types/doctor.types';
import { ApprovalStatusBadge } from '../common/StatusBadge';
import { formatRelativeTime } from '../../utils/formatDate';
import { buildDoctorPatientDetailPath } from '../../constants/routes.constants';

export function PatientQueueRow({ patient }: { patient: QueuePatientSummary }) {
  return (
    <Link
      to={buildDoctorPatientDetailPath(patient.patientId)}
      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-500/40"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-navy-500 text-sm font-semibold text-white">
          {patient.patientName.split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{patient.patientName}</p>
          <p className="text-xs text-slate-400 font-mono">{patient.patientId} · Age {patient.patientAge}</p>
        </div>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-xs text-slate-400">{patient.documentCount} document{patient.documentCount !== 1 ? 's' : ''}</p>
        <p className="text-xs text-slate-400">{formatRelativeTime(patient.latestUploadAt)}</p>
      </div>
      <ApprovalStatusBadge status={patient.status} />
    </Link>
  );
}
