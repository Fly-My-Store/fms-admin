export const REFUND_STATUS_LABELS = {
  PENDING: 'Pending',
  PROCESSED: 'Processed',
  FAILED: 'Failed',
};

export function getRefundStatusLabel(status) {
  const key = String(status || '').toUpperCase();
  return REFUND_STATUS_LABELS[key] || status || '—';
}

export function getRefundStatusChipColor(status) {
  const key = String(status || '').toUpperCase();
  if (key === 'PROCESSED') return 'success';
  if (key === 'FAILED') return 'error';
  if (key === 'PENDING') return 'warning';
  return 'default';
}

export function getRefundTimelineNote(status) {
  const key = String(status || '').toUpperCase();
  if (key === 'FAILED') {
    return 'Refund failed at the gateway. Verify in Razorpay dashboard or retry manually.';
  }
  if (key === 'PENDING') {
    return 'Refund initiated. Normal refunds are credited to the customer’s original payment method within 5–7 business days.';
  }
  if (key === 'PROCESSED') {
    return 'Refund processed at the gateway. Bank credit to the customer may take 5–7 business days.';
  }
  return null;
}

export function hasCapturedPaymentWithoutRefund(order, refunds = []) {
  const payments = order?.payments || [];
  const captured = payments.some((p) => {
    const s = String(p?.status || '').toUpperCase();
    return s === 'CAPTURED' || s === 'REFUNDED' || s === 'AUTHORIZED';
  });
  const cancelled = String(order?.status || '').toUpperCase() === 'CANCELLED';
  return cancelled && captured && refunds.length === 0;
}
