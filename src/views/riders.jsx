'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as logistics } from 'store/logistics/slice';
import RidersTableSection from 'sections/riders/RidersTableSection';
import useUrlFilters from 'hooks/useUrlFilters';
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

const FILTER_DEFAULTS = {
  q: '',
  kyc_status: 'all',
  availability_status: 'all',
  status: 'all',
  page: 1,
  limit: 20
};

export function RidersView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const state = useSelector((s) => s.logistics || {});
  const list = state.riders || {
    rows: [],
    meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
    loading: false,
    error: null
  };
  const {
    rows: data = [],
    meta: { total = 0, totalPages = 1 } = {},
    error
  } = list;

  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');

  const buildParams = (f = applied) => ({
    page: Number(f.page) || 1,
    limit: Number(f.limit) || 20,
    ...(f.q ? { q: f.q } : {}),
    ...(f.kyc_status && f.kyc_status !== 'all' ? { kyc_status: f.kyc_status } : {}),
    ...(f.availability_status && f.availability_status !== 'all'
      ? { availability_status: f.availability_status }
      : {}),
    ...(f.status && f.status !== 'all' ? { status: f.status } : {})
  });

  useEffect(() => {
    dispatch(logistics.ridersListRequest({ params: buildParams(applied) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    urlKey,
    applied.page,
    applied.limit,
    applied.q,
    applied.kyc_status,
    applied.availability_status,
    applied.status
  ]);

  useEffect(() => {
    setSearchQuery(applied.q || '');
  }, [applied.q]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      kyc_status: draft.kyc_status,
      availability_status: draft.availability_status,
      status: draft.status
    });
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

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
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
        value={draft.kyc_status}
        onChange={(e) => setDraft({ kyc_status: e.target.value })}
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
        value={draft.availability_status}
        onChange={(e) => setDraft({ availability_status: e.target.value })}
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
        value={draft.status}
        onChange={(e) => setDraft({ status: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        {STATUS_OPTIONS.map((o) => (
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

  return (
    <RidersTableSection
      rows={data}
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      handleViewButton={handleViewButton}
      pageIndex={(Number(applied.page) || 1) - 1}
      pageSize={Number(applied.limit) || 20}
      totalPageCount={totalPages}
      totalCount={total}
      onPaginationChange={handlePaginationChange}
      topActionsLeft={topActionsLeft}
    />
  );
}

export default RidersView;
