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
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import MainCard from 'components/MainCard';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import { listCategoryAttrs } from 'api/attributes';
import { listProducts, mergeProducts, previewProductMerge } from 'api/catalog';
import { uploadSingle } from 'api/upload';
import { RECORD_STATUS } from 'utils/constants';

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

function formatMoney(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return `₹${n}`;
}

function variantPriceLabel(variant) {
  const sale = formatMoney(variant?.sale_price);
  const mrp = formatMoney(variant?.mrp);
  if (sale && mrp) return `Price ${sale}  ·  MRP ${mrp}`;
  if (sale) return `Price ${sale}`;
  if (mrp) return `MRP ${mrp}`;
  return 'No catalog price';
}

function groupChoices(groupByVariant = {}) {
  const used = [...new Set(Object.values(groupByVariant).filter(Boolean))];
  const max = used.reduce((next, group) => Math.max(next, Number(group) || 0), 0);
  return Array.from({ length: max + 1 }, (_, index) => String(index + 1));
}

function allowedChoices(def) {
  if (def?.data_type === 'bool') return ['true', 'false'];
  if (Array.isArray(def?.allowed_values) && def.allowed_values.length) {
    return def.allowed_values.map((value) => (value != null && typeof value === 'object' ? JSON.stringify(value) : String(value)));
  }
  return null;
}

function AddAttributeForm({ defs, loading, onAdd }) {
  const [def, setDef] = useState(null);
  const [value, setValue] = useState('');
  const choices = allowedChoices(def);

  const add = () => {
    const code = String(def?.code || '').trim();
    const next = String(value || '').trim();
    if (!code || !next) return;
    onAdd({
      attribute_code: code,
      attribute_name: def?.name || code,
      value_text: next
    });
    setValue('');
  };

  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap">
      <Autocomplete
        options={defs}
        loading={loading}
        value={def}
        onChange={(_, next) => {
          setDef(next);
          setValue('');
        }}
        getOptionLabel={(opt) => (opt?.name ? `${opt.name} (${opt.code})` : opt?.code || '')}
        isOptionEqualToValue={(a, b) => a?.code === b?.code}
        sx={{ width: 280, maxWidth: '100%' }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Attribute"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />
      {choices ? (
        <TextField
          select
          size="small"
          label="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{ width: 200, maxWidth: '100%' }}
        >
          {choices.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <TextField
          size="small"
          label="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{ width: 200, maxWidth: '100%' }}
        />
      )}
      <Button variant="outlined" onClick={add} disabled={!def?.code || !String(value).trim()} sx={{ height: 32 }}>
        Add
      </Button>
    </Stack>
  );
}

function AddedAttributes({ rows, onRemove }) {
  if (!rows.length) return null;
  return rows.map((row) => (
    <Grid key={`${row.variant_id || 'product'}:${row.attribute_code}`} size={{ xs: 12, sm: 6 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2">{`${row.attribute_name || row.attribute_code}: ${row.value_text} (new)`}</Typography>
        <Button size="small" onClick={() => onRemove(row)}>
          Remove
        </Button>
      </Stack>
    </Grid>
  ));
}

function ImageUploadButton({ label, disabled, onFiles }) {
  return (
    <Button component="label" variant="outlined" size="small" disabled={disabled}>
      {label}
      <input
        type="file"
        accept="image/*"
        hidden
        multiple
        onChange={(e) => {
          const { files } = e.target;
          if (files?.length) onFiles(files);
          e.target.value = '';
        }}
      />
    </Button>
  );
}

function GroupSelect({ variantId, value, options, onChange }) {
  return (
    <TextField select size="small" label="Group" value={value} onChange={(e) => onChange(variantId, e.target.value)} sx={{ minWidth: 140 }}>
      <MenuItem value="">None</MenuItem>
      {options.map((group) => (
        <MenuItem key={group} value={group}>
          {`Group ${group}`}
        </MenuItem>
      ))}
    </TextField>
  );
}

function rankGroupAttrRows(rows, winnerId) {
  return [...rows].sort((a, b) => {
    if (a.variant_id === winnerId && b.variant_id !== winnerId) return -1;
    if (b.variant_id === winnerId && a.variant_id !== winnerId) return 1;
    if (a.source === 'variant' && b.source !== 'variant') return -1;
    if (b.source === 'variant' && a.source !== 'variant') return 1;
    return 0;
  });
}

function distinctKeysForGroups(keys, cards = [], winnerByGroup = {}) {
  const next = new Set(keys);
  for (const card of cards) {
    const winnerId = winnerByGroup[card.group] || card.members[0]?.id;
    const rows = card.members.flatMap((item) => item.attributes || []);
    const chosen = new Map();
    for (const row of rankGroupAttrRows(rows, winnerId)) {
      const key = variantAttrKey(row);
      if (!next.has(key)) continue;
      if (!chosen.has(row.attribute_code)) chosen.set(row.attribute_code, key);
    }
    for (const row of rows) {
      const key = variantAttrKey(row);
      if (chosen.get(row.attribute_code) !== key) next.delete(key);
    }
  }
  return next;
}

export default function ProductMerge() {
  const router = useRouter();
  const productAc = usePagedAutocomplete(listProducts, { record_status: RECORD_STATUS.ACTIVE });
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
  const [groupByVariant, setGroupByVariant] = useState({});
  const [winnerByGroup, setWinnerByGroup] = useState({});
  const [groupImageIds, setGroupImageIds] = useState({});
  const [priceByGroup, setPriceByGroup] = useState({});
  const [newAttrs, setNewAttrs] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newVariantAttrs, setNewVariantAttrs] = useState([]);
  const [newVariantImages, setNewVariantImages] = useState([]);
  const [attrDefs, setAttrDefs] = useState([]);
  const [attrDefsLoading, setAttrDefsLoading] = useState(false);
  const [uploading, setUploading] = useState('');

  const selectedIds = useMemo(() => selected.map((p) => p.id).filter(Boolean), [selected]);
  const selectedKey = selectedIds.slice().sort().join(',');

  useEffect(() => {
    if (selectedIds.length < 2) {
      setPreview(null);
      setPreviewError('');
      setNewAttrs([]);
      setNewImages([]);
      setNewVariantAttrs([]);
      setNewVariantImages([]);
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
        const nextSurvivor = data.products?.some((p) => p.id === survivorId) ? survivorId : data.products?.[0]?.id || '';
        setSurvivorId(nextSurvivor);
        const keeper = data.products?.find((p) => p.id === nextSurvivor);
        setName(keeper?.name || '');
        setAttrKeys(defaultAttrKeys(data.attributes || [], nextSurvivor));
        setVariantAttrKeys(new Set());
        setImageIds(new Set((data.images || []).map((img) => img.id)));
        setGroupByVariant({});
        setWinnerByGroup({});
        setGroupImageIds({});
        setPriceByGroup({});
        setNewAttrs([]);
        setNewImages([]);
        setNewVariantAttrs([]);
        setNewVariantImages([]);
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

  useEffect(() => {
    if (!categoryId) {
      setAttrDefs([]);
      return undefined;
    }
    let cancelled = false;
    setAttrDefsLoading(true);
    listCategoryAttrs({ category_id: categoryId, limit: 100 })
      .then((res) => {
        if (cancelled) return;
        const rows = res?.data || [];
        const defs = [];
        const seen = new Set();
        for (const row of rows) {
          const def = row?.attributeDef;
          if (!def?.code || seen.has(def.code)) continue;
          seen.add(def.code);
          defs.push(def);
        }
        setAttrDefs(defs);
      })
      .catch(() => {
        if (!cancelled) setAttrDefs([]);
      })
      .finally(() => {
        if (!cancelled) setAttrDefsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const handleSurvivorChange = (id) => {
    setSurvivorId(id);
    const keeper = preview?.products?.find((p) => p.id === id);
    setName(keeper?.name || '');
    if (preview?.attributes) setAttrKeys(defaultAttrKeys(preview.attributes, id));
    if ((preview?.categories || []).length > 1) setCategoryId(String(keeper?.category_id || ''));
    if ((preview?.brands || []).length > 1) setBrandId(String(keeper?.brand_id || ''));
  };

  const toggleAttr = (row, checked) => {
    if (checked) {
      setNewAttrs((prev) => prev.filter((item) => item.attribute_code !== row.attribute_code));
    }
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

  const addProductAttr = (row) => {
    setAttrKeys((prev) => {
      const next = new Set(prev);
      for (const existing of preview?.attributes || []) {
        if (existing.attribute_code === row.attribute_code) next.delete(attrKey(existing));
      }
      return next;
    });
    setNewAttrs((prev) => [...prev.filter((item) => item.attribute_code !== row.attribute_code), row]);
  };

  const toggleVariantAttr = (row, checked, scopeIds) => {
    const scope = new Set(scopeIds?.length ? scopeIds : [row.variant_id]);
    if (checked) {
      setNewVariantAttrs((prev) => prev.filter((item) => !(scope.has(item.variant_id) && item.attribute_code === row.attribute_code)));
    }
    setVariantAttrKeys((prev) => {
      const next = new Set(prev);
      const key = variantAttrKey(row);
      if (!checked) {
        next.delete(key);
        return next;
      }
      for (const variant of preview?.variants || []) {
        if (!scope.has(variant.id)) continue;
        for (const other of variant.attributes || []) {
          if (other.attribute_code === row.attribute_code) next.delete(variantAttrKey(other));
        }
      }
      next.add(key);
      return next;
    });
  };

  const addVariantAttr = (scopeIds, row) => {
    const scope = new Set(scopeIds);
    setVariantAttrKeys((prev) => {
      const next = new Set(prev);
      for (const variant of preview?.variants || []) {
        if (!scope.has(variant.id)) continue;
        for (const other of variant.attributes || []) {
          if (other.attribute_code === row.attribute_code) next.delete(variantAttrKey(other));
        }
      }
      return next;
    });
    const ownerId = scope.has(row.variant_id) ? row.variant_id : scopeIds[0];
    setNewVariantAttrs((prev) => [
      ...prev.filter((item) => !(scope.has(item.variant_id) && item.attribute_code === row.attribute_code)),
      { ...row, variant_id: ownerId }
    ]);
  };

  const uploadImages = async (files, { purpose, variantId }) => {
    const list = Array.from(files || []);
    if (!list.length || uploading) return;
    setUploading(variantId || 'product');
    try {
      const uploaded = [];
      for (const file of list) {
        const res = await uploadSingle(file, undefined, {
          purpose,
          product_id: survivorId || undefined,
          variant_id: variantId || undefined
        });
        const url = res?.url || res?.data?.url || res?.result?.url || '';
        const thumb = res?.thumb_url || res?.data?.thumb_url || res?.result?.thumb_url || null;
        if (!url) throw new Error('Upload did not return a URL');
        uploaded.push({
          localId: `${url}-${uploaded.length}-${Date.now()}`,
          url,
          thumb_url: thumb,
          variant_id: variantId || null
        });
      }
      if (variantId) setNewVariantImages((prev) => [...prev, ...uploaded]);
      else setNewImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Image upload failed', { variant: 'error' });
    } finally {
      setUploading('');
    }
  };

  const setVariantGroup = (variantId, group) => {
    setGroupByVariant((prev) => ({ ...prev, [variantId]: group }));
    if (!group) return;
    setWinnerByGroup((prev) => (prev[group] ? prev : { ...prev, [group]: variantId }));
    setPriceByGroup((prev) => (prev[group] ? prev : { ...prev, [group]: variantId }));
    setGroupImageIds((prev) => {
      if (prev[group]) return prev;
      const variant = (preview?.variants || []).find((item) => item.id === variantId);
      return { ...prev, [group]: new Set((variant?.images || []).map((img) => img.id)) };
    });
  };

  const toggleGroupImage = (group, imageId, checked) => {
    setGroupImageIds((prev) => {
      const next = new Set(prev[group] || []);
      if (checked) next.add(imageId);
      else next.delete(imageId);
      return { ...prev, [group]: next };
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
  const variantSections = useMemo(() => {
    const variants = preview?.variants || [];
    const grouped = new Map();
    const ungrouped = [];
    for (const variant of variants) {
      const group = groupByVariant[variant.id] || '';
      if (!group) {
        ungrouped.push(variant);
        continue;
      }
      if (!grouped.has(group)) grouped.set(group, []);
      grouped.get(group).push(variant);
    }
    const cards = [...grouped.entries()]
      .map(([group, members]) => ({ group, members }))
      .filter((row) => row.members.length >= 2)
      .sort((a, b) => Number(a.group) - Number(b.group));
    const leftover = [...ungrouped];
    for (const [, members] of grouped) {
      if (members.length < 2) leftover.push(...members);
    }
    leftover.sort((a, b) => String(a.sku).localeCompare(String(b.sku)));
    return { cards, leftover };
  }, [preview, groupByVariant]);

  useEffect(() => {
    if (!variantSections.cards.length) return;
    setVariantAttrKeys((prev) => distinctKeysForGroups(prev, variantSections.cards, winnerByGroup));
  }, [variantSections, winnerByGroup]);

  const canSubmit =
    selectedIds.length >= 2 &&
    Boolean(survivorId) &&
    Boolean(name.trim()) &&
    Boolean(preview) &&
    categoryChosen &&
    brandChosen &&
    !uploading;

  const variantTargetId = (variantId) => {
    const group = groupByVariant[variantId];
    if (!group) return variantId;
    const card = variantSections.cards.find((item) => item.group === group);
    if (!card) return variantId;
    return winnerByGroup[card.group] || card.members[0].id;
  };

  const handleMerge = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      const freshVariantAttrs = new Map();
      for (const row of newVariantAttrs) {
        const variantId = variantTargetId(row.variant_id);
        freshVariantAttrs.set(`${variantId}:${row.attribute_code}`, {
          variant_id: variantId,
          attribute_code: row.attribute_code,
          value_text: row.value_text
        });
      }
      const selectedVariantKeys = distinctKeysForGroups(variantAttrKeys, variantSections.cards, winnerByGroup);
      const result = await mergeProducts({
        survivor_id: survivorId,
        name: name.trim(),
        product_ids: selectedIds,
        attribute_keys: (preview.attributes || [])
          .filter((row) => attrKeys.has(attrKey(row)))
          .map((row) => ({ product_id: row.product_id, attribute_code: row.attribute_code })),
        new_attributes: newAttrs.map((row) => ({
          attribute_code: row.attribute_code,
          value_text: row.value_text
        })),
        variant_attribute_keys: (preview.variants || [])
          .flatMap((variant) => variant.attributes || [])
          .filter((row) => selectedVariantKeys.has(variantAttrKey(row)))
          .filter((row) => !freshVariantAttrs.has(`${variantTargetId(row.variant_id)}:${row.attribute_code}`))
          .map((row) => ({
            variant_id: row.variant_id,
            source: row.source,
            attribute_code: row.attribute_code
          })),
        new_variant_attributes: [...freshVariantAttrs.values()],
        variant_merges: variantSections.cards.map((card) => {
          const winnerId = winnerByGroup[card.group] || card.members[0].id;
          return {
            survivor_variant_id: winnerId,
            source_variant_ids: card.members.filter((item) => item.id !== winnerId).map((item) => item.id),
            price_variant_id: priceByGroup[card.group] || winnerId,
            image_ids: [...(groupImageIds[card.group] || [])]
          };
        }),
        image_ids: [...imageIds],
        new_images: newImages.map((image) => ({
          url: image.url,
          thumb_url: image.thumb_url || null
        })),
        new_variant_images: newVariantImages.map((image) => ({
          variant_id: variantTargetId(image.variant_id),
          url: image.url,
          thumb_url: image.thumb_url || null
        })),
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
          <Alert severity="info">Keep one product. Every variant from the others moves onto it. Store prices stay on their listings.</Alert>

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
            <Stack spacing={2.5}>
              <Box>
                <FormControl sx={{ width: '100%' }}>
                  <FormLabel>Product to keep</FormLabel>
                  <RadioGroup value={survivorId} onChange={(e) => handleSurvivorChange(e.target.value)}>
                    <Grid container spacing={1} sx={{ mt: 0.5 }}>
                      {(preview.products || []).map((product) => (
                        <Grid key={product.id} size={{ xs: 12, sm: 6 }}>
                          <FormControlLabel
                            value={product.id}
                            control={<Radio />}
                            sx={{ m: 0, alignItems: 'flex-start', width: '100%' }}
                            label={`${product.name}${product.category?.name ? ` · ${product.category.name}` : ''}`}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </RadioGroup>
                </FormControl>

                <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth sx={{ mt: 2 }} />

                {needsCategory ? (
                  <FormControl sx={{ mt: 2, width: '100%' }}>
                    <FormLabel>Category</FormLabel>
                    <RadioGroup value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                      <Grid container spacing={1} sx={{ mt: 0.5 }}>
                        {categories.map((category) => (
                          <Grid key={category.id || 'none'} size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                              value={String(category.id || '')}
                              control={<Radio />}
                              sx={{ m: 0, alignItems: 'flex-start', width: '100%' }}
                              label={category.name}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </RadioGroup>
                  </FormControl>
                ) : null}

                {needsBrand ? (
                  <FormControl sx={{ mt: 2, width: '100%' }}>
                    <FormLabel>Brand</FormLabel>
                    <RadioGroup value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                      <Grid container spacing={1} sx={{ mt: 0.5 }}>
                        {brands.map((brand) => (
                          <Grid key={brand.id || 'none'} size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                              value={String(brand.id || '')}
                              control={<Radio />}
                              sx={{ m: 0, alignItems: 'flex-start', width: '100%' }}
                              label={brand.name}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </RadioGroup>
                  </FormControl>
                ) : null}
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Product attributes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  These stay on the product you keep. Checking a value unchecks the same attribute from another product. Copy color or pack
                  onto a SKU in the variant list below.
                </Typography>
                <Grid container spacing={1}>
                  {(preview.attributes || []).length ? (
                    preview.attributes.map((row) => (
                      <Grid key={attrKey(row)} size={{ xs: 12, sm: 6 }}>
                        <FormControlLabel
                          sx={{ m: 0, alignItems: 'flex-start', width: '100%' }}
                          control={<Checkbox checked={attrKeys.has(attrKey(row))} onChange={(e) => toggleAttr(row, e.target.checked)} />}
                          label={`${row.attribute_name}: ${row.display_value || '—'} (${row.product_name})`}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid size={12}>
                      <Typography variant="body2" color="text.secondary">
                        No product attributes on the selected products.
                      </Typography>
                    </Grid>
                  )}
                  <AddedAttributes
                    rows={newAttrs}
                    onRemove={(row) => setNewAttrs((prev) => prev.filter((item) => item.attribute_code !== row.attribute_code))}
                  />
                </Grid>
                {categoryId ? (
                  <AddAttributeForm defs={attrDefs} loading={attrDefsLoading} onAdd={addProductAttr} />
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Choose a category before adding an attribute.
                  </Typography>
                )}
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Images
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  {(preview.images || []).length
                    ? preview.images.map((image) => (
                      <FormControlLabel
                        key={image.id}
                        sx={{ alignItems: 'flex-start', m: 0 }}
                        control={<Checkbox checked={imageIds.has(image.id)} onChange={(e) => toggleImage(image.id, e.target.checked)} />}
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
                    : null}
                  {newImages.map((image) => (
                    <Stack key={image.localId} spacing={0.5} sx={{ width: 120 }}>
                      <Avatar variant="rounded" src={image.thumb_url || image.url} alt="New product" sx={{ width: 96, height: 96 }} />
                      <Typography variant="caption">New</Typography>
                      <Button size="small" onClick={() => setNewImages((prev) => prev.filter((item) => item.localId !== image.localId))}>
                        Remove
                      </Button>
                    </Stack>
                  ))}
                  {!(preview.images || []).length && !newImages.length ? (
                    <Typography variant="body2" color="text.secondary">
                      No product images on the selected products.
                    </Typography>
                  ) : null}
                </Stack>
                <Box sx={{ mt: 1 }}>
                  <ImageUploadButton
                    label={uploading === 'product' ? 'Uploading…' : 'Add image'}
                    disabled={Boolean(uploading)}
                    onFiles={(files) => uploadImages(files, { purpose: 'product' })}
                  />
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Variants
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Every SKU moves onto the product you keep. Put two SKUs in the same group only when they are the same item, then pick the
                  SKU, one price, images, and attributes to keep.
                </Typography>
                <Stack spacing={3} divider={<Divider />}>
                  {variantSections.cards.map((card) => {
                    const memberIds = card.members.map((item) => item.id);
                    const winnerId = winnerByGroup[card.group] || card.members[0].id;
                    const priceId = priceByGroup[card.group] || winnerId;
                    const groupImages = card.members.flatMap((item) => (item.images || []).map((image) => ({ ...image, sku: item.sku })));
                    const attrs = card.members.flatMap((item) => item.attributes || []);
                    const addedAttrs = newVariantAttrs.filter((row) => memberIds.includes(row.variant_id));
                    const addedImages = newVariantImages.filter((image) => memberIds.includes(image.variant_id));
                    return (
                      <Box key={`group-${card.group}`} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          {`Group ${card.group} — same item`}
                        </Typography>
                        <RadioGroup
                          value={winnerId}
                          onChange={(e) => setWinnerByGroup((prev) => ({ ...prev, [card.group]: e.target.value }))}
                        >
                          {card.members.map((variant) => (
                            <Stack key={variant.id} direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                              <FormControlLabel value={variant.id} control={<Radio />} label={`${variant.sku} · ${variant.product_name}`} />
                              <GroupSelect
                                variantId={variant.id}
                                value={groupByVariant[variant.id] || ''}
                                options={groupChoices(groupByVariant)}
                                onChange={setVariantGroup}
                              />
                            </Stack>
                          ))}
                        </RadioGroup>
                        <Divider sx={{ my: 2 }} />
                        <FormControl>
                          <FormLabel>Price to keep</FormLabel>
                          <RadioGroup
                            value={priceId}
                            onChange={(e) => setPriceByGroup((prev) => ({ ...prev, [card.group]: e.target.value }))}
                          >
                            {card.members.map((variant) => (
                              <FormControlLabel
                                key={`price-${variant.id}`}
                                value={variant.id}
                                control={<Radio />}
                                label={`${variant.sku} · ${variantPriceLabel(variant)}`}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Images from these SKUs
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={2}>
                          {groupImages.length
                            ? groupImages.map((image) => (
                              <FormControlLabel
                                key={image.id}
                                sx={{ alignItems: 'flex-start', m: 0 }}
                                control={
                                  <Checkbox
                                    checked={(groupImageIds[card.group] || new Set()).has(image.id)}
                                    onChange={(e) => toggleGroupImage(card.group, image.id, e.target.checked)}
                                  />
                                }
                                label={
                                  <Stack spacing={0.5} sx={{ width: 120 }}>
                                    <Avatar
                                      variant="rounded"
                                      src={image.thumb_url || image.url}
                                      alt={image.sku}
                                      sx={{ width: 96, height: 96 }}
                                    />
                                    <Typography variant="caption">{image.sku}</Typography>
                                  </Stack>
                                }
                              />
                            ))
                            : null}
                          {addedImages.map((image) => (
                            <Stack key={image.localId} spacing={0.5} sx={{ width: 120 }}>
                              <Avatar
                                variant="rounded"
                                src={image.thumb_url || image.url}
                                alt="New variant"
                                sx={{ width: 96, height: 96 }}
                              />
                              <Typography variant="caption">New</Typography>
                              <Button
                                size="small"
                                onClick={() => setNewVariantImages((prev) => prev.filter((item) => item.localId !== image.localId))}
                              >
                                Remove
                              </Button>
                            </Stack>
                          ))}
                          {!groupImages.length && !addedImages.length ? (
                            <Typography variant="body2" color="text.secondary">
                              No variant images on these SKUs.
                            </Typography>
                          ) : null}
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          <ImageUploadButton
                            label={uploading === winnerId ? 'Uploading…' : 'Add image'}
                            disabled={Boolean(uploading)}
                            onFiles={(files) => uploadImages(files, { purpose: 'variant', variantId: winnerId })}
                          />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Attributes on the SKU you keep
                        </Typography>
                        <Grid container spacing={1}>
                          {attrs.map((row) => (
                            <Grid key={variantAttrKey(row)} size={{ xs: 12, sm: 6 }}>
                              <FormControlLabel
                                sx={{ m: 0, alignItems: 'flex-start', width: '100%' }}
                                control={
                                  <Checkbox
                                    checked={variantAttrKeys.has(variantAttrKey(row))}
                                    onChange={(e) => toggleVariantAttr(row, e.target.checked, memberIds)}
                                  />
                                }
                                label={`${row.attribute_name}: ${row.display_value || '—'} (${row.source === 'product' ? 'from product' : 'variant'} · ${row.product_name})`}
                              />
                            </Grid>
                          ))}
                          <AddedAttributes
                            rows={addedAttrs}
                            onRemove={(row) =>
                              setNewVariantAttrs((prev) =>
                                prev.filter((item) => item.attribute_code !== row.attribute_code || item.variant_id !== row.variant_id)
                              )
                            }
                          />
                          {!attrs.length && !addedAttrs.length ? (
                            <Grid size={12}>
                              <Typography variant="body2" color="text.secondary">
                                No attributes on these SKUs.
                              </Typography>
                            </Grid>
                          ) : null}
                        </Grid>
                        {categoryId ? (
                          <AddAttributeForm
                            defs={attrDefs}
                            loading={attrDefsLoading}
                            onAdd={(row) => addVariantAttr(memberIds, { ...row, variant_id: winnerId })}
                          />
                        ) : null}
                      </Box>
                    );
                  })}
                  {variantSections.leftover.map((variant) => {
                    const addedAttrs = newVariantAttrs.filter((row) => row.variant_id === variant.id);
                    const addedImages = newVariantImages.filter((image) => image.variant_id === variant.id);
                    return (
                      <Box key={variant.id}>
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
                          <Typography variant="subtitle2">
                            {variant.sku}
                            {` · ${variant.product_name}`}
                          </Typography>
                          <GroupSelect
                            variantId={variant.id}
                            value={groupByVariant[variant.id] || ''}
                            options={groupChoices(groupByVariant)}
                            onChange={setVariantGroup}
                          />
                        </Stack>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 1 }}>
                          {(variant.images || []).length
                            ? variant.images.map((image) => (
                              <Stack key={image.id} spacing={0.5} sx={{ width: 120 }}>
                                <Avatar
                                  variant="rounded"
                                  src={image.thumb_url || image.url}
                                  alt={variant.sku}
                                  sx={{ width: 96, height: 96 }}
                                />
                                <Typography variant="caption">{variant.sku}</Typography>
                              </Stack>
                            ))
                            : null}
                          {addedImages.map((image) => (
                            <Stack key={image.localId} spacing={0.5} sx={{ width: 120 }}>
                              <Avatar
                                variant="rounded"
                                src={image.thumb_url || image.url}
                                alt={variant.sku}
                                sx={{ width: 96, height: 96 }}
                              />
                              <Typography variant="caption">New</Typography>
                              <Button
                                size="small"
                                onClick={() => setNewVariantImages((prev) => prev.filter((item) => item.localId !== image.localId))}
                              >
                                Remove
                              </Button>
                            </Stack>
                          ))}
                          {!(variant.images || []).length && !addedImages.length ? (
                            <Typography variant="body2" color="text.secondary">
                              No variant images on this SKU.
                            </Typography>
                          ) : null}
                        </Stack>
                        <ImageUploadButton
                          label={uploading === variant.id ? 'Uploading…' : 'Add image'}
                          disabled={Boolean(uploading)}
                          onFiles={(files) => uploadImages(files, { purpose: 'variant', variantId: variant.id })}
                        />
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={1}>
                          {(variant.attributes || []).map((row) => (
                            <Grid key={variantAttrKey(row)} size={{ xs: 12, sm: 6 }}>
                              <FormControlLabel
                                sx={{ m: 0, alignItems: 'flex-start', width: '100%' }}
                                control={
                                  <Checkbox
                                    checked={variantAttrKeys.has(variantAttrKey(row))}
                                    onChange={(e) => toggleVariantAttr(row, e.target.checked, [variant.id])}
                                  />
                                }
                                label={`${row.attribute_name}: ${row.display_value || '—'} (${row.source === 'product' ? 'from product' : 'variant'})`}
                              />
                            </Grid>
                          ))}
                          <AddedAttributes
                            rows={addedAttrs}
                            onRemove={(row) =>
                              setNewVariantAttrs((prev) =>
                                prev.filter((item) => item.attribute_code !== row.attribute_code || item.variant_id !== row.variant_id)
                              )
                            }
                          />
                          {!(variant.attributes || []).length && !addedAttrs.length ? (
                            <Grid size={12}>
                              <Typography variant="body2" color="text.secondary">
                                No attributes on this variant.
                              </Typography>
                            </Grid>
                          ) : null}
                        </Grid>
                        {categoryId ? (
                          <AddAttributeForm defs={attrDefs} loading={attrDefsLoading} onAdd={(row) => addVariantAttr([variant.id], row)} />
                        ) : null}
                      </Box>
                    );
                  })}
                  {!(preview.variants || []).length ? (
                    <Typography variant="body2" color="text.secondary">
                      No variants on the selected products.
                    </Typography>
                  ) : null}
                </Stack>
              </Box>

              {variantAttrKeys.size === 0 && newVariantAttrs.length === 0 ? (
                <Alert severity="warning">No variant attributes are selected.</Alert>
              ) : null}

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={() => router.push('/products')}>Cancel</Button>
                <Button variant="contained" disabled={!canSubmit || saving} onClick={() => setConfirmOpen(true)}>
                  Merge
                </Button>
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      </MainCard>

      <Dialog open={confirmOpen} onClose={() => !saving && setConfirmOpen(false)}>
        <DialogTitle>Merge these products?</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedIds.length} products will become <strong>{name.trim() || 'this product'}</strong>.
            {variantSections.cards.length
              ? ` ${variantSections.cards
                .map((card) => {
                  const winner = card.members.find((item) => item.id === (winnerByGroup[card.group] || card.members[0].id));
                  return `${card.members.length} SKUs will become ${winner?.sku || 'one SKU'}`;
                })
                .join('. ')}.`
              : ' All variants move onto it.'}{' '}
            The other products are retired.
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
