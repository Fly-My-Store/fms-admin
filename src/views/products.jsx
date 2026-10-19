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
import MainCard from 'components/MainCard';
import { actions as catalog } from 'store/catalog/slice';
import ProductsTableSection from 'sections/products/ProductsTableSection';
import CatalogCsvUpdatePanel from 'sections/catalog/CatalogCsvUpdatePanel';
import CsvJobsList from 'sections/csv/CsvJobsList';
import { useRouter } from 'next/navigation';
import { getBrand, getCategory, listBrands, listCategories } from 'api/catalog';
import {
  abortProductCsvJob,
  enqueueProductCsvExport,
  enqueueProductCsvUpdate,
  listProductCsvJobs,
  productCsvJobDownloadPath
} from 'api/csvJobs';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import useUrlFilters from 'hooks/useUrlFilters';
import { RECORD_STATUS } from 'utils/constants';

const DEFAULT_PAGE_SIZE = 20;

const RECORD_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: String(RECORD_STATUS.ACTIVE), label: 'Active' },
  { value: String(RECORD_STATUS.INACTIVE), label: 'Inactive' },
  { value: String(RECORD_STATUS.ARCHIVED), label: 'Archived' }
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'slug', label: 'Slug' },
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' }
];

const FILTER_DEFAULTS = {
  q: '',
  record_status: String(RECORD_STATUS.ACTIVE),
  brand_id: '',
  category_id: '',
  sort: 'name',
  dir: 'ASC',
  page: 1,
  limit: DEFAULT_PAGE_SIZE
};

export function ProductsView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const state = useSelector((s) => s.catalog || {});
  const list = state.products || {
    rows: [],
    meta: { page: 1, pageSize: DEFAULT_PAGE_SIZE, totalPages: 1, total: 0 },
    loading: false,
    error: null
  };
  const {
    rows: data = [],
    meta: { totalPages = 1, total = 0 } = {},
    error
  } = list;

  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });

  const [searchQuery, setSearchQuery] = useState(draft.q || '');
  const [brandSel, setBrandSel] = useState(null);
  const [categorySel, setCategorySel] = useState(null);
  const brandAc = usePagedAutocomplete(listBrands);
  const categoryAc = usePagedAutocomplete(listCategories);

  const buildParams = (f = applied) => ({
    page: Number(f.page) || 1,
    limit: Number(f.limit) || DEFAULT_PAGE_SIZE,
    sort: f.sort || 'name',
    dir: f.dir || 'ASC',
    ...(f.q ? { q: f.q } : {}),
    ...(f.record_status !== '' && f.record_status != null ? { record_status: f.record_status } : {}),
    ...(f.brand_id ? { brand_id: f.brand_id } : {}),
    ...(f.category_id ? { category_id: f.category_id } : {})
  });

  useEffect(() => {
    dispatch(catalog.productsListRequest({ params: buildParams(applied) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, urlKey, applied.page, applied.limit, applied.q, applied.record_status, applied.brand_id, applied.category_id, applied.sort, applied.dir]);

  useEffect(() => {
    setSearchQuery(applied.q || '');
    let cancelled = false;
    (async () => {
      try {
        if (applied.brand_id) {
          const res = await getBrand(applied.brand_id);
          if (!cancelled) setBrandSel(res?.data || res || null);
        } else setBrandSel(null);
        if (applied.category_id) {
          const res = await getCategory(applied.category_id);
          if (!cancelled) setCategorySel(res?.data || res || null);
        } else setCategorySel(null);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applied.brand_id, applied.category_id, applied.q]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const [jobsTick, setJobsTick] = useState(0);
  const loadProductJobs = useCallback(() => listProductCsvJobs({ limit: 20 }), []);

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      brand_id: brandSel?.id || '',
      category_id: categorySel?.id || '',
      record_status: draft.record_status,
      sort: draft.sort,
      dir: draft.dir
    });
  };

  const handleDownloadCsv = async () => {
    try {
      await enqueueProductCsvExport({
        q: applied.q || '',
        record_status: applied.record_status,
        brand_id: applied.brand_id || '',
        category_id: applied.category_id || '',
        sort: applied.sort || 'name',
        dir: applied.dir || 'ASC'
      });
      enqueueSnackbar('Queued — you can close this page.', { variant: 'success' });
      setJobsTick((n) => n + 1);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Could not queue export', {
        variant: 'error'
      });
    }
  };

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
      <TextField
        size="small"
        label="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Name or slug…"
        sx={{ minWidth: 180 }}
      />
      <Autocomplete
        sx={{ minWidth: 170 }}
        size="small"
        options={brandAc.options}
        value={brandSel}
        loading={brandAc.loading}
        onChange={(_, v) => setBrandSel(v)}
        onInputChange={(_, v, reason) => {
          if (reason === 'reset') return;
          brandAc.setQuery(v);
        }}
        getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
        getOptionKey={(opt) => opt?.id || String(opt?.name || '')}
        isOptionEqualToValue={(a, b) => a?.id === b?.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Brand"
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
        sx={{ minWidth: 170 }}
        size="small"
        options={categoryAc.options}
        value={categorySel}
        loading={categoryAc.loading}
        onChange={(_, v) => setCategorySel(v)}
        onInputChange={(_, v, reason) => {
          if (reason === 'reset') return;
          categoryAc.setQuery(v);
        }}
        getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
        getOptionKey={(opt) => opt?.id || String(opt?.name || '')}
        isOptionEqualToValue={(a, b) => a?.id === b?.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Category"
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
        value={draft.record_status}
        onChange={(e) => setDraft({ record_status: e.target.value })}
        sx={{ minWidth: 120 }}
      >
        {RECORD_STATUS_OPTIONS.map((o) => (
          <MenuItem key={o.value || 'all'} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Sort"
        value={draft.sort}
        onChange={(e) =>
          setDraft({
            sort: e.target.value,
            dir: e.target.value === 'name' || e.target.value === 'slug' ? 'ASC' : 'DESC'
          })
        }
        sx={{ minWidth: 120 }}
      >
        {SORT_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  const topActions = () => (
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" size="small" onClick={handleDownloadCsv}>
        Download CSV
      </Button>
      <Button variant="outlined" size="small" onClick={() => router.push('/catalog-bulk-import')}>
        Bulk Upload
      </Button>
    </Stack>
  );

  return (
    <Stack spacing={2}>
      <ProductsTableSection
        rows={data}
        handleAddButton={() => router.push('/products/create')}
        handleEditButton={(row) => router.push(`/products/edit/${row.id}`)}
        handleViewButton={(row) => router.push(`/products/${row.id}`)}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || DEFAULT_PAGE_SIZE}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        totalCount={total}
        topActionsLeft={topActionsLeft}
        topActions={topActions}
      />

      <MainCard
        title="Bulk update products"
        subheader="Re-upload the downloaded CSV. Only filled update_ cells are written."
      >
        <CatalogCsvUpdatePanel
          updateKind="PRODUCT_UPDATE"
          enqueueUpdate={enqueueProductCsvUpdate}
          onQueued={() => setJobsTick((n) => n + 1)}
          helpText={
            <>
              Fill <strong>update_name</strong>, <strong>update_slug</strong>,{' '}
              <strong>update_brand_name</strong>, <strong>update_category_name</strong>, or{' '}
              <strong>update_product_images</strong> only when that field should change. Blank update
              cells are left alone. A filled image cell replaces product photos (
              <code>https://…</code> URLs separated by <code>|</code>). Match is by <strong>id</strong>.
            </>
          }
        />
      </MainCard>

      <CsvJobsList
        title="Product CSV jobs"
        loadJobs={loadProductJobs}
        downloadPath={(jobId, file) => productCsvJobDownloadPath(jobId, file)}
        abortJob={(jobId, body) => abortProductCsvJob(jobId, body)}
        refreshKey={jobsTick}
        emptyText="Product exports and updates show up here."
      />
    </Stack>
  );
}

export default ProductsView;
