'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as sellersStores } from 'store/sellersStores/slice';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';

import { createStore, updateStore } from 'api/sellersStores';

// MUI
import {
  Alert,
  Button,
  Divider,
  InputLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
  LinearProgress
} from '@mui/material';

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
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/i;
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
    support_phone: ''
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
        support_phone: seller.support_phone || ''
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

  // Live errors (for disabling the submit button)
  const liveErrors = useMemo(() => validateState(form), [form]);

  // ----- Submit -----
  const handleSubmit = async () => {
    try {
      const e = validateForm();
      if (Object.keys(e).length) {
        setErrors(e);
        enqueueSnackbar('Please fix the highlighted fields.', { variant: 'warning' });
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
        'support_phone'
      ]);

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
      // Handle validation errors from server
      const response = err?.response?.data;
      if (response?.errors) {
        // Server returned field-specific errors
        setErrors(response.errors);
        const errorMsg = response.message || 'Validation failed';
        enqueueSnackbar(errorMsg, { variant: 'error' });
      } else {
        // Generic error message
        const msg = response?.message || err?.message || 'Something went wrong.';
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

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        <Stack spacing={2}>
          {loading && <LinearProgress />}
          {error && <Alert severity="error">{String(error)}</Alert>}



          {/* Seller Owner (User) */}
          <Typography variant="h6">Seller Owner</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required={!id}>Name{!id && ' *'}</InputLabel>
              <TextField size="small" value={form.user?.name || ''} onChange={(e) => handleUserField('name', e.target.value)} error={!!errors['user.name']} helperText={errors['user.name'] || ''} required={!id} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required={!id}>Email{!id && ' *'}</InputLabel>
              <TextField size="small" type="email" value={form.user?.email || ''} onChange={(e) => handleUserField('email', e.target.value)} error={!!errors['user.email']} helperText={errors['user.email'] || ''} required={!id} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Phone</InputLabel>
              <TextField size="small" value={form.user?.phone || ''} onChange={(e) => handleUserField('phone', e.target.value)} error={!!errors['user.phone']} helperText={errors['user.phone'] || ''} />
            </Stack>
          </Stack>

          <Divider />

          {/* Seller (Business) */}
          <Typography variant="h6">Seller</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>Legal Name *</InputLabel>
              <TextField size="small" value={form.seller?.legal_name || ''} onChange={(e) => handleSellerField('legal_name', e.target.value)} error={!!errors['seller.legal_name']} helperText={errors['seller.legal_name'] || ''} required />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>Display Name *</InputLabel>
              <TextField size="small" value={form.seller?.display_name || ''} onChange={(e) => handleSellerField('display_name', e.target.value)} error={!!errors['seller.display_name']} helperText={errors['seller.display_name'] || ''} required />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>GSTIN</InputLabel>
              <TextField size="small" value={form.seller?.gstin || ''} onChange={(e) => handleSellerField('gstin', e.target.value)} error={!!errors['seller.gstin']} helperText={errors['seller.gstin'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>PAN</InputLabel>
              <TextField size="small" value={form.seller?.pan || ''} onChange={(e) => handleSellerField('pan', e.target.value)} error={!!errors['seller.pan']} helperText={errors['seller.pan'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>CIN</InputLabel>
              <TextField size="small" value={form.seller?.cin || ''} onChange={(e) => handleSellerField('cin', e.target.value)} />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Seller Support Email</InputLabel>
              <TextField size="small" value={form.seller?.support_email || ''} onChange={(e) => handleSellerField('support_email', e.target.value)} error={!!errors['seller.support_email']} helperText={errors['seller.support_email'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Seller Support Phone</InputLabel>
              <TextField size="small" value={form.seller?.support_phone || ''} onChange={(e) => handleSellerField('support_phone', e.target.value)} error={!!errors['seller.support_phone']} helperText={errors['seller.support_phone'] || ''} />
            </Stack>
          </Stack>

          <Divider />

          {/* Store section */}
          <Typography variant="h6">Store</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required={!id}>Name{!id && ' *'}</InputLabel>
              <TextField size="small" value={form.name || ''} onChange={(e) => handleField('name', e.target.value)} error={!!errors['name']} helperText={errors['name'] || ''} required={!id} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required={!id}>Slug{!id && ' *'}</InputLabel>
              <TextField
                size="small"
                value={form.slug || ''}
                onChange={(e) => handleField('slug', e.target.value)}
                error={!!errors['slug']}
                helperText={errors['slug'] || (slugManuallyEdited ? '' : 'Auto-generated from name')}
                required={!id}
                placeholder="Auto-generated from name"
              />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>Phone *</InputLabel>
              <TextField size="small" value={form.phone || ''} onChange={(e) => handleField('phone', e.target.value)} error={!!errors['phone']} helperText={errors['phone'] || ''} required />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>Email *</InputLabel>
              <TextField size="small" type="email" value={form.email || ''} onChange={(e) => handleField('email', e.target.value)} error={!!errors['email']} helperText={errors['email'] || ''} required />
            </Stack>
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel required>Address *</InputLabel>
            <TextField size="small" value={form.address_text || ''} onChange={(e) => handleField('address_text', e.target.value)} error={!!errors['address_text']} helperText={errors['address_text'] || ''} required />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>Latitude *</InputLabel>
              <TextField size="small" type="number" value={form.lat || ''} onChange={(e) => handleField('lat', e.target.value)} error={!!errors['lat']} helperText={errors['lat'] || ''} required />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>Longitude *</InputLabel>
              <TextField size="small" type="number" value={form.lng || ''} onChange={(e) => handleField('lng', e.target.value)} error={!!errors['lng']} helperText={errors['lng'] || ''} required />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Delivery Radius (m)</InputLabel>
              <TextField size="small" value={form.delivery_radius_m || ''} onChange={(e) => handleField('delivery_radius_m', e.target.value)} error={!!errors['delivery_radius_m']} helperText={errors['delivery_radius_m'] || ''} />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Open Time (HH:mm)</InputLabel>
              <TextField
                size="small"
                type="time"
                value={form.open_time || ''}
                onChange={(e) => handleField('open_time', e.target.value)}
                error={!!errors['open_time']}
                helperText={errors['open_time'] || 'Format: HH:mm (e.g., 09:00)'}
                inputProps={{
                  step: 60, // 1 minute steps
                  pattern: '[0-9]{2}:[0-9]{2}',
                  max: '23:59',
                  min: '00:00'
                }}
                placeholder="09:00"
              />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Close Time (HH:mm)</InputLabel>
              <TextField
                size="small"
                type="time"
                value={form.close_time || ''}
                onChange={(e) => handleField('close_time', e.target.value)}
                error={!!errors['close_time']}
                helperText={errors['close_time'] || 'Format: HH:mm (e.g., 18:00)'}
                inputProps={{
                  step: 60, // 1 minute steps
                  pattern: '[0-9]{2}:[0-9]{2}',
                  max: '23:59',
                  min: '00:00'
                }}
                placeholder="18:00"
              />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Is Open</InputLabel>
              <TextField select size="small" value={form.is_open} onChange={(e) => handleField('is_open', e.target.value)}>
                <MenuItem value="true">true</MenuItem>
                <MenuItem value="false">false</MenuItem>
              </TextField>
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>Code *</InputLabel>
              <TextField
                size="small"
                value={form.code || ''}
                onChange={(e) => handleField('code', e.target.value)}
                error={!!errors['code']}
                helperText={errors['code'] || (codeManuallyEdited ? '' : 'Auto-generated from name')}
                required
                placeholder="Auto-generated from name"
              />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Support Email</InputLabel>
              <TextField size="small" value={form.support_email || ''} onChange={(e) => handleField('support_email', e.target.value)} error={!!errors['support_email']} helperText={errors['support_email'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Support Phone</InputLabel>
              <TextField size="small" value={form.support_phone || ''} onChange={(e) => handleField('support_phone', e.target.value)} error={!!errors['support_phone']} helperText={errors['support_phone'] || ''} />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Status</InputLabel>
              <TextField select size="small" value={form.status} onChange={(e) => handleField('status', e.target.value)} error={!!errors['status']} helperText={errors['status'] || ''}>
                {STORE_STATUS.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Record Status</InputLabel>
              <TextField select size="small" value={form.record_status} onChange={(e) => handleField('record_status', Number(e.target.value))} error={!!errors['record_status']} helperText={errors['record_status'] || ''}>
                {RECORD_STATUS_LIST.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>

          <Divider />

          {/* Verification (KYC / KYB) */}
          <Typography variant="h6">Verification</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: -1 }}>
            Seller identity (KYC), business entity (KYB), and store location (Store KYB). Reason is required when status is REJECTED (or RESUBMIT for KYC).
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
            <Stack sx={{ gap: 1, flex: 1, minWidth: 200 }}>
              <InputLabel>Seller KYC Status</InputLabel>
              <TextField select size="small" fullWidth value={form.seller.kyc_status} onChange={(e) => handleSellerField('kyc_status', e.target.value)} error={!!errors['seller.kyc_status']} helperText={errors['seller.kyc_status'] || ''}>
                {KYC_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack sx={{ gap: 1, flex: 2 }}>
              <InputLabel>KYC Reason</InputLabel>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={form.seller?.kyc_reason || ''}
                onChange={(e) => handleSellerField('kyc_reason', e.target.value)}
                error={!!errors['seller.kyc_reason']}
                helperText={errors['seller.kyc_reason'] || 'Required when KYC is REJECTED or RESUBMIT'}
              />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
            <Stack sx={{ gap: 1, flex: 1, minWidth: 200 }}>
              <InputLabel>Seller KYB Status</InputLabel>
              <TextField select size="small" fullWidth value={form.seller.kyb_status} onChange={(e) => handleSellerField('kyb_status', e.target.value)} error={!!errors['seller.kyb_status']} helperText={errors['seller.kyb_status'] || ''}>
                {KYB_STATUS.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack sx={{ gap: 1, flex: 2 }}>
              <InputLabel>Seller KYB Reason</InputLabel>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={form.seller?.kyb_reason || ''}
                onChange={(e) => handleSellerField('kyb_reason', e.target.value)}
                error={!!errors['seller.kyb_reason']}
                helperText={errors['seller.kyb_reason'] || 'Required when seller KYB is REJECTED'}
              />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
            <Stack sx={{ gap: 1, flex: 1, minWidth: 200 }}>
              <InputLabel>Store KYB Status</InputLabel>
              <TextField select size="small" fullWidth value={form.kyb_status} onChange={(e) => handleField('kyb_status', e.target.value)} error={!!errors['kyb_status']} helperText={errors['kyb_status'] || ''}>
                {KYB_STATUS.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack sx={{ gap: 1, flex: 2 }}>
              <InputLabel>Store KYB Reason</InputLabel>
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={form.kyb_reason || ''}
                onChange={(e) => handleField('kyb_reason', e.target.value)}
                error={!!errors['kyb_reason']}
                helperText={errors['kyb_reason'] || 'Required when store KYB is REJECTED'}
              />
            </Stack>
          </Stack>

          <Divider />

          {/* Actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => router.push('/stores')}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} >
              {id ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}
