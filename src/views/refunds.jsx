'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { actions as ordersPayments } from 'store/ordersPayments/slice';
import RefundsTableSection from 'sections/refunds/RefundsTableSection';
import useUrlFilters from 'hooks/useUrlFilters';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSED', label: 'Processed' },
  { value: 'FAILED', label: 'Failed' }
];

const FILTER_DEFAULTS = {
  q: '',
  status: '',
  order_id: '',
  payment_id: '',
  page: 1,
  limit: 20
};

export function RefundsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.ordersPayments || {});
  const list = state.refunds || {
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

  useEffect(() => {
    setSearchQuery(applied.q || '');
  }, [applied.q]);

  useEffect(() => {
    dispatch(
      ordersPayments.refundsListRequest({
        params: {
          page: Number(applied.page) || 1,
          limit: Number(applied.limit) || 20,
          ...(applied.q ? { q: applied.q } : {}),
          ...(applied.status ? { status: applied.status } : {}),
          ...(applied.order_id ? { order_id: applied.order_id } : {}),
          ...(applied.payment_id ? { payment_id: applied.payment_id } : {})
        }
      })
    );
  }, [dispatch, urlKey, applied]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      status: draft.status,
      order_id: (draft.order_id || '').trim(),
      payment_id: (draft.payment_id || '').trim()
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
        placeholder="Reason, gateway refund id…"
        sx={{ minWidth: 200 }}
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
        size="small"
        label="Order ID"
        value={draft.order_id}
        onChange={(e) => setDraft({ order_id: e.target.value })}
        sx={{ minWidth: 260 }}
      />
      <TextField
        size="small"
        label="Payment ID"
        value={draft.payment_id}
        onChange={(e) => setDraft({ payment_id: e.target.value })}
        sx={{ minWidth: 260 }}
      />
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Refund history is read-only. Refunds are issued automatically when an order is cancelled from the order detail
        page.
      </Alert>
      <RefundsTableSection
        rows={data}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || 20}
        totalPageCount={totalPages}
        totalCount={total}
        onPaginationChange={handlePaginationChange}
        topActionsLeft={topActionsLeft}
      />
    </Stack>
  );
}

export default RefundsView;
