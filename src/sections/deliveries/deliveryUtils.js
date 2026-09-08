export const formatDeliveryDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

/** Prefer status timestamps; fall back to audit timestamps (snake or camel). */
export const deliveryUpdatedAt = (row) =>
  row?.delivered_at ||
  row?.cancelled_at ||
  row?.picked_up_at ||
  row?.started_at ||
  row?.assigned_at ||
  row?.updated_at ||
  row?.updatedAt ||
  row?.created_at ||
  row?.createdAt ||
  null;

export const shortOrderId = (id) => (id ? String(id).slice(0, 8) : '—');

export const nestedOrder = (row) => row?.order || row?.Order || null;
export const nestedStore = (row) => row?.store || row?.Store || null;
export const nestedRider = (row) => row?.rider || row?.Rider || null;
export const nestedPayments = (row) => nestedOrder(row)?.payments || nestedOrder(row)?.Payments || [];

export const expectedShareCents = (row) => {
  const fee = Number(row.rider_fee_cents) || 0;
  if (fee > 0) return fee;
  return nestedPayments(row).reduce(
    (sum, payment) => sum + Math.max(0, Number(payment.rider_share_cents) || 0),
    0
  );
};

export const walletShareCents = (row) => {
  const payments = nestedPayments(row);
  const credited = payments.some((payment) => payment.rider_wallet_credited_at);
  if (!credited) return 0;
  const fee = Number(row.rider_fee_cents) || 0;
  if (fee > 0) return fee;
  return payments.reduce((sum, payment) => {
    if (!payment.rider_wallet_credited_at) return sum;
    return sum + Math.max(0, Number(payment.rider_share_cents) || 0);
  }, 0);
};

export const isCreditedToWallet = (row) => walletShareCents(row) > 0;

function orderDisplayLabel(order, fallbackId) {
  if (order?.order_number != null && order.order_number !== '') {
    return String(Number(order.order_number));
  }
  return shortOrderId(order?.id || fallbackId);
}

export function normalizeDeliveryRow(row) {
  const order = nestedOrder(row);
  return {
    ...row,
    order_label: orderDisplayLabel(order, row.order_id),
    store_name: nestedStore(row)?.name || '—',
    rider_name: nestedRider(row)?.name || '—'
  };
}
