import type { Visit } from '../../types/visit.types';
import { formatDate } from '../../utils/formatDate';

const DOT_CLASSES: Record<string, string> = {
  Initial: 'bg-brand-500',
  'Follow-up': 'bg-slate-400',
  Routine: 'bg-emerald-500',
  Emergency: 'bg-rose-500',
};

export function VisitTimelineList({ visits }: { visits: Visit[] }) {
  return (
    <div className="relative pl-6">
      <div className="absolute bottom-1 left-[7px] top-1 w-0.5 bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-6">
        {visits.map((visit) => (
          <div key={visit.id} className="relative">
            <div
              className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                DOT_CLASSES[visit.visitType] || 'bg-brand-500'
              }`}
            />
            <p className="text-xs font-semibold text-slate-400">{formatDate(visit.visitDate)}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {visit.doctorName}
              {visit.doctorSpecialization && visit.doctorSpecialization !== 'Not available' && (
                <span className="font-normal text-slate-400"> · {visit.doctorSpecialization}</span>
              )}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="text-slate-400">Hospital: </span>
              {visit.hospital}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              <span className="text-xs font-medium text-slate-400">Reason: </span>
              {visit.reasonForVisit}
            </p>
            <span className="mt-1.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
              {visit.visitType}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
