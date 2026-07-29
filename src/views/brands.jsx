'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as catalog } from 'store/catalog/slice';
import BrandsTableSection from 'sections/brands/BrandsTableSection';
import BrandsBulkUploadDialog from 'sections/brands/BrandsBulkUploadDialog';
import { useRouter } from 'next/navigation';
import { RECORD_STATUS } from 'utils/constants';

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

const DEFAULT_PAGE_SIZE = 50;

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
    meta: { page = 1, pageSize = DEFAULT_PAGE_SIZE, totalPages = 1, total = 0 } = {},
    error
  } = list;

  const [searchQuery, setSearchQuery] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    record_status: String(RECORD_STATUS.ACTIVE),
    sort: 'name',
    dir: 'ASC'
  });

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => ({
    page: pageNum,
    limit,
    sort: f.sort || 'name',
    dir: f.dir || 'ASC',
    ...(f.q ? { q: f.q } : {}),
    ...(f.record_status !== '' && f.record_status != null ? { record_status: f.record_status } : {})
  });

  const reload = (pageNum = 1, limit = pageSize, f = filters) => {
    dispatch(catalog.brandsListRequest({ params: buildParams(pageNum, limit, f) }));
  };

  useEffect(() => {
    reload(1, DEFAULT_PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.record_status, filters.sort, filters.dir]);

  const handleSearch = () => {
    const next = { ...filters, q: searchQuery.trim() };
    setFilters(next);
    reload(1, pageSize, next);
  };

  const handleAddButton = () => {
    router.push('/brands/create');
  };

  const handleEditButton = (row) => {
    router.push(`/brands/edit/${row.id}`);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    reload(next.pageIndex + 1, next.pageSize);
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
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
        value={filters.record_status}
        onChange={(e) => setFilters((p) => ({ ...p, record_status: e.target.value }))}
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
        value={filters.sort}
        onChange={(e) =>
          setFilters((p) => ({
            ...p,
            sort: e.target.value,
            dir: e.target.value === 'name' || e.target.value === 'slug' ? 'ASC' : 'DESC'
          }))
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
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        totalCount={total}
        topActionsLeft={topActionsLeft}
        topActions={topActions}
      />
      <BrandsBulkUploadDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onDone={() => reload(1, pageSize)}
      />
    </>
  );
}

export default BrandsView;
