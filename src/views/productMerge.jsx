'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import { listProducts, mergeProducts, previewProductMerge } from 'api/catalog';

function attrKey(row) {
  return `${row.product_id}:${row.attribute_code}`;
}

function variantAttrKey(row) {
  return `${row.variant_id}:${row.source}:${row.attribute_code}`;
}

function defaultAttrKeys(attributes = [], survivorId) {
  const chosen = new Map();
  const ordered = [...attributes].sort((a, b) => {
    if (a.product_id === survivorId && b.product_id !== survivorId) return -1;
    if (b.product_id === survivorId && a.product_id !== survivorId) return 1;
    return 0;
  });
  for (const row of ordered) {
    if (!chosen.has(row.attribute_code)) chosen.set(row.attribute_code, attrKey(row));
  }
  return new Set(chosen.values());
}

function defaultVariantAttrKeys(variants = []) {
  const next = new Set();
  for (const variant of variants) {
    const seen = new Set();
    const ordered = [...(variant.attributes || [])].sort((a, b) => {
      if (a.source === 'variant' && b.source !== 'variant') return -1;
      if (b.source === 'variant' && a.source !== 'variant') return 1;
      return 0;
    });
    for (const row of ordered) {
      if (seen.has(row.attribute_code)) continue;
      seen.add(row.attribute_code);
      next.add(variantAttrKey(row));
    }
  }
  return next;
}

export default function ProductMerge() {
  const router = useRouter();
  const productAc = usePagedAutocomplete(listProducts);
  const [selected, setSelected] = useState([]);
  const [survivorId, setSurvivorId] = useState('');
  const [name, setName] = useState('');
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [attrKeys, setAttrKeys] = useState(new Set());
  const [variantAttrKeys, setVariantAttrKeys] = useState(new Set());
  const [imageIds, setImageIds] = useState(new Set());
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedIds = useMemo(() => selected.map((p) => p.id).filter(Boolean), [selected]);
  const selectedKey = selectedIds.slice().sort().join(',');

  useEffect(() => {
    if (selectedIds.length < 2) {
      setPreview(null);
      setPreviewError('');
      return undefined;
    }
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError('');
    previewProductMerge(selectedIds)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res;
        setPreview(data);
        const nextSurvivor = data.products?.some((p) => p.id === survivorId)
          ? survivorId
          : data.products?.[0]?.id || '';
        setSurvivorId(nextSurvivor);
        const keeper = data.products?.find((p) => p.id === nextSurvivor);
        setName(keeper?.name || '');
        setAttrKeys(defaultAttrKeys(data.attributes || [], nextSurvivor));
        setVariantAttrKeys(defaultVariantAttrKeys(data.variants || []));
        setImageIds(new Set((data.images || []).map((img) => img.id)));
        const categories = data.categories || [];
        const brands = data.brands || [];
        setCategoryId(categories.length === 1 ? String(categories[0].id || '') : String(keeper?.category_id || ''));
        setBrandId(brands.length === 1 ? String(brands[0].id || '') : String(keeper?.brand_id || ''));
      })
      .catch((err) => {
        if (cancelled) return;
        setPreview(null);
        setPreviewError(err?.response?.data?.message || err?.message || 'Could not load merge preview');
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // survivorId is applied after preview lands so a product add/remove does not loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const handleSurvivorChange = (id) => {
    setSurvivorId(id);
    const keeper = preview?.products?.find((p) => p.id === id);
    setName(keeper?.name || '');
    if (preview?.attributes) setAttrKeys(defaultAttrKeys(preview.attributes, id));
    if (preview?.variants) setVariantAttrKeys(defaultVariantAttrKeys(preview.variants));
    if ((preview?.categories || []).length > 1) setCategoryId(String(keeper?.category_id || ''));
    if ((preview?.brands || []).length > 1) setBrandId(String(keeper?.brand_id || ''));
  };

  const toggleAttr = (row, checked) => {
    setAttrKeys((prev) => {
      const next = new Set(prev);
      const key = attrKey(row);
      if (!checked) {
        next.delete(key);
        return next;
      }
      for (const other of preview?.attributes || []) {
        if (other.attribute_code === row.attribute_code) next.delete(attrKey(other));
      }
      next.add(key);
      return next;
    });
  };

  const toggleVariantAttr = (row, checked) => {
    setVariantAttrKeys((prev) => {
      const next = new Set(prev);
      const key = variantAttrKey(row);
      if (!checked) {
        next.delete(key);
        return next;
      }
      const variant = (preview?.variants || []).find((item) => item.id === row.variant_id);
      for (const other of variant?.attributes || []) {
        if (other.attribute_code === row.attribute_code) next.delete(variantAttrKey(other));
      }
      next.add(key);
      return next;
    });
  };

  const toggleImage = (id, checked) => {
    setImageIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const categories = preview?.categories || [];
  const brands = preview?.brands || [];
  const needsCategory = categories.length > 1;
  const needsBrand = brands.length > 1;
  const categoryChosen = !needsCategory || categories.some((item) => String(item.id || '') === categoryId);
  const brandChosen = !needsBrand || brands.some((item) => String(item.id || '') === brandId);
  const canSubmit =
    selectedIds.length >= 2
    && Boolean(survivorId)
    && Boolean(name.trim())
    && Boolean(preview)
    && categoryChosen
    && brandChosen;

  const handleMerge = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      const result = await mergeProducts({
        survivor_id: survivorId,
        name: name.trim(),
        product_ids: selectedIds,
        attribute_keys: (preview.attributes || [])
          .filter((row) => attrKeys.has(attrKey(row)))
          .map((row) => ({ product_id: row.product_id, attribute_code: row.attribute_code })),
        variant_attribute_keys: (preview.variants || [])
          .flatMap((variant) => variant.attributes || [])
          .filter((row) => variantAttrKeys.has(variantAttrKey(row)))
          .map((row) => ({
            variant_id: row.variant_id,
            source: row.source,
            attribute_code: row.attribute_code
          })),
        image_ids: [...imageIds],
        category_id: categoryId || null,
        brand_id: brandId || null
      });
      const product = result?.data?.product || result?.product;
      enqueueSnackbar('Products merged', { variant: 'success' });
      router.push(`/products/${product?.id || survivorId}`);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Merge failed', { variant: 'error' });
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <MainCard border={false} boxShadow showTitle={false}>
        <Stack spacing={3}>
          <Alert severity="info">
            Keep one product. Every variant from the others moves onto it. Store prices stay on their
            listings.
          </Alert>

          <Autocomplete
            multiple
            options={productAc.options}
            value={selected}
            loading={productAc.loading}
            onChange={(_, value) => setSelected(value)}
            onInputChange={(_, value, reason) => {
              if (reason === 'reset') return;
              productAc.setQuery(value);
            }}
            getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
            getOptionKey={(opt) => opt?.id || String(opt?.name || '')}
            isOptionEqualToValue={(a, b) => a?.id === b?.id}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search products"
                placeholder="Add two or more products"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {productAc.loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
            ListboxProps={{ onScroll: productAc.handleScroll, style: { maxHeight: 280, overflow: 'auto' } }}
          />

          {previewLoading ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Stack>
          ) : null}

          {previewError ? <Alert severity="error">{previewError}</Alert> : null}

          {preview ? (
            <>
              <FormControl>
                <FormLabel>Product to keep</FormLabel>
                <RadioGroup value={survivorId} onChange={(e) => handleSurvivorChange(e.target.value)}>
                  {(preview.products || []).map((product) => (
                    <FormControlLabel
                      key={product.id}
                      value={product.id}
                      control={<Radio />}
                      label={`${product.name}${product.category?.name ? ` · ${product.category.name}` : ''}`}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />

              {needsCategory ? (
                <FormControl>
                  <FormLabel>Category</FormLabel>
                  <RadioGroup value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    {categories.map((category) => (
                      <FormControlLabel
                        key={category.id || 'none'}
                        value={String(category.id || '')}
                        control={<Radio />}
                        label={category.name}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              ) : null}

              {needsBrand ? (
                <FormControl>
                  <FormLabel>Brand</FormLabel>
                  <RadioGroup value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                    {brands.map((brand) => (
                      <FormControlLabel
                        key={brand.id || 'none'}
                        value={String(brand.id || '')}
                        control={<Radio />}
                        label={brand.name}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              ) : null}

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Product attributes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  These stay on the product you keep. Checking a value unchecks the same
                  attribute from another product. Copy color or pack onto a SKU in the variant
                  list below.
                </Typography>
                <Stack>
                  {(preview.attributes || []).length ? (
                    preview.attributes.map((row) => (
                      <FormControlLabel
                        key={attrKey(row)}
                        control={
                          <Checkbox
                            checked={attrKeys.has(attrKey(row))}
                            onChange={(e) => toggleAttr(row, e.target.checked)}
                          />
                        }
                        label={`${row.attribute_name}: ${row.display_value || '—'} (${row.product_name})`}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No product attributes on the selected products.
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Images
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  {(preview.images || []).length ? (
                    preview.images.map((image) => (
                      <FormControlLabel
                        key={image.id}
                        sx={{ alignItems: 'flex-start', m: 0 }}
                        control={
                          <Checkbox
                            checked={imageIds.has(image.id)}
                            onChange={(e) => toggleImage(image.id, e.target.checked)}
                          />
                        }
                        label={
                          <Stack spacing={0.5} sx={{ width: 120 }}>
                            <Avatar
                              variant="rounded"
                              src={image.thumb_url || image.url}
                              alt={image.product_name}
                              sx={{ width: 96, height: 96 }}
                            />
                            <Typography variant="caption">{image.product_name}</Typography>
                          </Stack>
                        }
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No product images on the selected products.
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Variants
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Every variant below will move onto the product you keep. Check variant
                  attributes and product attributes to copy onto that SKU.
                </Typography>
                <Stack spacing={2}>
                  {(preview.variants || []).map((variant) => (
                    <Box key={variant.id}>
                      <Typography variant="subtitle2">
                        {variant.sku}
                        {` · ${variant.product_name}`}
                      </Typography>
                      {(variant.attributes || []).length ? (
                        <Stack>
                          {variant.attributes.map((row) => (
                            <FormControlLabel
                              key={variantAttrKey(row)}
                              control={
                                <Checkbox
                                  checked={variantAttrKeys.has(variantAttrKey(row))}
                                  onChange={(e) => toggleVariantAttr(row, e.target.checked)}
                                />
                              }
                              label={`${row.attribute_name}: ${row.display_value || '—'} (${row.source === 'product' ? 'from product' : 'variant'})`}
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No attributes on this variant.
                        </Typography>
                      )}
                    </Box>
                  ))}
                  {!(preview.variants || []).length ? (
                    <Typography variant="body2" color="text.secondary">
                      No variants on the selected products.
                    </Typography>
                  ) : null}
                </Stack>
              </Box>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={() => router.push('/products')}>Cancel</Button>
                <Button variant="contained" disabled={!canSubmit || saving} onClick={() => setConfirmOpen(true)}>
                  Merge
                </Button>
              </Stack>
            </>
          ) : null}
        </Stack>
      </MainCard>

      <Dialog open={confirmOpen} onClose={() => !saving && setConfirmOpen(false)}>
        <DialogTitle>Merge these products?</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedIds.length} products will become <strong>{name.trim() || 'this product'}</strong>.
            All variants move onto it. The other products are retired.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleMerge} disabled={saving}>
            {saving ? 'Merging…' : 'Merge'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
