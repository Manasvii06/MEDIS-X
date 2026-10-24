export interface PatientProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact?: {
    name: string;
    relation: string;
    mobileNumber: string;
  };
}
