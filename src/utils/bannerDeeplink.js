/**
 * Banner destination helpers — build / parse deeplinks for the customer app.
 * Product banners always target a variant (PDP), never a product-details screen.
 */

export const BANNER_DESTINATIONS = [
  { value: 'none', label: 'No link' },
  { value: 'home', label: 'Home' },
  { value: 'screen_guard', label: 'Screen Guard' },
  { value: 'search', label: 'Search' },
  { value: 'category', label: 'Category' },
  { value: 'store', label: 'Store' },
  { value: 'variant', label: 'Variant (product page)' },
  { value: 'variant_store', label: 'Variant at a store' },
  { value: 'custom', label: 'Custom / paste URL' }
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return UUID_RE.test(String(value || '').trim());
}

/**
 * @returns {{
 *   destination: string,
 *   searchQuery?: string,
 *   categorySlug?: string,
 *   storeSlug?: string,
 *   variantId?: string,
 *   storeId?: string,
 *   customUrl?: string,
 * }}
 */
export function parseBannerDeeplink(raw) {
  const value = String(raw || '').trim();
  if (!value) return { destination: 'none' };

  const fms = value.match(/^fms:\/\/([^/?#]+)(?:\/([^/?#]*))?/i);
  if (fms) {
    const head = String(fms[1] || '').toLowerCase();
    const rest = fms[2] ? decodeURIComponent(fms[2]) : '';
    if (head === 'home') return { destination: 'home' };
    if (head === 'sg' || head === 'screenguard' || head === 'screen-guard') {
      return { destination: 'screen_guard' };
    }
    if (head === 'search' && rest) return { destination: 'search', searchQuery: rest };
    if (head === 'category' && rest) return { destination: 'category', categorySlug: rest };
    if (head === 'store' && rest) return { destination: 'store', storeSlug: rest };
    if (head === 'variant' && rest && isUuid(rest)) {
      return { destination: 'variant', variantId: rest };
    }
    // Legacy product links — keep editable as custom (we no longer generate these)
    return { destination: 'custom', customUrl: value };
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'flymystore.com' || host === 'localhost') {
      const parts = url.pathname.split('/').filter(Boolean);
      if ((parts[0] === 'x' || parts[0] === 'xt') && parts[1]) {
        // Share URLs (often variant+store) — treat as custom so we don't lose them on edit
        return { destination: 'custom', customUrl: value };
      }
    }
  } catch {
    // fall through
  }

  return { destination: 'custom', customUrl: value };
}

/**
 * Build a simple fms:// deeplink (not for variant_store — that uses share-link API).
 */
export function buildBannerDeeplink({
  destination,
  searchQuery,
  category,
  store,
  variant,
  customUrl
}) {
  switch (destination) {
    case 'none':
      return null;
    case 'home':
      return 'fms://home';
    case 'screen_guard':
      return 'fms://sg';
    case 'search': {
      const q = String(searchQuery || '').trim();
      if (q.length < 2) return null;
      return `fms://search/${encodeURIComponent(q)}`;
    }
    case 'category': {
      const slug = category?.slug || category?.id;
      if (!slug) return null;
      return `fms://category/${encodeURIComponent(slug)}`;
    }
    case 'store': {
      const slug = store?.slug || store?.id;
      if (!slug) return null;
      return `fms://store/${encodeURIComponent(slug)}`;
    }
    case 'variant': {
      const id = variant?.id;
      if (!id || !isUuid(id)) return null;
      return `fms://variant/${id}`;
    }
    case 'custom': {
      const url = String(customUrl || '').trim();
      return url || null;
    }
    default:
      return null;
  }
}

export function entityOptionLabel(kind, entity) {
  if (!entity) return '';
  if (kind === 'variant') {
    const name = entity?.product?.name || entity?.name || '';
    const sku = entity?.sku ? ` · ${entity.sku}` : '';
    return `${name}${sku}`.trim() || entity.id;
  }
  return entity.name || entity.slug || entity.id;
}
