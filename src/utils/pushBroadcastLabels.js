export const PUSH_BROADCAST_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'QUEUED', label: 'Queued' },
  { value: 'RUNNING', label: 'Sending' },
  { value: 'SUCCEEDED', label: 'Sent' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

export const PUSH_BROADCAST_STATUS_LABELS = Object.fromEntries(
  PUSH_BROADCAST_STATUS_OPTIONS.map((o) => [o.value, o.label])
);

export const PUSH_BROADCAST_AUDIENCE_OPTIONS = [
  { value: 'ALL', label: 'All (customer + seller + rider)' },
  { value: 'CUSTOMER', label: 'Customers' },
  { value: 'SELLER', label: 'Sellers' },
  { value: 'RIDER', label: 'Riders' }
];

export const PUSH_BROADCAST_AUDIENCE_LABELS = Object.fromEntries(
  PUSH_BROADCAST_AUDIENCE_OPTIONS.map((o) => [o.value, o.label])
);

export function getPushBroadcastStatusLabel(status) {
  return PUSH_BROADCAST_STATUS_LABELS[status] || status || '—';
}

export function getPushBroadcastStatusChipColor(status) {
  switch (status) {
    case 'SUCCEEDED':
      return 'success';
    case 'RUNNING':
    case 'QUEUED':
      return 'info';
    case 'FAILED':
      return 'error';
    case 'CANCELLED':
      return 'default';
    case 'DRAFT':
    default:
      return 'warning';
  }
}

export function getPushBroadcastAudienceLabel(audience) {
  return PUSH_BROADCAST_AUDIENCE_LABELS[audience] || audience || '—';
}

/** Backend PUSH_BROADCAST_TEMPLATES labels (keep in sync with fms-backend). */
export const PUSH_BROADCAST_TEMPLATE_LABELS = Object.freeze({
  customer_name_missing: 'Customers — name missing',
  customer_inactive: 'Customers — inactive 14+ days',
  seller_docs_missing: 'Sellers — documents missing',
  seller_store_not_created: 'Sellers — store not created',
  seller_onboarding_stuck: 'Sellers — stuck in onboarding 3+ days',
  seller_data_missing: 'Sellers — profile data missing',
  seller_store_data_missing: 'Sellers — store data missing',
  seller_no_variants: 'Sellers — no listings 3+ days',
  seller_kyc_pending: 'Sellers — KYC pending / in review',
  rider_kyc_pending: 'Riders — KYC incomplete',
  rider_docs_missing: 'Riders — documents / DL missing'
});

export function getPushBroadcastTemplateLabel(templateKey) {
  if (!templateKey) return 'Manual compose';
  return PUSH_BROADCAST_TEMPLATE_LABELS[templateKey] || templateKey;
}

export const PUSH_BROADCAST_TEMPLATE_FILTER_OPTIONS = [
  { value: '', label: 'All templates' },
  { value: 'none', label: 'Manual compose' },
  ...Object.entries(PUSH_BROADCAST_TEMPLATE_LABELS).map(([value, label]) => ({ value, label }))
];

export const PUSH_BROADCAST_ACTION_LABELS = Object.freeze({
  OPEN_HOME: 'Open home',
  OPEN_PROFILE: 'Open profile',
  OPEN_STORE_VARIANTS: 'Open store listings',
  OPEN_DEEPLINK: 'Open deeplink'
});

export function getPushBroadcastActionLabel(action, deeplink) {
  const key = String(action || '').toUpperCase();
  if (!key && !deeplink) return '—';
  if (key === 'OPEN_DEEPLINK' || (!key && deeplink)) {
    const link = String(deeplink || '').trim();
    if (!link) return PUSH_BROADCAST_ACTION_LABELS.OPEN_DEEPLINK;
    if (/screen.?guard|screen_guard/i.test(link) || /fms:\/\/screen/i.test(link)) {
      return 'Open Screen Guard';
    }
    if (/fms:\/\/home/i.test(link)) return 'Open home';
    if (/fms:\/\/search/i.test(link)) return 'Open search';
    if (/fms:\/\/category/i.test(link)) return 'Open category';
    if (/fms:\/\/store/i.test(link)) return 'Open store';
    if (/fms:\/\/variant|\/v\//i.test(link) || /\/x\//i.test(link)) return 'Open product / link';
    return 'Open deeplink';
  }
  return PUSH_BROADCAST_ACTION_LABELS[key] || action || '—';
}

export const ACCOUNT_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Active (default)' },
  { value: '1', label: 'Active' },
  { value: '2', label: 'Inactive' },
  { value: '3', label: 'Suspended' },
  { value: '4', label: 'Deleted' }
];

export const KYC_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_REVIEW', label: 'In review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'RESUBMIT', label: 'Resubmit' }
];

export const KYB_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'NONE', label: 'None' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' }
];
