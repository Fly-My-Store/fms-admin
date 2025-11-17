'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as catalog } from 'store/catalog/slice';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';

import { createVariant, updateVariant, uploadVariantImage } from 'api/catalog';

// MUI
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormHelperText,
  InputLabel,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';

const STATUS_LIST = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'DISABLED'];
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
  option_rows: [{ key: 'color_name', value: '' }], // used to compute signature/hash
  option_signature: '',
  option_hash: '',
  mrp: '',
  sale_price: '',
  currency: 'INR',
  tax_inclusive: true,
  gtin: '',
  mpn: '',
  color_hex: '',
  length_cm: '',
  width_cm: '',
  height_cm: '',
  weight_g: '',
  pkg_length_cm: '',
  pkg_width_cm: '',
  pkg_height_cm: '',
  status: 'DRAFT',
  record_status: 1
};

function slugify(s = '') {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

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
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const { id } = useParams();
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
  const [newFiles, setNewFiles] = useState([]); // File[]

  // fetch detail for edit
  useEffect(() => {
    if (!id) return;
    dispatch(catalog.variantsGetRequest({ params: { id } }));
  }, [dispatch, id]);

  // hydrate when loaded
  useEffect(() => {
    if (!variant) return;
    setForm((prev) => ({
      ...prev,
      id: variant.id || '',
      product_id: variant.product_id || prev.product_id || '',
      sku: variant.sku || '',
      barcode: variant.barcode || '',
      option_rows: (() => {
        // attempt to reverse signature into rows for editing convenience
        const sig = variant.option_signature || '';
        if (!sig) return [{ key: 'color_name', value: '' }];
        const rows = sig.split('|').map((p) => {
          const [k, ...rest] = p.split('=');
          return { key: k || '', value: rest.join('=') || '' };
        });
        return rows.length ? rows : [{ key: 'color_name', value: '' }];
      })(),
      option_signature: variant.option_signature || '',
      option_hash: variant.option_hash || '',
      mrp: variant.mrp ?? '',
      sale_price: variant.sale_price ?? '',
      currency: variant.currency || 'INR',
      tax_inclusive: !!variant.tax_inclusive,
      gtin: variant.gtin || '',
      mpn: variant.mpn || '',
      color_hex: variant.color_hex || '',
      length_cm: variant.length_cm ?? '',
      width_cm: variant.width_cm ?? '',
      height_cm: variant.height_cm ?? '',
      weight_g: variant.weight_g ?? '',
      pkg_length_cm: variant.pkg_length_cm ?? '',
      pkg_width_cm: variant.pkg_width_cm ?? '',
      pkg_height_cm: variant.pkg_height_cm ?? '',
      status: variant.status || 'SUBMITTED',
      record_status: variant.record_status ?? 1
    }));

    setExistingImages(Array.isArray(variant.images) ? variant.images : []);
  }, [variant]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  // ----- Option rows -----
  const updateOptionRow = (idx, key, value) => {
    setForm((p) => {
      const arr = [...p.option_rows];
      arr[idx] = { ...(arr[idx] || {}), [key]: value };
      return { ...p, option_rows: arr };
    });
  };
  const addOptionRow = () => setForm((p) => ({ ...p, option_rows: [...p.option_rows, { key: '', value: '' }] }));
  const removeOptionRow = (idx) =>
    setForm((p) => ({ ...p, option_rows: p.option_rows.filter((_, i) => i !== idx) }));

  // recompute signature+hash when rows change
  useEffect(() => {
    (async () => {
      const sig = buildOptionSignature(form.option_rows);
      let hash = '';
      try {
        hash = sig ? await sha256Hex(sig) : '';
      } catch (e) {
        hash = ''; // very old browsers
      }
      setForm((p) => ({ ...p, option_signature: sig, option_hash: hash }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(form.option_rows)]);

  // ----- Images -----
  const onSelectImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
  };
  const removeNewFile = (idx) => setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  const removeExistingImage = (imgId) => setExistingImages((prev) => prev.filter((im) => im.id !== imgId));

  // ----- Submit -----
  const handleSubmit = async () => {
    try {
      if (!form.product_id) {
        return enqueueSnackbar('Missing product id. Open this page from a Product details screen.', { variant: 'warning' });
      }
      if (!form.sku?.trim()) {
        return enqueueSnackbar('SKU is required', { variant: 'warning' });
      }
      if (!form.option_signature) {
        return enqueueSnackbar('Add at least one variant option (e.g. color_name=Black)', { variant: 'warning' });
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
        length_cm: toNumOrNull(form.length_cm),
        width_cm: toNumOrNull(form.width_cm),
        height_cm: toNumOrNull(form.height_cm),
        weight_g: toNumOrNull(form.weight_g),
        pkg_length_cm: toNumOrNull(form.pkg_length_cm),
        pkg_width_cm: toNumOrNull(form.pkg_width_cm),
        pkg_height_cm: toNumOrNull(form.pkg_height_cm),
        status: form.status,
        record_status: Number(form.record_status ?? 1)
      };

      let variantId = id || form.id;
      if (variantId) {
        await updateVariant(variantId, payload);
        enqueueSnackbar('Variant updated', { variant: 'success' });
      } else {
        const res = await createVariant(form.product_id, payload);
        variantId = res?.data?.id || res?.data?.data?.id;
        enqueueSnackbar('Variant created', { variant: 'success' });
      }

      if (variantId && newFiles.length) {
        for (let i = 0; i < newFiles.length; i += 1) {
          try {
            await uploadVariantImage(variantId, newFiles[i], { position: existingImages.length + i });
          } catch {
            enqueueSnackbar('Some images failed to upload', { variant: 'warning' });
          }
        }
      }

      const backUrl = form.product_id ? `/products/${form.product_id}?tab=variants` : '/product-variants';
      router.push(backUrl);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong.';
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
        { title: 'product-variants', to: `/products/${product_id_from_query}?t=variants` },
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

          {/* One-column form */}
          <Stack spacing={2}>
            {/* Identity */}
            <Typography variant="subtitle1">Identity</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Stack flex={1} sx={{ gap: 1 }}>
                <InputLabel>SKU *</InputLabel>
                <TextField size="small" fullWidth value={form.sku} onChange={(e) => handleField('sku', e.target.value)} placeholder="IP17-BLK-256" />
              </Stack>
              <Stack flex={1} sx={{ gap: 1 }}>
                <InputLabel>Barcode</InputLabel>
                <TextField size="small" fullWidth value={form.barcode} onChange={(e) => handleField('barcode', e.target.value)} placeholder="EAN/GTIN" />
              </Stack>
            </Stack>

            {/* Options */}
            <Typography variant="subtitle1">Variant Options</Typography>
            <Stack spacing={1}>
              {form.option_rows.map((row, idx) => (
                <Stack key={idx} direction={{ xs: 'column', md: 'row' }} spacing={1}>
                  <Stack flex={1} sx={{ gap: 1 }}>
                    <InputLabel>Key</InputLabel>
                    <TextField size="small" fullWidth value={row.key} onChange={(e) => updateOptionRow(idx, 'key', e.target.value)} placeholder="e.g., color_name" />
                  </Stack>
                  <Stack flex={1} sx={{ gap: 1 }}>
                    <InputLabel>Value</InputLabel>
                    <TextField size="small" fullWidth value={row.value} onChange={(e) => updateOptionRow(idx, 'value', e.target.value)} placeholder="e.g., Black" />
                  </Stack>
                  <Stack justifyContent="flex-end">
                    <Button color="error" onClick={() => removeOptionRow(idx)} sx={{ mt: { xs: 1.6, md: 3.8 } }}>
                      Remove
                    </Button>
                  </Stack>
                </Stack>
              ))}
              <Button variant="outlined" size="small" onClick={addOptionRow}>
                Add Option
              </Button>
              <FormHelperText>Signature is generated from these pairs (sorted by key).</FormHelperText>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Stack flex={1} sx={{ gap: 1 }}>
                  <InputLabel>Option Signature</InputLabel>
                  <TextField size="small" fullWidth value={form.option_signature} InputProps={{ readOnly: true }} />
                </Stack>
                <Stack flex={1} sx={{ gap: 1 }}>
                  <InputLabel>Option Hash</InputLabel>
                  <TextField size="small" fullWidth value={form.option_hash} InputProps={{ readOnly: true }} />
                </Stack>
              </Stack>
            </Stack>

            {/* Pricing */}
            <Typography variant="subtitle1">Pricing</Typography>
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
            <Typography variant="subtitle1">Identifiers</Typography>
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

            {/* Physical */}
            <Typography variant="subtitle1">Physical</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Stack flex={1} sx={{ gap: 1 }}>
                <InputLabel>Length (cm)</InputLabel>
                <TextField size="small" fullWidth value={form.length_cm} onChange={(e) => handleField('length_cm', e.target.value)} />
              </Stack>
              <Stack flex={1} sx={{ gap: 1 }}>
                <InputLabel>Width (cm)</InputLabel>
                <TextField size="small" fullWidth value={form.width_cm} onChange={(e) => handleField('width_cm', e.target.value)} />
              </Stack>
              <Stack flex={1} sx={{ gap: 1 }}>
                <InputLabel>Height (cm)</InputLabel>
                <TextField size="small" fullWidth value={form.height_cm} onChange={(e) => handleField('height_cm', e.target.value)} />
              </Stack>
              <Stack flex={1} sx={{ gap: 1 }}>
                <InputLabel>Weight (g)</InputLabel>
                <TextField size="small" fullWidth value={form.weight_g} onChange={(e) => handleField('weight_g', e.target.value)} />
              </Stack>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Stack flex={1} sx={{ gap: 1 }}>
                <InputLabel>Pkg Length (cm)</InputLabel>
                <TextField size="small" fullWidth value={form.pkg_length_cm} onChange={(e) => handleField('pkg_length_cm', e.target.value)} />
              </Stack>
              <Stack flex={1} sx={{ gap: 1 }}>
                <InputLabel>Pkg Width (cm)</InputLabel>
                <TextField size="small" fullWidth value={form.pkg_width_cm} onChange={(e) => handleField('pkg_width_cm', e.target.value)} />
              </Stack>
              <Stack flex={1} sx={{ gap: 1 }}>
                <InputLabel>Pkg Height (cm)</InputLabel>
                <TextField size="small" fullWidth value={form.pkg_height_cm} onChange={(e) => handleField('pkg_height_cm', e.target.value)} />
              </Stack>
            </Stack>

            {/* Images */}
            <Typography variant="subtitle1">Images</Typography>
            <Stack sx={{ gap: 1 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {existingImages.map((im) => (
                  <Stack key={im.id} alignItems="center" spacing={0.5} sx={{ mr: 1, mb: 1 }}>
                    <Avatar variant="rounded" src={im.url} sx={{ width: 72, height: 72, borderRadius: 1 }} />
                    {im.is_primary ? <Chip size="small" label="Primary" /> : null}
                    <Button size="small" onClick={() => removeExistingImage(im.id)}>Remove</Button>
                  </Stack>
                ))}
                {newFiles.map((f, idx) => (
                  <Stack key={`new-${idx}`} alignItems="center" spacing={0.5} sx={{ mr: 1, mb: 1 }}>
                    <Avatar variant="rounded" src={URL.createObjectURL(f)} sx={{ width: 72, height: 72, borderRadius: 1 }} />
                    <Chip size="small" label="New" />
                    <Button size="small" onClick={() => removeNewFile(idx)}>Remove</Button>
                  </Stack>
                ))}
              </Stack>
              <Button component="label" variant="outlined" size="small">
                Add Images
                <input type="file" accept="image/*" hidden multiple onChange={onSelectImages} />
              </Button>
              <FormHelperText>First image becomes primary unless backend overrides.</FormHelperText>
            </Stack>

            {/* Status */}
            <Typography variant="subtitle1">Status</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Stack flex={1} sx={{ gap: 1 }}>
                <InputLabel>Status</InputLabel>
                <TextField select size="small" fullWidth value={form.status} onChange={(e) => handleField('status', e.target.value)}>
                  {STATUS_LIST.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack flex={1} sx={{ gap: 1 }}>
                <InputLabel>Record Status</InputLabel>
                <TextField select size="small" fullWidth value={form.record_status} onChange={(e) => handleField('record_status', e.target.value)}>
                  {RECORD_STATUS_LIST.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
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
