'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { CloseOutlined, InboxOutlined } from '@ant-design/icons';
import { enqueueSnackbar } from 'notistack';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { createShareLink } from 'api/content';
import { listAllVariants, listCategories } from 'api/catalog';
import { listStores } from 'api/sellersStores';
import { deleteUpload, uploadSingle } from 'api/upload';
import {
  createPushBroadcast,
  getPushBroadcast,
  listPushBroadcastTemplates,
  previewPushAudience,
  queuePushBroadcast,
  testPushBroadcast,
  updatePushBroadcast
} from 'api/pushBroadcasts';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import {
  BANNER_DESTINATIONS,
  buildBannerDeeplink,
  entityOptionLabel,
  parseBannerDeeplink
} from 'utils/bannerDeeplink';
import {
  ACCOUNT_STATUS_FILTER_OPTIONS,
  KYB_STATUS_FILTER_OPTIONS,
  KYC_STATUS_FILTER_OPTIONS,
  PUSH_BROADCAST_AUDIENCE_OPTIONS
} from 'utils/pushBroadcastLabels';

const EMPTY_FILTERS = {
  name_missing: false,
  email_missing: false,
  status: '',
  last_login_before_days: '',
  require_push_token: true,
  near_lat: '',
  near_lng: '',
  near_radius_km: '',
  store_not_created: false,
  onboarding_incomplete_days: '',
  seller_data_missing: false,
  store_data_missing: false,
  docs_missing: false,
  no_variants_days: '',
  kyc_status: '',
  kyb_status: '',
  rider_docs_missing: false
};

const RADIUS_KM_PRESETS = [5, 10, 25, 50];

/** FCM-friendly rich notification image (Android ~1MB; landscape 2:1 displays best). */
const PUSH_IMAGE = Object.freeze({
  maxBytes: 1024 * 1024,
  minW: 512,
  minH: 256,
  maxW: 2048,
  maxH: 1024,
  aspectMin: 1.7,
  aspectMax: 2.3,
  recommendW: 1024,
  recommendH: 512,
  acceptMime: new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'])
});

function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      URL.revokeObjectURL(url);
      resolve({ width: w, height: h });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image dimensions'));
    };
    img.src = url;
  });
}

async function validatePushNotificationImage(file) {
  if (!file) return 'No file selected';
  const mime = String(file.type || '').toLowerCase();
  if (!PUSH_IMAGE.acceptMime.has(mime)) {
    return 'Use JPEG or PNG (notification images only).';
  }
  if (file.size > PUSH_IMAGE.maxBytes) {
    return `Image must be under 1 MB (FCM limit). Yours is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`;
  }
  const { width, height } = await readImageDimensions(file);
  if (width < PUSH_IMAGE.minW || height < PUSH_IMAGE.minH) {
    return `Too small (${width}×${height}). Minimum ${PUSH_IMAGE.minW}×${PUSH_IMAGE.minH}.`;
  }
  if (width > PUSH_IMAGE.maxW || height > PUSH_IMAGE.maxH) {
    return `Too large (${width}×${height}). Maximum ${PUSH_IMAGE.maxW}×${PUSH_IMAGE.maxH}.`;
  }
  const ratio = width / height;
  if (ratio < PUSH_IMAGE.aspectMin || ratio > PUSH_IMAGE.aspectMax) {
    return `Use landscape ~2:1 (got ${width}×${height}, ratio ${ratio.toFixed(2)}). Recommended ${PUSH_IMAGE.recommendW}×${PUSH_IMAGE.recommendH}.`;
  }
  return null;
}

function locationFilterHint(audience) {
  if (audience === 'ALL') {
    return 'Customers: saved addresses · Sellers: store pin · Riders: last location. Users without a pin are excluded.';
  }
  if (audience === 'SELLER') {
    return 'Uses each seller’s store location (store.geom). Sellers without a store pin are excluded.';
  }
  if (audience === 'RIDER') {
    return 'Uses each rider’s last known location (rider.geom). Riders with no recent location are excluded.';
  }
  return 'Uses any saved customer address coordinates. Customers with no address pin are excluded.';
}

const COMMON_ACTIONS = [
  { value: 'OPEN_HOME', label: 'Open home' },
  { value: 'OPEN_PROFILE', label: 'Open profile' }
];

const SELLER_ACTIONS = [
  ...COMMON_ACTIONS,
  { value: 'OPEN_STORE_VARIANTS', label: 'Open store listings' }
];

const CUSTOMER_DESTINATIONS = BANNER_DESTINATIONS.filter((d) => d.value !== 'none');

function partnerActionsForAudience(audience) {
  if (audience === 'SELLER') return SELLER_ACTIONS;
  return COMMON_ACTIONS;
}

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res;
}

function toDatetimeLocal(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function cleanFilters(filters, audience, { targetMode, singleUserId } = {}) {
  if (targetMode === 'single') {
    const id = String(singleUserId || '').trim();
    return {
      user_ids: id ? [id] : [],
      require_push_token: filters.require_push_token !== false
    };
  }

  const f = { ...filters };
  const out = {
    name_missing: Boolean(f.name_missing),
    email_missing: Boolean(f.email_missing),
    require_push_token: f.require_push_token !== false,
    status: f.status === '' || f.status == null ? null : Number(f.status),
    last_login_before_days:
      f.last_login_before_days === '' || f.last_login_before_days == null
        ? null
        : Number(f.last_login_before_days)
  };

  const nearLat = f.near_lat === '' || f.near_lat == null ? null : Number(f.near_lat);
  const nearLng = f.near_lng === '' || f.near_lng == null ? null : Number(f.near_lng);
  const nearRadius =
    f.near_radius_km === '' || f.near_radius_km == null ? null : Number(f.near_radius_km);
  if (nearLat != null && nearLng != null && nearRadius != null
    && Number.isFinite(nearLat) && Number.isFinite(nearLng) && Number.isFinite(nearRadius)) {
    out.near_lat = nearLat;
    out.near_lng = nearLng;
    out.near_radius_km = nearRadius;
  }

  if (audience === 'SELLER') {
    out.store_not_created = Boolean(f.store_not_created);
    out.seller_data_missing = Boolean(f.seller_data_missing);
    out.store_data_missing = Boolean(f.store_data_missing);
    out.docs_missing = Boolean(f.docs_missing);
    out.onboarding_incomplete_days =
      f.onboarding_incomplete_days === '' || f.onboarding_incomplete_days == null
        ? null
        : Number(f.onboarding_incomplete_days);
    out.no_variants_days =
      f.no_variants_days === '' || f.no_variants_days == null ? null : Number(f.no_variants_days);
    out.kyc_status = f.kyc_status || null;
    out.kyb_status = f.kyb_status || null;
  }

  if (audience === 'RIDER') {
    out.rider_docs_missing = Boolean(f.rider_docs_missing);
    out.kyc_status = f.kyc_status || null;
  }

  return out;
}

function FilterCheck({ label, checked, onChange }) {
  return (
    <FormControlLabel
      control={<Checkbox size="small" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />}
      label={label}
    />
  );
}

export default function PushBroadcastUpsertView() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const isEdit = Boolean(id);
  const duplicateFromId = !isEdit ? searchParams?.get('duplicate') : null;

  const [form, setForm] = useState({
    title: '',
    body: '',
    image_url: '',
    audience: 'CUSTOMER',
    template_key: '',
    partner_action: 'OPEN_HOME',
    filters: { ...EMPTY_FILTERS }
  });
  const [targetMode, setTargetMode] = useState('segment');
  const [singleUserId, setSingleUserId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(isEdit || Boolean(duplicateFromId));
  const [saving, setSaving] = useState(false);
  const [previewCount, setPreviewCount] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const imageInputRef = useRef(null);

  const [destination, setDestination] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [store, setStore] = useState(null);
  const [variant, setVariant] = useState(null);
  const [customUrl, setCustomUrl] = useState('');

  const categoryAc = usePagedAutocomplete(listCategories);
  const storeAc = usePagedAutocomplete(listStores);
  const variantAc = usePagedAutocomplete(listAllVariants);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFilter = useCallback((key, value) => {
    setForm((prev) => ({
      ...prev,
      filters: { ...prev.filters, [key]: value }
    }));
    setPreviewCount(null);
  }, []);

  const hydrateDestination = useCallback(async (deeplink, action) => {
    if (action && ['OPEN_HOME', 'OPEN_PROFILE', 'OPEN_STORE_VARIANTS'].includes(action) && !deeplink) {
      setDestination('home');
      setForm((prev) => ({ ...prev, partner_action: action }));
      return;
    }
    const parsed = parseBannerDeeplink(deeplink || (action === 'OPEN_HOME' ? 'fms://home' : ''));
    setDestination(parsed.destination === 'none' ? 'home' : parsed.destination || 'home');
    setSearchQuery(parsed.searchQuery || '');
    setCustomUrl(parsed.customUrl || '');
    setCategory(null);
    setStore(null);
    setVariant(null);

    if (parsed.categorySlug) {
      try {
        const res = await listCategories({ page: 1, limit: 20, q: parsed.categorySlug });
        const rows = res?.data || res?.rows || [];
        setCategory(rows.find((r) => r.slug === parsed.categorySlug) || rows[0] || null);
      } catch {
        /* ignore */
      }
    }
    if (parsed.storeSlug) {
      try {
        const res = await listStores({ page: 1, limit: 20, q: parsed.storeSlug });
        const rows = res?.data || res?.rows || [];
        setStore(rows.find((r) => r.slug === parsed.storeSlug) || rows[0] || null);
      } catch {
        /* ignore */
      }
    }
    if (parsed.variantId) {
      try {
        const res = await listAllVariants({ page: 1, limit: 20, q: parsed.variantId });
        const rows = res?.data || res?.rows || [];
        setVariant(rows.find((r) => r.id === parsed.variantId) || rows[0] || null);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const applyLoadedBroadcast = useCallback(
    async (row, { duplicate = false } = {}) => {
      const filters = { ...EMPTY_FILTERS, ...(row.filters_json || {}) };
      // API often stores null; TextFields must use '' not null.
      const stringKeys = [
        'status',
        'last_login_before_days',
        'onboarding_incomplete_days',
        'no_variants_days',
        'near_lat',
        'near_lng',
        'near_radius_km',
        'kyc_status',
        'kyb_status'
      ];
      for (const key of stringKeys) {
        filters[key] = filters[key] == null ? '' : String(filters[key]);
      }

      const userIds = Array.isArray(row.filters_json?.user_ids) ? row.filters_json.user_ids : [];
      if (userIds.length === 1) {
        setTargetMode('single');
        setSingleUserId(userIds[0]);
      } else {
        setTargetMode('segment');
        setSingleUserId('');
      }

      const baseTitle = row.title || '';
      setForm({
        title: duplicate && baseTitle ? `Copy of ${baseTitle}` : baseTitle,
        body: row.body || '',
        image_url: row.image_url || '',
        audience: row.audience || 'CUSTOMER',
        template_key: row.template_key || '',
        partner_action: row.data_json?.action || 'OPEN_HOME',
        filters
      });
      // Duplicates start unscheduled so ops pick a new time.
      setScheduledAt(duplicate ? '' : toDatetimeLocal(row.scheduled_at));
      setPreviewCount(null);
      await hydrateDestination(row.data_json?.deeplink, row.data_json?.action);
    },
    [hydrateDestination]
  );

  useEffect(() => {
    listPushBroadcastTemplates()
      .then((res) => setTemplates(unwrap(res) || []))
      .catch(() => setTemplates([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return undefined;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const row = unwrap(await getPushBroadcast(id));
        if (!alive || !row) return;
        await applyLoadedBroadcast(row, { duplicate: false });
      } catch (err) {
        enqueueSnackbar(err?.response?.data?.message || 'Failed to load broadcast', { variant: 'error' });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, isEdit, applyLoadedBroadcast]);

  useEffect(() => {
    if (!duplicateFromId) return undefined;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const row = unwrap(await getPushBroadcast(duplicateFromId));
        if (!alive || !row) return;
        await applyLoadedBroadcast(row, { duplicate: true });
        enqueueSnackbar('Duplicated — review and save or queue as a new broadcast', { variant: 'info' });
      } catch (err) {
        enqueueSnackbar(err?.response?.data?.message || 'Failed to duplicate broadcast', {
          variant: 'error'
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [duplicateFromId, applyLoadedBroadcast]);

  const audienceTemplates = useMemo(
    () => {
      if (form.audience === 'ALL') return [];
      return templates.filter((t) => !form.audience || t.audience === form.audience);
    },
    [templates, form.audience]
  );

  const generatedLink = useMemo(
    () =>
      buildBannerDeeplink({
        destination,
        searchQuery,
        category,
        store,
        variant,
        customUrl
      }) || '',
    [destination, searchQuery, category, store, variant, customUrl]
  );

  const applyTemplate = (key) => {
    setField('template_key', key);
    const t = templates.find((x) => x.key === key);
    if (!t) return;
    setTargetMode('segment');
    setForm((prev) => ({
      ...prev,
      template_key: key,
      audience: t.audience,
      title: t.title || prev.title,
      body: t.body || prev.body,
      partner_action: t.data?.action || prev.partner_action,
      filters: {
        ...EMPTY_FILTERS,
        ...t.filters,
        status: t.filters?.status != null ? String(t.filters.status) : '',
        last_login_before_days:
          t.filters?.last_login_before_days != null ? String(t.filters.last_login_before_days) : '',
        onboarding_incomplete_days:
          t.filters?.onboarding_incomplete_days != null
            ? String(t.filters.onboarding_incomplete_days)
            : '',
        no_variants_days: t.filters?.no_variants_days != null ? String(t.filters.no_variants_days) : '',
        near_lat: t.filters?.near_lat != null ? String(t.filters.near_lat) : '',
        near_lng: t.filters?.near_lng != null ? String(t.filters.near_lng) : '',
        near_radius_km: t.filters?.near_radius_km != null ? String(t.filters.near_radius_km) : ''
      }
    }));
    if (t.data?.action === 'OPEN_HOME') setDestination('home');
    setPreviewCount(null);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadPushImageFile(file);
  };

  const uploadPushImageFile = async (file) => {
    try {
      const invalid = await validatePushNotificationImage(file);
      if (invalid) {
        enqueueSnackbar(invalid, { variant: 'warning' });
        return;
      }
      setUploading(true);
      setUploadProgress(0);
      const res = await uploadSingle(
        file,
        (pe) => {
          if (pe?.total) setUploadProgress(Math.round((pe.loaded * 100) / pe.total));
        },
        { purpose: 'banner' }
      );
      const url = res?.url || res?.data?.url;
      if (!url) throw new Error('Upload failed: no URL returned');
      setField('image_url', url);
      enqueueSnackbar('Image uploaded', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Image upload failed', {
        variant: 'error'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const url = String(form.image_url || '').trim();
    if (!url) return;
    try {
      setUploading(true);
      await deleteUpload(url);
      setField('image_url', '');
      enqueueSnackbar('Image removed', { variant: 'success' });
    } catch (err) {
      // Still clear local if storage rejects (e.g. already gone / external URL).
      setField('image_url', '');
      enqueueSnackbar(
        err?.response?.data?.message || err?.message || 'Image cleared (storage delete may have failed)',
        { variant: 'warning' }
      );
    } finally {
      setUploading(false);
    }
  };

  const onImageDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (form.image_url || uploading) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) await uploadPushImageFile(file);
  };

  const resolveDeeplink = async () => {
    if (form.audience !== 'CUSTOMER') {
      const allowed = partnerActionsForAudience(form.audience).map((a) => a.value);
      const action = allowed.includes(form.partner_action) ? form.partner_action : 'OPEN_HOME';
      return { action, deeplink: null };
    }

    if (destination === 'variant_store') {
      if (!variant?.id || !store?.id) {
        enqueueSnackbar('Pick a variant and store', { variant: 'warning' });
        return null;
      }
      const res = await createShareLink({
        type: 'variant',
        variant_id: variant.id,
        store_id: store.id,
        label: form.title?.trim() || `push-${variant.id.slice(0, 8)}`
      });
      const data = unwrap(res);
      const url = data?.url;
      if (!url) {
        enqueueSnackbar('Could not create store-scoped link', { variant: 'error' });
        return null;
      }
      return { action: 'OPEN_DEEPLINK', deeplink: url };
    }

    if (destination === 'search' && String(searchQuery || '').trim().length < 2) {
      enqueueSnackbar('Enter a search query (at least 2 characters)', { variant: 'warning' });
      return null;
    }
    if (destination === 'category' && !category?.slug && !category?.id) {
      enqueueSnackbar('Pick a category', { variant: 'warning' });
      return null;
    }
    if (destination === 'store' && !store?.slug && !store?.id) {
      enqueueSnackbar('Pick a store', { variant: 'warning' });
      return null;
    }
    if (destination === 'variant' && !variant?.id) {
      enqueueSnackbar('Pick a variant', { variant: 'warning' });
      return null;
    }
    if (destination === 'custom' && !String(customUrl || '').trim()) {
      enqueueSnackbar('Paste a URL or deeplink', { variant: 'warning' });
      return null;
    }

    const deeplink = buildBannerDeeplink({
      destination,
      searchQuery,
      category,
      store,
      variant,
      customUrl
    });

    if (!deeplink) {
      return { action: 'OPEN_HOME', deeplink: null };
    }
    if (destination === 'home') {
      return { action: 'OPEN_HOME', deeplink };
    }
    if (destination === 'screen_guard') {
      return { action: 'OPEN_DEEPLINK', deeplink };
    }
    return { action: 'OPEN_DEEPLINK', deeplink };
  };

  const buildPayload = async (queue = false) => {
    const resolved = await resolveDeeplink();
    if (!resolved) return null;

    const filters = cleanFilters(form.filters, form.audience, { targetMode, singleUserId });
    if (targetMode === 'single' && !filters.user_ids?.length) {
      enqueueSnackbar('Enter a user ID for single-user send', { variant: 'warning' });
      return null;
    }

    const data = { action: resolved.action };
    if (resolved.deeplink) data.deeplink = resolved.deeplink;

    return {
      title: form.title.trim(),
      body: form.body.trim(),
      image_url: form.image_url.trim() || null,
      audience: form.audience,
      template_key: form.template_key || null,
      filters,
      data,
      deeplink: resolved.deeplink || null,
      scheduled_at: fromDatetimeLocal(scheduledAt),
      queue
    };
  };

  const handlePreview = async () => {
    if (targetMode === 'single' && !singleUserId.trim()) {
      enqueueSnackbar('Enter a user ID first', { variant: 'warning' });
      return;
    }
    setPreviewing(true);
    try {
      const res = await previewPushAudience({
        audience: form.audience,
        filters: cleanFilters(form.filters, form.audience, { targetMode, singleUserId })
      });
      const data = unwrap(res);
      setPreviewCount(data?.count ?? 0);
      enqueueSnackbar(`Audience match: ${data?.count ?? 0} users`, { variant: 'info' });
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Preview failed', { variant: 'error' });
    } finally {
      setPreviewing(false);
    }
  };

  const handleTest = async () => {
    const testId = targetMode === 'single' ? singleUserId.trim() : singleUserId.trim();
    // Allow test from the single-user field or a dedicated paste — reuse singleUserId when in single mode
    const userId = testId || singleUserId.trim();
    if (!userId) {
      enqueueSnackbar('Enter a user ID to send a test', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const payload = await buildPayload(false);
      if (!payload) return;
      await testPushBroadcast({
        user_id: userId,
        title: payload.title,
        body: payload.body,
        image_url: payload.image_url,
        data: payload.data,
        deeplink: payload.deeplink
      });
      enqueueSnackbar('Test push sent', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Test send failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async ({ queue } = {}) => {
    if (!form.title.trim() || !form.body.trim()) {
      enqueueSnackbar('Title and body are required', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const payload = await buildPayload(queue);
      if (!payload) return;
      let row;
      if (isEdit) {
        row = unwrap(await updatePushBroadcast(id, payload));
        if (queue) row = unwrap(await queuePushBroadcast(id));
      } else {
        row = unwrap(await createPushBroadcast(payload));
      }
      enqueueSnackbar(queue ? 'Broadcast queued' : 'Broadcast saved', { variant: 'success' });
      router.push(row?.id ? `/push-broadcasts/${row.id}` : '/push-broadcasts');
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Save failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions =
    category?.id && !(categoryAc.options || []).some((o) => o.id === category.id)
      ? [category, ...(categoryAc.options || [])]
      : categoryAc.options || [];
  const storeOptions =
    store?.id && !(storeAc.options || []).some((o) => o.id === store.id)
      ? [store, ...(storeAc.options || [])]
      : storeAc.options || [];
  const variantOptions =
    variant?.id && !(variantAc.options || []).some((o) => o.id === variant.id)
      ? [variant, ...(variantAc.options || [])]
      : variantAc.options || [];

  const busy = saving || uploading;

  if (loading) {
    return (
      <Stack alignItems="center" py={6}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <>
      <Breadcrumbs
        custom
        heading={isEdit ? 'edit-push-broadcast' : 'create-push-broadcast'}
        links={[
          { title: 'home', to: '/dashboard' },
          { title: 'push-broadcasts', to: '/push-broadcasts' },
          { title: form.title || (isEdit ? id : 'new'), i18n: false }
        ]}
      />

      <Stack spacing={2}>
        {/* Card 1 — 3 columns: meta | copy | image */}
        <MainCard title="Message">
          <Grid container spacing={2} alignItems="stretch">
            <Grid size={{ xs: 12, md: 3 }}>
              <Stack spacing={1.5} sx={{ height: '100%' }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Audience"
                  value={form.audience}
                  onChange={(e) => {
                    const next = e.target.value;
                    setForm((prev) => {
                      const actions = partnerActionsForAudience(next);
                      return {
                        ...prev,
                        audience: next,
                        template_key: '',
                        partner_action: actions.some((a) => a.value === prev.partner_action)
                          ? prev.partner_action
                          : 'OPEN_HOME'
                      };
                    });
                    setPreviewCount(null);
                    if (next !== 'CUSTOMER') setDestination('home');
                  }}
                >
                  {PUSH_BROADCAST_AUDIENCE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Template (optional)"
                  value={form.template_key || ''}
                  onChange={(e) => applyTemplate(e.target.value)}
                  disabled={targetMode === 'single' || form.audience === 'ALL'}
                  helperText={
                    form.audience === 'ALL'
                      ? 'Templates are per audience — use manual compose for All.'
                      : undefined
                  }
                >
                  <MenuItem value="">Manual compose</MenuItem>
                  {audienceTemplates.map((t) => (
                    <MenuItem key={t.key} value={t.key}>
                      {t.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  size="small"
                  type="datetime-local"
                  label="Schedule (optional)"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={1.5} sx={{ height: '100%' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Title"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  inputProps={{ maxLength: 255 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={6}
                  label="Body"
                  value={form.body}
                  onChange={(e) => setField('body', e.target.value)}
                  sx={{ flex: 1, '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' } }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1} sx={{ height: '100%' }}>
                <Box
                  role={form.image_url ? undefined : 'button'}
                  tabIndex={form.image_url || uploading ? undefined : 0}
                  onClick={() => {
                    if (!form.image_url && !uploading) imageInputRef.current?.click();
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !form.image_url && !uploading) {
                      e.preventDefault();
                      imageInputRef.current?.click();
                    }
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    if (!form.image_url) setDragOver(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!form.image_url) setDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                  }}
                  onDrop={onImageDrop}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '2 / 1',
                    borderRadius: 1,
                    overflow: 'hidden',
                    bgcolor: 'grey.50',
                    border: form.image_url ? '1px solid' : '1px dashed',
                    borderColor: dragOver ? 'primary.main' : 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: form.image_url || uploading ? 'default' : 'pointer',
                    transition: 'border-color 0.15s ease, background-color 0.15s ease',
                    ...(dragOver && !form.image_url
                      ? { bgcolor: 'action.hover' }
                      : null),
                    '&:hover': form.image_url || uploading ? undefined : { borderColor: 'primary.main' }
                  }}
                >
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/bmp"
                    hidden
                    onChange={handleImageSelect}
                  />

                  {form.image_url ? (
                    <>
                      <Box
                        component="img"
                        src={form.image_url}
                        alt={form.title || 'Push image'}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <IconButton
                        size="small"
                        aria-label="Remove image"
                        onClick={handleRemoveImage}
                        disabled={busy}
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          bgcolor: 'rgba(0,0,0,0.55)',
                          color: 'common.white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' }
                        }}
                      >
                        <CloseOutlined style={{ fontSize: 14 }} />
                      </IconButton>
                    </>
                  ) : uploading ? (
                    <Stack alignItems="center" spacing={1}>
                      <CircularProgress size={28} />
                      <Typography variant="caption" color="text.secondary">
                        Uploading… {uploadProgress || 0}%
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack alignItems="center" spacing={0.5} px={2}>
                      <InboxOutlined style={{ fontSize: 28, opacity: 0.55 }} />
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Drop image here or click to upload
                      </Typography>
                      <Typography variant="caption" color="text.disabled" textAlign="center">
                        1024 × 512 · 2:1 · under 1 MB
                      </Typography>
                    </Stack>
                  )}
                </Box>
                {uploading && form.image_url ? (
                  <LinearProgress variant="determinate" value={uploadProgress} />
                ) : null}
                <FormHelperText sx={{ m: 0 }}>
                  JPEG/PNG, under 1 MB. Landscape ~2:1 — recommended {PUSH_IMAGE.recommendW}×
                  {PUSH_IMAGE.recommendH}. Remove deletes the file from storage.
                </FormHelperText>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>

        {/* Left: Who receives it | Right: Tap action + Send */}
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, md: 8 }}>
            <MainCard title="Who receives it" sx={{ height: '100%' }}>
              <Stack spacing={1.5}>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Target mode"
                      value={targetMode}
                      onChange={(e) => {
                        setTargetMode(e.target.value);
                        setPreviewCount(null);
                        if (e.target.value === 'single') setField('template_key', '');
                      }}
                    >
                      <MenuItem value="segment">Segment (filters)</MenuItem>
                      <MenuItem value="single">Single user</MenuItem>
                    </TextField>
                  </Grid>
                  {targetMode === 'single' ? (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="User ID"
                        value={singleUserId}
                        onChange={(e) => {
                          setSingleUserId(e.target.value);
                          setPreviewCount(null);
                        }}
                        helperText={
                          form.audience === 'ALL'
                            ? 'Any customer, seller, or rider UUID.'
                            : `One ${form.audience.toLowerCase()} UUID.`
                        }
                      />
                    </Grid>
                  ) : null}
                </Grid>

                {targetMode === 'segment' ? (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      {form.audience === 'ALL'
                        ? 'Common filters only across customers, sellers, and riders.'
                        : 'Common filters; audience-specific options appear when relevant.'}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5}>
                      <FilterCheck
                        label="Name missing"
                        checked={form.filters.name_missing}
                        onChange={(v) => setFilter('name_missing', v)}
                      />
                      <FilterCheck
                        label="Email missing"
                        checked={form.filters.email_missing}
                        onChange={(v) => setFilter('email_missing', v)}
                      />
                      <FilterCheck
                        label="Require push token"
                        checked={form.filters.require_push_token}
                        onChange={(v) => setFilter('require_push_token', v)}
                      />
                    </Stack>
                    <FormHelperText sx={{ m: 0 }}>
                      Push token on = live FCM only. Off = include users without phone push.
                    </FormHelperText>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Account status"
                          value={form.filters.status}
                          onChange={(e) => setFilter('status', e.target.value)}
                        >
                          {ACCOUNT_STATUS_FILTER_OPTIONS.map((o) => (
                            <MenuItem key={o.value || 'default'} value={o.value}>
                              {o.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Last login before (days)"
                          value={form.filters.last_login_before_days}
                          onChange={(e) => setFilter('last_login_before_days', e.target.value)}
                        />
                      </Grid>
                    </Grid>

                    <Typography variant="subtitle2">Location</Typography>
                    <FormHelperText sx={{ m: 0 }}>{locationFilterHint(form.audience)}</FormHelperText>
                    <Grid container spacing={1.5} alignItems="flex-start">
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Latitude"
                          value={form.filters.near_lat}
                          onChange={(e) => setFilter('near_lat', e.target.value)}
                          inputProps={{ step: 'any' }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Longitude"
                          value={form.filters.near_lng}
                          onChange={(e) => setFilter('near_lng', e.target.value)}
                          inputProps={{ step: 'any' }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Radius (km)"
                          value={form.filters.near_radius_km}
                          onChange={(e) => setFilter('near_radius_km', e.target.value)}
                          inputProps={{ min: 0.1, max: 200, step: 'any' }}
                        />
                      </Grid>
                    </Grid>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {RADIUS_KM_PRESETS.map((km) => (
                        <Button
                          key={km}
                          size="small"
                          variant={
                            String(form.filters.near_radius_km) === String(km) ? 'contained' : 'outlined'
                          }
                          onClick={() => setFilter('near_radius_km', String(km))}
                        >
                          {km} km
                        </Button>
                      ))}
                    </Stack>

                    {form.audience === 'SELLER' && (
                      <>
                        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5}>
                          <FilterCheck
                            label="Store not created"
                            checked={form.filters.store_not_created}
                            onChange={(v) => setFilter('store_not_created', v)}
                          />
                          <FilterCheck
                            label="Seller data missing"
                            checked={form.filters.seller_data_missing}
                            onChange={(v) => setFilter('seller_data_missing', v)}
                          />
                          <FilterCheck
                            label="Store data missing"
                            checked={form.filters.store_data_missing}
                            onChange={(v) => setFilter('store_data_missing', v)}
                          />
                          <FilterCheck
                            label="Docs missing"
                            checked={form.filters.docs_missing}
                            onChange={(v) => setFilter('docs_missing', v)}
                          />
                        </Stack>
                        <Grid container spacing={1.5}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Onboarding incomplete (days)"
                              value={form.filters.onboarding_incomplete_days}
                              onChange={(e) => setFilter('onboarding_incomplete_days', e.target.value)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="No variants for (days)"
                              value={form.filters.no_variants_days}
                              onChange={(e) => setFilter('no_variants_days', e.target.value)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="KYC status"
                              value={form.filters.kyc_status}
                              onChange={(e) => setFilter('kyc_status', e.target.value)}
                            >
                              {KYC_STATUS_FILTER_OPTIONS.map((o) => (
                                <MenuItem key={o.value || 'any'} value={o.value}>
                                  {o.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="KYB status"
                              value={form.filters.kyb_status}
                              onChange={(e) => setFilter('kyb_status', e.target.value)}
                            >
                              {KYB_STATUS_FILTER_OPTIONS.map((o) => (
                                <MenuItem key={o.value || 'any'} value={o.value}>
                                  {o.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        </Grid>
                      </>
                    )}

                    {form.audience === 'RIDER' && (
                      <>
                        <FilterCheck
                          label="Rider docs / DL missing"
                          checked={form.filters.rider_docs_missing}
                          onChange={(v) => setFilter('rider_docs_missing', v)}
                        />
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="KYC status"
                          value={form.filters.kyc_status}
                          onChange={(e) => setFilter('kyc_status', e.target.value)}
                          sx={{ maxWidth: 280 }}
                        >
                          {KYC_STATUS_FILTER_OPTIONS.map((o) => (
                            <MenuItem key={o.value || 'any'} value={o.value}>
                              {o.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </>
                    )}
                  </>
                ) : null}

                <Stack direction="row" spacing={1} alignItems="center">
                  <Button variant="outlined" size="small" onClick={handlePreview} disabled={previewing || busy}>
                    {previewing ? 'Counting…' : 'Preview count'}
                  </Button>
                  {previewCount != null && (
                    <Typography variant="body2">
                      Will reach <strong>{previewCount}</strong> user{previewCount === 1 ? '' : 's'}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <MainCard title="Tap action">
                <Stack spacing={1.5}>
                  {form.audience === 'CUSTOMER' ? (
                    <>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Opens"
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setSearchQuery('');
                          setCategory(null);
                          setStore(null);
                          setVariant(null);
                          setCustomUrl('');
                        }}
                      >
                        {CUSTOMER_DESTINATIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </TextField>

                      {destination === 'search' ? (
                        <TextField
                          size="small"
                          label="Search query"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="iphone case"
                          fullWidth
                        />
                      ) : null}

                      {destination === 'category' ? (
                        <Autocomplete
                          options={categoryOptions}
                          value={category}
                          loading={categoryAc.loading}
                          getOptionLabel={(o) => entityOptionLabel('category', o)}
                          isOptionEqualToValue={(a, b) => a?.id === b?.id}
                          onChange={(_e, next) => setCategory(next)}
                          onInputChange={(_e, q) => categoryAc.setQuery(q)}
                          ListboxProps={{ onScroll: categoryAc.handleScroll }}
                          renderInput={(params) => <TextField {...params} size="small" label="Category" />}
                        />
                      ) : null}

                      {destination === 'store' || destination === 'variant_store' ? (
                        <Autocomplete
                          options={storeOptions}
                          value={store}
                          loading={storeAc.loading}
                          getOptionLabel={(o) => entityOptionLabel('store', o)}
                          isOptionEqualToValue={(a, b) => a?.id === b?.id}
                          onChange={(_e, next) => setStore(next)}
                          onInputChange={(_e, q) => storeAc.setQuery(q)}
                          ListboxProps={{ onScroll: storeAc.handleScroll }}
                          renderInput={(params) => <TextField {...params} size="small" label="Store" />}
                        />
                      ) : null}

                      {destination === 'variant' || destination === 'variant_store' ? (
                        <Autocomplete
                          options={variantOptions}
                          value={variant}
                          loading={variantAc.loading}
                          getOptionLabel={(o) => entityOptionLabel('variant', o)}
                          isOptionEqualToValue={(a, b) => a?.id === b?.id}
                          onChange={(_e, next) => setVariant(next)}
                          onInputChange={(_e, q) => variantAc.setQuery(q)}
                          ListboxProps={{ onScroll: variantAc.handleScroll }}
                          renderInput={(params) => (
                            <TextField {...params} size="small" label="Variant" />
                          )}
                        />
                      ) : null}

                      {destination === 'custom' ? (
                        <TextField
                          size="small"
                          label="Custom URL / deeplink"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          placeholder="https://flymystore.com/x/… or fms://…"
                          fullWidth
                        />
                      ) : null}

                      {destination !== 'variant_store' && generatedLink ? (
                        <TextField
                          size="small"
                          label="Generated link"
                          value={generatedLink}
                          fullWidth
                          InputProps={{ readOnly: true }}
                        />
                      ) : null}
                    </>
                  ) : (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Opens in app"
                      value={form.partner_action}
                      onChange={(e) => setField('partner_action', e.target.value)}
                      helperText={
                        form.audience === 'ALL'
                          ? 'Shared action for all apps (home / profile).'
                          : undefined
                      }
                    >
                      {partnerActionsForAudience(form.audience).map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Stack>
              </MainCard>

              <MainCard title="Send" sx={{ flex: 1 }}>
                <Stack spacing={1.5}>
                  {targetMode === 'segment' ? (
                    <TextField
                      fullWidth
                      size="small"
                      label="Test user ID (optional)"
                      value={singleUserId}
                      onChange={(e) => setSingleUserId(e.target.value)}
                      helperText="One-off test before queueing the segment"
                    />
                  ) : null}
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button variant="outlined" size="small" onClick={handleTest} disabled={busy}>
                      Send test
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleSave({ queue: false })}
                      disabled={busy}
                    >
                      Save draft
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleSave({ queue: true })}
                      disabled={busy}
                    >
                      {saving ? 'Working…' : targetMode === 'single' ? 'Send to user' : 'Queue send'}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => router.push(isEdit ? `/push-broadcasts/${id}` : '/push-broadcasts')}
                      disabled={busy}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}
