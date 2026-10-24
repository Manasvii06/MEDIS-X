import type { DoctorAnalytics, QueuePatientSummary } from '../types/doctor.types';
import type { MedicalDocument, ApprovalStatus } from '../types/document.types';
import { API_BASE_URL } from '../constants/api.constants';

export interface DoctorApprovalLogItem {
  documentId: string;
  document: MedicalDocument;
  patient: {
    id: string;
    name: string;
    mobileNumber?: string;
    gender?: string;
    dateOfBirth?: string;
  };
  visit: {
    id: string;
    visitDate: string;
    doctorName: string;
    doctorSpecialization?: string;
    hospital: string;
    reasonForVisit: string;
  };
  medications: Array<{
    id: string;
    name: string;
    dosage?: string;
    frequency?: string;
    durationDays?: number;
    startDate?: string;
    endDate?: string;
    notes?: string;
  }>;
  approvalStatus: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export async function getDoctorApprovalLog(): Promise<DoctorApprovalLogItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/doctors/approval-log`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('getDoctorApprovalLog error:', err);
    return [];
  }
}

export async function getReviewQueue(): Promise<QueuePatientSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/doctors/queue`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: { patientId: string; patientName: string; pendingCount: number; lastVisitDate: string }) => ({
      patientId: item.patientId,
      patientName: item.patientName,
      patientAge: 32,
      documentCount: item.pendingCount,
      latestUploadAt: item.lastVisitDate !== 'None' ? item.lastVisitDate : new Date().toISOString(),
      status: item.pendingCount > 0 ? 'pending' : 'approved',
    }));
  } catch (err) {
    console.error('getReviewQueue error:', err);
    return [];
  }
}

export async function getAnalytics(): Promise<DoctorAnalytics> {
  const log = await getDoctorApprovalLog();
  const pending = log.filter((item) => item.approvalStatus === 'pending').length;
  const approved = log.filter((item) => item.approvalStatus === 'approved').length;

  return {
    patientsCheckedToday: approved,
    patientsCheckedThisWeek: approved,
    patientsCheckedThisMonth: approved,
    pendingReviewCount: pending,
  };
}

