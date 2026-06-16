'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as ordersPayments } from 'store/ordersPayments/slice';
import { listStores } from 'api/sellersStores';
import OrdersTableSection from 'sections/orders/OrdersTableSection';

const ORDER_STATUSES = ['', 'CREATED', 'CONFIRMED', 'PACKING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const PAYMENT_STATUSES = ['', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];

export function OrdersView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const state = useSelector((s) => s.orderspayments || {});
  const list = state.orders || { rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, total = 0, totalPages = 1 } = {}, error } = list;

  const [filters, setFilters] = useState({ q: '', status: '', payment_status: '', store_id: '' });
  const [stores, setStores] = useState([]);

  const loadOrders = useCallback(
    (params = {}) => {
      const nextPage = params.page ?? page;
      const nextLimit = params.limit ?? pageSize;
      const query = {
        page: nextPage,
        limit: nextLimit,
        ...(filters.q ? { q: filters.q } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.payment_status ? { payment_status: filters.payment_status } : {}),
        ...(filters.store_id ? { store_id: filters.store_id } : {})
      };
      dispatch(ordersPayments.ordersListRequest({ params: query }));
    },
    [dispatch, filters, page, pageSize]
  );

  useEffect(() => {
    loadOrders({ page: 1 });
  }, [filters.status, filters.payment_status, filters.store_id]);

  useEffect(() => {
    listStores({ limit: 200 })
      .then((resp) => setStores(resp?.data || []))
      .catch(() => setStores([]));
  }, []);

  const handleViewButton = (row) => {
    if (row?.id) router.push(`/orders/${row.id}`);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    loadOrders({ page: next.pageIndex + 1, limit: next.pageSize });
  };

  const handleSearch = () => loadOrders({ page: 1 });

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const filterBar = useMemo(
    () => () => (
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
        <TextField
          size="small"
          label="Search"
          placeholder="Order ID, customer name or phone"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="Order status"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          sx={{ minWidth: 160 }}
        >
          {ORDER_STATUSES.map((s) => (
            <MenuItem key={s || 'all'} value={s}>
              {s || 'All'}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Payment status"
          value={filters.payment_status}
          onChange={(e) => setFilters((f) => ({ ...f, payment_status: e.target.value }))}
          sx={{ minWidth: 160 }}
        >
          {PAYMENT_STATUSES.map((s) => (
            <MenuItem key={s || 'all'} value={s}>
              {s || 'All'}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Store"
          value={filters.store_id}
          onChange={(e) => setFilters((f) => ({ ...f, store_id: e.target.value }))}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All stores</MenuItem>
          {stores.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" size="small" onClick={handleSearch}>
          Search
        </Button>
      </Stack>
    ),
    [filters, stores, handleSearch]
  );

  return (
    <OrdersTableSection
      rows={data}
      handleViewButton={handleViewButton}
      pageIndex={page - 1}
      pageSize={pageSize}
      totalPageCount={totalPages}
      totalCount={total}
      onPaginationChange={handlePaginationChange}
      filterBar={filterBar}
    />
  );
}

export default OrdersView;
