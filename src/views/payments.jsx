'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as ordersPayments } from 'store/ordersPayments/slice';
import PaymentsTableSection from 'sections/payments/PaymentsTableSection';
import PaymentsFormDialog from 'sections/payments/PaymentsFormDialog';
import { PAYMENT_GATEWAY_STATUS, PAYMENT_GATEWAY_TYPE } from 'utils/constants';

const STATUS_OPTIONS = ['', ...Object.values(PAYMENT_GATEWAY_STATUS)];
const GATEWAY_OPTIONS = ['', ...Object.values(PAYMENT_GATEWAY_TYPE)];

export function PaymentsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.ordersPayments || {});
  const list = state.payments || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    status: '',
    gateway: '',
    order_id: '',
    from: '',
    to: ''
  });

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => ({
    page: pageNum,
    limit,
    ...(f.q ? { q: f.q } : {}),
    ...(f.status ? { status: f.status } : {}),
    ...(f.gateway ? { gateway: f.gateway } : {}),
    ...(f.order_id ? { order_id: f.order_id } : {}),
    ...(f.from ? { from: f.from } : {}),
    ...(f.to ? { to: f.to } : {})
  });

  useEffect(() => {
    dispatch(ordersPayments.paymentsListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.status, filters.gateway, filters.from, filters.to]);

  const handleSearch = () => {
    const next = { ...filters, q: searchQuery.trim(), order_id: filters.order_id.trim() };
    setFilters(next);
    dispatch(ordersPayments.paymentsListRequest({ params: buildParams(1, pageSize, next) }));
  };

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelected(null);
  };

  const handleAddButton = () => {
    setSelected(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelected(row);
    setOpen(true);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(ordersPayments.paymentsListRequest({ params: buildParams(next.pageIndex + 1, next.pageSize) }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap">
        <TextField
          size="small"
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Gateway ids…"
          sx={{ minWidth: 180 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s || 'all'} value={s}>
              {s || 'All'}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Gateway"
          value={filters.gateway}
          onChange={(e) => setFilters((p) => ({ ...p, gateway: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          {GATEWAY_OPTIONS.map((s) => (
            <MenuItem key={s || 'all'} value={s}>
              {s || 'All'}
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
          type="date"
          label="From"
          InputLabelProps={{ shrink: true }}
          value={filters.from}
          onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
        />
        <TextField
          size="small"
          type="date"
          label="To"
          InputLabelProps={{ shrink: true }}
          value={filters.to}
          onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
        />
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <PaymentsTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <PaymentsFormDialog open={open} onClose={handleDialogToggle} initialData={selected} />
    </>
  );
}

export default PaymentsView;
