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
  record_status: 1,

  // Seller (business) nested
  seller: {
    id: '', // optional when editing existing seller
    legal_name: '',
    display_name: '',
    business_name: '',
    gstin: '',
    pan: '',
    cin: '',
    kyb_status: 'PENDING',
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
      open_time: (data.open_time || '').toString().slice(0, 5),
      close_time: (data.close_time || '').toString().slice(0, 5),
      is_open: String(Boolean(data.is_open)),
      delivery_radius_m: data.delivery_radius_m ?? 5000,
      code: data.code || '',
      support_email: data.support_email || '',
      support_phone: data.support_phone || '',
      status: data.status || 'ACTIVE',
      record_status: data.record_status ?? 1,
      seller: {
        id: seller.id || '',
        legal_name: seller.legal_name || '',
        display_name: seller.display_name || '',
        business_name: seller.business_name || '',
        gstin: seller.gstin || '',
        pan: seller.pan || '',
        cin: seller.cin || '',
        kyb_status: seller.kyb_status || 'PENDING',
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
    setForm((p) => ({ ...p, [name]: value }));
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

    // Required: store
    if (!String(f.name || '').trim()) add('name', 'Name is required');
    const slugVal = String(f.slug || '').trim();
    if (!slugVal) add('slug', 'Slug is required');
    else if (!SLUG_RE.test(slugVal)) add('slug', 'Use lowercase letters, numbers and hyphens');

    // Status enums
    if (!STORE_STATUS.includes(f.status)) add('status', 'Invalid status');
    if (![1, 2, 3].includes(Number(f.record_status))) add('record_status', 'Invalid record status');

    // Contact formats (optional but validated if present)
    const email = String(f.email || '').trim();
    if (email && !EMAIL_RE.test(email)) add('email', 'Invalid email');

    const phone = String(f.phone || '').trim();
    if (phone) {
      const digits = phone.replace(/\D/g, '').length;
      if (!PHONE_RE.test(phone) || digits < 8) add('phone', 'Invalid phone');
    }

    const sEmail = String(f.support_email || '').trim();
    if (sEmail && !EMAIL_RE.test(sEmail)) add('support_email', 'Invalid email');

    const sPhone = String(f.support_phone || '').trim();
    if (sPhone) {
      const digits = sPhone.replace(/\D/g, '').length;
      if (!PHONE_RE.test(sPhone) || digits < 8) add('support_phone', 'Invalid phone');
    }

    // Geo
    const lat = f.lat === '' ? null : Number(f.lat);
    const lng = f.lng === '' ? null : Number(f.lng);
    if ((lat !== null || lng !== null) && (lat === null || lng === null)) {
      if (lat === null) add('lat', 'Latitude required with longitude');
      if (lng === null) add('lng', 'Longitude required with latitude');
    }
    if (lat !== null && !(lat >= -90 && lat <= 90)) add('lat', 'Latitude must be between -90 and 90');
    if (lng !== null && !(lng >= -180 && lng <= 180)) add('lng', 'Longitude must be between -180 and 180');

    const dr = f.delivery_radius_m === '' ? null : Number(f.delivery_radius_m);
    if (dr !== null && (!Number.isFinite(dr) || dr < 0)) add('delivery_radius_m', 'Delivery radius must be a positive number');

    // Times (optional)
    const ot = String(f.open_time || '');
    const ct = String(f.close_time || '');
    if (ot && !TIME_RE.test(ot)) add('open_time', 'Use HH:mm');
    if (ct && !TIME_RE.test(ct)) add('close_time', 'Use HH:mm');

    // Seller required
    const sel = f.seller || {};
    if (!String(sel.legal_name || '').trim()) add('seller.legal_name', 'Required');
    if (!String(sel.display_name || '').trim()) add('seller.display_name', 'Required');
    if (!String(sel.business_name || '').trim()) add('seller.business_name', 'Required');
    if (!KYB_STATUS.includes(sel.kyb_status)) add('seller.kyb_status', 'Invalid');

    // Seller optional docs; validate format if present
    const gst = String(sel.gstin || '').trim();
    if (gst && gst.length !== 15) add('seller.gstin', 'GSTIN must be 15 characters');

    const pan = String(sel.pan || '').trim();
    if (pan && !PAN_RE.test(pan)) add('seller.pan', 'Invalid PAN');

    const sse = String(sel.support_email || '').trim();
    if (sse && !EMAIL_RE.test(sse)) add('seller.support_email', 'Invalid email');

    const ssp = String(sel.support_phone || '').trim();
    if (ssp) {
      const digits = ssp.replace(/\D/g, '').length;
      if (!PHONE_RE.test(ssp) || digits < 8) add('seller.support_phone', 'Invalid phone');
    }

    // Owner user (require at least email + name)
    const usr = f.user || {};
    if (!String(usr.name || '').trim()) add('user.name', 'Required');
    const ue = String(usr.email || '').trim();
    if (!ue) add('user.email', 'Required');
    else if (!EMAIL_RE.test(ue)) add('user.email', 'Invalid email');
    const up = String(usr.phone || '').trim();
    if (up) {
      const digits = up.replace(/\D/g, '').length;
      if (!PHONE_RE.test(up) || digits < 8) add('user.phone', 'Invalid phone');
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

      // Optional geom: generated from lat/lng by backend if needed

      // Seller payload (optional on update; created if missing on create)
      const sellerPayload = pick(form.seller || {}, [
        'id',
        'legal_name',
        'display_name',
        'business_name',
        'gstin',
        'pan',
        'cin',
        'kyb_status',
        'support_email',
        'support_phone'
      ]);

      // Seller owner user payload
      const userPayload = pick(form.user || {}, ['id', 'name', 'email', 'phone']);

      const payload = { ...coerced, seller: sellerPayload, user: userPayload };

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
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong.';
      enqueueSnackbar(msg, { variant: 'error' });
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

          {/* Store section */}
          <Typography variant="h6">Store</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Name</InputLabel>
              <TextField size="small" value={form.name} onChange={(e) => handleField('name', e.target.value)} error={!!errors['name']} helperText={errors['name'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Slug</InputLabel>
              <TextField size="small" value={form.slug} onChange={(e) => handleField('slug', e.target.value)} error={!!errors['slug']} helperText={errors['slug'] || ''} />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Phone</InputLabel>
              <TextField size="small" value={form.phone} onChange={(e) => handleField('phone', e.target.value)} error={!!errors['phone']} helperText={errors['phone'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Email</InputLabel>
              <TextField size="small" value={form.email} onChange={(e) => handleField('email', e.target.value)} error={!!errors['email']} helperText={errors['email'] || ''} />
            </Stack>
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Address</InputLabel>
            <TextField size="small" value={form.address_text} onChange={(e) => handleField('address_text', e.target.value)} />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Latitude</InputLabel>
              <TextField size="small" value={form.lat} onChange={(e) => handleField('lat', e.target.value)} error={!!errors['lat']} helperText={errors['lat'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Longitude</InputLabel>
              <TextField size="small" value={form.lng} onChange={(e) => handleField('lng', e.target.value)} error={!!errors['lng']} helperText={errors['lng'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Delivery Radius (m)</InputLabel>
              <TextField size="small" value={form.delivery_radius_m} onChange={(e) => handleField('delivery_radius_m', e.target.value)} error={!!errors['delivery_radius_m']} helperText={errors['delivery_radius_m'] || ''} />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Open Time</InputLabel>
              <TextField size="small" type="time" value={form.open_time} onChange={(e) => handleField('open_time', e.target.value)} error={!!errors['open_time']} helperText={errors['open_time'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Close Time</InputLabel>
              <TextField size="small" type="time" value={form.close_time} onChange={(e) => handleField('close_time', e.target.value)} error={!!errors['close_time']} helperText={errors['close_time'] || ''} />
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
              <InputLabel>Code</InputLabel>
              <TextField size="small" value={form.code} onChange={(e) => handleField('code', e.target.value)} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Support Email</InputLabel>
              <TextField size="small" value={form.support_email} onChange={(e) => handleField('support_email', e.target.value)} error={!!errors['support_email']} helperText={errors['support_email'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Support Phone</InputLabel>
              <TextField size="small" value={form.support_phone} onChange={(e) => handleField('support_phone', e.target.value)} error={!!errors['support_phone']} helperText={errors['support_phone'] || ''} />
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

          {/* Seller (Business) */}
          <Typography variant="h6">Seller</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Legal Name</InputLabel>
              <TextField size="small" value={form.seller.legal_name} onChange={(e) => handleSellerField('legal_name', e.target.value)} error={!!errors['seller.legal_name']} helperText={errors['seller.legal_name'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Display Name</InputLabel>
              <TextField size="small" value={form.seller.display_name} onChange={(e) => handleSellerField('display_name', e.target.value)} error={!!errors['seller.display_name']} helperText={errors['seller.display_name'] || ''} />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
           
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>KYB Status</InputLabel>
              <TextField select size="small" value={form.seller.kyb_status} onChange={(e) => handleSellerField('kyb_status', e.target.value)} error={!!errors['seller.kyb_status']} helperText={errors['seller.kyb_status'] || ''}>
                {KYB_STATUS.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>GSTIN</InputLabel>
              <TextField size="small" value={form.seller.gstin} onChange={(e) => handleSellerField('gstin', e.target.value)} error={!!errors['seller.gstin']} helperText={errors['seller.gstin'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>PAN</InputLabel>
              <TextField size="small" value={form.seller.pan} onChange={(e) => handleSellerField('pan', e.target.value)} error={!!errors['seller.pan']} helperText={errors['seller.pan'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>CIN</InputLabel>
              <TextField size="small" value={form.seller.cin} onChange={(e) => handleSellerField('cin', e.target.value)} />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Seller Support Email</InputLabel>
              <TextField size="small" value={form.seller.support_email} onChange={(e) => handleSellerField('support_email', e.target.value)} error={!!errors['seller.support_email']} helperText={errors['seller.support_email'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Seller Support Phone</InputLabel>
              <TextField size="small" value={form.seller.support_phone} onChange={(e) => handleSellerField('support_phone', e.target.value)} error={!!errors['seller.support_phone']} helperText={errors['seller.support_phone'] || ''} />
            </Stack>
          </Stack>

          <Divider />

          {/* Seller Owner (User) */}
          <Typography variant="h6">Seller Owner</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Name</InputLabel>
              <TextField size="small" value={form.user.name} onChange={(e) => handleUserField('name', e.target.value)} error={!!errors['user.name']} helperText={errors['user.name'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Email</InputLabel>
              <TextField size="small" value={form.user.email} onChange={(e) => handleUserField('email', e.target.value)} error={!!errors['user.email']} helperText={errors['user.email'] || ''} />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Phone</InputLabel>
              <TextField size="small" value={form.user.phone} onChange={(e) => handleUserField('phone', e.target.value)} error={!!errors['user.phone']} helperText={errors['user.phone'] || ''} />
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
