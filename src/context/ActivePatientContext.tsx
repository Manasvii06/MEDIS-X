import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { FamilyMember } from '../types/family.types';
import * as patientService from '../services/patient.service';
import { useAuthContext } from './AuthContext';

interface ActivePatientContextValue {
  activePatientId: string;
  activePatientName: string;
  isViewingSelf: boolean;
  familyMembers: FamilyMember[];
  switchToSelf: () => void;
  switchToFamilyMember: (member: FamilyMember) => void;
  refreshFamilyMembers: () => void;
}

const ActivePatientContext = createContext<ActivePatientContextValue | undefined>(undefined);

export function ActivePatientProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const defaultId = user?.id || 'PATIENT-001';
  const defaultName = user?.name || 'My Profile';

  const [activePatientId, setActivePatientId] = useState<string>(defaultId);
  const [activePatientName, setActivePatientName] = useState<string>(defaultName);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Keep in sync with authenticated user
  useEffect(() => {
    if (user?.id) {
      setActivePatientId(user.id);
      setActivePatientName(user.name);
    }
  }, [user?.id, user?.name]);

  const refreshFamilyMembers = useCallback(() => {
    patientService.getFamilyMembers(user?.id || activePatientId).then(setFamilyMembers).catch(() => setFamilyMembers([]));
  }, [user?.id, activePatientId]);

  useEffect(refreshFamilyMembers, [refreshFamilyMembers]);

  const switchToSelf = () => {
    setActivePatientId(user?.id || 'PATIENT-001');
    setActivePatientName(user?.name || 'My Profile');
  };

  const switchToFamilyMember = (member: FamilyMember) => {
    setActivePatientId(member.linkedPatientId);
    setActivePatientName(member.name);
  };

  const isSelf = activePatientId === (user?.id || 'PATIENT-001');

  return (
    <ActivePatientContext.Provider
      value={{
        activePatientId,
        activePatientName,
        isViewingSelf: isSelf,
        familyMembers,
        switchToSelf,
        switchToFamilyMember,
        refreshFamilyMembers,
      }}
    >
      {children}
    </ActivePatientContext.Provider>
  );
}

export function useActivePatientContext() {
  const ctx = useContext(ActivePatientContext);
  if (!ctx) throw new Error('useActivePatientContext must be used within an ActivePatientProvider');
  return ctx;
}
