import type { MedicalDocument } from '../types/document.types';
import type { Visit } from '../types/visit.types';
import { API_BASE_URL } from '../constants/api.constants';

export async function getDocumentsForPatient(patientId: string): Promise<MedicalDocument[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/${patientId}/documents`);
    if (!res.ok) {
      throw new Error(`Failed to load documents: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error('getDocumentsForPatient error:', err);
    throw err;
  }
}

export interface SavePrescriptionParams {
  file: File;
  patientId: string;
  extractedText: string;
  aiSummary: string;
  doctorName?: string;
  hospital?: string;
  visitDate?: string;
  visitReason?: string;
  doctorSpecialization?: string;
  visitId?: string;
  medications?: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    durationDays?: number;
    notes?: string;
  }>;
}

export interface SavePrescriptionResult {
  success: boolean;
  visit: Visit;
  document: MedicalDocument;
  fileUrl: string;
  medications?: any[];
}

export async function savePrescription(params: SavePrescriptionParams): Promise<SavePrescriptionResult> {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('patientId', params.patientId);
  formData.append('extractedText', params.extractedText);
  formData.append('aiSummary', params.aiSummary);

  if (params.doctorName) formData.append('doctorName', params.doctorName);
  if (params.hospital) formData.append('hospital', params.hospital);
  if (params.visitDate) formData.append('visitDate', params.visitDate);
  if (params.visitReason) formData.append('visitReason', params.visitReason);
  if (params.doctorSpecialization) formData.append('doctorSpecialization', params.doctorSpecialization);
  if (params.visitId) formData.append('visitId', params.visitId);
  if (params.medications && params.medications.length > 0) {
    formData.append('medications', JSON.stringify(params.medications));
  }

  const res = await fetch(`${API_BASE_URL}/prescriptions/save`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error || 'Failed to save prescription and update profile.');
  }

  return await res.json();
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return !!data?.success;
  } catch (err) {
    console.error('deleteDocument error:', err);
    return false;
  }
}

export async function uploadDocument(
  patientId: string,
  visitId: string,
  file: File,
  documentLabel: string
): Promise<MedicalDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('patientId', patientId);
  formData.append('visitId', visitId);
  formData.append('documentLabel', documentLabel);
  formData.append('extractedText', '');
  formData.append('aiSummary', '');

  const res = await fetch(`${API_BASE_URL}/prescriptions/save`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error || 'Failed to upload document.');
  }

  const data = await res.json();
  return data.document;
}

export async function approveDocument(
  documentId: string,
  doctorId: string
): Promise<MedicalDocument | null> {
  const res = await fetch(`${API_BASE_URL}/documents/${documentId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId }),
  });

  if (!res.ok) return null;
  return await res.json();
}

export async function rejectDocument(
  documentId: string,
  doctorId: string,
  reason: string
): Promise<MedicalDocument | null> {
  const res = await fetch(`${API_BASE_URL}/documents/${documentId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId, reason }),
  });

  if (!res.ok) return null;
  return await res.json();
}

export async function requestApproval(
  documentId: string
): Promise<MedicalDocument | null> {
  const res = await fetch(`${API_BASE_URL}/documents/${documentId}/request-approval`, {
    method: 'POST',
  });

  if (!res.ok) return null;
  return await res.json();
}

