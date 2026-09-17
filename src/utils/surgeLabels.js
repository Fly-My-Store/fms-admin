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
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'EXPIRED', label: 'Expired' }
];

export function getSurgeStatusLabel(status) {
  return SURGE_STATUS_OPTIONS.find((o) => o.value === status)?.label || status || '—';
}

export function getSurgeStatusChipColor(status) {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PAUSED':
      return 'warning';
    case 'DRAFT':
      return 'default';
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
