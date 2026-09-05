'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { CloseOutlined } from '@ant-design/icons';
import { createBanner, createShareLink, updateBanner } from 'api/content';
import { getVariant, listAllVariants, listCategories } from 'api/catalog';
import { getStore, listStores } from 'api/sellersStores';
import { uploadSingle } from 'api/upload';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import { RECORD_STATUS } from 'utils/constants';
import {
  BANNER_DESTINATIONS,
  buildBannerDeeplink,
  entityOptionLabel,
  parseBannerDeeplink
} from 'utils/bannerDeeplink';

const EMPTY = {
  title: '',
  image_url: '',
  active_from: '',
  active_to: '',
  record_status: RECORD_STATUS.ACTIVE
};

const STATUS_OPTIONS = [
  { value: RECORD_STATUS.ACTIVE, label: 'Active' },
  { value: RECORD_STATUS.INACTIVE, label: 'Inactive' }
];

function unwrap(res) {
  return res?.data || res || null;
}

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toIsoOrNull = (local) => {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

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

export default function BannersFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [imagePreview, setImagePreview] = useState('');
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

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        title: initialData.title || '',
        image_url: initialData.image_url || '',
        active_from: toLocalInput(initialData.active_from),
        active_to: toLocalInput(initialData.active_to),
        record_status: Number(initialData.record_status) || RECORD_STATUS.ACTIVE
      });
      setImagePreview(initialData.image_url || '');
      hydrateFromDeeplink(initialData.deeplink || initialData.target_url || initialData.link_url || '');
    } else {
      setForm(EMPTY);
      setImagePreview('');
      resetDestination();
    }
  }, [initialData, open, hydrateFromDeeplink, resetDestination]);

  const generatedLink = useMemo(() => {
    if (destination === 'variant_store') {
      // Built on save via share-link API
      return previewLink || '';
    }
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

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
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
      setForm((prev) => ({ ...prev, image_url: url }));
      setImagePreview(url);
      enqueueSnackbar('Banner image uploaded', { variant: 'success' });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Image upload failed';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageRemove = () => {
    setForm((prev) => ({ ...prev, image_url: '' }));
    setImagePreview('');
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
    if (!form.image_url?.trim()) {
      enqueueSnackbar('Banner image is required', { variant: 'warning' });
      return;
    }

    try {
      setSaving(true);
      const deeplink = await resolveDeeplinkForSave();
      if (deeplink === undefined) return;

      const payload = {
        title: form.title?.trim() || null,
        image_url: form.image_url.trim(),
        deeplink,
        active_from: toIsoOrNull(form.active_from),
        active_to: toIsoOrNull(form.active_to),
        record_status: Number(form.record_status) || RECORD_STATUS.ACTIVE
      };

      if (initialData?.id) {
        await updateBanner(initialData.id, payload);
        enqueueSnackbar('Banner updated', { variant: 'success' });
      } else {
        await createBanner(payload);
        enqueueSnackbar('Banner created', { variant: 'success' });
      }
      onSaved?.();
      onClose();
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

  const busy = saving || uploading;

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Banner' : 'Add Banner'}
        <IconButton onClick={onClose} aria-label="close" disabled={busy}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} mt={0.5}>
          <Stack spacing={1}>
            <InputLabel>Banner image</InputLabel>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
              <Box
                sx={{
                  width: 200,
                  height: 88,
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {imagePreview || form.image_url ? (
                  <Box
                    component="img"
                    src={imagePreview || form.image_url}
                    alt={form.title || 'Banner preview'}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <Box component="span" sx={{ typography: 'caption', color: 'text.secondary', px: 1, textAlign: 'center' }}>
                    No image yet
                  </Box>
                )}
              </Box>
              <Stack spacing={0.5}>
                <Button component="label" variant="outlined" size="small" disabled={busy}>
                  {uploading ? `Uploading… ${uploadProgress || 0}%` : 'Upload image'}
                  <input type="file" accept="image/*" hidden onChange={handleImageSelect} />
                </Button>
                {imagePreview || form.image_url ? (
                  <Button size="small" onClick={handleImageRemove} disabled={busy}>
                    Remove
                  </Button>
                ) : null}
              </Stack>
            </Stack>
            <FormHelperText>Upload a wide banner image (recommended aspect ratio ~16:9).</FormHelperText>
          </Stack>

          <Stack spacing={1}>
            <InputLabel>Title</InputLabel>
            <TextField
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Optional headline"
              fullWidth
              size="small"
              disabled={busy}
            />
          </Stack>

          <Stack spacing={1}>
            <InputLabel>Opens</InputLabel>
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
            <FormHelperText>
              Product banners always open the <strong>variant</strong> page (not a product list).
            </FormHelperText>
          </Stack>

          {destination === 'search' ? (
            <Stack spacing={1}>
              <InputLabel>Search query</InputLabel>
              <TextField
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="iphone case"
                fullWidth
                disabled={busy}
              />
            </Stack>
          ) : null}

          {destination === 'category' ? (
            <Stack spacing={0.5}>
              <InputLabel>Category</InputLabel>
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
            </Stack>
          ) : null}

          {destination === 'store' || destination === 'variant_store' ? (
            <Stack spacing={0.5}>
              <InputLabel>Store</InputLabel>
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
            </Stack>
          ) : null}

          {destination === 'variant' || destination === 'variant_store' ? (
            <Stack spacing={0.5}>
              <InputLabel>Variant</InputLabel>
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
              {destination === 'variant_store' ? (
                <FormHelperText>
                  Creates a store-scoped share link so the app opens this variant at the selected store.
                </FormHelperText>
              ) : null}
            </Stack>
          ) : null}

          {destination === 'custom' ? (
            <Stack spacing={1}>
              <InputLabel>Custom URL / deeplink</InputLabel>
              <TextField
                size="small"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://flymystore.com/x/… or fms://…"
                fullWidth
                disabled={busy}
              />
            </Stack>
          ) : null}

          {destination !== 'none' && (previewLink || generatedLink) ? (
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Generated link
              </Typography>
              <TextField
                size="small"
                value={destination === 'variant_store' ? previewLink || '(created on save)' : generatedLink}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Stack>
          ) : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Stack spacing={1} flex={1}>
              <InputLabel>Active from</InputLabel>
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
            </Stack>
            <Stack spacing={1} flex={1}>
              <InputLabel>Active to</InputLabel>
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
            </Stack>
          </Stack>
          <FormHelperText sx={{ mt: -1 }}>Leave blank to show the banner without a schedule window.</FormHelperText>

          <Stack spacing={1}>
            <InputLabel>Status</InputLabel>
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
            <FormHelperText>Inactive banners are hidden from the customer app.</FormHelperText>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={busy}>
          {saving ? 'Saving…' : initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

BannersFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSaved: PropTypes.func,
  initialData: PropTypes.object
};
