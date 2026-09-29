import { formatINR } from './currency';
import { getOrderItemName, getOrderItemVariantLabel } from './orderDisplay';

const PARTIAL_REASON_LABELS = {
  OUT_OF_STOCK: 'Out of stock',
  ITEM_DAMAGED: 'Item damaged',
  WRONG_PRICE: 'Wrong price listed'
};

export function getPartialReasonLabel(code) {
  if (!code) return null;
  const key = String(code).toUpperCase();
  return PARTIAL_REASON_LABELS[key] || key.replace(/_/g, ' ');
}

function itemDisplayName(item) {
  const name = getOrderItemName(item);
  const variant = getOrderItemVariantLabel(item);
  return variant ? `${name} · ${variant}` : name;
}

function isCodOrder(order) {
  const gateway = order?.payments?.[0]?.gateway || order?.payment_gateway || null;
  return String(gateway || '').toUpperCase() === 'COD';
}

/**
 * Admin summary for partial-order opt-in / adjustment on order detail.
 * @returns {{
 *   allowPartial: boolean,
 *   adjusted: boolean,
 *   reasonLabel: string|null,
 *   note: string|null,
 *   adjustedAt: string|null,
 *   removedCount: number,
 *   remainingCount: number,
 *   originalTotalCents: number,
 *   newTotalCents: number,
 *   refundCents: number,
 *   isCod: boolean,
 *   deferredRefund: boolean,
 * }|null}
 */
export function buildAdminPartialOrderView(order) {
  if (!order) return null;

  const allowPartial = Boolean(order.allow_partial);
  const adjusted = Boolean(order.partial_adjusted_at);
  if (!allowPartial && !adjusted) return null;

  const allItems = Array.isArray(order.order_items) ? order.order_items : [];
  const removedCount = allItems.filter((it) => it?.removed_at).length;
  const remainingCount = allItems.filter((it) => !it?.removed_at).length;

  const snapAdj = order?.pricing_snapshot?.partial_adjustment || {};
  const reasonLabel =
    getPartialReasonLabel(snapAdj.reason_code)
    || (adjusted
      ? getPartialReasonLabel(allItems.find((it) => it?.removed_at)?.removal_reason)
      : null);
  const note = snapAdj.note ? String(snapAdj.note).trim() : null;

  const originalTotalCents = Number(
    order.original_total_cents
      ?? snapAdj.original_customer_total_cents
      ?? order.pricing_snapshot?.original_customer_total_cents
      ?? 0
  );
  const newTotalCents = Number(order.total_cents) || 0;
  const refundCents = Number(order.partial_refund_cents) || 0;
  const isCod = isCodOrder(order);
  const deferredRefund = adjusted && !isCod && refundCents > 0;

  return {
    allowPartial,
    adjusted,
    reasonLabel,
    note,
    adjustedAt: order.partial_adjusted_at || null,
    removedCount,
    remainingCount,
    originalTotalCents,
    newTotalCents,
    refundCents,
    isCod,
    deferredRefund
  };
}

export function formatPartialAdjustedWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export function buildPartialAdjustedAlertLines(view) {
  if (!view?.adjusted) return [];

  const lines = [];
  let lead = 'Seller removed unavailable items';
  if (view.reasonLabel) lead += ` · ${view.reasonLabel}`;
  lead += '.';
  if (view.remainingCount > 0) {
    lead += ` ${view.remainingCount} item${view.remainingCount === 1 ? '' : 's'} still shipping`;
    if (view.removedCount > 0) {
      lead += ` · ${view.removedCount} unavailable`;
    }
    lead += '.';
  }
  lines.push(lead);

  if (view.adjustedAt) {
    const when = formatPartialAdjustedWhen(view.adjustedAt);
    if (when) lines.push(`Adjusted ${when}`);
  }
  if (view.note) lines.push(`Note: ${view.note}`);

  if (view.originalTotalCents > 0) {
    lines.push(`Order total ${formatINR(view.originalTotalCents)} → ${formatINR(view.newTotalCents)}`);
  }
  if (view.deferredRefund) {
    lines.push(`Customer refund ${formatINR(view.refundCents)} after delivery`);
  } else if (view.isCod && view.originalTotalCents > view.newTotalCents) {
    lines.push('Pay on Delivery total updated — collect the new amount');
  }

  return lines;
}

/** Active lines first, then removed (unavailable). */
export function sortOrderItemsForPartial(items) {
  const list = Array.isArray(items) ? [...items] : [];
  return list.sort((a, b) => {
    const aRem = a?.removed_at ? 1 : 0;
    const bRem = b?.removed_at ? 1 : 0;
    return aRem - bRem;
  });
}

export function itemRemovalReasonLabel(item) {
  return getPartialReasonLabel(item?.removal_reason);
}

export { itemDisplayName };
