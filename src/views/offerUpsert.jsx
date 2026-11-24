'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';

import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import { listProducts, listProductVariants } from 'api/catalog';
import { listStores } from 'api/sellersStores';
import { createOffer, getOffer, updateOffer } from 'api/offers';

function variantLabel(variant) {
  const sku = String(variant?.sku || '').trim();
  const signature = String(variant?.option_signature || '')
    .split('|')
    .map((part) => part.split('=').pop())
    .filter(Boolean)
    .join(' · ');
  if (signature && sku) return `${signature} · ${sku}`;
  return signature || sku || 'Variant';
}

function newKey() {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function OfferUpsert() {
  const { id } = useParams();
  const router = useRouter();
  const storeAc = usePagedAutocomplete(listStores);
  const productAc = usePagedAutocomplete(listProducts, { record_status: 1 });
  const [text, setText] = useState('');
  const [storeSel, setStoreSel] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const addProduct = async (product) => {
    if (!product?.id) return;
    if (blocks.some((block) => block.product?.id === product.id)) {
      enqueueSnackbar('That product is already on this offer', { variant: 'warning' });
      return;
    }
    const res = await listProductVariants(product.id, { page: 1, limit: 200 });
    const variants = (res?.data || []).map((variant) => ({
      id: variant.id,
      label: variantLabel(variant)
    }));
    setBlocks((prev) => [
      ...prev,
      {
        key: newKey(),
        product: { id: product.id, name: product.name },
        variants,
        selectedIds: variants.map((variant) => variant.id)
      }
    ]);
  };

  const hydrate = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getOffer(id);
      const row = res?.data || res;
      setText(row.text || '');
      setStoreSel(row.store_id ? { id: row.store_id, name: row.store_name || 'Store' } : null);
      const next = [];
      for (const item of row.products || []) {
        const variantRes = await listProductVariants(item.product_id, { page: 1, limit: 200 });
        const variants = (variantRes?.data || []).map((variant) => ({
          id: variant.id,
          label: variantLabel(variant)
        }));
        const selectedIds = item.all_variants
          ? variants.map((variant) => variant.id)
          : (item.variants || []).map((variant) => variant.id);
        next.push({
          key: item.id || newKey(),
          product: { id: item.product_id, name: item.name },
          variants,
          selectedIds
        });
      }
      setBlocks(next);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to load offer', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { hydrate(); }, [hydrate]);

  const toggleVariant = (key, variantId) => {
    setBlocks((prev) => prev.map((block) => {
      if (block.key !== key) return block;
      const selected = new Set(block.selectedIds);
      if (selected.has(variantId)) selected.delete(variantId);
      else selected.add(variantId);
      return { ...block, selectedIds: [...selected] };
    }));
  };

  const onSave = async () => {
    const products = blocks
      .filter((block) => block.product?.id && (block.variants.length === 0 || block.selectedIds.length))
      .map((block) => {
        const all = block.variants.length === 0 || block.selectedIds.length === block.variants.length;
        return {
          product_id: block.product.id,
          all_variants: all,
          variant_ids: all ? [] : block.selectedIds
        };
      });
    if (!text.trim()) {
      enqueueSnackbar('Offer text is required', { variant: 'warning' });
      return;
    }
    if (!products.length) {
      enqueueSnackbar('Add a product and keep at least one variant selected', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const body = { text: text.trim(), store_id: storeSel?.id || null, products };
      if (id) await updateOffer(id, body);
      else await createOffer(body);
      enqueueSnackbar('Offer saved', { variant: 'success' });
      router.push('/offers');
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Save failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const breadcrumb = useMemo(() => {
    const name = text.trim() || (id ? 'edit' : 'new');
    return {
      heading: id ? 'edit-offer' : 'create-offer',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'offers', to: '/offers' },
        { title: name, i18n: false }
      ]
    };
  }, [id, text]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
      <Stack spacing={2}>
        <TextField
          label="Offer"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Free pressure cooker"
          inputProps={{ maxLength: 120 }}
          helperText="Shown on the product page. 120 characters."
          disabled={loading}
          fullWidth
          size="small"
        />
        <Autocomplete
          size="small"
          options={storeAc.options}
          value={storeSel}
          loading={storeAc.loading}
          getOptionLabel={(opt) => opt?.name || ''}
          isOptionEqualToValue={(a, b) => a?.id === b?.id}
          onChange={(_, value) => setStoreSel(value)}
          onInputChange={(_, value, reason) => {
            if (reason !== 'reset') storeAc.setQuery(value);
          }}
          ListboxProps={{ onScroll: storeAc.handleScroll }}
          renderInput={(params) => (
            <TextField {...params} label="Store" placeholder="Leave empty for every store" />
          )}
        />
        <Typography variant="body2" color="text.secondary">
          Leave the store empty to show this offer everywhere. An empty variant list is not saved.
          All variants checked means future variants are included too.
        </Typography>
        <Autocomplete
          size="small"
          options={productAc.options}
          loading={productAc.loading}
          getOptionLabel={(opt) => opt?.name || ''}
          isOptionEqualToValue={(a, b) => a?.id === b?.id}
          value={null}
          onChange={(_, value) => {
            if (value) addProduct(value);
          }}
          onInputChange={(_, value, reason) => {
            if (reason !== 'reset') productAc.setQuery(value);
          }}
          ListboxProps={{ onScroll: productAc.handleScroll }}
          renderInput={(params) => <TextField {...params} label="Add product" placeholder="Search products" />}
        />
        {blocks.map((block) => (
          <Stack key={block.key} spacing={1} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">{block.product?.name}</Typography>
              <Button size="small" color="warning" onClick={() => setBlocks((prev) => prev.filter((item) => item.key !== block.key))}>
                Remove
              </Button>
            </Stack>
            <FormGroup>
              {block.variants.map((variant) => (
                <FormControlLabel
                  key={variant.id}
                  control={(
                    <Checkbox
                      checked={block.selectedIds.includes(variant.id)}
                      onChange={() => toggleVariant(block.key, variant.id)}
                    />
                  )}
                  label={variant.label}
                />
              ))}
              {!block.variants.length ? (
                <Typography variant="body2" color="text.secondary">This product has no variants yet. It will cover variants added later.</Typography>
              ) : null}
            </FormGroup>
          </Stack>
        ))}
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={onSave} disabled={saving || loading}>
            Save offer
          </Button>
          <Button onClick={() => router.push('/offers')}>Cancel</Button>
        </Stack>
      </Stack>
      </MainCard>
    </>
  );
}
