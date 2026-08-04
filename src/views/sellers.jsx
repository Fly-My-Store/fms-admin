'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as sellersStores } from 'store/sellersStores/slice';
import SellersTableSection from 'sections/sellers/SellersTableSection';
import SellersFormDialog from 'sections/sellers/SellersFormDialog';
import useUrlFilters from 'hooks/useUrlFilters';
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

const FILTER_DEFAULTS = {
  q: '',
  kyc_status: 'all',
  kyb_status: 'all',
  record_status: 'all',
  is_tester: 'false',
  page: 1,
  limit: 20
};

export function SellersView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const actorIsTester = useSelector((s) => Boolean(s.auth?.user?.is_tester));
  const state = useSelector((s) => s.sellersStores || {});
  const list = state.sellers || {
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
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const buildParams = (f = applied) => {
    const params = {
      page: Number(f.page) || 1,
      limit: Number(f.limit) || 20,
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
    dispatch(sellersStores.sellersListRequest({ params: buildParams(applied) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    urlKey,
    applied.page,
    applied.limit,
    applied.q,
    applied.kyc_status,
    applied.kyb_status,
    applied.record_status,
    applied.is_tester,
    actorIsTester
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
      kyb_status: draft.kyb_status,
      record_status: draft.record_status,
      is_tester: draft.is_tester
    });
  };

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

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
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
        value={draft.kyc_status}
        onChange={(e) => setDraft({ kyc_status: e.target.value })}
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
        value={draft.kyb_status}
        onChange={(e) => setDraft({ kyb_status: e.target.value })}
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
        value={draft.record_status}
        onChange={(e) => setDraft({ record_status: e.target.value })}
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
          value={draft.is_tester}
          onChange={(e) => setDraft({ is_tester: e.target.value })}
          sx={{ minWidth: 120 }}
        >
          {TESTER_FILTER_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      )}
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <>
      <SellersTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        handleViewStoreButton={handleViewStoreButton}
        handlePayoutButton={handlePayoutButton}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || 20}
        totalPageCount={totalPages}
        totalCount={total}
        onPaginationChange={handlePaginationChange}
        topActionsLeft={topActionsLeft}
      />

      <SellersFormDialog open={open} onClose={() => setOpen(false)} initialData={selected} />
    </>
  );
}

export default SellersView;
