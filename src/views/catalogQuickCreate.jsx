'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter, useSearchParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import {
  getProduct,
  getVariant,
  listAllVariants,
  listBrands,
  listCategories,
  listProducts,
  quickCreateCatalog,
  updateVariant
} from 'api/catalog';
import { createDef, listDefs, listProductAttrs, listVariantAttrs, upsertVariantAttr } from 'api/attributes';
import { uploadSingle } from 'api/upload';
import { RECORD_STATUS } from 'utils/constants';

function attributeCodeFromName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
}

function parsePipeAttrs(text) {
  return String(text || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      const idx = part.indexOf(':');
      if (idx <= 0) return null;
      return { code: part.slice(0, idx).trim(), value: part.slice(idx + 1).trim() };
    })
    .filter((x) => x?.code && x?.value);
}

function joinPipeAttrs(pairs) {
  return pairs
    .filter((p) => p.code && p.value)
    .map((p) => `${p.code}:${p.value}`)
    .join('|');
}

function parseImageUrls(text) {
  return String(text || '')
    .split(/[|,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinImageUrls(urls) {
  return (urls || []).filter(Boolean).join('|');
}

async function sha256Hex(text) {
  if (!text) return '';
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function attrValueFromRow(row) {
  if (row?.value_text != null && row.value_text !== '') return String(row.value_text);
  if (row?.value_decimal != null && row.value_decimal !== '') return String(row.value_decimal);
  if (row?.value_int != null && row.value_int !== '') return String(row.value_int);
  if (row?.value_bool != null) return String(row.value_bool);
  if (row?.value_json != null) {
    try {
      return typeof row.value_json === 'string' ? row.value_json : JSON.stringify(row.value_json);
    } catch {
      return '';
    }
  }
  return '';
}

/** Dual-mode attribute editor: pipe text + search/create rows */
function AttributePipeEditor({ label, value, onChange, helper }) {
  const defsAc = usePagedAutocomplete(listDefs);
  const [codeSel, setCodeSel] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [attrValue, setAttrValue] = useState('');
  const [creating, setCreating] = useState(false);

  const pairs = useMemo(() => parsePipeAttrs(value), [value]);

  const addPair = async () => {
    const rawCode = codeSel?.code || codeInput.trim();
    const code = attributeCodeFromName(rawCode);
    const val = attrValue.trim();
    if (!code || !val) {
      enqueueSnackbar('Attribute code and value are required', { variant: 'warning' });
      return;
    }

    const exists = defsAc.options.some((d) => d.code === code) || codeSel?.code === code;
    if (!exists && !codeSel) {
      try {
        setCreating(true);
        await createDef({
          code,
          name: rawCode || code,
          data_type: 'text'
        });
        enqueueSnackbar(`Created attribute ${code}`, { variant: 'success' });
      } catch (err) {
        const msg = err?.response?.data?.message || '';
        if (!/already exists/i.test(msg)) {
          enqueueSnackbar(msg || err?.message || 'Failed to create attribute', { variant: 'error' });
          setCreating(false);
          return;
        }
      } finally {
        setCreating(false);
      }
    }

    const next = [...pairs.filter((p) => p.code !== code), { code, value: val }];
    onChange(joinPipeAttrs(next));
    setCodeSel(null);
    setCodeInput('');
    setAttrValue('');
  };

  const removePair = (code) => {
    onChange(joinPipeAttrs(pairs.filter((p) => p.code !== code)));
  };

  return (
    <Stack spacing={1.5}>
      <InputLabel>{label}</InputLabel>
      <TextField
        size="small"
        fullWidth
        multiline
        minRows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="code:value|code:value"
      />
      {helper ? <FormHelperText>{helper}</FormHelperText> : null}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'flex-start' }}>
        <Autocomplete
          freeSolo
          size="small"
          sx={{ minWidth: 220, flex: 1 }}
          options={defsAc.options}
          value={codeSel}
          inputValue={codeInput}
          loading={defsAc.loading || creating}
          getOptionLabel={(o) => (typeof o === 'string' ? o : o?.code || o?.name || '')}
          isOptionEqualToValue={(a, b) => a?.code === b?.code}
          onChange={(_, v) => {
            if (typeof v === 'string') {
              setCodeSel(null);
              setCodeInput(v);
            } else {
              setCodeSel(v);
              setCodeInput(v?.code || '');
            }
          }}
          onInputChange={(_, v) => {
            setCodeInput(v);
            defsAc.setQuery(v);
            if (codeSel && v !== codeSel.code) setCodeSel(null);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Attribute"
              placeholder="Search or type new…"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {defsAc.loading || creating ? <CircularProgress color="inherit" size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          ListboxProps={{ onScroll: defsAc.handleScroll, style: { maxHeight: 240, overflow: 'auto' } }}
        />
        <TextField
          size="small"
          label="Value"
          value={attrValue}
          onChange={(e) => setAttrValue(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button variant="outlined" onClick={addPair} disabled={creating}>
          Add
        </Button>
      </Stack>

      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
        {pairs.map((p) => (
          <Chip key={p.code} label={`${p.code}:${p.value}`} onDelete={() => removePair(p.code)} size="small" />
        ))}
      </Stack>
    </Stack>
  );
}

AttributePipeEditor.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  helper: PropTypes.string
};

function ImageUrlField({ label, value, onChange, uploadPurpose, disabled, showGrid = true, maxImages }) {
  const [uploading, setUploading] = useState(false);
  const single = Number(maxImages) === 1;
  const urls = parseImageUrls(value).slice(0, single ? 1 : undefined);
  const atLimit = single && urls.length >= 1;

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setUploading(true);
      const res = await uploadSingle(file, undefined, { purpose: uploadPurpose });
      const url = res?.url || res?.data?.url;
      if (!url) throw new Error('Upload completed but URL missing');
      onChange(single ? url : joinImageUrls([...urls, url]));
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Upload failed', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const removeUrl = (target) => {
    if (disabled) return;
    onChange(joinImageUrls(urls.filter((x) => x !== target)));
  };

  const onTextChange = (raw) => {
    if (single) {
      const first = parseImageUrls(raw)[0] || raw.trim();
      onChange(first);
      return;
    }
    onChange(raw);
  };

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
      <Stack spacing={1} flex={1} minWidth={0}>
        <InputLabel>{label}</InputLabel>
        <TextField
          size="small"
          fullWidth
          multiline={!single}
          minRows={single ? 1 : 2}
          disabled={disabled}
          value={single ? urls[0] || value || '' : value}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={single ? 'https://… (or upload one image)' : 'https://…|https://…  (or upload)'}
        />
        <Button
          component="label"
          size="small"
          variant="outlined"
          disabled={disabled || uploading}
          sx={{ alignSelf: 'flex-start' }}
        >
          {uploading ? 'Uploading…' : single ? (atLimit ? 'Replace image' : 'Upload image') : 'Upload image'}
          <input hidden type="file" accept="image/*" onChange={onUpload} />
        </Button>
      </Stack>

      {showGrid ? (
        <Box
          sx={{
            width: { xs: '100%', md: single ? 140 : 320 },
            flexShrink: 0,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.25,
            bgcolor: 'grey.50',
            minHeight: single ? 120 : 140
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Preview {single ? '' : `(${urls.length})`}
          </Typography>
          {urls.length ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: single ? '1fr' : 'repeat(auto-fill, minmax(88px, 1fr))',
                gap: 1
              }}
            >
              {urls.map((u, idx) => (
                <Box
                  key={`${u}-${idx}`}
                  sx={{
                    position: 'relative',
                    pt: '100%',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: idx === 0 ? 'primary.main' : 'divider',
                    bgcolor: 'background.paper'
                  }}
                >
                  <Box
                    component="img"
                    src={u}
                    alt={`${label} ${idx + 1}`}
                    sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => window.open(u, '_blank')}
                  />
                  {!single && idx === 0 ? (
                    <Chip
                      size="small"
                      color="primary"
                      label="Primary"
                      sx={{ position: 'absolute', top: 4, left: 4, height: 20, '& .MuiChip-label': { px: 0.75, fontSize: 10 } }}
                    />
                  ) : null}
                  {!disabled ? (
                    <Button
                      size="small"
                      color="error"
                      variant="contained"
                      onClick={() => removeUrl(u)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        minWidth: 0,
                        width: 22,
                        height: 22,
                        p: 0,
                        fontSize: 14,
                        lineHeight: 1
                      }}
                    >
                      ×
                    </Button>
                  ) : null}
                </Box>
              ))}
            </Box>
          ) : (
            <Stack alignItems="center" justifyContent="center" sx={{ height: single ? 80 : 100, color: 'text.secondary' }}>
              <Typography variant="caption">No image yet</Typography>
            </Stack>
          )}
        </Box>
      ) : null}
    </Stack>
  );
}

ImageUrlField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  uploadPurpose: PropTypes.string,
  disabled: PropTypes.bool,
  showGrid: PropTypes.bool,
  maxImages: PropTypes.number
};

function statusLabel(value) {
  switch (Number(value)) {
    case RECORD_STATUS.ACTIVE:
      return { label: 'Active', color: 'success', bg: 'transparent' };
    case RECORD_STATUS.INACTIVE:
      return { label: 'Inactive', color: 'warning', bg: 'warning.lighter' };
    case RECORD_STATUS.ARCHIVED:
      return { label: 'Archived', color: 'error', bg: 'error.lighter' };
    default:
      return { label: 'Unknown', color: 'default', bg: 'grey.100' };
  }
}

function catalogOptionLabel(option) {
  if (typeof option === 'string') return option;
  const name = option?.name || option?.code || '';
  if (!name) return '';
  if (Number(option?.record_status) === RECORD_STATUS.ACTIVE || option?.record_status == null) return name;
  return `${name} — ${statusLabel(option.record_status).label}`;
}

function renderCatalogOption(props, option) {
  const { key, ...rest } = props;
  const status = statusLabel(option?.record_status);
  const inactive = Number(option?.record_status) !== RECORD_STATUS.ACTIVE && option?.record_status != null;
  return (
    <Box
      component="li"
      key={key}
      {...rest}
      sx={{
        bgcolor: inactive ? status.bg : undefined,
        '&.Mui-focused': { bgcolor: inactive ? status.bg : undefined },
        gap: 1
      }}
    >
      <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
        {option?.name || option?.code || '—'}
      </Typography>
      {inactive ? <Chip size="small" color={status.color} label={status.label} variant="light" /> : null}
    </Box>
  );
}

function productThumb(product) {
  const imgs = Array.isArray(product?.images) ? product.images : [];
  const primary = imgs.find((i) => i?.is_primary) || imgs[0];
  return primary?.thumb_url || primary?.url || product?.brand?.logo_thumb_url || product?.brand?.logo_url || '';
}

function ProductSummaryCard({ product, onOpen }) {
  if (!product?.id) return null;
  const thumb = productThumb(product);
  const status = statusLabel(product.record_status);
  return (
    <Card variant="outlined" sx={{ position: { md: 'sticky' }, top: { md: 16 } }}>
      <Box
        sx={{
          position: 'relative',
          pt: '56.25%',
          bgcolor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        {thumb ? (
          <Box
            component="img"
            src={thumb}
            alt={product.name}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0 }}>
            <Avatar variant="rounded" sx={{ width: 64, height: 64 }}>
              {(product.name || 'P')[0]}
            </Avatar>
          </Stack>
        )}
      </Box>
      <CardContent>
        <Stack spacing={1.25}>
          <Typography variant="subtitle1" fontWeight={600}>
            {product.name}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip size="small" color={status.color} label={status.label} variant="light" />
            {product.variant_count != null ? (
              <Chip size="small" variant="outlined" label={`${product.variant_count} variants`} />
            ) : null}
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Brand
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {product.brand?.logo_thumb_url || product.brand?.logo_url ? (
                <Avatar src={product.brand.logo_thumb_url || product.brand.logo_url} sx={{ width: 22, height: 22 }} />
              ) : null}
              <Typography variant="body2">{product.brand?.name || '—'}</Typography>
            </Stack>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Category
            </Typography>
            <Typography variant="body2">
              {[product.category?.parent?.name, product.category?.name].filter(Boolean).join(' › ') ||
                product.category?.name ||
                '—'}
            </Typography>
          </Stack>
          {product.description ? (
            <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {product.description}
            </Typography>
          ) : null}
          <Button size="small" variant="outlined" onClick={() => onOpen?.(product.id)}>
            Open product
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

ProductSummaryCard.propTypes = {
  product: PropTypes.object,
  onOpen: PropTypes.func
};

const EMPTY_FORM = {
  sku: '',
  variant_label: '',
  product_name: '',
  product_description: '',
  brand_name: '',
  brand_description: '',
  brand_image: '',
  parent_category_name: '',
  parent_category_description: '',
  parent_category_icon: '',
  category_name: '',
  category_description: '',
  category_icon: '',
  mrp: '',
  sale_price: '',
  tax_inclusive: true,
  barcode: '',
  gtin: '',
  mpn: '',
  color_hex: '',
  product_attributes: '',
  variant_attributes: '',
  variant_axes: '',
  product_images: '',
  variant_images: ''
};

export default function CatalogQuickCreateView() {
  const router = useRouter();
  const search = useSearchParams();
  const editId = search?.get('edit') || '';
  const presetProductId = search?.get('product_id') || '';
  const presetProductName = search?.get('product_name') || '';

  const [form, setForm] = useState(EMPTY_FORM);
  const [existingProduct, setExistingProduct] = useState(null);
  const [productSel, setProductSel] = useState(null);
  const [brandSel, setBrandSel] = useState(null);
  const [parentCatSel, setParentCatSel] = useState(null);
  const [catSel, setCatSel] = useState(null);
  const [axisSelected, setAxisSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(Boolean(editId));
  const [skuChecking, setSkuChecking] = useState(false);
  const [skuError, setSkuError] = useState('');

  const isNewProduct = !existingProduct;
  const showProductSetup = isNewProduct && !editId;
  const isExistingCategory = Boolean(catSel?.id);
  const isNewCategory = showProductSetup && Boolean(form.category_name.trim()) && !isExistingCategory;
  const isExistingParent = Boolean(parentCatSel?.id);
  const productAc = usePagedAutocomplete(listProducts);
  const brandAc = usePagedAutocomplete(listBrands);
  const parentCatAc = usePagedAutocomplete(listCategories, { level: 'root' });
  const catAc = usePagedAutocomplete(listCategories);

  const variantAttrCodes = useMemo(
    () => parsePipeAttrs(form.variant_attributes).map((p) => p.code),
    [form.variant_attributes]
  );

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  // Live SKU uniqueness check
  useEffect(() => {
    const sku = form.sku.trim();
    if (!sku) {
      setSkuError('');
      setSkuChecking(false);
      return undefined;
    }
    let cancelled = false;
    setSkuChecking(true);
    const t = setTimeout(async () => {
      try {
        const res = await listAllVariants({ q: sku, limit: 50 });
        const rows = res?.data || res?.rows || [];
        const hit = rows.find(
          (r) => String(r.sku || '').toLowerCase() === sku.toLowerCase() && String(r.id) !== String(editId || '')
        );
        if (!cancelled) setSkuError(hit ? `SKU already used${hit.product?.name ? ` on ${hit.product.name}` : ''}` : '');
      } catch {
        if (!cancelled) setSkuError('');
      } finally {
        if (!cancelled) setSkuChecking(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [form.sku, editId]);

  // Prefill product from query when creating under a product
  useEffect(() => {
    if (editId || !presetProductId) return;
    (async () => {
      try {
        const res = await getProduct(presetProductId);
        const product = res?.data || res;
        if (!product?.id) return;
        setExistingProduct(product);
        setProductSel(product);
        setBrandSel(product.brand || null);
        setCatSel(product.category || null);
        setForm((p) => ({
          ...p,
          product_name: product.name || presetProductName || '',
          product_description: product.description || '',
          brand_name: product.brand?.name || '',
          category_name: product.category?.name || ''
        }));
      } catch {
        if (presetProductName) setField('product_name', presetProductName);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, presetProductId]);

  // Load edit variant
  useEffect(() => {
    if (!editId) return;
    (async () => {
      setLoadingEdit(true);
      try {
        const res = await getVariant(editId);
        const variant = res?.data || res;
        let product = variant?.product || null;
        if (variant?.product_id) {
          try {
            const pRes = await getProduct(variant.product_id);
            product = pRes?.data || pRes || product;
          } catch {
            /* keep nested product */
          }
        }

        const [vAttrsRes, pAttrsRes] = await Promise.all([
          listVariantAttrs({ variant_id: editId, limit: 100 }),
          product?.id ? listProductAttrs({ product_id: product.id, limit: 100 }) : Promise.resolve({ data: [] })
        ]);
        const vAttrs = vAttrsRes?.data || [];
        const pAttrs = pAttrsRes?.data || [];

        const variantPipe = joinPipeAttrs(
          vAttrs.map((r) => ({
            code: r.attribute_code || r.attributeDef?.code,
            value: attrValueFromRow(r)
          }))
        );
        const productPipe = joinPipeAttrs(
          pAttrs.map((r) => ({
            code: r.attribute_code || r.attributeDef?.code,
            value: attrValueFromRow(r)
          }))
        );

        const axes = String(variant.option_signature || '')
          .split('|')
          .map((s) => s.split('=')[0]?.trim())
          .filter(Boolean);

        setExistingProduct(product || null);
        setProductSel(product || null);
        setBrandSel(product?.brand || null);
        setCatSel(product?.category || null);
        setAxisSelected(axes);
        setForm({
          ...EMPTY_FORM,
          sku: variant.sku || '',
          variant_label: '',
          product_name: product?.name || '',
          product_description: product?.description || '',
          brand_name: product?.brand?.name || '',
          category_name: product?.category?.name || '',
          mrp: variant.mrp ?? '',
          sale_price: variant.sale_price ?? '',
          tax_inclusive: variant.tax_inclusive !== false,
          barcode: variant.barcode || '',
          gtin: variant.gtin || '',
          mpn: variant.mpn || '',
          color_hex: variant.color_hex || '',
          product_attributes: productPipe,
          variant_attributes: variantPipe,
          variant_axes: axes.join('|'),
          variant_images: (variant.images || []).map((i) => i.url).filter(Boolean).join('|')
        });
      } catch (err) {
        enqueueSnackbar(err?.response?.data?.message || err?.message || 'Failed to load variant', { variant: 'error' });
      } finally {
        setLoadingEdit(false);
      }
    })();
  }, [editId]);

  useEffect(() => {
    setField('variant_axes', axisSelected.join('|'));
  }, [axisSelected]);

  const clearProductSetupFields = (productName = '') => {
    setExistingProduct(null);
    setProductSel(null);
    setBrandSel(null);
    setParentCatSel(null);
    setCatSel(null);
    setForm((p) => ({
      ...p,
      product_name: productName,
      product_description: '',
      brand_name: '',
      brand_description: '',
      brand_image: '',
      parent_category_name: '',
      parent_category_description: '',
      parent_category_icon: '',
      category_name: '',
      category_description: '',
      category_icon: '',
      product_attributes: '',
      product_images: ''
    }));
  };

  const onProductChange = async (_, v) => {
    if (v && typeof v === 'object' && v.id) {
      let product = v;
      try {
        const res = await getProduct(v.id);
        product = res?.data || res || v;
      } catch {
        /* use list row */
      }
      setExistingProduct(product);
      setProductSel(product);
      setBrandSel(product.brand || null);
      setParentCatSel(product.category?.parent || null);
      setCatSel(product.category || null);
      setForm((p) => ({
        ...p,
        product_name: product.name || '',
        product_description: product.description || '',
        brand_name: product.brand?.name || '',
        brand_description: '',
        brand_image: '',
        parent_category_name: product.category?.parent?.name || '',
        parent_category_description: '',
        parent_category_icon: '',
        category_name: product.category?.name || '',
        category_description: '',
        category_icon: '',
        product_attributes: '',
        product_images: ''
      }));
    } else if (typeof v === 'string') {
      clearProductSetupFields(v);
    } else {
      clearProductSetupFields('');
    }
  };

  const buildRow = () => ({
    sku: form.sku.trim(),
    variant_label: form.variant_label.trim(),
    product_name: form.product_name.trim(),
    product_description: isNewProduct ? form.product_description.trim() : '',
    brand_name: isNewProduct ? form.brand_name.trim() : '',
    brand_description: isNewProduct ? form.brand_description.trim() : '',
    brand_image: isNewProduct ? form.brand_image.trim() : '',
    parent_category_name: isNewProduct && isNewCategory ? form.parent_category_name.trim() : '',
    parent_category_description:
      isNewProduct && isNewCategory && !isExistingParent
        ? form.parent_category_description.trim() || form.category_description.trim()
        : '',
    parent_category_icon:
      isNewProduct && isNewCategory && !isExistingParent
        ? form.parent_category_icon.trim() || form.category_icon.trim()
        : '',
    category_name: isNewProduct ? form.category_name.trim() : '',
    category_description: isNewProduct && isNewCategory ? form.category_description.trim() : '',
    category_icon: isNewProduct && isNewCategory ? form.category_icon.trim() : '',
    mrp: form.mrp === '' ? '' : String(form.mrp),
    sale_price: form.sale_price === '' ? '' : String(form.sale_price),
    tax_inclusive: form.tax_inclusive ? 'TRUE' : 'FALSE',
    barcode: form.barcode.trim(),
    gtin: form.gtin.trim(),
    mpn: form.mpn.trim(),
    color_hex: form.color_hex.trim(),
    product_attributes: isNewProduct ? form.product_attributes.trim() : '',
    variant_attributes: form.variant_attributes.trim(),
    variant_axes: form.variant_axes.trim(),
    product_images: isNewProduct ? form.product_images.trim() : '',
    variant_images: form.variant_images.trim()
  });

  const handleSubmit = async () => {
    if (!form.sku.trim()) return enqueueSnackbar('SKU is required', { variant: 'warning' });
    if (skuError) return enqueueSnackbar(skuError, { variant: 'error' });
    if (skuChecking) return enqueueSnackbar('Still checking SKU…', { variant: 'info' });
    if (!form.product_name.trim()) return enqueueSnackbar('Product is required', { variant: 'warning' });

    setSaving(true);
    try {
      if (editId) {
        const pairs = parsePipeAttrs(form.variant_attributes);
        const optionObj = {};
        const axes = axisSelected.length ? axisSelected : pairs.map((p) => p.code);
        for (const p of pairs) {
          if (axes.includes(p.code)) optionObj[p.code] = p.value;
        }
        const keys = Object.keys(optionObj).sort();
        const option_signature = keys.map((k) => `${k}=${optionObj[k]}`).join('|');
        const option_hash = option_signature ? await sha256Hex(option_signature) : null;

        await updateVariant(editId, {
          sku: form.sku.trim(),
          barcode: form.barcode || null,
          mrp: form.mrp === '' ? null : Number(form.mrp),
          sale_price: form.sale_price === '' ? null : Number(form.sale_price),
          tax_inclusive: !!form.tax_inclusive,
          gtin: form.gtin || null,
          mpn: form.mpn || null,
          color_hex: form.color_hex || null,
          option_signature: option_signature || null,
          option_hash
        });

        for (const p of pairs) {
          await upsertVariantAttr(p.code, {
            variant_id: editId,
            attribute_code: p.code,
            value_text: p.value
          });
        }

        enqueueSnackbar('Variant updated', { variant: 'success' });
        router.push(`/product-variants/${editId}`);
        return;
      }

      const result = await quickCreateCatalog([buildRow()]);
      const row = result?.data?.rows?.[0] || result?.rows?.[0];
      const summary = result?.data?.summary || result?.summary;
      if (row?.status === 'failed' || summary?.failed) {
        enqueueSnackbar(row?.error || 'Create failed', { variant: 'error' });
        return;
      }
      enqueueSnackbar('Created — pending approval', { variant: 'success' });
      if (row?.variant_id) router.push(`/product-variants/${row.variant_id}`);
      else router.push('/product-variants');
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Save failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const breadcrumb = useMemo(() => {
    const skuLabel = editId ? form.sku || 'edit' : 'create';
    const productLabel = form.product_name || productSel?.name || '';
    const productId = form.product_id || productSel?.id || presetProductId || '';
    const links = [
      { title: 'home', to: '/dashboard' },
      { title: 'product-variants', to: '/product-variants' }
    ];
    if (productId && productLabel) {
      links.push({ title: productLabel, to: `/products/${productId}`, i18n: false });
    }
    links.push({ title: skuLabel, i18n: false });
    return {
      heading: editId ? 'update-variant' : 'create-variant',
      links
    };
  }, [
    editId,
    form.sku,
    form.product_name,
    form.product_id,
    productSel?.name,
    productSel?.id,
    presetProductId
  ]);

  if (loadingEdit) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow showTitle={false}>
        <Stack spacing={3} flex={1} minWidth={0} width="100%">
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} width="100%">
            <Stack spacing={3} flex={1}>
              {/* 1. Identity + pricing */}
              <Typography variant="h6">1. Variant & product</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  fullWidth
                  required
                  label="SKU"
                  value={form.sku}
                  onChange={(e) => setField('sku', e.target.value)}
                  error={Boolean(skuError)}
                  helperText={skuError || (skuChecking ? 'Checking SKU…' : 'Must be unique')}
                  InputProps={{
                    endAdornment: skuChecking ? <CircularProgress color="inherit" size={16} /> : null
                  }}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Variant label"
                  value={form.variant_label}
                  onChange={(e) => setField('variant_label', e.target.value)}
                />
              </Stack>

              <Autocomplete
                freeSolo
                size="small"
                options={productAc.options}
                value={productSel}
                inputValue={form.product_name}
                loading={productAc.loading}
                disabled={Boolean(editId)}
                getOptionLabel={catalogOptionLabel}
                isOptionEqualToValue={(a, b) => a?.id === b?.id}
                onChange={onProductChange}
                onInputChange={(_, v, reason) => {
                  if (reason === 'reset') return;
                  productAc.setQuery(v);
                  if (existingProduct && v !== existingProduct.name) {
                    clearProductSetupFields(v);
                    return;
                  }
                  if (!existingProduct && reason === 'clear') {
                    clearProductSetupFields('');
                    return;
                  }
                  setField('product_name', v);
                }}
                renderOption={renderCatalogOption}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Product"
                    required
                    placeholder="Search existing or type new name…"
                    helperText={
                      existingProduct
                        ? `Existing product selected${
                            Number(existingProduct.record_status) !== RECORD_STATUS.ACTIVE
                              ? ` (${statusLabel(existingProduct.record_status).label})`
                              : ''
                          } — brand / category / product attrs hidden`
                        : 'Type a new name to create product + brand / category below'
                    }
                  />
                )}
                ListboxProps={{ onScroll: productAc.handleScroll, style: { maxHeight: 280, overflow: 'auto' } }}
              />

              {showProductSetup ? (
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  label="Product description"
                  value={form.product_description}
                  onChange={(e) => setField('product_description', e.target.value)}
                />
              ) : null}

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField size="small" fullWidth label="MRP" value={form.mrp} onChange={(e) => setField('mrp', e.target.value)} />
                <TextField
                  size="small"
                  fullWidth
                  label="Sale price"
                  value={form.sale_price}
                  onChange={(e) => setField('sale_price', e.target.value)}
                />
                <FormControlLabel
                  control={
                    <Checkbox checked={!!form.tax_inclusive} onChange={(e) => setField('tax_inclusive', e.target.checked)} />
                  }
                  label="Tax inclusive"
                />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField size="small" fullWidth label="Barcode" value={form.barcode} onChange={(e) => setField('barcode', e.target.value)} />
                <TextField size="small" fullWidth label="GTIN" value={form.gtin} onChange={(e) => setField('gtin', e.target.value)} />
                <TextField size="small" fullWidth label="MPN" value={form.mpn} onChange={(e) => setField('mpn', e.target.value)} />
                <TextField
                  size="small"
                  fullWidth
                  label="Color hex"
                  value={form.color_hex}
                  onChange={(e) => setField('color_hex', e.target.value)}
                  placeholder="#000000"
                />
              </Stack>
            </Stack>

            {existingProduct ? (
              <Box sx={{ width: { xs: '100%', lg: 340 }, flexShrink: 0 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Selected product
                </Typography>
                <ProductSummaryCard product={existingProduct} onOpen={(id) => router.push(`/products/${id}`)} />
              </Box>
            ) : null}
          </Stack>
          {showProductSetup ? (
            <>
              <Divider />

              <Typography variant="h6">2. Brand</Typography>
              <Autocomplete
                freeSolo
                size="small"
                options={brandAc.options}
                value={brandSel}
                inputValue={form.brand_name}
                loading={brandAc.loading}
                getOptionLabel={catalogOptionLabel}
                isOptionEqualToValue={(a, b) => a?.id === b?.id}
                onChange={(_, v) => {
                  if (v && typeof v === 'object') {
                    setBrandSel(v);
                    setForm((p) => ({
                      ...p,
                      brand_name: v.name || '',
                      brand_description: v.description || '',
                      brand_image: v.logo_url || ''
                    }));
                  } else if (typeof v === 'string') {
                    setBrandSel(null);
                    setField('brand_name', v);
                  } else {
                    setBrandSel(null);
                    setField('brand_name', '');
                  }
                }}
                onInputChange={(_, v, reason) => {
                  if (reason === 'reset') return;
                  brandAc.setQuery(v);
                  setField('brand_name', v);
                }}
                renderOption={renderCatalogOption}
                renderInput={(params) => <TextField {...params} label="Brand" placeholder="Search or type new…" />}
                ListboxProps={{ onScroll: brandAc.handleScroll, style: { maxHeight: 240, overflow: 'auto' } }}
              />
              <TextField
                size="small"
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                label="Brand description"
                value={form.brand_description}
                onChange={(e) => setField('brand_description', e.target.value)}
              />
              <ImageUrlField
                label="Brand logo"
                value={form.brand_image}
                onChange={(v) => setField('brand_image', v)}
                uploadPurpose="brand"
                maxImages={1}
              />

              <Divider />

              <Typography variant="h6">3. Category</Typography>
              <Autocomplete
                freeSolo
                size="small"
                options={catAc.options}
                value={catSel}
                inputValue={form.category_name}
                loading={catAc.loading}
                getOptionLabel={catalogOptionLabel}
                isOptionEqualToValue={(a, b) => a?.id === b?.id}
                onChange={(_, v) => {
                  if (v && typeof v === 'object' && v.id) {
                    setCatSel(v);
                    const parent = v.parent || null;
                    setParentCatSel(parent);
                    setForm((p) => ({
                      ...p,
                      category_name: v.name || '',
                      category_description: v.description || '',
                      category_icon: v.icon_url || '',
                      parent_category_name: parent?.name || '',
                      parent_category_description: parent?.description || '',
                      parent_category_icon: parent?.icon_url || ''
                    }));
                  } else if (typeof v === 'string') {
                    setCatSel(null);
                    setParentCatSel(null);
                    setForm((p) => ({
                      ...p,
                      category_name: v,
                      category_description: '',
                      category_icon: '',
                      parent_category_name: '',
                      parent_category_description: '',
                      parent_category_icon: ''
                    }));
                  } else {
                    setCatSel(null);
                    setParentCatSel(null);
                    setForm((p) => ({
                      ...p,
                      category_name: '',
                      category_description: '',
                      category_icon: '',
                      parent_category_name: '',
                      parent_category_description: '',
                      parent_category_icon: ''
                    }));
                  }
                }}
                onInputChange={(_, v, reason) => {
                  if (reason === 'reset') return;
                  catAc.setQuery(v);
                  if (catSel && v !== catSel.name) {
                    setCatSel(null);
                    setParentCatSel(null);
                    setForm((p) => ({
                      ...p,
                      category_name: v,
                      category_description: '',
                      category_icon: '',
                      parent_category_name: '',
                      parent_category_description: '',
                      parent_category_icon: ''
                    }));
                    return;
                  }
                  setField('category_name', v);
                }}
                renderOption={renderCatalogOption}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    placeholder="Search existing or type new…"
                    helperText={
                      isExistingCategory
                        ? `Existing category selected${
                            Number(catSel?.record_status) !== RECORD_STATUS.ACTIVE
                              ? ` (${statusLabel(catSel.record_status).label})`
                              : ''
                          } — parent is locked`
                        : form.category_name.trim()
                          ? 'New category — optionally assign or create a parent below'
                          : 'Select an existing category or type a new name'
                    }
                  />
                )}
                ListboxProps={{ onScroll: catAc.handleScroll, style: { maxHeight: 240, overflow: 'auto' } }}
              />

              {isExistingCategory ? (
                <Alert severity={Number(catSel?.record_status) === RECORD_STATUS.ACTIVE ? 'info' : 'warning'}>
                  Using existing category
                  {Number(catSel?.record_status) !== RECORD_STATUS.ACTIVE
                    ? ` (${statusLabel(catSel.record_status).label})`
                    : ''}
                  {form.parent_category_name ? ` under parent “${form.parent_category_name}”` : ' (no parent)'}. Parent cannot be
                  changed here.
                </Alert>
              ) : null}

              {isNewCategory ? (
                <>
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={4}
                    label="Category description"
                    value={form.category_description}
                    onChange={(e) => setField('category_description', e.target.value)}
                  />
                  <ImageUrlField
                    label="Category icon"
                    value={form.category_icon}
                    onChange={(v) => setField('category_icon', v)}
                    uploadPurpose="category"
                    maxImages={1}
                  />

                  <Typography variant="subtitle1" sx={{ pt: 1 }}>
                    Parent category (optional)
                  </Typography>
                  <FormHelperText sx={{ mt: 0, mb: 1 }}>
                    Select an existing parent, or type a new parent name to create one.
                  </FormHelperText>
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={parentCatAc.options}
                    value={parentCatSel}
                    inputValue={form.parent_category_name}
                    loading={parentCatAc.loading}
                    getOptionLabel={catalogOptionLabel}
                    isOptionEqualToValue={(a, b) => a?.id === b?.id}
                    onChange={(_, v) => {
                      if (v && typeof v === 'object' && v.id) {
                        setParentCatSel(v);
                        setForm((p) => ({
                          ...p,
                          parent_category_name: v.name || '',
                          parent_category_description: v.description || '',
                          parent_category_icon: v.icon_url || ''
                        }));
                      } else if (typeof v === 'string') {
                        setParentCatSel(null);
                        setForm((p) => ({
                          ...p,
                          parent_category_name: v,
                          parent_category_description: '',
                          parent_category_icon: ''
                        }));
                      } else {
                        setParentCatSel(null);
                        setForm((p) => ({
                          ...p,
                          parent_category_name: '',
                          parent_category_description: '',
                          parent_category_icon: ''
                        }));
                      }
                    }}
                    onInputChange={(_, v, reason) => {
                      if (reason === 'reset') return;
                      parentCatAc.setQuery(v);
                      if (parentCatSel && v !== parentCatSel.name) {
                        setParentCatSel(null);
                        setForm((p) => ({
                          ...p,
                          parent_category_name: v,
                          parent_category_description: '',
                          parent_category_icon: ''
                        }));
                        return;
                      }
                      setField('parent_category_name', v);
                    }}
                    renderOption={renderCatalogOption}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Parent category"
                        placeholder="Search existing or type new…"
                        helperText={
                          isExistingParent
                            ? `Existing parent selected${
                                Number(parentCatSel?.record_status) !== RECORD_STATUS.ACTIVE
                                  ? ` (${statusLabel(parentCatSel.record_status).label})`
                                  : ''
                              }`
                            : form.parent_category_name.trim()
                              ? 'New parent will be created'
                              : 'Optional'
                        }
                      />
                    )}
                    ListboxProps={{ onScroll: parentCatAc.handleScroll, style: { maxHeight: 240, overflow: 'auto' } }}
                  />

                  {form.parent_category_name.trim() && !isExistingParent ? (
                    <>
                      <TextField
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={4}
                        label="Parent category description"
                        helperText="Leave empty to reuse category description"
                        value={form.parent_category_description}
                        onChange={(e) => setField('parent_category_description', e.target.value)}
                      />
                      <ImageUrlField
                        label="Parent category icon"
                        value={form.parent_category_icon}
                        onChange={(v) => setField('parent_category_icon', v)}
                        uploadPurpose="category"
                        maxImages={1}
                      />
                      {!form.parent_category_icon.trim() && form.category_icon.trim() ? (
                        <FormHelperText>Will reuse category icon if left empty</FormHelperText>
                      ) : null}
                    </>
                  ) : null}
                </>
              ) : null}

              <Divider />

              <Typography variant="h6">4. Product attributes</Typography>
              <AttributePipeEditor
                label="Product attributes"
                value={form.product_attributes}
                onChange={(v) => setField('product_attributes', v)}
                helper="Direct pipe string or search/create + Add. Missing defs are created automatically."
              />
            </>
          ) : null}

          <Divider />

          <Typography variant="h6">{showProductSetup ? '5. Variant attributes' : '2. Variant attributes'}</Typography>
          <AttributePipeEditor
            label="Variant attributes"
            value={form.variant_attributes}
            onChange={(v) => {
              setField('variant_attributes', v);
              const codes = parsePipeAttrs(v).map((p) => p.code);
              setAxisSelected((prev) => prev.filter((c) => codes.includes(c)));
            }}
            helper="These define the sellable options. Include connector/length/etc. when color alone is not unique."
          />

          <Typography variant="h6">{showProductSetup ? '6. Variant axes' : '3. Variant axes'}</Typography>
          <Autocomplete
            multiple
            size="small"
            options={variantAttrCodes}
            value={axisSelected.filter((c) => variantAttrCodes.includes(c))}
            onChange={(_, v) => setAxisSelected(v)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Axes (from variant attributes only)"
                placeholder={variantAttrCodes.length ? 'Select axes…' : 'Add variant attributes first'}
              />
            )}
          />

          <Divider />

          {showProductSetup ? (
            <>
              <Typography variant="h6">7. Product images</Typography>
              <ImageUrlField
                label="Product images"
                value={form.product_images}
                onChange={(v) => setField('product_images', v)}
                uploadPurpose="product"
              />
            </>
          ) : null}

          <Typography variant="h6">{showProductSetup ? '8. Variant images' : '4. Variant images'}</Typography>
          {editId ? (
            <FormHelperText sx={{ mt: 0 }}>
              Image changes on edit use <strong>Edit variant (shell)</strong> from the variant detail page.
            </FormHelperText>
          ) : null}
          <ImageUrlField
            label="Variant images"
            value={form.variant_images}
            onChange={(v) => setField('variant_images', v)}
            uploadPurpose="variant"
            disabled={Boolean(editId)}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => router.push('/product-variants')}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={saving || Boolean(skuError) || skuChecking}>
              {saving ? 'Saving…' : editId ? 'Update variant' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}
