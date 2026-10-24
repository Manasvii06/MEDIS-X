import { useState } from 'react';
import type { Visit, VisitType } from '../../types/visit.types';
import { formatDate } from '../../utils/formatDate';

interface VisitPickerProps {
  visits: Visit[];
  selectedVisitId: string | null;
  onSelectExisting: (visitId: string) => void;
  onCreateNew: (visit: Omit<Visit, 'id' | 'patientId' | 'documentIds'>) => void;
}

const VISIT_TYPES: VisitType[] = ['Initial', 'Follow-up', 'Routine', 'Emergency'];

export function VisitPicker({ visits, selectedVisitId, onSelectExisting, onCreateNew }: VisitPickerProps) {
  const [mode, setMode] = useState<'existing' | 'new'>(visits.length > 0 ? 'existing' : 'new');
  const [form, setForm] = useState({
    visitDate: new Date().toISOString().slice(0, 10),
    visitType: 'Follow-up' as VisitType,
    doctorName: '',
    doctorSpecialization: '',
    hospital: '',
    reasonForVisit: '',
  });

  const isNewValid = form.doctorName.trim() && form.hospital.trim() && form.reasonForVisit.trim();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Which visit is this for?</p>
      <p className="mt-0.5 text-xs text-slate-400">
        Group this upload with an existing visit, or start a new one — e.g. today's follow-up.
      </p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={visits.length === 0}
          onClick={() => setMode('existing')}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
            mode === 'existing'
              ? 'bg-brand-600 text-white'
              : 'bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700'
          }`}
        >
          Existing visit
        </button>
        <button
          type="button"
          onClick={() => setMode('new')}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
            mode === 'new'
              ? 'bg-brand-600 text-white'
              : 'bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700'
          }`}
        >
          + New visit
        </button>
      </div>

      {mode === 'existing' && (
        <div className="mt-3 space-y-2">
          {visits.map((v) => (
            <label
              key={v.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                selectedVisitId === v.id
                  ? 'border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50'
              }`}
            >
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {formatDate(v.visitDate)} · {v.doctorName}
                </p>
                <p className="text-xs text-slate-400">{v.reasonForVisit}</p>
              </div>
              <input
                type="radio"
                name="visit"
                checked={selectedVisitId === v.id}
                onChange={() => onSelectExisting(v.id)}
                className="h-4 w-4 accent-brand-600"
              />
            </label>
          ))}
        </div>
      )}

      {mode === 'new' && (
        <div className="mt-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Visit date</label>
              <input
                type="date"
                value={form.visitDate}
                onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Visit type</label>
              <select
                value={form.visitType}
                onChange={(e) => setForm({ ...form, visitType: e.target.value as VisitType })}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {VISIT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <input
            type="text"
            placeholder="Doctor name"
            value={form.doctorName}
            onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            type="text"
            placeholder="Specialization (e.g. Cardiology)"
            value={form.doctorSpecialization}
            onChange={(e) => setForm({ ...form, doctorSpecialization: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            type="text"
            placeholder="Hospital / clinic"
            value={form.hospital}
            onChange={(e) => setForm({ ...form, hospital: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <input
            type="text"
            placeholder="Reason for visit"
            value={form.reasonForVisit}
            onChange={(e) => setForm({ ...form, reasonForVisit: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            disabled={!isNewValid}
            onClick={() => onCreateNew(form)}
            className="w-full rounded-lg bg-navy-500 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use this visit
          </button>
        </div>
      )}
    </div>
  );
}
