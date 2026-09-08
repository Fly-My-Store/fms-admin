import { formatINR } from './currency';
import { getOrderCustomerHref, getOrderRiderHref, getOrderStoreHref } from './orderLinks';
import { getOrderEventLabel } from './orderStatusLabels';

const NEARBY_MS = 3 * 60 * 1000;

const ACTOR_LABELS = {
  ADMIN: 'Admin',
  SELLER: 'Seller',
  CUSTOMER: 'Customer',
  RIDER: 'Rider',
  SYSTEM: 'System',
  PLATFORM: 'Platform'
};

const REASON_LABELS = {
  OUT_OF_STOCK: 'Out of stock',
  ITEM_DAMAGED: 'Item damaged',
  STORE_CLOSED: 'Store closed',
  TOO_BUSY: 'Store too busy',
  WRONG_PRICE: 'Wrong price',
  PRESCRIPTION_ISSUE: 'Prescription issue',
  STORE_EMERGENCY: 'Store emergency',
  OTHER: 'Other',
  SELLER_SLA_TIMEOUT: 'Seller did not pack in time',
  RIDER_DISPATCH_TIMEOUT: 'No rider assigned in time'
};

function titleCaseKey(key) {
  return String(key || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

function toMs(value) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function formatDistance(meters) {
  const n = Number(meters);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < 1000) return `${Math.round(n)} m`;
  return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)} km`;
}

function actorLabel(value) {
  if (!value) return null;
  const key = String(value).toUpperCase();
  return ACTOR_LABELS[key] || titleCaseKey(key);
}

function reasonLabel(value) {
  if (!value) return null;
  const key = String(value).toUpperCase();
  return REASON_LABELS[key] || titleCaseKey(key);
}

function riderLabel(order, riderId) {
  const rider = order?.delivery?.rider;
  if (rider && (!riderId || rider.id === riderId)) {
    return [rider.name, rider.phone].filter(Boolean).join(' · ');
  }
  if (riderId) return `Rider ${String(riderId).slice(0, 8)}`;
  return rider?.name || null;
}

function paymentGatewayLabel(gateway) {
  const key = String(gateway || '').toUpperCase();
  if (key === 'COD') return 'Pay on Delivery';
  return key || null;
}

function eventTone(type) {
  const key = String(type || '').toUpperCase();
  if (['ORDER_DELIVERED', 'DELIVERY_COMPLETED', 'PAYMENT_SUCCESS', 'PAYMENT_CAPTURED', 'ORDER_REFUNDED'].includes(key)) {
    return 'success';
  }
  if (['ORDER_CANCELLED', 'PAYMENT_FAILED', 'DELIVERY_FAILED'].includes(key)) return 'error';
  if (key.includes('WALLET')) return 'info';
  return 'default';
}

function eventGroup(type) {
  const key = String(type || '').toUpperCase();
  if (key.startsWith('PAYMENT') || key.includes('WALLET')) return 'Payment';
  if (key === 'ORDER_REFUNDED') return 'Refund';
  if (
    key.startsWith('DELIVERY') ||
    key.startsWith('RIDER') ||
    key === 'ORDER_DISPATCHED' ||
    key === 'REACHED_STORE'
  ) {
    return 'Delivery';
  }
  if (key === 'ORDER_CANCELLED') return 'Cancel';
  return 'Order';
}

function pushUnique(details, line) {
  if (!line) return;
  const text = String(line).trim();
  if (!text) return;
  if (!details.includes(text)) details.push(text);
}

function detailsForEvent(event, order) {
  const type = String(event?.type || '').toUpperCase();
  const payload = event?.payload && typeof event.payload === 'object' ? event.payload : {};
  const details = [];
  const delivery = order?.delivery;

  if (type === 'ORDER_CREATED') {
    pushUnique(details, order?.total_cents != null ? `Total ${formatINR(order.total_cents)}` : null);
    const gateway = order?.payments?.[0]?.gateway;
    pushUnique(details, paymentGatewayLabel(gateway) ? `Payment: ${paymentGatewayLabel(gateway)}` : null);
    pushUnique(details, order?.store?.name ? `Store: ${order.store.name}` : null);
  }

  if (type === 'ORDER_CONFIRMED') {
    pushUnique(details, 'Seller accepted the order');
  }

  if (type === 'ORDER_PACKED') {
    const phase = String(payload.phase || '').toUpperCase();
    if (phase === 'START') pushUnique(details, 'Seller started packing');
    if (phase === 'DONE') pushUnique(details, 'All items packed and ready for pickup');
  }

  if (type === 'DELIVERY_ASSIGNED' || type === 'RIDER_TRIP_STARTED' || type === 'ORDER_DISPATCHED' || type === 'ORDER_DELIVERED' || type === 'DELIVERY_COMPLETED' || type === 'REACHED_STORE') {
    pushUnique(details, riderLabel(order, payload.rider_id));
    pushUnique(details, formatDistance(delivery?.distance_m) ? `Trip ${formatDistance(delivery.distance_m)}` : null);
  }

  if (type === 'RIDER_TRIP_STARTED') {
    pushUnique(details, 'En route to store');
  }

  if (type === 'REACHED_STORE') {
    pushUnique(details, 'Rider arrived at the store');
  }

  if (type === 'ORDER_DISPATCHED') {
    pushUnique(details, 'Out for delivery');
  }

  if (type === 'PAYMENT_SUCCESS' || type === 'PAYMENT_CAPTURED' || type === 'PAYMENT_FAILED') {
    const gateway = paymentGatewayLabel(payload.gateway || payload.payment_gateway || order?.payments?.[0]?.gateway);
    const amount = payload.amount_cents ?? order?.payments?.[0]?.amount_cents ?? order?.total_cents;
    pushUnique(details, [gateway, amount != null ? formatINR(amount) : null].filter(Boolean).join(' · ') || null);
    pushUnique(details, payload.gateway_payment_id || payload.error_description || payload.error_code || null);
  }

  if (type === 'ORDER_CANCELLED') {
    const by = actorLabel(payload.initiated_by);
    pushUnique(details, by ? `${payload.auto ? 'Automatic cancel' : 'Cancelled'} by ${by}` : payload.auto ? 'Automatic cancel' : null);
    pushUnique(details, reasonLabel(payload.reason_code || payload.reason) ? `Reason: ${reasonLabel(payload.reason_code || payload.reason)}` : null);
    pushUnique(details, payload.customer_message);
    const oos = Array.isArray(payload.oos_items)
      ? payload.oos_items.map((item) => item?.name).filter(Boolean)
      : payload.oos_item_names;
    if (Array.isArray(oos) && oos.length) pushUnique(details, `Out of stock: ${oos.join(', ')}`);
    pushUnique(details, payload.charge_bearer ? `Charge bearer: ${actorLabel(payload.charge_bearer)}` : null);
    pushUnique(details, payload.refund_error ? `Refund error: ${payload.refund_error}` : null);
    pushUnique(details, paymentGatewayLabel(payload.payment_gateway));
  }

  if (type === 'ORDER_REFUNDED') {
    pushUnique(details, payload.amount_cents != null ? formatINR(payload.amount_cents) : null);
    pushUnique(details, payload.status ? `Status: ${titleCaseKey(payload.status)}` : null);
    pushUnique(details, payload.reason ? `Reason: ${payload.reason}` : null);
    pushUnique(details, payload.gateway_refund_id ? `Gateway: ${payload.gateway_refund_id}` : null);
  }

  if (type === 'SELLER_WALLET_CREDITED' || type === 'RIDER_WALLET_CREDITED') {
    pushUnique(details, payload.amount_cents != null ? formatINR(payload.amount_cents) : null);
  }

  return details;
}

function linksForEvent(type, order) {
  const key = String(type || '').toUpperCase();
  const links = [];
  const storeHref = getOrderStoreHref(order);
  const riderHref = getOrderRiderHref(order);
  const customerHref = getOrderCustomerHref(order);
  const storeName = order?.store?.name;
  const riderName = order?.delivery?.rider?.name;
  const customerName = order?.customer?.name;

  if (['ORDER_CREATED', 'ORDER_CONFIRMED', 'ORDER_PACKED', 'REACHED_STORE'].includes(key) && storeHref && storeName) {
    links.push({ href: storeHref, label: storeName });
  }
  if (
    ['DELIVERY_ASSIGNED', 'RIDER_TRIP_STARTED', 'ORDER_DISPATCHED', 'ORDER_DELIVERED', 'DELIVERY_COMPLETED', 'REACHED_STORE', 'RIDER_WALLET_CREDITED'].includes(key) &&
    riderHref &&
    riderName
  ) {
    links.push({ href: riderHref, label: riderName });
  }
  if (key === 'ORDER_CREATED' && customerHref && customerName) {
    links.push({ href: customerHref, label: customerName });
  }
  return links;
}

function makeItem({ id, at, type, event, order, title }) {
  const atMs = toMs(at);
  if (atMs == null) return null;
  const links = linksForEvent(type, order);
  const linkLabels = new Set(links.map((link) => link.label));
  const details = detailsForEvent(event || { type, payload: {} }, order).filter(
    (line) => !linkLabels.has(line) && !links.some((link) => line === `Store: ${link.label}`)
  );
  return {
    id,
    at,
    atMs,
    type,
    title: title || getOrderEventLabel(event || { type }),
    details,
    links,
    actor: actorLabel(event?.payload?.initiated_by),
    group: eventGroup(type),
    tone: eventTone(type)
  };
}

function hasNearby(items, types, atMs) {
  if (atMs == null) return false;
  const set = new Set(types.map((t) => String(t).toUpperCase()));
  return items.some((item) => set.has(String(item.type).toUpperCase()) && Math.abs(item.atMs - atMs) <= NEARBY_MS);
}

export function buildOrderTimeline(order) {
  if (!order) return [];

  const events = order.OrderEvents || order.order_events || [];
  const delivery = order.delivery || {};
  const payments = order.payments || [];
  const refunds = payments.flatMap((p) => p.Refunds || p.refunds || []);
  const items = [];

  events.forEach((event, index) => {
    const row = makeItem({
      id: event.id || `event-${index}`,
      at: event.created_at || event.createdAt,
      type: event.type,
      event,
      order
    });
    if (row) items.push(row);
  });

  const milestones = [
    { at: order.placed_at || order.created_at, type: 'ORDER_CREATED' },
    { at: order.confirmed_at, type: 'ORDER_CONFIRMED' },
    { at: order.packed_at, type: 'ORDER_PACKED', event: { type: 'ORDER_PACKED', payload: { phase: 'DONE' } } },
    { at: delivery.assigned_at, type: 'DELIVERY_ASSIGNED', event: { type: 'DELIVERY_ASSIGNED', payload: { rider_id: delivery.rider_id } } },
    { at: delivery.started_at, type: 'RIDER_TRIP_STARTED', event: { type: 'RIDER_TRIP_STARTED', payload: { rider_id: delivery.rider_id } } },
    { at: delivery.reached_store_at, type: 'REACHED_STORE', event: { type: 'REACHED_STORE', payload: { rider_id: delivery.rider_id } } },
    { at: delivery.picked_up_at, type: 'ORDER_DISPATCHED', event: { type: 'ORDER_DISPATCHED', payload: { rider_id: delivery.rider_id } } },
    { at: delivery.delivered_at || order.delivered_at, type: 'ORDER_DELIVERED', event: { type: 'ORDER_DELIVERED', payload: { rider_id: delivery.rider_id } } },
    { at: delivery.cancelled_at || order.cancelled_at, type: 'ORDER_CANCELLED' }
  ];

  milestones.forEach((milestone, index) => {
    const atMs = toMs(milestone.at);
    if (atMs == null) return;
    if (milestone.type === 'ORDER_PACKED') {
      const hasPackedDone = items.some(
        (item) => item.type === 'ORDER_PACKED' && item.title === 'Order packed'
      );
      if (hasPackedDone) return;
    } else if (hasNearby(items, [milestone.type], atMs)) {
      return;
    }
    const row = makeItem({
      id: `milestone-${milestone.type}-${index}`,
      at: milestone.at,
      type: milestone.type,
      event: milestone.event || { type: milestone.type, payload: {} },
      order
    });
    if (row) items.push(row);
  });

  payments.forEach((payment) => {
    const gateway = payment.gateway;
    const status = String(payment.status || '').toUpperCase();
    const capturedAt = payment.captured_at || (status === 'CAPTURED' || status === 'SUCCESS' ? payment.updated_at : null);
    const failedAt = status === 'FAILED' ? payment.updated_at || payment.created_at : null;

    if (capturedAt && !hasNearby(items, ['PAYMENT_SUCCESS', 'PAYMENT_CAPTURED'], toMs(capturedAt))) {
      const row = makeItem({
        id: `payment-${payment.id}`,
        at: capturedAt,
        type: 'PAYMENT_SUCCESS',
        event: {
          type: 'PAYMENT_SUCCESS',
          payload: {
            gateway,
            amount_cents: payment.amount_cents,
            gateway_payment_id: payment.gateway_payment_id
          }
        },
        order
      });
      if (row) items.push(row);
    }

    if (failedAt && !hasNearby(items, ['PAYMENT_FAILED'], toMs(failedAt))) {
      const row = makeItem({
        id: `payment-failed-${payment.id}`,
        at: failedAt,
        type: 'PAYMENT_FAILED',
        event: {
          type: 'PAYMENT_FAILED',
          payload: {
            gateway,
            amount_cents: payment.amount_cents,
            error_code: payment.error_code,
            error_description: payment.error_description
          }
        },
        order
      });
      if (row) items.push(row);
    }

    if (payment.seller_wallet_credited_at) {
      const row = makeItem({
        id: `seller-wallet-${payment.id}`,
        at: payment.seller_wallet_credited_at,
        type: 'SELLER_WALLET_CREDITED',
        event: {
          type: 'SELLER_WALLET_CREDITED',
          payload: {
            amount_cents:
              Number(payment.seller_share_cents) ||
              Number(order?.earnings?.net_payout_cents) ||
              0
          }
        },
        order
      });
      if (row) items.push(row);
    }

    if (payment.rider_wallet_credited_at) {
      const deliveryFee = Number(order?.delivery?.rider_fee_cents) || 0;
      const row = makeItem({
        id: `rider-wallet-${payment.id}`,
        at: payment.rider_wallet_credited_at,
        type: 'RIDER_WALLET_CREDITED',
        event: {
          type: 'RIDER_WALLET_CREDITED',
          payload: {
            amount_cents:
              deliveryFee || Number(payment.rider_share_cents) || Number(order?.rider_share_cents) || 0
          }
        },
        order
      });
      if (row) items.push(row);
    }
  });

  refunds.forEach((refund) => {
    const at = refund.processed_at || refund.updated_at || refund.created_at;
    if (!at || hasNearby(items, ['ORDER_REFUNDED'], toMs(at))) return;
    const row = makeItem({
      id: `refund-${refund.id}`,
      at,
      type: 'ORDER_REFUNDED',
      event: {
        type: 'ORDER_REFUNDED',
        payload: {
          amount_cents: refund.amount_cents,
          status: refund.status,
          reason: refund.reason,
          gateway_refund_id: refund.gateway_refund_id
        }
      },
      order
    });
    if (row) items.push(row);
  });

  items.sort((a, b) => a.atMs - b.atMs || String(a.id).localeCompare(String(b.id)));
  return items;
}
