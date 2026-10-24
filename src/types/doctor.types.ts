import type { ApprovalStatus } from './document.types';

export interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  registrationNumber: string;
  hospital: string;
  email?: string;
}

export interface QueuePatientSummary {
  patientId: string;
  patientName: string;
  patientAge: number;
  documentCount: number;
  latestUploadAt: string; // ISO date
  status: ApprovalStatus; // status of the most recent pending item in queue
}

export interface DoctorAnalytics {
  patientsCheckedToday: number;
  patientsCheckedThisWeek: number;
  patientsCheckedThisMonth: number;
  pendingReviewCount: number;
}
