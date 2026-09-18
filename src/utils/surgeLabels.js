export const SURGE_TYPE_LABELS = Object.freeze({
  PERCENT: 'Percent',
  FLAT: 'Flat (₹)'
});

export const SURGE_SCOPE_LABELS = Object.freeze({
  CART: 'Cart',
  ITEM: 'Items',
  DELIVERY_FEE: 'Delivery fee',
  PLATFORM_FEE: 'Platform fee',
  SERVICE_FEE: 'Service fee',
  GATEWAY_FEE: 'Gateway fee'
});

export const SURGE_BENEFICIARY_LABELS = Object.freeze({
  SELLER: 'Seller',
  PLATFORM: 'Platform'
});

export const SURGE_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_APPROVAL', label: 'Pending approval' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'EXPIRED', label: 'Expired' }
];

export function getSurgeStatusLabel(status) {
  return SURGE_STATUS_OPTIONS.find((o) => o.value === status)?.label || status || '—';
}

export function getSurgeStatusChipColor(status) {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PENDING_APPROVAL':
      return 'warning';
    case 'PAUSED':
      return 'default';
    case 'DRAFT':
      return 'default';
    case 'REJECTED':
    case 'EXPIRED':
      return 'error';
    default:
      return 'default';
  }
}

export function formatSurgeAmount(row) {
  if (!row) return '—';
  if (row.surge_type === 'FLAT') {
    return `₹${(Number(row.surge_value || 0) / 100).toFixed(2)}`;
  }
  return `${row.surge_value || 0}%`;
}

/** Weekday chips Mon→Sun (values 1..6,0). */
export const SURGE_WEEKDAY_OPTIONS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' }
];

const WEEKDAY_LABEL = Object.fromEntries(SURGE_WEEKDAY_OPTIONS.map((d) => [d.value, d.label]));

export function formatSurgeActiveDays(days) {
  if (!Array.isArray(days) || !days.length) return 'Every day';
  const ordered = SURGE_WEEKDAY_OPTIONS.map((d) => d.value).filter((v) => days.includes(v));
  return ordered.map((v) => WEEKDAY_LABEL[v]).join(', ');
}

export function formatSurgeDailyHours(startTime, endTime) {
  if (!startTime && !endTime) return 'All day';
  if (startTime && endTime) return `${startTime} – ${endTime} IST`;
  return startTime || endTime || 'All day';
}
