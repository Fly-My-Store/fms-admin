/** Client-side promotion form validation for admin (aligned with backend Joi). */

const CODE_RE = /^[A-Z0-9_-]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Admin caps — looser than seller app; still guards obvious mistakes. */
export const ADMIN_PROMO_LIMITS = Object.freeze({
  TITLE_MIN: 3,
  TITLE_MAX: 255,
  DESC_MAX: 2000,
  CODE_MIN: 3,
  CODE_MAX: 64,
  PERCENT_MIN: 1,
  PERCENT_MAX: 100,
  FLAT_RUPEES_MIN: 1,
  FLAT_RUPEES_MAX: 100000,
  MAX_DISCOUNT_CAP_RUPEES_MAX: 100000,
  MIN_CART_RUPEES_MAX: 1000000,
  MAX_TOTAL_USES_MAX: 1000000,
  MAX_USES_PER_USER_MAX: 1000,
  MAX_TARGETS: 50,
  MAX_DURATION_DAYS: 730
});

const FIELD_MAP = Object.freeze({
  title: 'title',
  description: 'description',
  code: 'code',
  discount_type: 'discount_type',
  discount_value: 'discount_value',
  max_discount_cents: 'max_discount_rupees',
  max_discount_rupees: 'max_discount_rupees',
  visibility: 'visibility',
  funding: 'funding',
  status: 'status',
  store_id: 'store_id',
  min_cart_cents: 'min_cart_rupees',
  min_cart_rupees: 'min_cart_rupees',
  max_total_uses: 'max_total_uses',
  max_uses_per_user: 'max_uses_per_user',
  starts_at: 'starts_at',
  ends_at: 'ends_at',
  targets: 'targets'
});

function parseRupees(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n;
}

function parseIntField(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

function parseDatetimeLocal(value) {
  const s = String(value || '').trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

/**
 * @returns {{ ok: true } | { ok: false, errors: Record<string, string>, message: string }}
 */
export function validateAdminPromotionForm(form, { mode = 'create' } = {}) {
  const errors = {};
  const L = ADMIN_PROMO_LIMITS;
  const isEdit = mode === 'edit';

  const title = String(form.title || '').trim();
  if (!title) errors.title = 'Title is required';
  else if (title.length < L.TITLE_MIN) errors.title = `Title must be at least ${L.TITLE_MIN} characters`;
  else if (title.length > L.TITLE_MAX) errors.title = `Title must be at most ${L.TITLE_MAX} characters`;

  const description = String(form.description || '');
  if (description.length > L.DESC_MAX) {
    errors.description = `Description must be at most ${L.DESC_MAX} characters`;
  }

  const code = String(form.code || '')
    .trim()
    .toUpperCase();
  if (code) {
    if (code.length < L.CODE_MIN || code.length > L.CODE_MAX) {
      errors.code = `Code must be ${L.CODE_MIN}–${L.CODE_MAX} characters`;
    } else if (!CODE_RE.test(code)) {
      errors.code = 'Code can only use A–Z, 0–9, _ and -';
    }
  }

  if (!['PERCENT', 'FLAT', 'FREE_DELIVERY'].includes(form.discount_type)) {
    errors.discount_type = 'Select a discount type';
  }

  const type = form.discount_type;
  if (type === 'PERCENT') {
    const pct = parseIntField(form.discount_value);
    if (pct == null || pct < L.PERCENT_MIN || pct > L.PERCENT_MAX) {
      errors.discount_value = `Percent must be ${L.PERCENT_MIN}–${L.PERCENT_MAX}`;
    }
    const cap = parseRupees(form.max_discount_rupees);
    if (form.max_discount_rupees !== '' && form.max_discount_rupees != null) {
      if (cap == null || cap <= 0) {
        errors.max_discount_rupees = 'Enter a valid max discount amount';
      } else if (cap > L.MAX_DISCOUNT_CAP_RUPEES_MAX) {
        errors.max_discount_rupees = `Max discount cap cannot exceed ₹${L.MAX_DISCOUNT_CAP_RUPEES_MAX}`;
      }
    }
  } else if (type === 'FLAT') {
    const flat = parseRupees(form.discount_value);
    if (flat == null || flat < L.FLAT_RUPEES_MIN) {
      errors.discount_value = `Flat amount must be at least ₹${L.FLAT_RUPEES_MIN}`;
    } else if (flat > L.FLAT_RUPEES_MAX) {
      errors.discount_value = `Flat amount cannot exceed ₹${L.FLAT_RUPEES_MAX}`;
    }
  }

  const minCart = parseRupees(form.min_cart_rupees === '' ? '0' : form.min_cart_rupees);
  if (minCart == null || minCart < 0) {
    errors.min_cart_rupees = 'Min cart must be 0 or more';
  } else if (minCart > L.MIN_CART_RUPEES_MAX) {
    errors.min_cart_rupees = `Min cart cannot exceed ₹${L.MIN_CART_RUPEES_MAX}`;
  } else if (type === 'FLAT') {
    const flat = parseRupees(form.discount_value);
    if (flat != null && minCart > 0 && minCart < flat) {
      errors.min_cart_rupees = 'Min cart should be at least the flat discount amount';
    }
  }

  const maxTotal = parseIntField(form.max_total_uses);
  if (form.max_total_uses !== '' && form.max_total_uses != null) {
    if (maxTotal == null || maxTotal < 1) {
      errors.max_total_uses = 'Max total uses must be at least 1';
    } else if (maxTotal > L.MAX_TOTAL_USES_MAX) {
      errors.max_total_uses = `Max total uses cannot exceed ${L.MAX_TOTAL_USES_MAX}`;
    }
  }

  const maxPerUser = parseIntField(form.max_uses_per_user);
  if (form.max_uses_per_user !== '' && form.max_uses_per_user != null) {
    if (maxPerUser == null || maxPerUser < 1) {
      errors.max_uses_per_user = 'Max uses per user must be at least 1';
    } else if (maxPerUser > L.MAX_USES_PER_USER_MAX) {
      errors.max_uses_per_user = `Max uses per user cannot exceed ${L.MAX_USES_PER_USER_MAX}`;
    }
  }

  if (maxTotal != null && maxPerUser != null && maxPerUser > maxTotal) {
    errors.max_uses_per_user = 'Per-user uses cannot exceed max total uses';
  }

  if (form.funding === 'SELLER' && !form.store_id) {
    errors.store_id = 'Select a store when funding is Seller';
  }

  const starts = parseDatetimeLocal(form.starts_at);
  if (form.starts_at?.trim() && starts === undefined) {
    errors.starts_at = 'Enter a valid start date/time';
  }

  const ends = parseDatetimeLocal(form.ends_at);
  if (form.ends_at?.trim() && ends === undefined) {
    errors.ends_at = 'Enter a valid end date/time';
  }

  if (starts && ends && ends < starts) {
    errors.ends_at = 'End must be on or after start';
  }

  if (ends) {
    if (!isEdit && ends.getTime() < Date.now()) {
      errors.ends_at = 'End cannot be in the past';
    }
    const rangeStart = starts || new Date();
    const maxFromStart = new Date(rangeStart);
    maxFromStart.setDate(maxFromStart.getDate() + L.MAX_DURATION_DAYS);
    if (ends > maxFromStart) {
      errors.ends_at = `Duration cannot exceed ${L.MAX_DURATION_DAYS} days`;
    }
  }

  const targets = Array.isArray(form.targets) ? form.targets : [];
  if (targets.length > L.MAX_TARGETS) {
    errors.targets = `You can add at most ${L.MAX_TARGETS} targets`;
  } else {
    const incomplete = targets.some((t) => {
      const hasType = Boolean(t?.target_type);
      const id = String(t?.target_id || '').trim();
      return hasType && !id;
    });
    if (incomplete) {
      errors.targets = 'Each target needs a selected brand, category, product, or variant';
    } else {
      const badId = targets.find((t) => {
        const id = String(t?.target_id || '').trim();
        return id && !UUID_RE.test(id);
      });
      if (badId) {
        errors.targets = 'Each target must be a valid selection';
      }
    }
  }

  const keys = Object.keys(errors);
  if (!keys.length) return { ok: true };

  return {
    ok: false,
    errors,
    message: errors[keys[0]]
  };
}

/** Map API / Joi field keys onto admin form field names. */
export function mapAdminPromotionApiErrors(apiErrors) {
  if (!apiErrors || typeof apiErrors !== 'object') return {};
  const out = {};
  for (const [rawKey, rawMsg] of Object.entries(apiErrors)) {
    const key = FIELD_MAP[String(rawKey).split('.')[0]] || rawKey;
    let msg = String(rawMsg || '').trim();
    if (!msg) continue;
    msg = msg.replace(/^"[^"]+"\s*/i, '');
    if (msg) msg = msg.charAt(0).toUpperCase() + msg.slice(1);
    if (!out[key]) out[key] = msg;
  }
  return out;
}

export function firstAdminPromotionError(errors, fallback = 'Please fix the highlighted fields') {
  if (!errors || typeof errors !== 'object') return fallback;
  const first = Object.values(errors).find((v) => typeof v === 'string' && v.trim());
  return first || fallback;
}

export function percentDiscountHint() {
  return `Allowed ${ADMIN_PROMO_LIMITS.PERCENT_MIN}–${ADMIN_PROMO_LIMITS.PERCENT_MAX}%`;
}

export function flatDiscountHint() {
  return `Allowed ₹${ADMIN_PROMO_LIMITS.FLAT_RUPEES_MIN}–₹${ADMIN_PROMO_LIMITS.FLAT_RUPEES_MAX}`;
}
