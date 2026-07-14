'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as sellersStores } from 'store/sellersStores/slice';
import SellersTableSection from 'sections/sellers/SellersTableSection';
import { KYC_STATUS, RECORD_STATUS } from 'utils/constants';

const KYC_OPTIONS = ['', ...Object.values(KYC_STATUS)];
const KYB_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'NONE', label: 'None' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' }
];
const RECORD_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: String(RECORD_STATUS.ACTIVE), label: 'Active' },
  { value: String(RECORD_STATUS.INACTIVE), label: 'Inactive' },
  { value: String(RECORD_STATUS.ARCHIVED), label: 'Archived' }
];

const KYC_LABELS = {
  PENDING: 'Pending',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RESUBMIT: 'Resubmit'
};

export function SellersView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const state = useSelector((s) => s.sellersStores || {});
  const list = state.sellers || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    kyc_status: '',
    kyb_status: '',
    record_status: ''
  });

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => ({
    page: pageNum,
    limit,
    ...(f.q ? { q: f.q } : {}),
    ...(f.kyc_status ? { kyc_status: f.kyc_status } : {}),
    ...(f.kyb_status ? { kyb_status: f.kyb_status } : {}),
    ...(f.record_status ? { record_status: f.record_status } : {})
  });

  useEffect(() => {
    dispatch(sellersStores.sellersListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.kyc_status, filters.kyb_status, filters.record_status]);

  const handleSearch = () => {
    const next = { ...filters, q: searchQuery.trim() };
    setFilters(next);
    dispatch(sellersStores.sellersListRequest({ params: buildParams(1, pageSize, next) }));
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(sellersStores.sellersListRequest({ params: buildParams(next.pageIndex + 1, next.pageSize) }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  const handlePayoutButton = (row) => {
    const name = row?.display_name || row?.legal_name || '';
    router.push(
      `/payouts?payee_type=SELLER&payee_id=${row.id}&payee_name=${encodeURIComponent(name)}`
    );
  };

  const handleViewStoreButton = (row) => {
    const storeId =
      row?.primary_store_id || row?.default_store_id || row?.primary_store?.id || row?.stores?.[0]?.id;
    if (storeId) router.push(`/stores/${storeId}`);
  };

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap">
        <TextField
          size="small"
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Name, GSTIN, email, phone…"
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="KYC"
          value={filters.kyc_status}
          onChange={(e) => setFilters((p) => ({ ...p, kyc_status: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          {KYC_OPTIONS.map((s) => (
            <MenuItem key={s || 'all'} value={s}>
              {s ? KYC_LABELS[s] || s : 'All'}
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

      <SellersTableSection
        rows={data}
        handleViewStoreButton={handleViewStoreButton}
        handlePayoutButton={handlePayoutButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
}

export default SellersView;
