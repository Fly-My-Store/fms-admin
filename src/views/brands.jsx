'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as catalog } from 'store/catalog/slice';
import BrandsTableSection from 'sections/brands/BrandsTableSection';
import BrandsBulkUploadDialog from 'sections/brands/BrandsBulkUploadDialog';
import { useRouter } from 'next/navigation';
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
  sort: 'name',
  dir: 'ASC',
  page: 1,
  limit: DEFAULT_PAGE_SIZE
};

export function BrandsView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const state = useSelector((s) => s.catalog || {});
  const list = state.brands || {
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

  const [bulkOpen, setBulkOpen] = useState(false);
  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');

  const buildParams = (f = applied) => ({
    page: Number(f.page) || 1,
    limit: Number(f.limit) || DEFAULT_PAGE_SIZE,
    sort: f.sort || 'name',
    dir: f.dir || 'ASC',
    ...(f.q ? { q: f.q } : {}),
    ...(f.record_status !== '' && f.record_status != null ? { record_status: f.record_status } : {})
  });

  useEffect(() => {
    dispatch(catalog.brandsListRequest({ params: buildParams(applied) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, urlKey, applied.page, applied.limit, applied.q, applied.record_status, applied.sort, applied.dir]);

  useEffect(() => {
    setSearchQuery(applied.q || '');
  }, [applied.q]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      record_status: draft.record_status,
      sort: draft.sort,
      dir: draft.dir
    });
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
    <Button variant="outlined" size="small" onClick={() => setBulkOpen(true)}>
      Bulk Upload
    </Button>
  );

  return (
    <>
      <BrandsTableSection
        rows={data}
        handleAddButton={() => router.push('/brands/create')}
        handleEditButton={(row) => router.push(`/brands/edit/${row.id}`)}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || DEFAULT_PAGE_SIZE}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        totalCount={total}
        topActionsLeft={topActionsLeft}
        topActions={topActions}
      />
      <BrandsBulkUploadDialog open={bulkOpen} onClose={() => setBulkOpen(false)} onDone={() => applySearch()} />
    </>
  );
}

export default BrandsView;
