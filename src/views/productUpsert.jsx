'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as catalog } from 'store/catalog/slice';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';

import axiosServices from 'utils/axios';
import { createProduct, listBrands, listCategories, updateProduct, uploadProductImage } from 'api/catalog';

// MUI
import {
  Alert,
  Autocomplete,
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
import { uploadSingle } from 'api/upload';

const STATUS_LIST = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'DISABLED'];
const RECORD_STATUS_LIST = [
  { value: 1, label: 'ACTIVE' },
  { value: 2, label: 'INACTIVE' },
  { value: 3, label: 'ARCHIVED' }
];

const EMPTY = {
  id: '',
  brand_id: '',
  category_id: '',
  name: '',
  slug: '',
  description: '',
  spec_json: '',
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

function tryParseJSON(str) {
  if (!str || typeof str !== 'string') return null;
  try { return JSON.parse(str); } catch { return '__INVALID__'; }
}

export default function ProductUpsert() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();

  // detail from store
  const { productDetail } = useSelector((s) => s.catalog || {});
  const detail = productDetail || { data: null, loading: false, error: null };
  const product = detail.data;
  const error = detail.error;
  const loading = detail.loading;

  const [form, setForm] = useState(EMPTY);

  // --- Brand autocomplete state ---
  const [brandQuery, setBrandQuery] = useState('');
  const [brandOptions, setBrandOptions] = useState([]);
  const [brandPage, setBrandPage] = useState(1);
  const [brandTotalPages, setBrandTotalPages] = useState(1);
  const [brandLoading, setBrandLoading] = useState(false);
  const brandListboxRef = useRef(null);
  const [brandSel, setBrandSel] = useState(null); // {id,name,slug,logo_url}

  // --- Category autocomplete state ---
  const [catQuery, setCatQuery] = useState('');
  const [catOptions, setCatOptions] = useState([]);
  const [catPage, setCatPage] = useState(1);
  const [catTotalPages, setCatTotalPages] = useState(1);
  const [catLoading, setCatLoading] = useState(false);
  const catListboxRef = useRef(null);
  const [catSel, setCatSel] = useState(null); // {id,name,slug}

  // --- Images ---
  const [existingImages, setExistingImages] = useState([]); // from backend
  const [newFiles, setNewFiles] = useState([]); // File[]

  // fetch detail for edit
  useEffect(() => {
    if (!id) return;
    dispatch(catalog.productsGetRequest({ params: { id } }));
  }, [dispatch, id]);

  // hydrate when loaded
  useEffect(() => {
    if (!product || !id) return;
    setForm({
      id: product.id || '',
      brand_id: product.brand_id || product.brand?.id || '',
      category_id: product.category_id || product.category?.id || '',
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      spec_json: product.spec_json ? JSON.stringify(product.spec_json, null, 2) : '',
      status: product.status || 'SUBMITTED',
      record_status: product.record_status ?? 1,
    });

    setBrandSel(product.brand || null);
    setCatSel(product.category || null);
    setExistingImages(Array.isArray(product.images) ? product.images : []);
  }, [product, id]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const handleNameChange = (e) => {
    const value = e.target.value;
    setForm((p) => ({ ...p, name: value, slug: slugify(value) }));
  };

  // ----- Brand loader -----
  const loadBrands = async (p = 1, q = brandQuery, append = false) => {
    try {
      setBrandLoading(true);
      const res = await listBrands({ page: p, limit: 20, q });
      const rows = res?.data || res?.rows || [];
      const meta = res?.meta || { page: p, totalPages: 1 };
      setBrandOptions((prev) => (append ? [...prev, ...rows] : rows));
      setBrandPage(meta.page || p);
      setBrandTotalPages(meta.totalPages || 1);
    } catch {
      // ignore
    } finally {
      setBrandLoading(false);
    }
  };
  useEffect(() => { loadBrands(1, brandQuery, false); }, []);
  useEffect(() => {
    const t = setTimeout(() => loadBrands(1, brandQuery, false), 300);
    return () => clearTimeout(t);
  }, [brandQuery]);
  const onBrandListScroll = (e) => {
    const node = e.currentTarget;
    const nearBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 32;
    if (nearBottom && !brandLoading && brandPage < brandTotalPages) loadBrands(brandPage + 1, brandQuery, true);
  };

  // ----- Category loader -----
  const loadCategories = async (p = 1, q = catQuery, append = false) => {
    try {
      setCatLoading(true);
      const res = await listCategories({ page: p, limit: 20, q });
      const rows = res?.data || res?.rows || [];
      const meta = res?.meta || { page: p, totalPages: 1 };
      setCatOptions((prev) => (append ? [...prev, ...rows] : rows));
      setCatPage(meta.page || p);
      setCatTotalPages(meta.totalPages || 1);
    } catch {
      // ignore
    } finally {
      setCatLoading(false);
    }
  };
  useEffect(() => { loadCategories(1, catQuery, false); }, []);
  useEffect(() => {
    const t = setTimeout(() => loadCategories(1, catQuery, false), 300);
    return () => clearTimeout(t);
  }, [catQuery]);
  const onCatListScroll = (e) => {
    const node = e.currentTarget;
    const nearBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 32;
    if (nearBottom && !catLoading && catPage < catTotalPages) loadCategories(catPage + 1, catQuery, true);
  };

  // ----- Images -----
  const onSelectImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const result = await uploadSingle(files[0], 'products');//for chat gpt : fix this to upload and add to product images, you have api details
    setNewFiles((prev) => [...prev, ...files]);
  };
  const removeNewFile = (idx) => setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  const removeExistingImage = (imgId) => setExistingImages((prev) => prev.filter((im) => im.id !== imgId));

  // ----- Submit -----
  const handleSubmit = async () => {
    try {
      const boxArr = String(form.box_contents || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const spec = tryParseJSON(form.spec_json);

      if (spec === '__INVALID__') return enqueueSnackbar('Invalid JSON in Specifications', { variant: 'warning' });

      const payload = {
        brand_id: brandSel?.id || form.brand_id || null,
        category_id: catSel?.id || form.category_id || null,
        name: form.name?.trim(),
        slug: (form.slug || slugify(form.name)).trim(),
        description: form.description || null,
        spec_json: spec || null,
        status: 'APPROVED',
        record_status: Number(form.record_status ?? 1),
      };

      payload.images = [];// chat gpt : fix this also  create product/ update  product api info already there.

      let prodId = id || form.id;
      if (prodId) {
        await updateProduct(prodId, payload);
        enqueueSnackbar('Product updated', { variant: 'success' });
      } else {
        await createProduct(payload);
        enqueueSnackbar('Product created', { variant: 'success' });
      }

      router.push('/products');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong.';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const breadcrumb = useMemo(() => {
    const name = form?.name || id || 'new-product';
    return {
      heading: id ? 'edit-product' : 'create-product',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'products', to: '/products' },
        { title: name, i18n: false }
      ]
    };
  }, [form?.name, id]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        <Stack spacing={2}>
          {loading && <Alert severity="info">Loading product…</Alert>}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {/* Left */}
            <Stack flex={1} spacing={2}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Name</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="e.g., Galaxy S24"
                />
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel>Slug</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  value={form.slug}
                  onChange={(e) => handleField('slug', e.target.value)}
                  placeholder="galaxy-s24"
                />
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel>Description</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={4}
                  value={form.description}
                  onChange={(e) => handleField('description', e.target.value)}
                />
              </Stack>

              {/* Images */}
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Images</InputLabel>
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
            </Stack>

            {/* Right */}
            <Stack flex={1} spacing={2}>
              {/* Brand */}
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Brand</InputLabel>
                <Autocomplete
                  options={brandOptions}
                  value={brandSel}
                  loading={brandLoading}
                  size="small"
                  onChange={(_, v) => { setBrandSel(v); handleField('brand_id', v?.id || ''); }}
                  onOpen={() => loadBrands(1, brandQuery, false)}
                  getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
                  isOptionEqualToValue={(a, b) => a?.id === b?.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Search brand…"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {brandLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  ListboxProps={{ onScroll: onBrandListScroll, ref: brandListboxRef, style: { maxHeight: 320, overflow: 'auto' } }}
                />
              </Stack>

              {/* Category */}
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Category</InputLabel>
                <Autocomplete
                  options={catOptions}
                  value={catSel}
                  loading={catLoading}
                  onChange={(_, v) => { setCatSel(v); handleField('category_id', v?.id || ''); }}
                  onOpen={() => loadCategories(1, catQuery, false)}
                  getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
                  isOptionEqualToValue={(a, b) => a?.id === b?.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Search category…"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {catLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  ListboxProps={{ onScroll: onCatListScroll, ref: catListboxRef, style: { maxHeight: 320, overflow: 'auto' } }}
                />
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel>Specifications (JSON)</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={4}
                  value={form.spec_json}
                  onChange={(e) => handleField('spec_json', e.target.value)}
                  inputProps={{ style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' } }}
                />
              </Stack>

              <Stack sx={{ gap: 1 }}>
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
          </Stack>

          <Divider />

          {/* Actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => router.push('/products')}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading || !form.name}>
              {id ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}
