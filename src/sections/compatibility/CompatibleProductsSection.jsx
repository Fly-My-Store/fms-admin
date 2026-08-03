'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';

import {
  createCompatibilityProduct,
  listBrands,
  listCompatibilities,
  listProducts,
  putCompatibilities
} from 'api/catalog';

function usePagedSearch(listFn, extraParams = {}) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await listFn({ page: 1, limit: 30, q: query || undefined, ...extraParams });
        if (!cancelled) setOptions(res?.data || []);
      } catch {
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, listFn, JSON.stringify(extraParams)]);

  return { query, setQuery, options, loading };
}

/**
 * Map any product (and optional variant) to other compatible products.
 */
export default function CompatibleProductsSection({
  productId,
  variantId = null,
  title = 'Compatible products'
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [brandValue, setBrandValue] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [creating, setCreating] = useState(false);

  const productSearch = usePagedSearch(listProducts);
  const brandSearch = usePagedSearch(listBrands);

  const load = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await listCompatibilities({
        product_id: productId,
        variant_id: variantId || undefined
      });
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      enqueueSnackbar(e?.message || 'Failed to load compatible products', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [productId, variantId]);

  useEffect(() => {
    load();
  }, [load]);

  const linkedIds = useMemo(
    () => rows.map((r) => r.product?.id || r.device?.id).filter(Boolean),
    [rows]
  );

  const persist = async (nextIds) => {
    try {
      setSaving(true);
      const res = await putCompatibilities({
        product_id: productId,
        variant_id: variantId || null,
        compatible_product_ids: nextIds
      });
      setRows(Array.isArray(res?.data) ? res.data : []);
      enqueueSnackbar('Compatible products saved', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Save failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const addProduct = async (product) => {
    if (!product?.id) return;
    if (String(product.id) === String(productId)) {
      enqueueSnackbar('Cannot link a product to itself', { variant: 'warning' });
      return;
    }
    if (linkedIds.includes(product.id)) {
      enqueueSnackbar('Already linked', { variant: 'info' });
      return;
    }
    await persist([...linkedIds, product.id]);
    setSelected(null);
  };

  const removeProduct = async (linkedId) => {
    await persist(linkedIds.filter((id) => id !== linkedId));
  };

  const createAndLink = async () => {
    const name = newName.trim();
    if (!name) {
      enqueueSnackbar('Product name is required', { variant: 'warning' });
      return;
    }
    if (!brandValue?.id && !brandName.trim()) {
      enqueueSnackbar('Pick or type a brand', { variant: 'warning' });
      return;
    }
    try {
      setCreating(true);
      await createCompatibilityProduct({
        name,
        brand_id: brandValue?.id || undefined,
        brand_name: brandValue?.id ? undefined : brandName.trim(),
        link: {
          product_id: productId,
          variant_id: variantId || null
        }
      });
      enqueueSnackbar('Product created and linked', { variant: 'success' });
      setCreateOpen(false);
      setNewName('');
      setBrandValue(null);
      setBrandName('');
      await load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Create failed', { variant: 'error' });
    } finally {
      setCreating(false);
    }
  };

  if (!productId) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1">{title}</Typography>
        {loading || saving ? <CircularProgress size={18} /> : null}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Link any related catalogue products (phones, covers, groceries, etc.). Create a reference product if it is not sold yet.
        {variantId ? ' Links on this variant are SKU-specific.' : ' Product-level links apply to all variants unless a variant overrides.'}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
        <Autocomplete
          sx={{ flex: 1, minWidth: 240 }}
          options={productSearch.options}
          loading={productSearch.loading}
          value={selected}
          onChange={(_e, value) => addProduct(value)}
          onInputChange={(_e, value) => productSearch.setQuery(value)}
          getOptionLabel={(o) => (o?.name ? `${o.name}${o.brand?.name ? ` · ${o.brand.name}` : ''}` : '')}
          isOptionEqualToValue={(a, b) => a?.id === b?.id}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Search product" placeholder="iPhone 17, tomato, cover…" />
          )}
        />
        <Button variant="outlined" onClick={() => setCreateOpen(true)}>
          Create product
        </Button>
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={1}>
        {rows.length === 0 && !loading ? (
          <Typography variant="body2" color="text.secondary">
            No compatible products linked yet.
          </Typography>
        ) : null}
        {rows.map((row) => {
          const linked = row.product || row.device;
          if (!linked?.id) return null;
          const label = linked.brand?.name ? `${linked.brand.name} · ${linked.name}` : linked.name;
          return (
            <Chip
              key={row.compatibility_id || linked.id}
              label={label}
              onDelete={() => removeProduct(linked.id)}
              variant="outlined"
            />
          );
        })}
      </Stack>

      <Dialog open={createOpen} onClose={() => !creating && setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create reference product</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Product name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="iPhone 17 / Tomato / …"
              fullWidth
              size="small"
            />
            <Autocomplete
              freeSolo
              options={brandSearch.options}
              loading={brandSearch.loading}
              value={brandValue}
              onChange={(_e, value) => {
                if (typeof value === 'string') {
                  setBrandValue(null);
                  setBrandName(value);
                } else {
                  setBrandValue(value);
                  setBrandName(value?.name || '');
                }
              }}
              onInputChange={(_e, value) => {
                brandSearch.setQuery(value);
                if (!brandValue) setBrandName(value);
              }}
              getOptionLabel={(o) => (typeof o === 'string' ? o : o?.name || '')}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              renderInput={(params) => (
                <TextField {...params} size="small" label="Brand" placeholder="Apple / FarmCo…" />
              )}
            />
            <Typography variant="caption" color="text.secondary">
              Saved under the Product Reference category (hidden from normal customer browse).
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={createAndLink} disabled={creating}>
            {creating ? 'Creating…' : 'Create & link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
