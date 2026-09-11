/**
 * MahaSetu Status and Language Mapper
 * Enforces plain citizen language vs operational technical language
 */

export const APPLICATION_STATUS = {
  PENDING_CONSENT: 'PENDING_CONSENT',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const TASK_STATUS = {
  WAITING: 'WAITING',
  READY: 'READY',
  CANCELLED: 'CANCELLED',
  // Future execution states (prepared but isolated)
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  RETRYING: 'RETRYING',
};

/**
 * Maps application statuses to citizen-friendly labels and badge variants
 */
export function mapApplicationStatus(status, role = 'CITIZEN') {
  if (role === 'CITIZEN') {
    switch (status) {
      case APPLICATION_STATUS.PENDING_CONSENT:
        return { label: 'Action Required', variant: 'warning', tone: 'amber' };
      case APPLICATION_STATUS.APPROVED:
        return { label: 'Approved', variant: 'success', tone: 'emerald' };
      case APPLICATION_STATUS.REJECTED:
        return { label: 'Rejected', variant: 'danger', tone: 'rose' };
      default:
        return { label: status || 'Pending', variant: 'neutral', tone: 'slate' };
    }
  }

  // Officer / Admin view
  switch (status) {
    case APPLICATION_STATUS.PENDING_CONSENT:
      return { label: 'PENDING_CONSENT', variant: 'warning', tone: 'amber' };
    case APPLICATION_STATUS.APPROVED:
      return { label: 'APPROVED', variant: 'success', tone: 'emerald' };
    case APPLICATION_STATUS.REJECTED:
      return { label: 'REJECTED', variant: 'danger', tone: 'rose' };
    default:
      return { label: status || 'UNKNOWN', variant: 'neutral', tone: 'slate' };
  }
}

/**
 * Maps task status to human-readable labels and badge variants.
 * Note: READY means 'Ready to proceed' / 'Ready to process', NEVER 'Completed'.
 */
export function mapTaskStatus(status, role = 'CITIZEN') {
  if (role === 'CITIZEN') {
    switch (status) {
      case TASK_STATUS.WAITING:
        return { label: 'Waiting for approval', variant: 'neutral', tone: 'slate' };
      case TASK_STATUS.READY:
        return { label: 'Ready to proceed', variant: 'info', tone: 'blue' };
      case TASK_STATUS.CANCELLED:
        return { label: 'Cancelled', variant: 'danger', tone: 'rose' };
      case TASK_STATUS.RUNNING:
        return { label: 'Processing', variant: 'warning', tone: 'amber' };
      case TASK_STATUS.SUCCESS:
        return { label: 'Completed', variant: 'success', tone: 'emerald' };
      case TASK_STATUS.FAILED:
        return { label: 'Action failed', variant: 'danger', tone: 'rose' };
      case TASK_STATUS.RETRYING:
        return { label: 'Retrying', variant: 'warning', tone: 'amber' };
      default:
        return { label: status || 'Waiting', variant: 'neutral', tone: 'slate' };
    }
  }

  // Officer / Admin / Technical view
  switch (status) {
    case TASK_STATUS.WAITING:
      return { label: 'WAITING', variant: 'neutral', tone: 'slate' };
    case TASK_STATUS.READY:
      return { label: 'READY', variant: 'info', tone: 'blue' };
    case TASK_STATUS.CANCELLED:
      return { label: 'CANCELLED', variant: 'danger', tone: 'rose' };
    case TASK_STATUS.RUNNING:
      return { label: 'RUNNING', variant: 'warning', tone: 'amber' };
    case TASK_STATUS.SUCCESS:
      return { label: 'SUCCESS', variant: 'success', tone: 'emerald' };
    case TASK_STATUS.FAILED:
      return { label: 'FAILED', variant: 'danger', tone: 'rose' };
    case TASK_STATUS.RETRYING:
      return { label: 'RETRYING', variant: 'warning', tone: 'amber' };
    default:
      return { label: status || 'WAITING', variant: 'neutral', tone: 'slate' };
  }
}

/**
 * Converts trigger_event enum into friendly citizen wording
 */
export function formatTriggerEvent(event) {
  if (!event) return 'Government Service Request';
  return event
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Formats department name from code
 */
export function formatDepartmentName(code) {
  if (!code) return 'Department';
  return code.replace(/_/g, ' ');
}

/**
 * Formats ISO date to readable string
 */
export function formatDate(isoString) {
  if (!isoString) return 'Recent';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
