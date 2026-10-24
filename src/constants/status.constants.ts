import type { ApprovalStatus, ProcessingStatus } from '../types/document.types';

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  approved: 'Doctor Approved',
  pending: 'Pending Approval',
  rejected: 'Rejected',
  not_requested: 'Approval Not Requested',
};


export const PROCESSING_STATUS_LABEL: Record<ProcessingStatus, string> = {
  queued: 'Queued',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};
