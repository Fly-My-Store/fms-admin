export const STORE_FIELD_LABELS = {
  name: 'Store name',
  slug: 'Store slug',
  phone: 'Store phone',
  email: 'Store email',
  address_text: 'Address',
  lat: 'Latitude',
  lng: 'Longitude',
  open_time: 'Open time',
  close_time: 'Close time',
  delivery_radius_m: 'Delivery radius',
  fssai_number: 'FSSAI number',
  logo_url: 'Store logo',
  support_email: 'Store support email',
  support_phone: 'Store support phone',
  status: 'Store status',
  kyb_status: 'Store KYB status',
  kyb_reason: 'Store KYB reason',
  record_status: 'Record status',
  'user.name': 'Owner name',
  'user.email': 'Owner email',
  'user.phone': 'Owner phone',
  'seller.legal_name': 'Legal name',
  'seller.display_name': 'Display name',
  'seller.gstin': 'GSTIN',
  'seller.pan': 'PAN',
  'seller.cin': 'CIN',
  'seller.kyc_status': 'Seller KYC status',
  'seller.kyc_reason': 'Seller KYC reason',
  'seller.kyb_status': 'Seller KYB status',
  'seller.kyb_reason': 'Seller KYB reason',
  'seller.support_email': 'Seller support email',
  'seller.support_phone': 'Seller support phone',
  pan: 'PAN',
  gstin: 'GSTIN',
  legal_name: 'Legal name',
  display_name: 'Display name',
};

export function fieldLabel(key) {
  if (!key) return 'Form';
  return STORE_FIELD_LABELS[key] || key.replace(/\./g, ' › ').replace(/_/g, ' ');
}

/**
 * Normalize API validation payloads into { message, errors }.
 * Supports controller `errors` objects and Joi `details` arrays.
 */
export function normalizeValidationErrors(data) {
  if (!data || typeof data !== 'object') {
    return { message: null, errors: {} };
  }

  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    return {
      message: data.message || 'Validation failed',
      errors: data.errors,
    };
  }

  if (Array.isArray(data.details)) {
    const errors = {};
    data.details.forEach((detail) => {
      const key = Array.isArray(detail?.path) ? detail.path.join('.') : 'form';
      if (!errors[key]) {
        errors[key] = detail.message || 'Invalid value';
      }
    });
    return {
      message: data.message === 'ValidationError' ? 'Validation failed' : (data.message || 'Validation failed'),
      errors,
    };
  }

  return {
    message: data.message || null,
    errors: {},
  };
}

export function formatErrorEntries(errors) {
  return Object.entries(errors || {}).map(([key, message]) => ({
    key,
    label: fieldLabel(key),
    message: String(message),
  }));
}

export function buildErrorSummaryMessage(errors, { maxItems = 3 } = {}) {
  const entries = formatErrorEntries(errors);
  if (!entries.length) return null;

  const shown = entries.slice(0, maxItems).map((e) => `${e.label}: ${e.message}`);
  const rest = entries.length - maxItems;
  if (rest > 0) shown.push(`+ ${rest} more`);
  return shown.join(' · ');
}
