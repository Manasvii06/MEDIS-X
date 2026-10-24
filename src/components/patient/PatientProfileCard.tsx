import type { PatientProfile } from '../../types/patient.types';
import { Card } from '../common/Card';

export function PatientProfileCard({ profile }: { profile: PatientProfile }) {
  const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-500 text-lg font-semibold text-white">
          {profile.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">{profile.name}</p>
          <p className="font-mono text-xs text-slate-400">{profile.id}</p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-y-4 text-sm">
        <div>
          <dt className="text-slate-400">Age / Gender</dt>
          <dd className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{age} / {profile.gender}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Blood group</dt>
          <dd className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{profile.bloodGroup}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Mobile</dt>
          <dd className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{profile.mobileNumber}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Email</dt>
          <dd className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{profile.email ?? '—'}</dd>
        </div>
      </dl>

      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-700">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Allergies</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {profile.allergies.length > 0 ? (
              profile.allergies.map((a) => (
                <span key={a} className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                  {a}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">None recorded</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Chronic conditions</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {profile.chronicConditions.length > 0 ? (
              profile.chronicConditions.map((c) => (
                <span key={c} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  {c}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">None recorded</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
