export type VisitType = 'Initial' | 'Follow-up' | 'Routine' | 'Emergency';

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string; // ISO date
  visitType: VisitType;
  doctorName: string;
  doctorSpecialization: string;
  hospital: string;
  reasonForVisit: string;
  documentIds: string[]; // MedicalDocument.id references
  notes?: string;
}
