export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  linkedPatientId: string; // points at a PatientProfile.id
}
