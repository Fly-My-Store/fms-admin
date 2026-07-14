'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { actions as ordersPayments } from 'store/ordersPayments/slice';
import RefundsTableSection from 'sections/refunds/RefundsTableSection';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSED', label: 'Processed' },
  { value: 'FAILED', label: 'Failed' }
];

export function RefundsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.ordersPayments || {});
  const list = state.refunds || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', order_id: '', payment_id: '' });

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => ({
    page: pageNum,
    limit,
    ...(f.q ? { q: f.q } : {}),
    ...(f.status ? { status: f.status } : {}),
    ...(f.order_id ? { order_id: f.order_id } : {}),
    ...(f.payment_id ? { payment_id: f.payment_id } : {})
  });

  useEffect(() => {
    dispatch(ordersPayments.refundsListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.status]);

  const handleSearch = () => {
    const next = {
      ...filters,
      q: searchQuery.trim(),
      order_id: filters.order_id.trim(),
      payment_id: filters.payment_id.trim()
    };
    setFilters(next);
    dispatch(ordersPayments.refundsListRequest({ params: buildParams(1, pageSize, next) }));
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(ordersPayments.refundsListRequest({ params: buildParams(next.pageIndex + 1, next.pageSize) }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  return (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        Refund history is read-only. Refunds are issued automatically when an order is cancelled from the order detail page.
      </Alert>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap">
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
          size="small"
          label="Order ID"
          value={filters.order_id}
          onChange={(e) => setFilters((p) => ({ ...p, order_id: e.target.value }))}
          sx={{ minWidth: 260 }}
        />
        <TextField
          size="small"
          label="Payment ID"
          value={filters.payment_id}
          onChange={(e) => setFilters((p) => ({ ...p, payment_id: e.target.value }))}
          sx={{ minWidth: 260 }}
        />
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>
      <RefundsTableSection
        rows={data}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
}

export default RefundsView;
