import type { ApprovalStatus, ProcessingStatus } from '../../types/document.types';
import { APPROVAL_STATUS_LABEL, PROCESSING_STATUS_LABEL } from '../../constants/status.constants';
import { approvalStatusClasses, processingStatusClasses } from '../../utils/statusStyles';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from './icons';

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  const Icon = status === 'approved' ? CheckCircleIcon : status === 'rejected' ? XCircleIcon : ClockIcon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${approvalStatusClasses(status)}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {APPROVAL_STATUS_LABEL[status]}
    </span>
  );
}

export function ProcessingStatusBadge({ status }: { status: ProcessingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${processingStatusClasses(status)}`}
    >
      {PROCESSING_STATUS_LABEL[status]}
    </span>
  );
}
