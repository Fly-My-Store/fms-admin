'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as catalog } from 'store/catalog/slice';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';

import { createVariant, updateVariant } from 'api/catalog';
import { uploadSingle } from 'api/upload';

// MUI
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Divider,
  FormHelperText,
  InputLabel,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';

const RECORD_STATUS_LIST = [
  { value: 1, label: 'ACTIVE' },
  { value: 2, label: 'INACTIVE' },
  { value: 3, label: 'ARCHIVED' }
];
const CURRENCIES = ['INR', 'USD', 'EUR'];

const EMPTY = {
  id: '',
  product_id: '',
  sku: '',
  barcode: '',
  option_signature: '',
  option_hash: '',
  mrp: '',
  sale_price: '',
  currency: 'INR',
  tax_inclusive: true,
  gtin: '',
  mpn: '',
  color_hex: '',
  record_status: 1
};

function toNumOrNull(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function buildOptionSignature(rows = []) {
  const pairs = [];
  for (const r of rows) {
    const k = String(r?.key || '').trim();
    const v = String(r?.value || '').trim();
    if (!k || !v) continue;
    pairs.push(`${k.toLowerCase()}=${v}`);
  }
  // sort by key for determinism
  pairs.sort((a, b) => a.localeCompare(b));
  return pairs.join('|');
}

async function sha256Hex(text) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function VariantUpsert() {
  const { id } = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const product_id_from_query = search?.get('p');
  const product_name_from_query = search?.get('n');
  const dispatch = useDispatch();

  // detail from store
  const { variantDetail } = useSelector((s) => s.catalog || {});
  const detail = variantDetail || { data: null, loading: false, error: null };
  const variant = detail.data;
  const error = detail.error;
  const loading = detail.loading;

  const [form, setForm] = useState({ ...EMPTY, product_id: product_id_from_query || '' });

  // --- Images ---
  const [existingImages, setExistingImages] = useState([]); // from backend
  const [newImages, setNewImages] = useState([]); // [{url, kind, role, is_primary, position}]
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  // fetch detail for edit
  useEffect(() => {
    if (!id) return;
    dispatch(catalog.variantsGetRequest({ params: { id } }));
  }, [dispatch, id]);

  // hydrate when loaded
  useEffect(() => {
    if (!id || !variant) return;
    setForm((prev) => ({
      ...prev,
      id: variant.id || '',
      product_id: variant.product_id || prev.product_id || '',
      sku: variant.sku || '',
      barcode: variant.barcode || '',
      option_signature: variant.option_signature || '',
      option_hash: variant.option_hash || '',
      mrp: variant.mrp ?? '',
      sale_price: variant.sale_price ?? '',
      currency: variant.currency || 'INR',
      tax_inclusive: !!variant.tax_inclusive,
      gtin: variant.gtin || '',
      mpn: variant.mpn || '',
      color_hex: variant.color_hex || '',
      record_status: variant.record_status || 1
    }));

    setExistingImages(Array.isArray(variant.images) ? variant.images : []);
  }, [variant, id]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  // ----- Images -----
  const onSelectImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setUploadPct(0);

    try {
      const staged = [];
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const res = await uploadSingle(file, (evt) => {
          if (evt && evt.total) {
            const pct = Math.round((evt.loaded * 100) / evt.total);
            setUploadPct((prev) => (pct > prev ? pct : prev));
          }
        });
        const url = res?.url;
        if (!url) continue;

        const hasPrimary = existingImages.some((im) => im.is_primary && !im._delete) || newImages.some((im) => im.is_primary);
        const positionBase = existingImages.filter((im) => !im._delete).length + newImages.length + staged.length;

        staged.push({
          url,
          kind: 'image',
          role: 'gallery',
          is_primary: hasPrimary ? false : staged.length === 0, // first new becomes primary if none
          position: positionBase
        });
      }
      if (staged.length) {
        setNewImages((prev) => [...prev, ...staged]);
        enqueueSnackbar(`${staged.length} image${staged.length > 1 ? 's' : ''} added`, { variant: 'success' });
      }
    } catch (err) {
      enqueueSnackbar('Upload failed for some files', { variant: 'warning' });
    } finally {
      setUploading(false);
      setUploadPct(0);
      // clear input selection
      e.target.value = '';
    }
  };

  const removeNewImage = (idx) => setNewImages((prev) => prev.filter((_, i) => i !== idx));

  const toggleDeleteExisting = (imgId) =>
    setExistingImages((prev) =>
      prev.map((im) => (im.id === imgId ? { ...im, _delete: !im._delete } : im))
    );

  // ----- Submit -----
  const handleSubmit = async () => {
    try {
      if (!form.product_id) {
        return enqueueSnackbar('Missing product id. Open this page from a Product details screen.', { variant: 'warning' });
      }
      if (!form.sku?.trim()) {
        return enqueueSnackbar('SKU is required', { variant: 'warning' });
      }

      const payload = {
        product_id: form.product_id,
        sku: form.sku.trim(),
        barcode: form.barcode || null,
        option_signature: form.option_signature,
        option_hash: form.option_hash,
        mrp: toNumOrNull(form.mrp),
        sale_price: toNumOrNull(form.sale_price),
        currency: form.currency || 'INR',
        tax_inclusive: !!form.tax_inclusive,
        gtin: form.gtin || null,
        mpn: form.mpn || null,
        color_hex: form.color_hex || null,
        record_status: form.record_status
      };

      const imagesOps = [];

      existingImages.forEach((im) => {
        if (im._delete) imagesOps.push({ id: im.id, delete: true });
      });

      newImages.forEach((ni) => {
        imagesOps.push({
          ...ni,
          new: true
        });
      });

      if (imagesOps.length) {
        payload.images = imagesOps;
      }

      let variantId = id || form.id;
      if (variantId) {
        await updateVariant(variantId, payload);
        enqueueSnackbar('Variant updated', { variant: 'success' });
      } else {
        const res = await createVariant(form.product_id, payload);
        variantId = res?.data?.id || res?.data?.data?.id;
        enqueueSnackbar('Variant created', { variant: 'success' });
      }

      const backUrl = form.product_id ? `/products/${form.product_id}?tab=variants` : '/product-variants';
      router.push(backUrl);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong.';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const breadcrumb = useMemo(() => {
    const name = form?.sku || id || 'new-variant';
    return {
      heading: id ? 'update-variant' : 'create-variant',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'products', to: '/products' },
        { title: `${product_id_from_query}-${product_name_from_query}`, to: `/products/${product_id_from_query}`, i18n: false },
        { title: 'product-variants', to: `/products/${product_id_from_query}?tab=variants` },
        { title: name, i18n: false }
      ]
    };
  }, [form?.sku, id]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        <Stack spacing={2}>
          {/* Context bar */}
          <Stack direction="row" alignItems="center" spacing={1}>
            {form.product_id ? (
              <Chip color="primary" variant="outlined" label={`Product: ${product_name_from_query || form.product_id}`} />
            ) : (
              <Alert severity="info" sx={{ flex: 1 }}>
                Open this page from a Product details page (Variants tab) so the product is pre-selected.
              </Alert>
            )}
          </Stack>

          {loading && <Alert severity="info">Loading variant…</Alert>}

          {/* Identity */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>SKU *</InputLabel>
              <TextField size="small" fullWidth value={form.sku} onChange={(e) => handleField('sku', e.target.value)} placeholder="IP17-BLK-256" />
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Barcode</InputLabel>
              <TextField size="small" fullWidth value={form.barcode} onChange={(e) => handleField('barcode', e.target.value)} placeholder="EAN/GTIN" />
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Record Status</InputLabel>
              <TextField
                select
                size="small"
                fullWidth
                value={form.record_status}
                onChange={(e) => handleField('record_status', e.target.value)}
              >
                {RECORD_STATUS_LIST.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>MRP</InputLabel>
              <TextField size="small" fullWidth value={form.mrp} onChange={(e) => handleField('mrp', e.target.value)} placeholder="79999.00" />
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Sale Price</InputLabel>
              <TextField size="small" fullWidth value={form.sale_price} onChange={(e) => handleField('sale_price', e.target.value)} placeholder="74999.00" />
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Currency</InputLabel>
              <TextField select size="small" fullWidth value={form.currency} onChange={(e) => handleField('currency', e.target.value)}>
                {CURRENCIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Tax Inclusive</InputLabel>
              <TextField select size="small" fullWidth value={form.tax_inclusive ? '1' : '0'} onChange={(e) => handleField('tax_inclusive', e.target.value === '1')}>
                <MenuItem value="1">Yes</MenuItem>
                <MenuItem value="0">No</MenuItem>
              </TextField>
            </Stack>
          </Stack>

          {/* Identifiers */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>GTIN</InputLabel>
              <TextField size="small" fullWidth value={form.gtin} onChange={(e) => handleField('gtin', e.target.value)} />
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>MPN</InputLabel>
              <TextField size="small" fullWidth value={form.mpn} onChange={(e) => handleField('mpn', e.target.value)} />
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Color Hex</InputLabel>
              <TextField size="small" fullWidth value={form.color_hex} onChange={(e) => handleField('color_hex', e.target.value)} placeholder="#000000" />
            </Stack>
          </Stack>

          {/* Images */}
          <Typography variant="subtitle1">Images</Typography>
          <Stack sx={{ gap: 1 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {existingImages.map((im) => (
                <Stack key={im.id} alignItems="center" spacing={0.5} sx={{ mr: 1, mb: 1 }}>
                  <Avatar variant="rounded" src={im.url} sx={{ width: 72, height: 72, borderRadius: 1, opacity: im._delete ? 0.4 : 1 }} />
                  {im.is_primary ? <Chip size="small" label="Primary" /> : null}
                  {im._delete ? <Chip size="small" color="warning" label="To delete" /> : null}
                  <Button size="small" onClick={() => toggleDeleteExisting(im.id)}>{im._delete ? 'Undo' : 'Remove'}</Button>
                </Stack>
              ))}
              {newImages.map((im, idx) => (
                <Stack key={`new-${idx}`} alignItems="center" spacing={0.5} sx={{ mr: 1, mb: 1 }}>
                  <Avatar variant="rounded" src={im.url} sx={{ width: 72, height: 72, borderRadius: 1 }} />
                  <Chip size="small" label="New" />
                  {im.is_primary ? <Chip size="small" label="Primary" /> : null}
                  <Button size="small" onClick={() => removeNewImage(idx)}>Remove</Button>
                </Stack>
              ))}
            </Stack>
            <Button component="label" variant="outlined" size="small">
              Add Images
              <input type="file" accept="image/*" hidden multiple onChange={onSelectImages} />
            </Button>
            {uploading && (
              <Stack sx={{ width: 240, mt: 1 }}>
                <LinearProgress variant="determinate" value={uploadPct} />
                <FormHelperText>Uploading… {uploadPct}%</FormHelperText>
              </Stack>
            )}
            <FormHelperText>First image becomes primary unless backend overrides.</FormHelperText>
          </Stack>

          <Divider />

          {/* Actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => {
              const backUrl = form.product_id ? `/products/${form.product_id}?tab=variants` : '/product-variants';
              router.push(backUrl);
            }}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading || !form.sku || !form.product_id}>
              {id ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}
