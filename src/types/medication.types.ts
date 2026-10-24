export type MedicationStatus = 'active' | 'completed';

export interface Medication {
  id: string;
  patientId: string;
  visitId: string;
  name: string;
  dosage: string;
  frequency: string; // e.g. "Twice daily"
  durationDays: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  prescribedBy: string; // doctor name
  hospital: string;
  notes?: string;
}
