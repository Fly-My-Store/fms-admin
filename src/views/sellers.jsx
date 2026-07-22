'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as sellersStores } from 'store/sellersStores/slice';
import SellersTableSection from 'sections/sellers/SellersTableSection';
import SellersFormDialog from 'sections/sellers/SellersFormDialog';
import { KYC_STATUS, RECORD_STATUS } from 'utils/constants';

const KYC_OPTIONS = [
  { value: 'all', label: 'All' },
  ...Object.values(KYC_STATUS).map((s) => ({ value: s, label: s }))
];
const KYB_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'NONE', label: 'None' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' }
];
const RECORD_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: String(RECORD_STATUS.ACTIVE), label: 'Active' },
  { value: String(RECORD_STATUS.INACTIVE), label: 'Inactive' },
  { value: String(RECORD_STATUS.ARCHIVED), label: 'Archived' }
];
const TESTER_FILTER_OPTIONS = [
  { value: 'false', label: 'Live' },
  { value: 'true', label: 'Testers' },
  { value: 'all', label: 'All' }
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
  const actorIsTester = useSelector((s) => Boolean(s.auth?.user?.is_tester));
  const state = useSelector((s) => s.sellersStores || {});
  const list = state.sellers || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    q: '',
    kyc_status: 'all',
    kyb_status: 'all',
    record_status: 'all',
    is_tester: 'false'
  });

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => {
    const params = {
      page: pageNum,
      limit,
      ...(f.q ? { q: f.q } : {}),
      ...(f.kyc_status && f.kyc_status !== 'all' ? { kyc_status: f.kyc_status } : {}),
      ...(f.kyb_status && f.kyb_status !== 'all' ? { kyb_status: f.kyb_status } : {}),
      ...(f.record_status && f.record_status !== 'all' ? { record_status: f.record_status } : {})
    };
    if (!actorIsTester) {
      params.is_tester = f.is_tester || 'false';
    }
    return params;
  };

  useEffect(() => {
    dispatch(sellersStores.sellersListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.kyc_status, filters.kyb_status, filters.record_status, filters.is_tester, actorIsTester]);

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

  const handleAddButton = () => {
    setSelected(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelected(row);
    setOpen(true);
  };

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
          {KYC_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.value === 'all' ? 'All' : KYC_LABELS[o.value] || o.label}
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
            <MenuItem key={o.value} value={o.value}>
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
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        {!actorIsTester && (
          <TextField
            select
            size="small"
            label="Scope"
            value={filters.is_tester}
            onChange={(e) => setFilters((p) => ({ ...p, is_tester: e.target.value }))}
            sx={{ minWidth: 120 }}
          >
            {TESTER_FILTER_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        )}
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <SellersTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        handleViewStoreButton={handleViewStoreButton}
        handlePayoutButton={handlePayoutButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />

      <SellersFormDialog open={open} onClose={() => setOpen(false)} initialData={selected} />
    </>
  );
}

export default SellersView;
