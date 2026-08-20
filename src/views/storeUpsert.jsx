'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as sellersStores } from 'store/sellersStores/slice';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import FormErrorsSummary from 'components/FormErrorsSummary';

import { createStore, updateStore } from 'api/sellersStores';
import { buildErrorSummaryMessage, normalizeValidationErrors } from 'utils/formErrors';
import PharmacyLicenseReviewPanel from 'sections/seller-documents/PharmacyLicenseReviewPanel';
import SellerKycDocumentsPanel from 'sections/seller-documents/SellerKycDocumentsPanel';
import StoreLocationPicker from 'sections/stores/StoreLocationPicker';

// MUI
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  LinearProgress
} from '@mui/material';
import Grid from '@mui/material/Grid2';

// -------------------- Constants --------------------
const RECORD_STATUS_LIST = [
  { value: 1, label: 'ACTIVE' },
  { value: 2, label: 'INACTIVE' },
  { value: 3, label: 'ARCHIVED' }
];

const STORE_STATUS = ['ACTIVE', 'INACTIVE'];
const KYB_STATUS = ['NONE', 'PENDING', 'APPROVED', 'REJECTED'];
const KYC_STATUSES = ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMIT'];

// -------------------- Helpers --------------------
function toNumOrNull(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pick(obj, keys) {
  const out = {};
  keys.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k];
  });
  return out;
}

// Format time value for Safari compatibility (HH:mm format)
function formatTimeValue(value) {
  if (!value) return '';
  const str = String(value);
  // If already in HH:mm format, return as is
  if (TIME_RE.test(str)) return str.slice(0, 5);
  // If it's a time string like "09:00:00", extract HH:mm
  const match = str.match(/^(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  return '';
}

// Remove empty/null/undefined values from object (recursively for nested objects)
function removeEmptyFields(obj) {
  if (obj === null || obj === undefined) return undefined;

  if (Array.isArray(obj)) {
    const filtered = obj.map(item => removeEmptyFields(item)).filter(item => item !== undefined);
    return filtered.length > 0 ? filtered : undefined;
  }

  if (typeof obj === 'object') {
    const cleaned = {};
    Object.keys(obj).forEach(key => {
      const value = removeEmptyFields(obj[key]);
      // Keep the field if it has a meaningful value
      // Allow 0, false, and empty arrays/objects that have been cleaned
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    });
    // Return undefined if object is empty, otherwise return cleaned object
    const keys = Object.keys(cleaned);
    return keys.length > 0 ? cleaned : undefined;
  }

  // For primitive values, return undefined if empty string or null
  if (obj === '' || obj === null) return undefined;
  // Keep 0, false, and other falsy but valid values
  return obj;
}

// -------------------- Regex validation constants --------------------
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s]{7,20}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;

// -------------------- Empty form --------------------
const EMPTY = {
  // Store
  id: '',
  name: '',
  slug: '',
  phone: '',
  email: '',
  address_text: '',
  lat: '',
  lng: '',
  open_time: '', // HH:mm
  close_time: '', // HH:mm
  is_open: 'true', // keep as string for select binding, coerce on submit
  delivery_radius_m: 5000,
  code: '',
  support_email: '',
  support_phone: '',
  status: 'ACTIVE',
  kyb_status: 'NONE',
  kyb_reason: '',
  record_status: 1,

  // Seller (business) nested
  seller: {
    id: '', // optional when editing existing seller
    legal_name: '',
    display_name: '',
    gstin: '',
    pan: '',
    cin: '',
    kyb_status: 'PENDING',
    kyb_reason: '',
    kyc_status: 'PENDING',
    kyc_reason: '',
    support_email: '',
    support_phone: '',
    cod_enabled: false,
    can_sell_screen_guard: false,
    is_pharmacy: false
  },

  // Seller owner user nested
  user: {
    id: '', // optional when editing existing owner
    name: '',
    email: '',
    phone: ''
  }
};

export default function StoreUpsert() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  // detail from store
  const { storeDetail } = useSelector((s) => s.sellersStores || {});
  const detail = storeDetail || { data: null, loading: false, error: null };
  const data = detail.data;
  const loading = detail.loading;
  const error = detail.error;

  const [form, setForm] = useState({ ...EMPTY });
  const [errors, setErrors] = useState({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);

  // Reset form when id is cleared (navigating to create)
  useEffect(() => {
    if (!id) {
      setForm({ ...EMPTY });
      setErrors({});
      setSlugManuallyEdited(false);
      setCodeManuallyEdited(false);
    }
  }, [id]);

  // fetch detail for edit
  useEffect(() => {
    if (!id) return;
    dispatch(sellersStores.storesGetRequest({ params: { id } }));
  }, [dispatch, id]);

  // hydrate when loaded
  useEffect(() => {
    if (!id || !data) return;

    // Safely extract nested seller & user (might be null)
    const seller = data.seller || {};
    const user = (seller && seller.user) || {};

    // Reset manual edit flags when loading existing data
    // Don't auto-generate slug/code for existing records
    setSlugManuallyEdited(true);
    setCodeManuallyEdited(true);

    setForm((prev) => ({
      ...prev,
      id: data.id || '',
      name: data.name || '',
      slug: data.slug || '',
      phone: data.phone || '',
      email: data.email || '',
      address_text: data.address_text || '',
      lat: data.lat ?? '',
      lng: data.lng ?? '',
      open_time: formatTimeValue(data.open_time),
      close_time: formatTimeValue(data.close_time),
      is_open: String(Boolean(data.is_open)),
      delivery_radius_m: data.delivery_radius_m ?? 5000,
      code: data.code || '',
      support_email: data.support_email || '',
      support_phone: data.support_phone || '',
      kyb_status: data.kyb_status || 'NONE',
      kyb_reason: data.kyb_reason || '',
      record_status: data.record_status ?? 1,
      seller: {
        id: seller.id || '',
        legal_name: seller.legal_name || '',
        display_name: seller.display_name || '',
        gstin: seller.gstin || '',
        pan: seller.pan || '',
        cin: seller.cin || '',
        kyb_status: seller.kyb_status || 'PENDING',
        kyb_reason: seller.kyb_reason || '',
        kyc_status: seller.kyc_status || 'PENDING',
        kyc_reason: seller.kyc_reason || '',
        support_email: seller.support_email || '',
        support_phone: seller.support_phone || '',
        cod_enabled: Boolean(seller.cod_enabled),
        can_sell_screen_guard: Boolean(seller.can_sell_screen_guard),
        is_pharmacy: Boolean(seller.is_pharmacy)
      },
      user: {
        id: user.id || '',
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }
    }));
  }, [data, id]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const clearError = (path) => setErrors((prev) => {
    if (!prev || !prev[path]) return prev;
    const copy = { ...prev };
    delete copy[path];
    return copy;
  });
  const handleField = (name, value) => {
    // Format time fields for Safari compatibility
    if (name === 'open_time' || name === 'close_time') {
      value = formatTimeValue(value);
    }

    // Auto-generate slug from name when name changes (if slug hasn't been manually edited)
    if (name === 'name') {
      setForm((prev) => {
        const updated = { ...prev, [name]: value };
        if (!slugManuallyEdited && value) {
          const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          updated.slug = slug;
        }
        // Auto-generate code from name (if code hasn't been manually edited)
        if (!codeManuallyEdited && value) {
          const namePart = value.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
          // Use a consistent random part based on name length for same name
          const randomPart = Math.floor(100 + Math.random() * 900);
          updated.code = `${namePart || 'STR'}-${randomPart}`;
        }
        return updated;
      });
    } else if (name === 'slug') {
      // Track manual slug edits
      setSlugManuallyEdited(true);
      setForm((p) => ({ ...p, [name]: value }));
    } else if (name === 'code') {
      // Track manual code edits
      setCodeManuallyEdited(true);
      setForm((p) => ({ ...p, [name]: value }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }

    clearError(name);
  };
  const handleSellerField = (name, value) => {
    setForm((p) => ({ ...p, seller: { ...(p.seller || {}), [name]: value } }));
    clearError(`seller.${name}`);
  };
  const handleUserField = (name, value) => {
    setForm((p) => ({ ...p, user: { ...(p.user || {}), [name]: value } }));
    clearError(`user.${name}`);
  };

  // Validation function (pure)
  const validateState = (f) => {
    const e = {};
    const add = (k, msg) => { if (!e[k]) e[k] = msg; };

    // Required: store (only for create)
    if (!id && !String(f.name || '').trim()) add('name', 'Store name is required');
    if (f.name && String(f.name).trim().length < 2) add('name', 'Store name must be at least 2 characters');

    const slugVal = String(f.slug || '').trim();
    if (!id && !slugVal) add('slug', 'Store slug is required');
    if (slugVal && !SLUG_RE.test(slugVal)) add('slug', 'Slug must contain only lowercase letters, numbers, and hyphens');

    // Status enums
    if (f.status && !STORE_STATUS.includes(f.status)) add('status', 'Status must be ACTIVE or INACTIVE');
    if (f.record_status !== undefined && ![1, 2, 3].includes(Number(f.record_status))) add('record_status', 'Invalid record status');

    // Required contact fields
    const email = String(f.email || '').trim();
    if (!email) add('email', 'Email is required');
    if (email && !EMAIL_RE.test(email)) add('email', 'Invalid email format');

    const phone = String(f.phone || '').trim();
    if (!phone) add('phone', 'Phone is required');
    if (phone) {
      const digits = phone.replace(/\D/g, '').length;
      if (!PHONE_RE.test(phone) || digits < 8) add('phone', 'Invalid phone number');
    }

    const sEmail = String(f.support_email || '').trim();
    if (sEmail && !EMAIL_RE.test(sEmail)) add('support_email', 'Invalid support email format');

    const sPhone = String(f.support_phone || '').trim();
    if (sPhone) {
      const digits = sPhone.replace(/\D/g, '').length;
      if (!PHONE_RE.test(sPhone) || digits < 8) add('support_phone', 'Invalid support phone number');
    }

    // Required geo fields
    const lat = f.lat === '' ? null : Number(f.lat);
    const lng = f.lng === '' ? null : Number(f.lng);
    if (lat === null || isNaN(lat)) add('lat', 'Latitude is required');
    if (lng === null || isNaN(lng)) add('lng', 'Longitude is required');
    if (lat !== null && !isNaN(lat) && (lat < -90 || lat > 90)) add('lat', 'Latitude must be between -90 and 90');
    if (lng !== null && !isNaN(lng) && (lng < -180 || lng > 180)) add('lng', 'Longitude must be between -180 and 180');

    // Required address and code
    const addressText = String(f.address_text || '').trim();
    if (!addressText) add('address_text', 'Address is required');

    const code = String(f.code || '').trim();
    if (!code) add('code', 'Code is required');

    const dr = f.delivery_radius_m === '' ? null : Number(f.delivery_radius_m);
    if (dr !== null && (isNaN(dr) || dr < 0)) add('delivery_radius_m', 'Delivery radius must be a positive number');

    // Times (optional)
    const ot = String(f.open_time || '');
    const ct = String(f.close_time || '');
    if (ot && !TIME_RE.test(ot)) add('open_time', 'Open time must be in HH:mm format');
    if (ct && !TIME_RE.test(ct)) add('close_time', 'Close time must be in HH:mm format');

    // Seller fields
    const sel = f.seller || {};

    // Required seller fields - legal_name and display_name are required by database NOT NULL constraint
    // Check if seller data is being provided (not just empty object)
    const hasSellerData = Object.keys(sel).length > 0 && Object.values(sel).some(v => v !== '' && v !== null && v !== undefined);

    if (hasSellerData || !id) {
      // When creating a store or when seller data is provided, these fields are required
      const legalName = String(sel.legal_name || '').trim();
      if (!legalName) {
        add('seller.legal_name', 'Legal name is required');
      }

      const displayName = String(sel.display_name || '').trim();
      if (!displayName) {
        add('seller.display_name', 'Display name is required');
      }
    }

    // GSTIN validation - must be exactly 15 characters if provided
    const gst = String(sel.gstin || '').trim();
    if (gst && gst.length !== 15) {
      add('seller.gstin', 'GSTIN must be exactly 15 characters');
    }

    // PAN validation - must match format if provided
    const pan = String(sel.pan || '').trim();
    if (pan && !PAN_RE.test(pan)) {
      add('seller.pan', 'Invalid PAN format. Expected format: ABCDE1234F');
    }

    // KYB Status validation
    if (sel.kyb_status && !KYB_STATUS.includes(sel.kyb_status)) {
      add('seller.kyb_status', `KYB status must be one of: ${KYB_STATUS.join(', ')}`);
    }

    if (sel.kyc_status && !KYC_STATUSES.includes(sel.kyc_status)) {
      add('seller.kyc_status', `KYC status must be one of: ${KYC_STATUSES.join(', ')}`);
    }

    if (
      (sel.kyc_status === 'REJECTED' || sel.kyc_status === 'RESUBMIT') &&
      !String(sel.kyc_reason || '').trim()
    ) {
      add('seller.kyc_reason', 'KYC reason is required for REJECTED or RESUBMIT status');
    }

    if (sel.kyb_status === 'REJECTED' && !String(sel.kyb_reason || '').trim()) {
      add('seller.kyb_reason', 'Seller KYB reason is required for REJECTED status');
    }

    if (f.kyb_status && !KYB_STATUS.includes(f.kyb_status)) {
      add('kyb_status', `Store KYB status must be one of: ${KYB_STATUS.join(', ')}`);
    }

    if (f.kyb_status === 'REJECTED' && !String(f.kyb_reason || '').trim()) {
      add('kyb_reason', 'Store KYB reason is required for REJECTED status');
    }

    // Support email validation
    const sse = String(sel.support_email || '').trim();
    if (sse && !EMAIL_RE.test(sse)) {
      add('seller.support_email', 'Invalid email format');
    }

    // Support phone validation
    const ssp = String(sel.support_phone || '').trim();
    if (ssp) {
      const digits = ssp.replace(/\D/g, '').length;
      if (!PHONE_RE.test(ssp) || digits < 8) {
        add('seller.support_phone', 'Invalid phone number. Must contain at least 8 digits');
      }
    }

    // Owner user (required for create, optional for update)
    const usr = f.user || {};
    if (!id && !String(usr.name || '').trim()) add('user.name', 'User name is required');
    const ue = String(usr.email || '').trim();
    if (!id && !ue) add('user.email', 'User email is required');
    if (ue && !EMAIL_RE.test(ue)) add('user.email', 'Invalid email format');
    const up = String(usr.phone || '').trim();
    if (up) {
      const digits = up.replace(/\D/g, '').length;
      if (!PHONE_RE.test(up) || digits < 8) add('user.phone', 'Invalid phone number');
    }

    return e;
  };

  // Keep submit-time validator that populates `errors`
  const validateForm = () => validateState(form);

  // ----- Submit -----
  const handleSubmit = async () => {
    try {
      const e = validateForm();
      if (Object.keys(e).length) {
        setErrors(e);
        enqueueSnackbar(buildErrorSummaryMessage(e) || 'Please fix the highlighted fields.', { variant: 'warning' });
        return;
      }
      // Prepare store payload
      const storeKeys = [
        'name',
        'slug',
        'phone',
        'email',
        'address_text',
        'open_time',
        'close_time',
        'code',
        'support_email',
        'support_phone',
        'status',
        'kyb_status',
        'kyb_reason',
        'record_status'
      ];

      // Coerce numeric / boolean fields
      const coerced = {
        ...pick(form, storeKeys),
        lat: toNumOrNull(form.lat),
        lng: toNumOrNull(form.lng),
        delivery_radius_m: toNumOrNull(form.delivery_radius_m),
        is_open: form.is_open === 'true'
      };

      // Seller payload (optional on update; created if missing on create)
      const sellerPayload = pick(form.seller || {}, [
        'id',
        'legal_name',
        'display_name',
        'gstin',
        'pan',
        'cin',
        'kyb_status',
        'kyb_reason',
        'kyc_status',
        'kyc_reason',
        'support_email',
        'support_phone',
        'cod_enabled',
        'can_sell_screen_guard',
        'is_pharmacy'
      ]);
      sellerPayload.cod_enabled = Boolean(form.seller?.cod_enabled);
      sellerPayload.can_sell_screen_guard = Boolean(form.seller?.can_sell_screen_guard);
      sellerPayload.is_pharmacy = Boolean(form.seller?.is_pharmacy);

      // Seller owner user payload
      const userPayload = pick(form.user || {}, ['id', 'name', 'email', 'phone']);

      // Build payload
      const rawPayload = { ...coerced };

      // Only include seller if it has at least one non-empty field
      const hasSellerData = Object.values(sellerPayload).some(val => val !== '' && val !== null && val !== undefined);
      if (hasSellerData) {
        rawPayload.seller = sellerPayload;
      }

      // Always include user on create (required fields validated), only if has data on update
      const hasUserData = Object.values(userPayload).some(val => val !== '' && val !== null && val !== undefined);
      if (!id || hasUserData) {
        rawPayload.user = userPayload;
      }

      // Remove all empty/null/undefined fields recursively
      // This will clean empty strings from nested objects but keep objects with at least one field
      const payload = removeEmptyFields(rawPayload) || {};

      let storeId = id || form.id;
      if (storeId) {
        await updateStore(storeId, payload);
        enqueueSnackbar('Store updated', { variant: 'success' });
      } else {
        await createStore(payload);
        enqueueSnackbar('Store created', { variant: 'success' });
      }
      router.push('/stores');
    } catch (err) {
      const response = err?.response?.data;
      const { message, errors: apiErrors } = normalizeValidationErrors(response);
      if (Object.keys(apiErrors).length) {
        setErrors(apiErrors);
        enqueueSnackbar(buildErrorSummaryMessage(apiErrors) || message || 'Validation failed', { variant: 'error' });
      } else {
        const msg = message || err?.message || 'Something went wrong.';
        enqueueSnackbar(msg, { variant: 'error' });
      }
    }
  };

  const breadcrumb = useMemo(() => {
    const name = form?.name || id || 'new-store';
    return {
      heading: id ? 'update-store' : 'create-store',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'stores', to: '/stores' },
        { title: name, i18n: false }
      ]
    };
  }, [form?.name, id]);

  const verificationChips = useMemo(() => {
    const sel = form.seller || {};
    return [
      { label: `KYC: ${sel.kyc_status || '—'}`, color: sel.kyc_status === 'APPROVED' ? 'success' : 'default' },
      { label: `Seller KYB: ${sel.kyb_status || '—'}`, color: sel.kyb_status === 'APPROVED' ? 'success' : 'default' },
      { label: `Store KYB: ${form.kyb_status || '—'}`, color: form.kyb_status === 'APPROVED' ? 'success' : 'default' },
    ];
  }, [form.kyb_status, form.seller]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      {loading && <LinearProgress sx={{ mb: 1 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{String(error)}</Alert>}
      <FormErrorsSummary errors={errors} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard title="Store details" subheader="Customer-facing store identity and contact">
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Store name"
                  required={!id}
                  fullWidth
                  value={form.name || ''}
                  onChange={(e) => handleField('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name || ''}
                />
                <TextField
                  size="small"
                  label="Slug"
                  required={!id}
                  fullWidth
                  value={form.slug || ''}
                  onChange={(e) => handleField('slug', e.target.value)}
                  error={!!errors.slug}
                  helperText={errors.slug || (slugManuallyEdited ? '' : 'Auto-generated from name')}
                  placeholder="my-store"
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Store code"
                  required
                  fullWidth
                  value={form.code || ''}
                  onChange={(e) => handleField('code', e.target.value)}
                  error={!!errors.code}
                  helperText={errors.code || (codeManuallyEdited ? '' : 'Auto-generated from name')}
                />
                <TextField
                  size="small"
                  label="Phone"
                  required
                  fullWidth
                  value={form.phone || ''}
                  onChange={(e) => handleField('phone', e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone || ''}
                />
              </Stack>
              <TextField
                size="small"
                label="Email"
                type="email"
                required
                fullWidth
                value={form.email || ''}
                onChange={(e) => handleField('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email || ''}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Support email"
                  fullWidth
                  value={form.support_email || ''}
                  onChange={(e) => handleField('support_email', e.target.value)}
                  error={!!errors.support_email}
                  helperText={errors.support_email || ''}
                />
                <TextField
                  size="small"
                  label="Support phone"
                  fullWidth
                  value={form.support_phone || ''}
                  onChange={(e) => handleField('support_phone', e.target.value)}
                  error={!!errors.support_phone}
                  helperText={errors.support_phone || ''}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Open time"
                  type="time"
                  fullWidth
                  value={form.open_time || ''}
                  onChange={(e) => handleField('open_time', e.target.value)}
                  error={!!errors.open_time}
                  helperText={errors.open_time || 'HH:mm'}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  label="Close time"
                  type="time"
                  fullWidth
                  value={form.close_time || ''}
                  onChange={(e) => handleField('close_time', e.target.value)}
                  error={!!errors.close_time}
                  helperText={errors.close_time || 'HH:mm'}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.is_open === 'true'}
                      onChange={(e) => handleField('is_open', e.target.checked ? 'true' : 'false')}
                    />
                  }
                  label="Store is open"
                />
                <TextField
                  select
                  size="small"
                  label="Status"
                  fullWidth
                  value={form.status}
                  onChange={(e) => handleField('status', e.target.value)}
                  error={!!errors.status}
                  helperText={errors.status || ''}
                >
                  {STORE_STATUS.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Record status"
                  fullWidth
                  value={form.record_status}
                  onChange={(e) => handleField('record_status', Number(e.target.value))}
                  error={!!errors.record_status}
                  helperText={errors.record_status || ''}
                >
                  {RECORD_STATUS_LIST.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard title="Location" subheader="Address and map pin for delivery radius">
            <StoreLocationPicker
              address={form.address_text}
              lat={form.lat}
              lng={form.lng}
              deliveryRadiusM={form.delivery_radius_m}
              errors={errors}
              storeName={form.name}
              onAddressChange={(v) => handleField('address_text', v)}
              onLatChange={(v) => handleField('lat', v)}
              onLngChange={(v) => handleField('lng', v)}
              onDeliveryRadiusChange={(v) => handleField('delivery_radius_m', v)}
            />
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard title="Seller" subheader="Business entity linked to this store">
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Legal name"
                  required
                  fullWidth
                  value={form.seller?.legal_name || ''}
                  onChange={(e) => handleSellerField('legal_name', e.target.value)}
                  error={!!errors['seller.legal_name']}
                  helperText={errors['seller.legal_name'] || ''}
                />
                <TextField
                  size="small"
                  label="Display name"
                  required
                  fullWidth
                  value={form.seller?.display_name || ''}
                  onChange={(e) => handleSellerField('display_name', e.target.value)}
                  error={!!errors['seller.display_name']}
                  helperText={errors['seller.display_name'] || ''}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="GSTIN"
                  fullWidth
                  value={form.seller?.gstin || ''}
                  onChange={(e) => handleSellerField('gstin', e.target.value)}
                  error={!!errors['seller.gstin']}
                  helperText={errors['seller.gstin'] || '15 characters'}
                  placeholder="22AAAAA0000A1Z5"
                />
                <TextField
                  size="small"
                  label="PAN"
                  fullWidth
                  value={form.seller?.pan || ''}
                  onChange={(e) => handleSellerField('pan', e.target.value)}
                  error={!!errors['seller.pan']}
                  helperText={errors['seller.pan'] || 'Format: ABCDE1234F'}
                />
                <TextField
                  size="small"
                  label="CIN"
                  fullWidth
                  value={form.seller?.cin || ''}
                  onChange={(e) => handleSellerField('cin', e.target.value)}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Seller support email"
                  fullWidth
                  value={form.seller?.support_email || ''}
                  onChange={(e) => handleSellerField('support_email', e.target.value)}
                  error={!!errors['seller.support_email']}
                  helperText={errors['seller.support_email'] || ''}
                />
                <TextField
                  size="small"
                  label="Seller support phone"
                  fullWidth
                  value={form.seller?.support_phone || ''}
                  onChange={(e) => handleSellerField('support_phone', e.target.value)}
                  error={!!errors['seller.support_phone']}
                  helperText={errors['seller.support_phone'] || ''}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" useFlexGap>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(form.seller?.cod_enabled)}
                      onChange={(e) => handleSellerField('cod_enabled', e.target.checked)}
                    />
                  }
                  label="Pay on delivery"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(form.seller?.can_sell_screen_guard)}
                      onChange={(e) => handleSellerField('can_sell_screen_guard', e.target.checked)}
                    />
                  }
                  label="Screen guards"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(form.seller?.is_pharmacy)}
                      onChange={(e) => handleSellerField('is_pharmacy', e.target.checked)}
                    />
                  }
                  label="Pharmacy seller"
                />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard title="Account owner" subheader="Seller app login for this store">
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Owner name"
                required={!id}
                fullWidth
                value={form.user?.name || ''}
                onChange={(e) => handleUserField('name', e.target.value)}
                error={!!errors['user.name']}
                helperText={errors['user.name'] || ''}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Owner email"
                  type="email"
                  required={!id}
                  fullWidth
                  value={form.user?.email || ''}
                  onChange={(e) => handleUserField('email', e.target.value)}
                  error={!!errors['user.email']}
                  helperText={errors['user.email'] || ''}
                />
                <TextField
                  size="small"
                  label="Owner phone"
                  fullWidth
                  value={form.user?.phone || ''}
                  onChange={(e) => handleUserField('phone', e.target.value)}
                  error={!!errors['user.phone']}
                  helperText={errors['user.phone'] || ''}
                />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={12}>
          <MainCard
            title="Verification"
            subheader="Review documents and set KYC / KYB status"
            secondary={(
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {verificationChips.map((chip) => (
                  <Chip key={chip.label} size="small" label={chip.label} color={chip.color} variant="outlined" />
                ))}
              </Stack>
            )}
          >
            <Stack spacing={2}>
              <SellerKycDocumentsPanel
                sellerId={form.seller?.id}
                editable
                title=""
                kycStatuses={KYC_STATUSES}
                kybStatuses={KYB_STATUS}
                errors={errors}
                sellerKyc={{
                  status: form.seller?.kyc_status,
                  reason: form.seller?.kyc_reason,
                  onStatusChange: (v) => handleSellerField('kyc_status', v),
                  onReasonChange: (v) => handleSellerField('kyc_reason', v),
                }}
                sellerKyb={{
                  status: form.seller?.kyb_status,
                  reason: form.seller?.kyb_reason,
                  onStatusChange: (v) => handleSellerField('kyb_status', v),
                  onReasonChange: (v) => handleSellerField('kyb_reason', v),
                }}
                storeKyb={{
                  status: form.kyb_status,
                  reason: form.kyb_reason,
                  onStatusChange: (v) => handleField('kyb_status', v),
                  onReasonChange: (v) => handleField('kyb_reason', v),
                }}
              />
              {form.seller?.id ? (
                <PharmacyLicenseReviewPanel
                  sellerId={form.seller.id}
                  isPharmacy={Boolean(form.seller?.is_pharmacy)}
                  onChanged={() => id && dispatch(sellersStores.storesGetRequest({ params: { id } }))}
                />
              ) : (
                <Alert severity="info" variant="outlined">
                  Pharmacy license review appears after the store is linked to a seller.
                </Alert>
              )}
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          mt: 2,
          py: 2,
          px: 2,
          mx: -2,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          boxShadow: (theme) => theme.shadows[4],
        }}
      >
        <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
          <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto', display: { xs: 'none', sm: 'block' } }}>
            {id ? 'Update store, seller, and verification settings' : 'Create store with seller and owner account'}
          </Typography>
          <Button onClick={() => router.push('/stores')}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {id ? 'Update store' : 'Create store'}
          </Button>
        </Stack>
      </Box>
    </>
  );
}
