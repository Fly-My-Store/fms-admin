export const PROMOTION_CAMPAIGN_TYPE_LABELS = {
  COUPON: 'Coupon',
  REFERRAL: 'Referral'
};

export const PROMOTION_CAMPAIGN_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'ENDED', label: 'Ended' }
];

export const PROMOTION_CAMPAIGN_STATUS_LABELS = Object.fromEntries(
  PROMOTION_CAMPAIGN_STATUS_OPTIONS.map((o) => [o.value, o.label])
);

export function getPromotionCampaignStatusLabel(status) {
  return PROMOTION_CAMPAIGN_STATUS_LABELS[status] || status || '—';
}

export function getPromotionCampaignStatusChipColor(status) {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PAUSED':
      return 'warning';
    case 'ENDED':
      return 'default';
    case 'DRAFT':
    default:
      return 'info';
  }
}

export function getPromotionCampaignTypeLabel(type) {
  return PROMOTION_CAMPAIGN_TYPE_LABELS[type] || type || '—';
}

export function formatINRFromCents(cents) {
  if (cents == null || cents === '') return '—';
  return `₹${(Number(cents) / 100).toFixed(2)}`;
}

export const PROMOTION_CHANNEL_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Website' },
  { value: 'news', label: 'Local news' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Other' }
];
