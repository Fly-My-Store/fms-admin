'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as ordersPayments } from 'store/ordersPayments/slice';
import { listStores } from 'api/sellersStores';
import OrdersTableSection from 'sections/orders/OrdersTableSection';
import useUrlFilters from 'hooks/useUrlFilters';

const ORDER_STATUSES = ['', 'CREATED', 'CONFIRMED', 'PACKING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const PAYMENT_STATUSES = ['', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];

const FILTER_DEFAULTS = {
  q: '',
  status: '',
  payment_status: '',
  store_id: '',
  page: 1,
  limit: 20
};

export function OrdersView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const state = useSelector((s) => s.ordersPayments || {});
  const list = state.orders || {
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
  const [stores, setStores] = useState([]);

  useEffect(() => {
    listStores({ limit: 200 })
      .then((resp) => setStores(resp?.data || []))
      .catch(() => setStores([]));
  }, []);

  useEffect(() => {
    setSearchQuery(applied.q || '');
  }, [applied.q]);

  useEffect(() => {
    dispatch(
      ordersPayments.ordersListRequest({
        params: {
          page: Number(applied.page) || 1,
          limit: Number(applied.limit) || 20,
          ...(applied.q ? { q: applied.q } : {}),
          ...(applied.status ? { status: applied.status } : {}),
          ...(applied.payment_status ? { payment_status: applied.payment_status } : {}),
          ...(applied.store_id ? { store_id: applied.store_id } : {})
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
      payment_status: draft.payment_status,
      store_id: draft.store_id
    });
  };

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
      <TextField
        size="small"
        label="Search"
        placeholder="Order ID, customer name or phone"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        sx={{ minWidth: 220 }}
      />
      <TextField
        select
        size="small"
        label="Order status"
        value={draft.status}
        onChange={(e) => setDraft({ status: e.target.value })}
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
        value={draft.payment_status}
        onChange={(e) => setDraft({ payment_status: e.target.value })}
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
        value={draft.store_id}
        onChange={(e) => setDraft({ store_id: e.target.value })}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">All</MenuItem>
        {stores.map((s) => (
          <MenuItem key={s.id} value={s.id}>
            {s.name || s.id}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <OrdersTableSection
      rows={data}
      handleViewButton={(row) => row?.id && router.push(`/orders/${row.id}`)}
      pageIndex={(Number(applied.page) || 1) - 1}
      pageSize={Number(applied.limit) || 20}
      totalPageCount={totalPages}
      onPaginationChange={handlePaginationChange}
      totalCount={total}
      topActionsLeft={topActionsLeft}
    />
  );
}

export default OrdersView;
