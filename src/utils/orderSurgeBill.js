import { SURGE_SCOPE_LABELS } from './surgeLabels';

const SURGE_BILL_ORDER = [
  'DELIVERY_FEE',
  'GATEWAY_FEE',
  'SERVICE_FEE',
  'PLATFORM_FEE',
  'CART',
  'ITEM'
];

const FALLBACK_SCOPE_LABEL = Object.freeze({
  DELIVERY_FEE: 'Peak charge on delivery',
  GATEWAY_FEE: 'Peak charge on payment gateway',
  SERVICE_FEE: 'Peak charge on service fee',
  PLATFORM_FEE: 'Peak charge on platform fee',
  CART: 'Peak charge on items',
  ITEM: 'Peak charge on items'
});

export function getAppliedSurgesFromOrder(order) {
  const list =
    order?.pricing?.applied_surges ||
    order?.pricing_snapshot?.applied_surges ||
    order?.applied_surges ||
    [];
  return Array.isArray(list) ? list : [];
}

function centsForBeneficiary(surge, beneficiary) {
  if (beneficiary === 'SELLER') {
    return Number(surge?.seller_surge_cents ?? 0);
  }
  if (beneficiary === 'RIDER') {
    return Number(surge?.rider_surge_cents ?? 0);
  }
  // Customer bill: full amount charged for this surge.
  return Number(surge?.surge_cents || 0);
}

function labelForSurge(surge, scope) {
  const title = String(surge?.title || '')
    .trim()
    .replace(/^\[QA\]\s*/i, '');
  if (title) return title;
  return FALLBACK_SCOPE_LABEL[scope] || `Peak · ${SURGE_SCOPE_LABELS[scope] || scope}`;
}

/**
 * Peak / surge bill rows for admin order perspectives.
 * @param {object} order
 * @param {{ beneficiary?: 'SELLER' | 'RIDER' | null }} [opts]
 *   - null/undefined: all surges the customer paid (customer view)
 *   - SELLER / RIDER: only that beneficiary's share, by scope
 */
export function getOrderSurgeBillLines(order, { beneficiary = null } = {}) {
  const filterBen = beneficiary ? String(beneficiary).toUpperCase() : null;
  const totals = new Map();
  const labels = new Map();

  for (const surge of getAppliedSurgesFromOrder(order)) {
    const ben = String(surge?.surge_beneficiary || 'PLATFORM').toUpperCase();
    if (filterBen && ben !== filterBen) continue;
    const scope = String(surge?.scope || '').toUpperCase();
    const cents = centsForBeneficiary(surge, filterBen);
    if (!scope || cents <= 0) continue;
    totals.set(scope, Number(totals.get(scope) || 0) + cents);
    if (!labels.has(scope)) labels.set(scope, labelForSurge(surge, scope));
  }

  const lines = [];
  for (const scope of SURGE_BILL_ORDER) {
    const cents = Number(totals.get(scope) || 0);
    if (cents <= 0) continue;
    lines.push({
      scope,
      label: labels.get(scope) || FALLBACK_SCOPE_LABEL[scope] || scope,
      cents
    });
    totals.delete(scope);
  }
  for (const [scope, cents] of totals.entries()) {
    if (cents <= 0) continue;
    lines.push({
      scope,
      label: labels.get(scope) || FALLBACK_SCOPE_LABEL[scope] || scope,
      cents
    });
  }

  if (lines.length) return lines;

  // Legacy / missing applied_surges: fall back to totals on the perspective DTOs.
  if (!filterBen) {
    const surgeCents = Number(order?.pricing?.surge_cents || order?.surge_cents || 0);
    if (surgeCents > 0) return [{ scope: 'TOTAL', label: 'Peak charge', cents: surgeCents }];
  } else if (filterBen === 'SELLER') {
    const surgeCents = Number(order?.earnings?.seller_surge_cents || 0);
    if (surgeCents > 0) return [{ scope: 'TOTAL', label: 'Peak charge', cents: surgeCents }];
  } else if (filterBen === 'RIDER') {
    const surgeCents = Number(order?.rider_view?.rider_surge_cents || 0);
    if (surgeCents > 0) return [{ scope: 'TOTAL', label: 'Peak charge', cents: surgeCents }];
  }
  return [];
}
