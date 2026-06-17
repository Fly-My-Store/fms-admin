export const formatDeliveryDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

export const shortOrderId = (id) => (id ? String(id).slice(0, 8) : '—');

export const nestedOrder = (row) => row?.order || row?.Order || null;
export const nestedStore = (row) => row?.store || row?.Store || null;
export const nestedRider = (row) => row?.rider || row?.Rider || null;
export const nestedPayments = (row) => nestedOrder(row)?.payments || nestedOrder(row)?.Payments || [];

export const expectedShareCents = (row) => {
  const fee = Number(row.rider_fee_cents) || 0;
  const paymentShare = nestedPayments(row).reduce(
    (sum, payment) => sum + Math.max(0, Number(payment.rider_share_cents) || 0),
    0
  );
  return Math.max(fee, paymentShare);
};

export const walletShareCents = (row) =>
  nestedPayments(row).reduce((sum, payment) => {
    if (!payment.rider_wallet_credited_at) return sum;
    return sum + Math.max(0, Number(payment.rider_share_cents) || 0);
  }, 0);

export const isCreditedToWallet = (row) => walletShareCents(row) > 0;

export function normalizeDeliveryRow(row) {
  return {
    ...row,
    order_label: nestedOrder(row)?.id ? shortOrderId(nestedOrder(row).id) : shortOrderId(row.order_id),
    store_name: nestedStore(row)?.name || '—',
    rider_name: nestedRider(row)?.name || '—'
  };
}
