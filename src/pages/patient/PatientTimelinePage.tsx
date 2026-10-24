import { useEffect, useState } from 'react';
import type { Visit } from '../../types/visit.types';
import * as visitService from '../../services/visit.service';
import { VisitTimelineList } from '../../components/patient/VisitTimelineList';
import { VisitFrequencyChart } from '../../components/patient/VisitFrequencyChart';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { AsyncStatus } from '../../types/common.types';
import { useActivePatient } from '../../hooks/useActivePatient';
import { ActivityIcon } from '../../components/common/icons';

export function PatientTimelinePage() {
  const { activePatientId, activePatientName, isViewingSelf } = useActivePatient();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');

  const loadVisits = () => {
    setStatus('loading');
    visitService
      .getVisitsForPatient(activePatientId)
      .then((data) => {
        setVisits(data);
        setStatus(data.length === 0 ? 'empty' : 'success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(loadVisits, [activePatientId]);

  const uniqueDoctors = new Set(visits.map((v) => v.doctorName)).size;

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-slate-800 dark:text-slate-100">
        {isViewingSelf ? 'My Timeline' : `${activePatientName}'s Timeline`}
      </h1>
      <p className="mt-1 text-sm text-slate-400">Every doctor visit, across hospitals, in one place.</p>

      {status === 'loading' && <LoadingSpinner label="Loading timeline…" />}
      {status === 'error' && <ErrorState onRetry={loadVisits} />}
      {status === 'empty' && (
        <div className="mt-5">
          <EmptyState title="No visits yet" description="Visits will appear here once documents are uploaded." icon={<ActivityIcon className="h-5 w-5" />} />
        </div>
      )}

      {status === 'success' && (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <Card>
            <h2 className="mb-4 font-display text-sm font-semibold text-slate-800 dark:text-slate-100">Visit history</h2>
            <VisitTimelineList visits={visits} />
          </Card>

          <div className="space-y-4">
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Visits in the last 6 months</p>
              <div className="mt-3">
                <VisitFrequencyChart visits={visits} />
              </div>
            </Card>
            <Card>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-400">Total visits</dt>
                  <dd className="mt-0.5 font-display text-xl font-semibold text-slate-800 dark:text-slate-100">{visits.length}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Doctors seen</dt>
                  <dd className="mt-0.5 font-display text-xl font-semibold text-slate-800 dark:text-slate-100">{uniqueDoctors}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
