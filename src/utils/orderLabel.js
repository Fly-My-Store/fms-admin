/**
 * Prefer sequential order_number; fall back to UUID slice until backfill.
 */
export function formatOrderLabel(orderOrId, { prefix = 'Order #' } = {}) {
  if (orderOrId == null) return `${prefix}—`;
  if (typeof orderOrId === 'object') {
    const n = orderOrId.order_number;
    if (n != null && n !== '' && Number.isFinite(Number(n))) {
      return `${prefix}${Number(n)}`;
    }
    const id = orderOrId.id;
    if (id) return `${prefix}${String(id).slice(0, 8)}`;
    return `${prefix}—`;
  }
  return `${prefix}${String(orderOrId).slice(0, 8)}`;
}

export function formatOrderNumberOnly(orderOrId) {
  if (orderOrId == null) return '—';
  if (typeof orderOrId === 'object') {
    const n = orderOrId.order_number;
    if (n != null && n !== '' && Number.isFinite(Number(n))) return String(Number(n));
    return orderOrId.id ? String(orderOrId.id).slice(0, 8) : '—';
  }
  return String(orderOrId).slice(0, 8);
}
