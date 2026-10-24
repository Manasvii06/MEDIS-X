import { useState } from 'react';
import { XIcon } from '../common/icons';

interface AddFamilyMemberModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; relation: string; dateOfBirth: string; gender: 'Male' | 'Female' | 'Other' }) => void;
  isSaving?: boolean;
}

const RELATIONS = ['Spouse', 'Son', 'Daughter', 'Mother', 'Father', 'Sibling', 'Other'];

export function AddFamilyMemberModal({ onClose, onSubmit, isSaving }: AddFamilyMemberModalProps) {
  const [form, setForm] = useState({
    name: '',
    relation: RELATIONS[0],
    dateOfBirth: '',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
  });

  const isValid = form.name.trim() && form.dateOfBirth;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-800"
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-semibold text-slate-800 dark:text-slate-100">Add family member</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          You'll be able to manage their records and switch to their profile just like your own.
        </p>

        <div className="mt-4 space-y-2.5">
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={form.relation}
              onChange={(e) => setForm({ ...form, relation: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {RELATIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Date of birth</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!isValid || isSaving}
          onClick={() => onSubmit(form)}
          className="mt-5 w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Adding…' : 'Add family member'}
        </button>
      </div>
    </div>
  );
}
