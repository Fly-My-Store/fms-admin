'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as sellersStores } from 'store/sellersStores/slice';
import StoresTableSection from 'sections/stores/StoresTableSection';
import { useRouter } from 'next/navigation';
import { STORE_STATUS } from 'utils/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  ...Object.values(STORE_STATUS).map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))
];

const KYB_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'NONE', label: 'None' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' }
];

export function StoresView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const state = useSelector((s) => s.sellersStores || {});
  const list = state.stores || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };

  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', kyb_status: '' });

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => ({
    page: pageNum,
    limit,
    sort: 'updatedAt',
    dir: 'DESC',
    ...(f.q ? { q: f.q } : {}),
    ...(f.status ? { status: f.status } : {}),
    ...(f.kyb_status ? { kyb_status: f.kyb_status } : {})
  });

  useEffect(() => {
    dispatch(sellersStores.storesListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.status, filters.kyb_status]);

  const handleSearch = () => {
    const next = { ...filters, q: searchQuery.trim() };
    setFilters(next);
    dispatch(sellersStores.storesListRequest({ params: buildParams(1, pageSize, next) }));
  };

  const handleAddButton = () => {
    router.push('/stores/add');
  };

  const handleEditButton = (row) => {
    router.push(`/stores/edit/${row.id}`);
  };

  const handleViewButton = (row) => {
    router.push(`/stores/${row.id}`);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(
      sellersStores.storesListRequest({
        params: buildParams(next.pageIndex + 1, next.pageSize)
      })
    );
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Name, slug, code, phone…"
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value || 'all'} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="KYB"
          value={filters.kyb_status}
          onChange={(e) => setFilters((p) => ({ ...p, kyb_status: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          {KYB_OPTIONS.map((o) => (
            <MenuItem key={o.value || 'all'} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <StoresTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        handleViewButton={handleViewButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
}

export default StoresView;
