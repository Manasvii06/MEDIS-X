import { useState, useEffect } from 'react';
import type { Medication } from '../../types/medication.types';
import { formatDate } from '../../utils/formatDate';
import { PillIcon, TrashIcon, CalendarIcon, CheckIcon } from '../common/icons';

export interface MedicationGroup {
  key: string;
  visitId: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  hospital: string;
  medications: Medication[];
}

function isActive(endDate: string): boolean {
  if (!endDate || endDate === 'Not available') return true;
  const d = new Date(endDate);
  if (isNaN(d.getTime())) return true;
  return d.getTime() >= new Date().setHours(0, 0, 0, 0);
}

function cleanFrequency(freq?: string): string {
  if (!freq) return 'As directed';
  const lower = freq.toLowerCase();
  if (lower.includes('four') || lower.includes('4')) return '4x daily';
  if (lower.includes('three') || lower.includes('3') || lower.includes('tid')) return '3x daily';
  if (lower.includes('twice') || lower.includes('2') || lower.includes('bid')) return '2x daily';
  if (lower.includes('once') || lower.includes('1') || lower.includes('od')) return 'Once daily';
  return freq.replace(/\(.*?\)/g, '').trim();
}

function cleanNotes(notes?: string): string {
  if (!notes) return '';
  const lower = notes.toLowerCase();
  if (lower.includes('after food') || lower.includes('after meal')) return 'After food';
  if (lower.includes('before food') || lower.includes('before meal')) return 'Before food';
  if (lower.includes('bedtime') || lower.includes('night')) return 'At bedtime';
  return notes;
}

interface MedicationGroupCardProps {
  group: MedicationGroup;
  onDeleteGroup: (group: MedicationGroup) => Promise<void> | void;
}

export function MedicationGroupCard({
  group,
  onDeleteGroup,
}: MedicationGroupCardProps) {
  const todayKey = `med_taken_${group.key}_${new Date().toISOString().split('T')[0]}`;

  // Interactive taken state persisted in localStorage
  const [takenMeds, setTakenMeds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(todayKey, JSON.stringify(takenMeds));
    } catch {}
  }, [takenMeds, todayKey]);

  const toggleTaken = (id: string) => {
    setTakenMeds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleAll = () => {
    const allTaken = group.medications.every((m) => takenMeds[m.id]);
    const next: Record<string, boolean> = {};
    for (const m of group.medications) {
      next[m.id] = !allTaken;
    }
    setTakenMeds(next);
  };

  const handleDeleteGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteGroup(group);
  };

  const isGroupActive = group.medications.some((m) => isActive(m.endDate));
  const hasDoctor = group.prescribedBy && group.prescribedBy !== 'Not available';
  const hasHospital = group.hospital && group.hospital !== 'Not available';

  const takenCount = group.medications.filter((m) => takenMeds[m.id]).length;
  const totalCount = group.medications.length;
  const allCompleted = totalCount > 0 && takenCount === totalCount;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-brand-200 dark:border-slate-700 dark:bg-slate-800">
      {/* Box Header: Title, Course status, Date, and ONE bin icon below date */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-3.5 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <PillIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-base font-bold text-slate-800 dark:text-slate-100">
                {hasDoctor ? group.prescribedBy : `Prescription (${totalCount} Medicines)`}
              </h2>
              {hasHospital && (
                <span className="text-xs text-slate-400">· {group.hospital}</span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                  isGroupActive
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20'
                    : 'bg-slate-100 text-slate-600 ring-slate-400/20 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {isGroupActive ? 'Ongoing course' : 'Completed course'}
              </span>

              {/* Interactive daily progress badge */}
              <button
                type="button"
                onClick={handleToggleAll}
                className="text-[11px] font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2 dark:text-brand-400"
              >
                {allCompleted ? 'Reset today’s doses' : `${takenCount}/${totalCount} taken today (Mark all)`}
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Date at top, and ONLY ONE bin icon BELOW date */}
        <div className="flex flex-col items-end gap-1.5 text-right">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {formatDate(group.startDate)} → {formatDate(group.endDate)}
            </span>
          </div>

          {/* Single bin icon on right side below date */}
          <button
            type="button"
            title="Delete prescription"
            aria-label="Delete prescription"
            onClick={handleDeleteGroup}
            className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition dark:border-slate-700 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Multiple Medicines in One Box with compact, interactive details */}
      <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700/60">
        {group.medications.map((med, idx) => {
          const isTaken = !!takenMeds[med.id];
          const freqLabel = cleanFrequency(med.frequency);
          const noteLabel = cleanNotes(med.notes);

          return (
            <div
              key={med.id}
              onClick={() => toggleTaken(med.id)}
              className={`flex items-center justify-between gap-3 py-2.5 px-2.5 rounded-xl cursor-pointer transition select-none ${
                isTaken
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Interactive Checkbox */}
                <div
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition ${
                    isTaken
                      ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
                      : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
                  }`}
                >
                  {isTaken && <CheckIcon className="h-3.5 w-3.5" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      {idx + 1}.
                    </span>
                    <span
                      className={`text-sm font-semibold truncate ${
                        isTaken
                          ? 'text-emerald-900 line-through decoration-emerald-500/60 dark:text-emerald-200'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {med.name}
                    </span>
                    {med.dosage && (
                      <span className="text-xs text-slate-400 font-normal">
                        ({med.dosage})
                      </span>
                    )}
                  </div>

                  {/* Compact, clean badges */}
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      {freqLabel}
                    </span>
                    {noteLabel && (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        {noteLabel}
                      </span>
                    )}
                    {med.durationDays > 0 && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        {med.durationDays}d
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isTaken
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'text-slate-400'
                  }`}
                >
                  {isTaken ? '✓ Taken' : 'Tap to take'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
