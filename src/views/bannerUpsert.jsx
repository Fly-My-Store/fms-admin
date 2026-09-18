'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { createBanner, createShareLink, getBanner, updateBanner } from 'api/content';
import { getVariant, listAllVariants, listCategories } from 'api/catalog';
import { listStores } from 'api/sellersStores';
import { uploadSingle } from 'api/upload';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import { RECORD_STATUS } from 'utils/constants';
import {
  BANNER_DESTINATIONS,
  buildBannerDeeplink,
  entityOptionLabel,
  parseBannerDeeplink
} from 'utils/bannerDeeplink';
import BannerCustomerPreview from 'sections/banners/BannerCustomerPreview';

const EMPTY = {
  title: '',
  subtitle: '',
  action_label: '',
  image_url: '',
  foreground_image_url: '',
  image_placement: 'none',
  vertical: 'all',
  active_from: '',
  active_to: '',
  record_status: RECORD_STATUS.ACTIVE
};

const PLACEMENT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' }
];

const VERTICAL_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'restaurant', label: 'Food' },
  { value: 'grocery', label: 'Grocery' }
];

const STATUS_OPTIONS = [
  { value: RECORD_STATUS.ACTIVE, label: 'Active' },
  { value: RECORD_STATUS.INACTIVE, label: 'Inactive' }
];

function unwrap(res) {
  return res?.data || res || null;
}

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIsoOrNull(local) {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function findCategoryBySlug(slug) {
  if (!slug) return null;
  try {
    const res = await listCategories({ page: 1, limit: 20, q: slug });
    const rows = res?.data || res?.rows || [];
    return rows.find((r) => r.slug === slug) || rows[0] || null;
  } catch {
    return null;
  }
}

async function findStoreBySlug(slug) {
  if (!slug) return null;
  try {
    const res = await listStores({ page: 1, limit: 20, q: slug });
    const rows = res?.data || res?.rows || [];
    return rows.find((r) => r.slug === slug) || rows[0] || null;
  } catch {
    return null;
  }
}

function Field({ label, helper, children, sx }) {
  return (
    <Stack sx={{ gap: 0.75, minWidth: 0, ...sx }}>
      {label ? <InputLabel>{label}</InputLabel> : null}
      {children}
      {helper ? <FormHelperText>{helper}</FormHelperText> : null}
    </Stack>
  );
}

function ImageThumb({ src, alt, width, height, placeholder, contain }) {
  return (
    <Box
      sx={{
        width,
        height,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'grey.100',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      {src ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{ width: '100%', height: '100%', objectFit: contain ? 'contain' : 'cover', display: 'block' }}
        />
      ) : (
        <Typography variant="caption" color="text.secondary" px={1} textAlign="center">
          {placeholder}
        </Typography>
      )}
    </Box>
  );
}

export function BannerUpsert() {
  const { id } = useParams();
  const router = useRouter();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [imagePreview, setImagePreview] = useState('');
  const [foregroundPreview, setForegroundPreview] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const [destination, setDestination] = useState('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [store, setStore] = useState(null);
  const [variant, setVariant] = useState(null);
  const [customUrl, setCustomUrl] = useState('');
  const [previewLink, setPreviewLink] = useState('');

  const categoryAc = usePagedAutocomplete(listCategories);
  const storeAc = usePagedAutocomplete(listStores);
  const variantAc = usePagedAutocomplete(listAllVariants);

  const resetDestination = useCallback(() => {
    setDestination('none');
    setSearchQuery('');
    setCategory(null);
    setStore(null);
    setVariant(null);
    setCustomUrl('');
    setPreviewLink('');
  }, []);

  const hydrateFromDeeplink = useCallback(async (deeplink) => {
    const parsed = parseBannerDeeplink(deeplink);
    setDestination(parsed.destination || 'none');
    setSearchQuery(parsed.searchQuery || '');
    setCustomUrl(parsed.customUrl || (parsed.destination === 'custom' ? deeplink : '') || '');
    setCategory(null);
    setStore(null);
    setVariant(null);
    setPreviewLink(String(deeplink || '').trim());

    if (parsed.destination === 'category' && parsed.categorySlug) {
      const row = await findCategoryBySlug(parsed.categorySlug);
      if (row) setCategory(row);
    }
    if (parsed.destination === 'store' && parsed.storeSlug) {
      const row = await findStoreBySlug(parsed.storeSlug);
      if (row) setStore(row);
    }
    if (parsed.destination === 'variant' && parsed.variantId) {
      try {
        const row = unwrap(await getVariant(parsed.variantId));
        if (row) setVariant(row);
      } catch {
        // ignore
      }
    }
  }, []);

  const applyRow = useCallback(
    async (row) => {
      setForm({
        title: row.title || '',
        subtitle: row.subtitle || '',
        action_label: row.action_label || '',
        image_url: row.image_url || '',
        foreground_image_url: row.foreground_image_url || '',
        image_placement: row.image_placement || 'none',
        vertical: VERTICAL_OPTIONS.some((opt) => opt.value === row.vertical) ? row.vertical : 'all',
        active_from: toLocalInput(row.active_from),
        active_to: toLocalInput(row.active_to),
        record_status: Number(row.record_status) || RECORD_STATUS.ACTIVE
      });
      setImagePreview(row.image_url || '');
      setForegroundPreview(row.foreground_image_url || '');
      await hydrateFromDeeplink(row.deeplink || row.target_url || row.link_url || '');
    },
    [hydrateFromDeeplink]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) {
        setForm(EMPTY);
        setImagePreview('');
        setForegroundPreview('');
        resetDestination();
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const row = unwrap(await getBanner(id));
        if (!row) throw new Error('Banner not found');
        if (!cancelled) await applyRow(row);
      } catch (err) {
        enqueueSnackbar(err?.response?.data?.message || err?.message || 'Failed to load banner', {
          variant: 'error'
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, applyRow, resetDestination]);

  const generatedLink = useMemo(() => {
    if (destination === 'variant_store') return previewLink || '';
    return (
      buildBannerDeeplink({
        destination,
        searchQuery,
        category,
        store,
        variant,
        customUrl
      }) || ''
    );
  }, [destination, searchQuery, category, store, variant, customUrl, previewLink]);

  useEffect(() => {
    if (destination !== 'variant_store') {
      setPreviewLink(generatedLink);
    }
  }, [destination, generatedLink]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDestinationChange = (next) => {
    setDestination(next);
    setSearchQuery('');
    setCategory(null);
    setStore(null);
    setVariant(null);
    setCustomUrl('');
    setPreviewLink('');
  };

  const uploadBannerImage = async (file, field) => {
    if (!file) return;
    try {
      setUploading(true);
      setUploadProgress(0);
      const res = await uploadSingle(
        file,
        (pe) => {
          if (pe?.total) {
            setUploadProgress(Math.round((pe.loaded * 100) / pe.total));
          }
        },
        {
          purpose: 'banner',
          store_id: store?.id || undefined
        }
      );
      const url = res?.url || res?.data?.url;
      if (!url) throw new Error('Upload failed: no URL returned');
      setForm((prev) => ({
        ...prev,
        [field]: url,
        ...(field === 'foreground_image_url' && prev.image_placement === 'none' ? { image_placement: 'right' } : {})
      }));
      if (field === 'image_url') setImagePreview(url);
      if (field === 'foreground_image_url') setForegroundPreview(url);
      enqueueSnackbar(field === 'image_url' ? 'Background uploaded' : 'Foreground uploaded', { variant: 'success' });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Image upload failed';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleBackgroundSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    await uploadBannerImage(file, 'image_url');
  };

  const handleForegroundSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    await uploadBannerImage(file, 'foreground_image_url');
  };

  const handleImageRemove = () => {
    setForm((prev) => ({ ...prev, image_url: '' }));
    setImagePreview('');
  };

  const handleForegroundRemove = () => {
    setForm((prev) => ({ ...prev, foreground_image_url: '', image_placement: 'none' }));
    setForegroundPreview('');
  };

  const resolveDeeplinkForSave = async () => {
    if (destination === 'none') return null;

    if (destination === 'variant_store') {
      if (!variant?.id) {
        enqueueSnackbar('Pick a variant', { variant: 'warning' });
        return undefined;
      }
      if (!store?.id) {
        enqueueSnackbar('Pick a store', { variant: 'warning' });
        return undefined;
      }
      const res = await createShareLink({
        type: 'variant',
        variant_id: variant.id,
        store_id: store.id,
        label: form.title?.trim() || `banner-${variant.id.slice(0, 8)}`
      });
      const data = unwrap(res);
      const url = data?.url;
      if (!url) throw new Error('Could not create store-scoped link');
      return url;
    }

    if (destination === 'search' && String(searchQuery || '').trim().length < 2) {
      enqueueSnackbar('Enter a search query (at least 2 characters)', { variant: 'warning' });
      return undefined;
    }
    if (destination === 'category' && !category?.slug && !category?.id) {
      enqueueSnackbar('Pick a category', { variant: 'warning' });
      return undefined;
    }
    if (destination === 'store' && !store?.slug && !store?.id) {
      enqueueSnackbar('Pick a store', { variant: 'warning' });
      return undefined;
    }
    if (destination === 'variant' && !variant?.id) {
      enqueueSnackbar('Pick a variant', { variant: 'warning' });
      return undefined;
    }
    if (destination === 'custom' && !String(customUrl || '').trim()) {
      enqueueSnackbar('Paste a URL or deeplink', { variant: 'warning' });
      return undefined;
    }

    return buildBannerDeeplink({
      destination,
      searchQuery,
      category,
      store,
      variant,
      customUrl
    });
  };

  const handleSubmit = async () => {
    const background = form.image_url?.trim() || '';
    const title = form.title?.trim() || '';
    const subtitle = form.subtitle?.trim() || '';
    if (!background && (!title || !subtitle)) {
      enqueueSnackbar('Without a background image, title and subtitle are required', { variant: 'warning' });
      return;
    }

    try {
      setSaving(true);
      const deeplink = await resolveDeeplinkForSave();
      if (deeplink === undefined) return;

      const payload = {
        title: title || null,
        subtitle: subtitle || null,
        action_label: form.action_label?.trim() || null,
        image_url: background || null,
        foreground_image_url: form.foreground_image_url?.trim() || null,
        image_placement: form.foreground_image_url?.trim()
          ? form.image_placement === 'left'
            ? 'left'
            : 'right'
          : 'none',
        vertical: form.vertical || 'all',
        deeplink,
        active_from: toIsoOrNull(form.active_from),
        active_to: toIsoOrNull(form.active_to),
        record_status: Number(form.record_status) || RECORD_STATUS.ACTIVE
      };

      if (id) {
        await updateBanner(id, payload);
        enqueueSnackbar('Banner updated', { variant: 'success' });
      } else {
        await createBanner(payload);
        enqueueSnackbar('Banner created', { variant: 'success' });
      }
      router.push('/banners');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Save failed';
      enqueueSnackbar(msg, { variant: 'error' });
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

  const busy = saving || uploading || loading;
  const hasForeground = Boolean(foregroundPreview || form.foreground_image_url);
  const placementValue = hasForeground ? (form.image_placement === 'left' ? 'left' : 'right') : 'none';

  const breadcrumb = useMemo(() => {
    const name = form.title || form.subtitle || (isEdit ? id : 'new-banner');
    return {
      heading: isEdit ? 'edit-banner' : 'create-banner',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'banners', to: '/banners' },
        { title: name, i18n: false }
      ]
    };
  }, [form.title, form.subtitle, id, isEdit]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard showTitle={false}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" py={8}>
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
              <Stack flex={1} spacing={1.5} sx={{ minWidth: 0, width: '100%' }}>
                <FormHelperText sx={{ mt: 0 }}>
                  Without a background image, title and subtitle are both required.
                </FormHelperText>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
                  <Field label="Title" sx={{ flex: { sm: 1.2 }, width: { xs: '100%', sm: 'auto' } }}>
                    <TextField
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Summer sale"
                      fullWidth
                      size="small"
                      disabled={busy}
                    />
                  </Field>
                  <Field label="Subtitle" sx={{ flex: { sm: 2 }, width: { xs: '100%', sm: 'auto' } }}>
                    <TextField
                      name="subtitle"
                      value={form.subtitle}
                      onChange={handleChange}
                      placeholder="Free delivery on orders above ₹499"
                      fullWidth
                      size="small"
                      disabled={busy}
                    />
                  </Field>
                  <Field label="Shows on" sx={{ width: { xs: '100%', sm: 150 }, flexShrink: 0 }}>
                    <TextField
                      select
                      name="vertical"
                      value={form.vertical || 'all'}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      disabled={busy}
                    >
                      {VERTICAL_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Field>
                  <Field label="Status" sx={{ width: { xs: '100%', sm: 140 }, flexShrink: 0 }}>
                    <TextField
                      select
                      name="record_status"
                      value={form.record_status}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      disabled={busy}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Field>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
                  <Field label="Action button" sx={{ width: { xs: '100%', sm: 160 }, flexShrink: 0 }}>
                    <TextField
                      name="action_label"
                      value={form.action_label}
                      onChange={handleChange}
                      placeholder="Shop now"
                      fullWidth
                      size="small"
                      disabled={busy}
                    />
                  </Field>
                  <Field label="Opens" sx={{ flex: { sm: 1.1 }, width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 160 } }}>
                    <TextField
                      select
                      size="small"
                      value={destination}
                      onChange={(e) => handleDestinationChange(e.target.value)}
                      fullWidth
                      disabled={busy}
                    >
                      {BANNER_DESTINATIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Field>
                  <Field label="From" sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
                    <TextField
                      name="active_from"
                      type="datetime-local"
                      value={form.active_from}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      disabled={busy}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Field>
                  <Field label="To" sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
                    <TextField
                      name="active_to"
                      type="datetime-local"
                      value={form.active_to}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      disabled={busy}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Field>
                </Stack>

                {destination === 'search' ? (
                  <Field label="Search query">
                    <TextField
                      size="small"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="iphone case"
                      fullWidth
                      disabled={busy}
                    />
                  </Field>
                ) : null}

                {destination === 'category' ? (
                  <Field label="Category">
                    <Autocomplete
                      options={categoryOptions}
                      value={category}
                      loading={categoryAc.loading}
                      disabled={busy}
                      getOptionLabel={(o) => entityOptionLabel('category', o)}
                      isOptionEqualToValue={(a, b) => a?.id === b?.id}
                      onChange={(_e, next) => setCategory(next)}
                      onInputChange={(_e, q) => categoryAc.setQuery(q)}
                      ListboxProps={{ onScroll: categoryAc.handleScroll }}
                      renderInput={(params) => <TextField {...params} size="small" placeholder="Search categories…" />}
                    />
                  </Field>
                ) : null}

                {destination === 'store' || destination === 'variant_store' ? (
                  <Field label="Store">
                    <Autocomplete
                      options={storeOptions}
                      value={store}
                      loading={storeAc.loading}
                      disabled={busy}
                      getOptionLabel={(o) => entityOptionLabel('store', o)}
                      isOptionEqualToValue={(a, b) => a?.id === b?.id}
                      onChange={(_e, next) => setStore(next)}
                      onInputChange={(_e, q) => storeAc.setQuery(q)}
                      ListboxProps={{ onScroll: storeAc.handleScroll }}
                      renderInput={(params) => <TextField {...params} size="small" placeholder="Search stores…" />}
                    />
                  </Field>
                ) : null}

                {destination === 'variant' || destination === 'variant_store' ? (
                  <Field
                    label="Variant"
                    helper={
                      destination === 'variant_store'
                        ? 'Creates a store-scoped share link so the app opens this variant at the selected store.'
                        : undefined
                    }
                  >
                    <Autocomplete
                      options={variantOptions}
                      value={variant}
                      loading={variantAc.loading}
                      disabled={busy}
                      getOptionLabel={(o) => entityOptionLabel('variant', o)}
                      isOptionEqualToValue={(a, b) => a?.id === b?.id}
                      onChange={(_e, next) => setVariant(next)}
                      onInputChange={(_e, q) => variantAc.setQuery(q)}
                      ListboxProps={{ onScroll: variantAc.handleScroll }}
                      renderInput={(params) => <TextField {...params} size="small" placeholder="Search variants…" />}
                    />
                  </Field>
                ) : null}

                {destination === 'custom' ? (
                  <Field label="Custom URL / deeplink">
                    <TextField
                      size="small"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://flymystore.com/x/… or fms://…"
                      fullWidth
                      disabled={busy}
                    />
                  </Field>
                ) : null}

                {destination !== 'none' && (previewLink || generatedLink) ? (
                  <Field label="Generated link">
                    <TextField
                      size="small"
                      value={destination === 'variant_store' ? previewLink || '(created on save)' : generatedLink}
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Field>
                ) : null}
              </Stack>

              <Stack spacing={1.5} sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
                <BannerCustomerPreview
                  imageUrl={imagePreview || form.image_url}
                  title={form.title}
                  subtitle={form.subtitle}
                  actionLabel={destination !== 'none' ? form.action_label : ''}
                  foregroundImageUrl={foregroundPreview || form.foreground_image_url}
                  imagePlacement={form.image_placement}
                  maxWidth={280}
                />

                <Field
                  label="Background image"
                  helper="3:1 crop on the customer home card. Required when title and subtitle are both empty."
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <ImageThumb
                      src={imagePreview || form.image_url}
                      alt={form.title || 'Banner background'}
                      width={120}
                      height={40}
                      placeholder="Optional"
                    />
                    <Stack spacing={0.5}>
                      <Button component="label" variant="outlined" size="small" disabled={busy}>
                        {uploading ? `Uploading… ${uploadProgress || 0}%` : 'Upload'}
                        <input type="file" accept="image/*" hidden onChange={handleBackgroundSelect} />
                      </Button>
                      {imagePreview || form.image_url ? (
                        <Button size="small" onClick={handleImageRemove} disabled={busy}>
                          Remove
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                </Field>

                <Field label="Foreground image">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <ImageThumb
                      src={foregroundPreview || form.foreground_image_url}
                      alt="Foreground"
                      width={56}
                      height={56}
                      placeholder="Optional"
                      contain
                    />
                    <Stack spacing={0.5}>
                      <Button component="label" variant="outlined" size="small" disabled={busy}>
                        Upload
                        <input type="file" accept="image/*" hidden onChange={handleForegroundSelect} />
                      </Button>
                      {foregroundPreview || form.foreground_image_url ? (
                        <Button size="small" onClick={handleForegroundRemove} disabled={busy}>
                          Remove
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                </Field>

                <Field label="Foreground placement" helper="Ignored until a foreground image is uploaded.">
                  <TextField
                    select
                    name="image_placement"
                    size="small"
                    value={placementValue}
                    onChange={handleChange}
                    fullWidth
                    disabled={busy || !hasForeground}
                  >
                    {(hasForeground ? PLACEMENT_OPTIONS.filter((opt) => opt.value !== 'none') : PLACEMENT_OPTIONS).map(
                      (opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                </Field>
              </Stack>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => router.push('/banners')} disabled={saving || uploading}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSubmit} disabled={busy}>
                {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
              </Button>
            </Stack>
          </Stack>
        )}
      </MainCard>
    </>
  );
}

export default BannerUpsert;
