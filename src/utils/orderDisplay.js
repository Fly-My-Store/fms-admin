export function formatAddressLine(address) {
  if (!address) return '—';
  const primary = [address.line1, address.line2].filter(Boolean).join(', ');
  const area =
    address.formatted_address || [address.city, address.state, address.postal_code].filter(Boolean).join(', ');
  const parts = [primary, area].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

export function formatReceiverLine(order) {
  const contact = order?.delivery_contact;
  if (contact?.name || contact?.phone) {
    return [contact.name, contact.phone].filter(Boolean).join(' · ');
  }
  const addr = order?.delivery_address;
  if (addr?.receiver_name || addr?.phone) {
    return [addr.receiver_name, addr.phone].filter(Boolean).join(' · ');
  }
  return null;
}

export function getOrderItemName(item) {
  const snap = item?.snapshot || {};
  return (
    snap.product_name ||
    item?.store_variant?.product_variant?.product?.name ||
    item?.store_variant?.product_variant?.sku ||
    'Item'
  );
}

export function getOrderItemVariantLabel(item) {
  const snap = item?.snapshot || {};
  if (snap.variant_display) return snap.variant_display;
  const sig = item?.store_variant?.product_variant?.option_signature;
  if (!sig) return null;
  return String(sig)
    .split('|')
    .map((kv) => kv.split('='))
    .filter(([k, v]) => k && v)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}

export function parsePrescriptionUrls(raw) {
  if (raw == null || raw === '') return [];
  const s = String(raw).trim();
  if (!s) return [];
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => {
            if (typeof item === 'string') return item.trim();
            if (item && typeof item.url === 'string') return item.url.trim();
            return '';
          })
          .filter(Boolean);
      }
    } catch {
      /* fall through */
    }
  }
  return [s];
}

export function formatDistance(meters) {
  const n = Number(meters);
  if (!Number.isFinite(n) || n < 0) return '—';
  if (n < 1000) return `${Math.round(n)} m`;
  return `${(n / 1000).toFixed(1)} km`;
}
