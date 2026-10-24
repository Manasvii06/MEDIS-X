export type DocumentFileType = 'image' | 'pdf';

export type ApprovalStatus = 'approved' | 'pending' | 'rejected' | 'not_requested';

export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface AISummary {
  id: string;
  text: string;
  extractedEntities: string[];
  confidence: number; // 0-1
  generatedAt: string; // ISO date
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  visitId: string; // groups this document under a specific visit
  fileName: string;
  fileType: DocumentFileType;
  fileUrl: string; // placeholder URL only — real files live in Supabase Storage
  uploadedAt: string; // ISO date
  documentLabel: string; // e.g. "Prescription", "Lab Report"
  processingStatus: ProcessingStatus;
  approvalStatus: ApprovalStatus;
  reviewedBy?: string; // doctor id
  reviewedAt?: string;
  rejectionReason?: string;
  aiSummary?: AISummary;
  extractedText?: string;
}
