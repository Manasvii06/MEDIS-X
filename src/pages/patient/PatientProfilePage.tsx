import { useEffect, useState } from 'react';
import type { PatientProfile } from '../../types/patient.types';
import * as patientService from '../../services/patient.service';
import { PatientProfileCard } from '../../components/patient/PatientProfileCard';
import { FamilyMemberCard } from '../../components/patient/FamilyMemberCard';
import { AddFamilyMemberModal } from '../../components/patient/AddFamilyMemberModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Card } from '../../components/common/Card';
import { PlusIcon, UsersIcon } from '../../components/common/icons';
import type { AsyncStatus } from '../../types/common.types';
import { useActivePatient } from '../../hooks/useActivePatient';

export function PatientProfilePage() {
  const {
    activePatientId,
    activePatientName,
    isViewingSelf,
    familyMembers,
    switchToSelf,
    switchToFamilyMember,
    refreshFamilyMembers,
  } = useActivePatient();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSavingMember, setIsSavingMember] = useState(false);

  const loadProfile = () => {
    setStatus('loading');
    patientService
      .getProfileById(activePatientId)
      .then((data) => {
        setProfile(data);
        setStatus(data ? 'success' : 'error');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(loadProfile, [activePatientId]);

  const handleAddFamilyMember = async (data: {
    name: string;
    relation: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
  }) => {
    setIsSavingMember(true);
    await patientService.addFamilyMember(data, activePatientId);
    refreshFamilyMembers();
    setIsSavingMember(false);
    setShowAddModal(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="max-w-lg">
        <h1 className="font-display text-xl font-semibold text-slate-800 dark:text-slate-100">
          {isViewingSelf ? 'My Profile' : `${activePatientName}'s Profile`}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {isViewingSelf ? 'Your personal and medical details.' : `Managed by you as a family member.`}
        </p>

        <div className="mt-5">
          {status === 'loading' && <LoadingSpinner label="Loading profile…" />}
          {status === 'error' && <ErrorState onRetry={loadProfile} />}
          {status === 'success' && profile && <PatientProfileCard profile={profile} />}
        </div>
      </div>

      <div>
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-slate-400" />
              <p className="font-display text-sm font-semibold text-slate-800 dark:text-slate-100">Family members</p>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-400">Switch profiles to view or upload records for them.</p>

          <div className="mt-4 space-y-2">
            <FamilyMemberCard
              member={{
                id: 'self',
                name: isViewingSelf && profile ? profile.name : activePatientName,
                relation: 'You',
                dateOfBirth: isViewingSelf && profile ? profile.dateOfBirth : '',
                gender: isViewingSelf && profile ? profile.gender : 'Other',
                linkedPatientId: activePatientId,
              }}
              isActive={isViewingSelf}
              onSwitch={switchToSelf}
            />
            {familyMembers.map((member) => (
              <FamilyMemberCard
                key={member.id}
                member={member}
                isActive={activePatientId === member.linkedPatientId}
                onSwitch={() => switchToFamilyMember(member)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-500 hover:border-brand-300 hover:text-brand-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:text-brand-400"
          >
            <PlusIcon className="h-4 w-4" />
            Add family member
          </button>
        </Card>
      </div>

      {showAddModal && (
        <AddFamilyMemberModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddFamilyMember}
          isSaving={isSavingMember}
        />
      )}
    </div>
  );
}
