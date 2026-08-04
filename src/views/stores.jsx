'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as sellersStores } from 'store/sellersStores/slice';
import StoresTableSection from 'sections/stores/StoresTableSection';
import useUrlFilters from 'hooks/useUrlFilters';
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

const FILTER_DEFAULTS = {
  q: '',
  status: '',
  kyb_status: '',
  page: 1,
  limit: 20
};

export function StoresView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const state = useSelector((s) => s.sellersStores || {});
  const list = state.stores || {
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
    sort: 'updatedAt',
    dir: 'DESC',
    ...(f.q ? { q: f.q } : {}),
    ...(f.status ? { status: f.status } : {}),
    ...(f.kyb_status ? { kyb_status: f.kyb_status } : {})
  });

  useEffect(() => {
    dispatch(sellersStores.storesListRequest({ params: buildParams(applied) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, urlKey, applied.page, applied.limit, applied.q, applied.status, applied.kyb_status]);

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
      status: draft.status,
      kyb_status: draft.kyb_status
    });
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

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
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
        value={draft.status}
        onChange={(e) => setDraft({ status: e.target.value })}
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
        value={draft.kyb_status}
        onChange={(e) => setDraft({ kyb_status: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        {KYB_OPTIONS.map((o) => (
          <MenuItem key={o.value || 'all'} value={o.value}>
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
    <StoresTableSection
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

export default StoresView;
