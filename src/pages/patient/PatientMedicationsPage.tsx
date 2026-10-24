import { useEffect, useMemo, useState } from 'react';
import type { Medication } from '../../types/medication.types';
import * as medicationService from '../../services/medication.service';
import { MedicationGroupCard, type MedicationGroup } from '../../components/patient/MedicationGroupCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { AsyncStatus } from '../../types/common.types';
import { useActivePatient } from '../../hooks/useActivePatient';
import { PillIcon } from '../../components/common/icons';
import { ConfirmDialogModal } from '../../components/common/ConfirmDialogModal';

function isActive(endDate: string): boolean {
  if (!endDate || endDate === 'Not available') return true;
  const d = new Date(endDate);
  if (isNaN(d.getTime())) return true;
  return d.getTime() >= new Date().setHours(0, 0, 0, 0);
}

export function PatientMedicationsPage() {
  const { activePatientId, activePatientName, isViewingSelf } = useActivePatient();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [groupToDelete, setGroupToDelete] = useState<MedicationGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMedications = () => {
    setStatus('loading');
    medicationService
      .getMedicationsForPatient(activePatientId)
      .then((data) => {
        setMedications(data);
        setStatus(data.length === 0 ? 'empty' : 'success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(loadMedications, [activePatientId]);


  const handleDeleteGroup = (group: MedicationGroup) => {
    setGroupToDelete(group);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    setIsDeleting(true);
    try {
      await Promise.all(
        groupToDelete.medications.map((m) => medicationService.deleteMedication(m.id))
      );
      setGroupToDelete(null);
      loadMedications();
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return medications;
    return medications.filter((m) => (filter === 'active' ? isActive(m.endDate) : !isActive(m.endDate)));
  }, [medications, filter]);

  // Group medications prescribed together into a single box
  const groupedMedications = useMemo(() => {
    const map = new Map<string, MedicationGroup>();

    for (const m of filtered) {
      const key = m.visitId || `${m.startDate}_${m.prescribedBy}_${m.hospital}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          visitId: m.visitId,
          startDate: m.startDate,
          endDate: m.endDate,
          prescribedBy: m.prescribedBy,
          hospital: m.hospital,
          medications: [],
        });
      }
      const g = map.get(key)!;
      g.medications.push(m);
      if (new Date(m.endDate).getTime() > new Date(g.endDate).getTime()) {
        g.endDate = m.endDate;
      }
    }

    return Array.from(map.values());
  }, [filtered]);

  const activeCount = useMemo(() => medications.filter((m) => isActive(m.endDate)).length, [medications]);
  const completedCount = useMemo(() => medications.filter((m) => !isActive(m.endDate)).length, [medications]);

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-slate-800 dark:text-slate-100">
        {isViewingSelf ? 'My Medications' : `${activePatientName}'s Medications`}
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Prescribed medicines grouped by prescription. Track ongoing courses and completed doses.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
            filter === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'
          }`}
        >
          All ({medications.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
            filter === 'active'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'
          }`}
        >
          Ongoing Dose ({activeCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
            filter === 'completed'
              ? 'bg-slate-600 text-white'
              : 'bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'
          }`}
        >
          Completed Dose ({completedCount})
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {status === 'loading' && <LoadingSpinner label="Loading medications…" />}
        {status === 'error' && <ErrorState onRetry={loadMedications} />}
        {(status === 'success' || status === 'empty') && groupedMedications.length === 0 && (
          <EmptyState
            title="No medications found"
            description="Medications parsed from your uploaded prescriptions will automatically appear here."
            icon={<PillIcon className="h-5 w-5" />}
          />
        )}
        {status === 'success' &&
          groupedMedications.map((group) => (
            <MedicationGroupCard
              key={group.key}
              group={group}
              onDeleteGroup={handleDeleteGroup}
            />
          ))}
      </div>

      {/* Delete Medication Group Confirmation Popup */}
      <ConfirmDialogModal
        isOpen={!!groupToDelete}
        title="Delete Prescription Medications?"
        description={
          groupToDelete ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to delete all{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {groupToDelete.medications.length} medicines
                </strong>{' '}
                prescribed on {groupToDelete.startDate}?
              </p>
              <p className="text-xs text-slate-400">
                This will remove these medicines from your active medications list.
              </p>
            </div>
          ) : null
        }
        confirmLabel="Delete Medications"
        cancelLabel="Cancel"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setGroupToDelete(null);
        }}
      />
    </div>
  );
}

export default PatientMedicationsPage;
