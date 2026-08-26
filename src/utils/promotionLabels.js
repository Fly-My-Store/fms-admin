export const PROMOTION_STATUS_LABELS = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending approval',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired'
};

export const PROMOTION_STATUS_OPTIONS = [
  { value: 'DRAFT', label: PROMOTION_STATUS_LABELS.DRAFT },
  { value: 'PENDING_APPROVAL', label: PROMOTION_STATUS_LABELS.PENDING_APPROVAL },
  { value: 'ACTIVE', label: PROMOTION_STATUS_LABELS.ACTIVE },
  { value: 'PAUSED', label: PROMOTION_STATUS_LABELS.PAUSED },
  { value: 'REJECTED', label: PROMOTION_STATUS_LABELS.REJECTED },
  { value: 'EXPIRED', label: PROMOTION_STATUS_LABELS.EXPIRED }
];

export const PROMOTION_FUNDING_LABELS = {
  PLATFORM: 'Platform',
  SELLER: 'Seller'
};

export const PROMOTION_VISIBILITY_LABELS = {
  PUBLIC: 'Public',
  PRIVATE: 'Private'
};

export const PROMOTION_DISCOUNT_TYPE_LABELS = {
  PERCENT: 'Percent',
  FLAT: 'Flat',
  FREE_DELIVERY: 'Free delivery'
};

export const PROMOTION_TARGET_TYPE_LABELS = {
  CATEGORY: 'Category',
  PRODUCT: 'Product',
  PRODUCT_VARIANT: 'Product variant'
};

function labelFromMap(map, value) {
  const key = String(value || '').toUpperCase();
  return map[key] || value || '—';
}

export function getPromotionStatusLabel(status) {
  return labelFromMap(PROMOTION_STATUS_LABELS, status);
}

export function getPromotionStatusChipColor(status) {
  const key = String(status || '').toUpperCase();
  if (key === 'ACTIVE') return 'success';
  if (key === 'PENDING_APPROVAL') return 'warning';
  if (key === 'REJECTED' || key === 'EXPIRED') return 'error';
  if (key === 'PAUSED' || key === 'DRAFT') return 'default';
  return 'default';
}

export function getPromotionFundingLabel(funding) {
  return labelFromMap(PROMOTION_FUNDING_LABELS, funding);
}

export function getPromotionVisibilityLabel(visibility) {
  return labelFromMap(PROMOTION_VISIBILITY_LABELS, visibility);
}

export function getPromotionDiscountTypeLabel(type) {
  return labelFromMap(PROMOTION_DISCOUNT_TYPE_LABELS, type);
}

export function getPromotionTargetTypeLabel(type) {
  return labelFromMap(PROMOTION_TARGET_TYPE_LABELS, type);
}
