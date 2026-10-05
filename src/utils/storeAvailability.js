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

export function formatWeeklyHoursSummary(weeklyHours, fallbackOpen, fallbackClose) {
  if (!weeklyHours || typeof weeklyHours !== 'object') {
    if (fallbackOpen && fallbackClose) return `${fallbackOpen} – ${fallbackClose} (all days)`;
    return null;
  }
  const openDays = [];
  let sample = null;
  for (let i = 0; i <= 6; i += 1) {
    const day = weeklyHours[String(i)] ?? weeklyHours[i];
    if (day?.open && day?.close) {
      openDays.push(DAY_LABELS[i]);
      if (!sample) sample = day;
    }
  }
  if (!sample) return 'No open days';
  let line = `${openDays.join(', ')} ${sample.open} – ${sample.close}`;
  if (sample.break_start && sample.break_end) {
    line += ` · break ${sample.break_start}–${sample.break_end}`;
  }
  return line;
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
