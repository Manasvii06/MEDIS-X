import type { FamilyMember } from '../../types/family.types';
import { ChevronRightIcon } from '../common/icons';

export function FamilyMemberCard({
  member,
  isActive,
  onSwitch,
}: {
  member: FamilyMember;
  isActive: boolean;
  onSwitch: () => void;
}) {
  const age = new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();

  return (
    <button
      type="button"
      onClick={onSwitch}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
        isActive
          ? 'border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10'
          : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-500 text-xs font-semibold text-white">
          {member.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{member.name}</p>
          <p className="text-xs text-slate-400">{member.relation} · Age {age}</p>
        </div>
      </div>
      {isActive ? (
        <span className="rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white">Viewing</span>
      ) : (
        <ChevronRightIcon className="h-4 w-4 text-slate-400" />
      )}
    </button>
  );
}
