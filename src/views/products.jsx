'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import {
  Autocomplete,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField
} from '@mui/material';
import { actions as catalog } from 'store/catalog/slice';
import ProductsTableSection from 'sections/products/ProductsTableSection';
import { useRouter } from 'next/navigation';
import { listBrands, listCategories } from 'api/catalog';
import { RECORD_STATUS } from 'utils/constants';

const RECORD_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: String(RECORD_STATUS.ACTIVE), label: 'Active' },
  { value: String(RECORD_STATUS.INACTIVE), label: 'Inactive' },
  { value: String(RECORD_STATUS.ARCHIVED), label: 'Archived' }
];

function usePagedAutocomplete(listFn) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (p = 1, q = query, append = false) => {
      try {
        setLoading(true);
        const res = await listFn({ page: p, limit: 20, q: q || undefined });
        const rows = res?.data || [];
        const meta = res?.meta || { page: p, totalPages: 1 };
        setOptions((prev) => (append ? [...prev, ...rows] : rows));
        setPage(meta.page || p);
        setTotalPages(meta.totalPages || 1);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [listFn, query]
  );

  useEffect(() => {
    const t = setTimeout(() => load(1, query, false), 300);
    return () => clearTimeout(t);
  }, [query, load]);

  const handleScroll = (event) => {
    const node = event.currentTarget;
    const nearBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 32;
    if (nearBottom && !loading && page < totalPages) {
      load(page + 1, query, true);
    }
  };

  return { query, setQuery, options, loading, load, handleScroll };
}

export function ProductsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.catalog || {});
  const list = state.products || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1, total: 0 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1, total = 1 } = {}, error } = list;
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    record_status: '',
    brand: null,
    category: null
  });

  const brandAc = usePagedAutocomplete(listBrands);
  const categoryAc = usePagedAutocomplete(listCategories);

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => ({
    page: pageNum,
    limit,
    ...(f.q ? { q: f.q } : {}),
    ...(f.record_status ? { record_status: f.record_status } : {}),
    ...(f.brand?.id ? { brand_id: f.brand.id } : {}),
    ...(f.category?.id ? { category_id: f.category.id } : {})
  });

  useEffect(() => {
    dispatch(catalog.productsListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.record_status, filters.brand?.id, filters.category?.id]);

  const handleSearch = () => {
    const next = { ...filters, q: searchQuery.trim() };
    setFilters(next);
    dispatch(catalog.productsListRequest({ params: buildParams(1, pageSize, next) }));
  };

  const handleAddButton = () => {
    router.push('/products/create');
  };

  const handleEditButton = (row) => {
    router.push(`/products/edit/${row.id}`);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(catalog.productsListRequest({ params: buildParams(next.pageIndex + 1, next.pageSize) }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap">
        <TextField
          size="small"
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Name or slug…"
          sx={{ minWidth: 200 }}
        />
        <Autocomplete
          sx={{ minWidth: 200 }}
          options={brandAc.options}
          value={filters.brand}
          loading={brandAc.loading}
          onChange={(_, v) => setFilters((p) => ({ ...p, brand: v }))}
          onOpen={() => brandAc.load(1, brandAc.query, false)}
          getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
          isOptionEqualToValue={(a, b) => a?.id === b?.id}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Brand"
              placeholder="Search brand…"
              onChange={(e) => brandAc.setQuery(e.target.value)}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {brandAc.loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          ListboxProps={{ onScroll: brandAc.handleScroll, style: { maxHeight: 280, overflow: 'auto' } }}
        />
        <Autocomplete
          sx={{ minWidth: 200 }}
          options={categoryAc.options}
          value={filters.category}
          loading={categoryAc.loading}
          onChange={(_, v) => setFilters((p) => ({ ...p, category: v }))}
          onOpen={() => categoryAc.load(1, categoryAc.query, false)}
          getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
          isOptionEqualToValue={(a, b) => a?.id === b?.id}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Category"
              placeholder="Search category…"
              onChange={(e) => categoryAc.setQuery(e.target.value)}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {categoryAc.loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
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
          value={filters.record_status}
          onChange={(e) => setFilters((p) => ({ ...p, record_status: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          {RECORD_STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value || 'all'} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <ProductsTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        handleViewButton={(row) => router.push(`/products/${row.id}`)}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        totalCount={total}
      />
    </>
  );
}

export default ProductsView;
