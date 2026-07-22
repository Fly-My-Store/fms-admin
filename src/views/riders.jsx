'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as logistics } from 'store/logistics/slice';
import RidersTableSection from 'sections/riders/RidersTableSection';
import { ACCOUNT_STATUS } from 'utils/constants';

const KYC_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'RESUBMIT', label: 'Resubmit' }
];
const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'IDLE', label: 'Idle' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'ON_TRIP', label: 'On Trip' }
];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: String(ACCOUNT_STATUS.ACTIVE), label: 'Active' },
  { value: String(ACCOUNT_STATUS.INACTIVE), label: 'Inactive' },
  { value: String(ACCOUNT_STATUS.SUSPENDED), label: 'Suspended' },
  { value: String(ACCOUNT_STATUS.DELETED), label: 'Deleted' }
];

export function RidersView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const state = useSelector((s) => s.logistics || {});
  const list = state.riders || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    kyc_status: 'all',
    availability_status: 'all',
    status: 'all'
  });

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => ({
    page: pageNum,
    limit,
    ...(f.q ? { q: f.q } : {}),
    ...(f.kyc_status && f.kyc_status !== 'all' ? { kyc_status: f.kyc_status } : {}),
    ...(f.availability_status && f.availability_status !== 'all'
      ? { availability_status: f.availability_status }
      : {}),
    ...(f.status && f.status !== 'all' ? { status: f.status } : {})
  });

  useEffect(() => {
    dispatch(logistics.ridersListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on filter dropdowns; search uses Search button
  }, [dispatch, filters.kyc_status, filters.availability_status, filters.status]);

  const handleSearch = () => {
    const next = { ...filters, q: searchQuery.trim() };
    setFilters(next);
    dispatch(logistics.ridersListRequest({ params: buildParams(1, pageSize, next) }));
  };

  const updateFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
  };

  const handleAddButton = () => {
    router.push('/riders/add');
  };

  const handleViewButton = (row) => {
    if (!row?.id) return;
    router.push(`/riders/${row.id}`);
  };

  const handleEditButton = (row) => {
    if (!row?.id) return;
    router.push(`/riders/edit/${row.id}`);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(
      logistics.ridersListRequest({
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
          placeholder="Name, email, phone, vehicle…"
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="KYC"
          value={filters.kyc_status}
          onChange={(e) => updateFilter('kyc_status', e.target.value)}
          sx={{ minWidth: 140 }}
        >
          {KYC_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Availability"
          value={filters.availability_status}
          onChange={(e) => updateFilter('availability_status', e.target.value)}
          sx={{ minWidth: 140 }}
        >
          {AVAILABILITY_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          sx={{ minWidth: 140 }}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <RidersTableSection
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

export default RidersView;
