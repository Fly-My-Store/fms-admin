const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function storeAvailabilityLabel(store) {
  if (!store) return '—';
  if (store.availability_label) return store.availability_label;
  if (store.accepting_orders ?? store.is_open) return 'Open for orders';
  return 'Closed for orders';
}

/** Whether admin may open this store (verification + ACTIVE). Close is always allowed. */
export function canAdminOpenStore(store) {
  if (!store) return false;
  if (String(store.status || '').toUpperCase() !== 'ACTIVE') return false;
  const seller = store.seller || {};
  return (
    seller.kyc_status === 'APPROVED'
    && seller.kyb_status === 'APPROVED'
    && store.kyb_status === 'APPROVED'
  );
}

export function adminOpenBlockedReason(store) {
  if (!store) return 'Store not found';
  if (String(store.status || '').toUpperCase() !== 'ACTIVE') {
    return 'Store must be ACTIVE before it can accept orders';
  }
  const seller = store.seller || {};
  const pending = [];
  if (seller.kyc_status !== 'APPROVED') pending.push('seller KYC');
  if (seller.kyb_status !== 'APPROVED') pending.push('seller KYB');
  if (store.kyb_status !== 'APPROVED') pending.push('store KYB');
  if (!pending.length) return null;
  return `Complete ${pending.join(', ')} before opening`;
}

/** Per-day schedule lines (Mon→Sun). Sellers may set different hours each day. */
export function formatWeeklyHoursLines(weeklyHours, fallbackOpen, fallbackClose) {
  const order = [1, 2, 3, 4, 5, 6, 0]; // Mon → Sun
  if (!weeklyHours || typeof weeklyHours !== 'object') {
    if (fallbackOpen && fallbackClose) {
      return order.map((i) => ({
        key: String(i),
        label: DAY_LABELS[i],
        text: `${fallbackOpen} – ${fallbackClose}`,
        closed: false,
      }));
    }
    return [];
  }
  return order.map((i) => {
    const day = weeklyHours[String(i)] ?? weeklyHours[i];
    if (day?.open && day?.close) {
      let text = `${day.open} – ${day.close}`;
      if (day.break_start && day.break_end) {
        text += ` · break ${day.break_start}–${day.break_end}`;
      }
      return {key: String(i), label: DAY_LABELS[i], text, closed: false};
    }
    return {key: String(i), label: DAY_LABELS[i], text: 'Closed', closed: true};
  });
}

/** @deprecated prefer formatWeeklyHoursLines for per-day schedules */
export function formatWeeklyHoursSummary(weeklyHours, fallbackOpen, fallbackClose) {
  const lines = formatWeeklyHoursLines(weeklyHours, fallbackOpen, fallbackClose);
  if (!lines.length) return null;
  return lines.map((l) => `${l.label} ${l.text}`).join(' · ');
}

export function toggleConfirmMessage(store, wantsOpen) {
  const label = storeAvailabilityLabel(store);
  const nextHint = store?.availability_next_at
    ? new Date(store.availability_next_at).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;
  if (wantsOpen) {
    return nextHint
      ? `Open store until ${nextHint}? This uses the full remaining schedule window.`
      : 'Open store for the full remaining schedule window?';
  }
  return nextHint
    ? `Close store until ${nextHint}? This uses the full remaining schedule window.`
    : `Close store until the next scheduled open? (Currently: ${label})`;
}
