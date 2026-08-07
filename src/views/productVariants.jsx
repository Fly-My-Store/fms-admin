'use client';

import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import {
  Autocomplete,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField
} from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import ProductVariantsGrid from 'sections/product-variants/ProductVariantsGrid';
import MainCard from 'components/MainCard';
import ListPagination from 'components/list/ListPagination';
import { actions as catalog } from 'store/catalog/slice';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { getBrand, getCategory, getProduct, listBrands, listCategories, listProducts } from 'api/catalog';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import useUrlFilters from 'hooks/useUrlFilters';
import { RECORD_STATUS } from 'utils/constants';

const DEFAULT_PAGE_SIZE = 20;

const RECORD_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: String(RECORD_STATUS.ACTIVE), label: 'Active' },
  { value: String(RECORD_STATUS.INACTIVE), label: 'Inactive' },
  { value: String(RECORD_STATUS.ARCHIVED), label: 'Archived' }
];

const FILTER_DEFAULTS = {
  q: '',
  record_status: String(RECORD_STATUS.ACTIVE),
  product_id: '',
  brand_id: '',
  category_id: '',
  page: 1,
  limit: DEFAULT_PAGE_SIZE
};

/** Keep the selected row visible even when it is not in the current page of options. */
function withSelectedOption(options, selected) {
  if (!selected?.id) return options;
  if (options.some((o) => o?.id === selected.id)) return options;
  return [selected, ...options];
}

/**
 * Global Product Variants list, or product-scoped when `product_id` is passed
 * (product detail tab).
 */
export default function ProductVariantsView({ product_id, productName }) {
  const scoped = Boolean(product_id);
  const dispatch = useDispatch();
  const router = useRouter();
  const state = useSelector((s) => s.catalog || {});
  const list = state.variants || {
    rows: [],
    meta: { page: 1, pageSize: DEFAULT_PAGE_SIZE, totalPages: 1, total: 0 },
    loading: false,
    error: null
  };
  const {
    rows: data = [],
    meta: { totalPages = 1, total = 0 } = {},
    loading,
    error
  } = list;

  const urlFilters = useUrlFilters({ defaults: FILTER_DEFAULTS });
  const [scopedPage, setScopedPage] = useState({ page: 1, limit: DEFAULT_PAGE_SIZE });

  // Product-detail embed: local pagination only (do not rewrite product URL)
  const draft = scoped ? FILTER_DEFAULTS : urlFilters.draft;
  const setDraft = urlFilters.setDraft;
  const applied = scoped ? { ...FILTER_DEFAULTS, ...scopedPage } : urlFilters.applied;
  const applySearch = urlFilters.applySearch;
  const urlKey = scoped ? `scoped:${product_id}:${scopedPage.page}:${scopedPage.limit}` : urlFilters.urlKey;

  const handlePaginationChange = (updater) => {
    if (scoped) {
      setScopedPage((prev) => {
        const current = { pageIndex: (Number(prev.page) || 1) - 1, pageSize: Number(prev.limit) || DEFAULT_PAGE_SIZE };
        const nextState = typeof updater === 'function' ? updater(current) : updater;
        return {
          page: (nextState.pageIndex || 0) + 1,
          limit: nextState.pageSize || prev.limit
        };
      });
      return;
    }
    urlFilters.handlePaginationChange(updater);
  };

  const [productSel, setProductSel] = useState(null);
  const [brandSel, setBrandSel] = useState(null);
  const [categorySel, setCategorySel] = useState(null);
  const [searchQuery, setSearchQuery] = useState(draft.q || '');

  const productAc = usePagedAutocomplete(listProducts);
  const brandAc = usePagedAutocomplete(listBrands);
  const categoryAc = usePagedAutocomplete(listCategories);

  const buildParams = (f = applied) => {
    const status = f.record_status;
    const hasProduct = Boolean(scoped ? product_id : f.product_id);
    return {
      page: Number(f.page) || 1,
      limit: Number(f.limit) || DEFAULT_PAGE_SIZE,
      ...(f.q ? { q: f.q } : {}),
      ...(status && status !== 'all' ? { record_status: status } : {}),
      ...(scoped
        ? { product_id }
        : {
            // Product is the narrowest scope — do not AND leftover brand/category
            // filters (that combination often returns 0 rows incorrectly).
            ...(f.product_id ? { product_id: f.product_id } : {}),
            ...(!hasProduct && f.brand_id ? { brand_id: f.brand_id } : {}),
            ...(!hasProduct && f.category_id ? { category_id: f.category_id } : {})
          })
    };
  };

  // Fetch whenever applied filters / URL change (Search or pagination or back)
  useEffect(() => {
    dispatch(catalog.variantsListRequest({ params: buildParams(applied) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, scoped, product_id, urlKey, applied.page, applied.limit, applied.q, applied.record_status, applied.product_id, applied.brand_id, applied.category_id]);

  // Hydrate autocomplete selections from URL ids
  useEffect(() => {
    setSearchQuery(applied.q || '');
    let cancelled = false;
    (async () => {
      if (scoped) return;
      try {
        if (applied.product_id) {
          const res = await getProduct(applied.product_id);
          if (!cancelled) {
            setProductSel(res?.data || res || null);
            // Product scope wins — don't show stale brand/category chips from old URLs
            setBrandSel(null);
            setCategorySel(null);
          }
          return;
        }
        setProductSel(null);
        if (applied.brand_id) {
          const res = await getBrand(applied.brand_id);
          if (!cancelled) setBrandSel(res?.data || res || null);
        } else setBrandSel(null);
        if (applied.category_id) {
          const res = await getCategory(applied.category_id);
          if (!cancelled) setCategorySel(res?.data || res || null);
        } else setCategorySel(null);
      } catch {
        /* ignore hydrate errors */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scoped, applied.product_id, applied.brand_id, applied.category_id, applied.q]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleSearch = () => {
    const nextProductId = productSel?.id || '';
    applySearch({
      q: searchQuery.trim(),
      product_id: nextProductId,
      // Drop brand/category when a product is chosen so URL + fetch stay consistent
      brand_id: nextProductId ? '' : brandSel?.id || '',
      category_id: nextProductId ? '' : categorySel?.id || '',
      record_status: draft.record_status || 'all'
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setProductSel(null);
    setBrandSel(null);
    setCategorySel(null);
    applySearch({
      q: '',
      product_id: '',
      brand_id: '',
      category_id: '',
      record_status: String(RECORD_STATUS.ACTIVE)
    });
  };

  const handleAddButton = () => {
    const qs = scoped
      ? `?product_id=${product_id}&product_name=${encodeURIComponent(productName || '')}`
      : '';
    router.push(`/product-variants/create${qs}`);
  };

  const handleEditButton = (row) => {
    router.push(`/product-variants/create?edit=${row.id}`);
  };

  const handleViewButton = (row) => {
    const p = row.product_id || row.product?.id || product_id || '';
    const n = row.product?.name || productName || '';
    router.push(`/product-variants/${row.id}?p=${p}&n=${encodeURIComponent(n)}`);
  };

  const headerActions = (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{ gap: 1, alignItems: { xs: 'stretch', md: 'center' }, flexWrap: 'wrap' }}
    >
      {!scoped ? (
        <>
          <TextField
            size="small"
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="SKU, product, brand…"
            sx={{ minWidth: 180 }}
          />
          <Autocomplete
            sx={{ minWidth: 180 }}
            size="small"
            options={withSelectedOption(productAc.options, productSel)}
            value={productSel}
            loading={productAc.loading}
            getOptionLabel={(o) => o?.name || ''}
            isOptionEqualToValue={(a, b) => a?.id === b?.id}
            onChange={(_, v) => {
              setProductSel(v);
              // Product supersedes brand/category — clear so Search cannot AND them
              if (v) {
                setBrandSel(null);
                setCategorySel(null);
              }
            }}
            onInputChange={(_, v, reason) => {
              if (reason === 'reset') return;
              productAc.setQuery(v);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Product"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {productAc.loading ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
            ListboxProps={{ onScroll: productAc.handleScroll, style: { maxHeight: 280, overflow: 'auto' } }}
          />
          <Autocomplete
            sx={{ minWidth: 160 }}
            size="small"
            options={withSelectedOption(brandAc.options, brandSel)}
            value={brandSel}
            loading={brandAc.loading}
            disabled={Boolean(productSel)}
            getOptionLabel={(o) => o?.name || ''}
            isOptionEqualToValue={(a, b) => a?.id === b?.id}
            onChange={(_, v) => setBrandSel(v)}
            onInputChange={(_, v, reason) => {
              if (reason === 'reset') return;
              brandAc.setQuery(v);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Brand"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {brandAc.loading ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
            ListboxProps={{ onScroll: brandAc.handleScroll, style: { maxHeight: 280, overflow: 'auto' } }}
          />
          <Autocomplete
            sx={{ minWidth: 160 }}
            size="small"
            options={withSelectedOption(categoryAc.options, categorySel)}
            value={categorySel}
            loading={categoryAc.loading}
            disabled={Boolean(productSel)}
            getOptionLabel={(o) => o?.name || ''}
            isOptionEqualToValue={(a, b) => a?.id === b?.id}
            onChange={(_, v) => setCategorySel(v)}
            onInputChange={(_, v, reason) => {
              if (reason === 'reset') return;
              categoryAc.setQuery(v);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {categoryAc.loading ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
            ListboxProps={{ onScroll: categoryAc.handleScroll, style: { maxHeight: 280, overflow: 'auto' } }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={draft.record_status === '' ? 'all' : draft.record_status}
            onChange={(e) => setDraft({ record_status: e.target.value })}
            sx={{ minWidth: 120 }}
          >
            {RECORD_STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" size="small" onClick={handleSearch} disabled={loading}>
            Search
          </Button>
          <Button variant="text" size="small" onClick={handleClearFilters} disabled={loading}>
            Clear
          </Button>
        </>
      ) : null}
      <Button variant="contained" size="small" startIcon={<PlusOutlined />} onClick={handleAddButton}>
        New Variant
      </Button>
    </Stack>
  );

  return (
    <MainCard secondary={headerActions}>
      <Stack spacing={2}>
        <ProductVariantsGrid
          rows={data}
          showProductMeta={!scoped}
          handleEditButton={handleEditButton}
          handleViewButton={handleViewButton}
        />
        <ListPagination
          page={Number(applied.page) || 1}
          pageSize={Number(applied.limit) || DEFAULT_PAGE_SIZE}
          totalPages={totalPages}
          totalCount={total}
          onPaginationChange={handlePaginationChange}
        />
      </Stack>
    </MainCard>
  );
}
