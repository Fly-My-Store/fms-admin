'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as logistics } from 'store/logistics/slice';
import RidersTableSection from 'sections/riders/RidersTableSection';
import { TABLE_STATUS } from 'utils/constants';

const KYC_OPTIONS = ['', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMIT'];
const AVAILABILITY_OPTIONS = ['', 'OFFLINE', 'IDLE', 'ASSIGNED', 'ON_TRIP'];
const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: String(TABLE_STATUS.ACTIVE), label: 'Active' },
  { value: String(TABLE_STATUS.INACTIVE), label: 'Inactive' },
  { value: String(TABLE_STATUS.SUSPENDED), label: 'Suspended' },
  { value: String(TABLE_STATUS.DELETED), label: 'Deleted' }
];

const KYC_LABELS = {
  PENDING: 'Pending',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RESUBMIT: 'Resubmit'
};

const AVAILABILITY_LABELS = {
  OFFLINE: 'Offline',
  IDLE: 'Idle',
  ASSIGNED: 'Assigned',
  ON_TRIP: 'On Trip'
};

export function RidersView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const state = useSelector((s) => s.logistics || {});
  const list = state.riders || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    kyc_status: '',
    availability_status: '',
    record_status: ''
  });

  const buildParams = (pageNum = page, limit = pageSize) => ({
    page: pageNum,
    limit,
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.kyc_status ? { kyc_status: filters.kyc_status } : {}),
    ...(filters.availability_status ? { availability_status: filters.availability_status } : {}),
    ...(filters.record_status ? { record_status: filters.record_status } : {})
  });

  useEffect(() => {
    dispatch(logistics.ridersListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on filter dropdowns; search uses Search button
  }, [dispatch, filters.kyc_status, filters.availability_status, filters.record_status]);

  const handleSearch = () => {
    const next = { ...filters, q: searchQuery.trim() };
    setFilters(next);
    dispatch(
      logistics.ridersListRequest({
        params: {
          page: 1,
          limit: pageSize,
          ...(next.q ? { q: next.q } : {}),
          ...(next.kyc_status ? { kyc_status: next.kyc_status } : {}),
          ...(next.availability_status ? { availability_status: next.availability_status } : {}),
          ...(next.record_status ? { record_status: next.record_status } : {})
        }
      })
    );
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
          {KYC_OPTIONS.map((s) => (
            <MenuItem key={s || 'all'} value={s}>
              {s ? KYC_LABELS[s] : 'All'}
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
          {AVAILABILITY_OPTIONS.map((s) => (
            <MenuItem key={s || 'all'} value={s}>
              {s ? AVAILABILITY_LABELS[s] : 'All'}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={filters.record_status}
          onChange={(e) => updateFilter('record_status', e.target.value)}
          sx={{ minWidth: 140 }}
        >
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s.value || 'all'} value={s.value}>
              {s.label}
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
