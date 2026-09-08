const ORDER_LABELS = {
  CREATED: 'Created',
  CONFIRMED: 'Confirmed',
  PACKING: 'Packing',
  PACKED: 'Packed',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded'
};

const DELIVERY_LABELS = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  STARTED: 'Rider en route to store',
  REACHED_STORE: 'Reached store',
  PICKED_UP: 'Picked up',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed'
};

const PAYMENT_LABELS = {
  PENDING: 'Pending',
  SUCCESS: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  CANCELLED: 'Not collected'
};

const ORDER_EVENT_LABELS = {
  ORDER_CREATED: 'Order placed',
  ORDER_CONFIRMED: 'Order confirmed',
  ORDER_PACKED: 'Order packed',
  ORDER_DISPATCHED: 'Picked up from store',
  ORDER_DELIVERED: 'Delivered',
  ORDER_CANCELLED: 'Order cancelled',
  ORDER_REFUNDED: 'Refund processed',
  PAYMENT_SUCCESS: 'Payment received',
  PAYMENT_FAILED: 'Payment failed',
  DELIVERY_ASSIGNED: 'Rider assigned',
  RIDER_TRIP_STARTED: 'Rider started trip',
  DELIVERY_COMPLETED: 'Delivery completed',
  DELIVERY_FAILED: 'Delivery failed',
  REACHED_STORE: 'Reached store',
  PAYMENT_CAPTURED: 'Payment captured',
  SELLER_WALLET_CREDITED: 'Seller wallet credited',
  RIDER_WALLET_CREDITED: 'Rider wallet credited'
};

function humanizeStatusKey(key) {
  return String(key || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function getOrderStatusLabel(status) {
  if (!status) return '';
  return ORDER_LABELS[String(status).toUpperCase()] ?? status;
}

export function getDeliveryStatusLabel(status) {
  if (!status) return '';
  return DELIVERY_LABELS[String(status).toUpperCase()] ?? status;
}

export function getPaymentStatusLabel(status, { gateway } = {}) {
  if (!status) return '';
  const key = String(status).toUpperCase();
  const isCod = String(gateway || '').toUpperCase() === 'COD';
  if (isCod && key === 'PENDING') return 'Pay on Delivery · collect';
  if (isCod && key === 'SUCCESS') return 'Pay on Delivery · paid';
  if (isCod && key === 'CANCELLED') return 'Pay on Delivery · not collected';
  return PAYMENT_LABELS[key] ?? status;
}

export function getOrderPaymentStatusLabel(order) {
  const gateway = order?.payments?.[0]?.gateway || order?.payment_gateway || null;
  return getPaymentStatusLabel(order?.payment_status, { gateway });
}

export function getOrderEventLabel(event) {
  const type = String(event?.type || '').toUpperCase();
  if (!type) return 'Event';

  if (type === 'ORDER_PACKED') {
    const phase = String(event?.payload?.phase || '').toUpperCase();
    if (phase === 'START') return 'Packing started';
    if (phase === 'DONE') return 'Order packed';
  }

  if (type === 'PAYMENT_SUCCESS') {
    const gateway = String(event?.payload?.gateway || event?.payload?.payment_gateway || '').toUpperCase();
    if (gateway === 'COD') return 'Pay on Delivery collected';
  }

  return ORDER_EVENT_LABELS[type] ?? humanizeStatusKey(type);
}

export function statusChipColor(value) {
  const key = String(value || '').toUpperCase();
  if (['DELIVERED', 'SUCCESS', 'CAPTURED', 'PAID'].includes(key)) return 'success';
  if (['CANCELLED', 'FAILED', 'REFUNDED'].includes(key)) return 'error';
  if (['PENDING', 'CREATED'].includes(key)) return 'warning';
  return 'default';
}
