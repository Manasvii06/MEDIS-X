import type { PatientProfile } from '../types/patient.types';
import type { FamilyMember } from '../types/family.types';
import { API_BASE_URL } from '../constants/api.constants';

export async function getMyProfile(): Promise<PatientProfile> {
  const res = await fetch(`${API_BASE_URL}/patients/me`);
  if (!res.ok) {
    throw new Error('Failed to load profile.');
  }
  return await res.json();
}

export async function getProfileById(patientId: string): Promise<PatientProfile | null> {
  if (!patientId) return null;
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function getFamilyMembers(patientId?: string): Promise<FamilyMember[]> {
  const targetId = patientId || 'PATIENT-001';
  const res = await fetch(`${API_BASE_URL}/patients/${targetId}/family`);
  if (!res.ok) return [];
  return await res.json();
}

export async function addFamilyMember(
  member: Omit<FamilyMember, 'id' | 'linkedPatientId'>,
  primaryPatientId?: string
): Promise<FamilyMember> {
  const targetId = primaryPatientId || 'PATIENT-001';
  const res = await fetch(`${API_BASE_URL}/patients/${targetId}/family`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  });

  if (!res.ok) {
    throw new Error('Could not add family member.');
  }

  return await res.json();
}

export async function updateMyProfile(
  updates: Partial<PatientProfile>,
  patientId?: string
): Promise<PatientProfile> {
  const targetId = patientId || 'PATIENT-001';
  const res = await fetch(`${API_BASE_URL}/patients/${targetId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error('Could not update profile.');
  }

  return await res.json();
}

export async function getPatientById(patientId: string): Promise<PatientProfile | null> {
  return getProfileById(patientId);
}
