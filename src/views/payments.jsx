'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as ordersPayments } from 'store/ordersPayments/slice';
import PaymentsTableSection from 'sections/payments/PaymentsTableSection';
import PaymentsFormDialog from 'sections/payments/PaymentsFormDialog';
import useUrlFilters from 'hooks/useUrlFilters';
import { PAYMENT_GATEWAY_STATUS, PAYMENT_GATEWAY_TYPE } from 'utils/constants';

const STATUS_OPTIONS = ['', ...Object.values(PAYMENT_GATEWAY_STATUS)];
const GATEWAY_OPTIONS = ['', ...Object.values(PAYMENT_GATEWAY_TYPE)];

const FILTER_DEFAULTS = {
  q: '',
  status: '',
  gateway: '',
  order_id: '',
  from: '',
  to: '',
  page: 1,
  limit: 20
};

export function PaymentsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.ordersPayments || {});
  const list = state.payments || {
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

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');

  useEffect(() => {
    setSearchQuery(applied.q || '');
  }, [applied.q]);

  useEffect(() => {
    dispatch(
      ordersPayments.paymentsListRequest({
        params: {
          page: Number(applied.page) || 1,
          limit: Number(applied.limit) || 20,
          ...(applied.q ? { q: applied.q } : {}),
          ...(applied.status ? { status: applied.status } : {}),
          ...(applied.gateway ? { gateway: applied.gateway } : {}),
          ...(applied.order_id ? { order_id: applied.order_id } : {}),
          ...(applied.from ? { from: applied.from } : {}),
          ...(applied.to ? { to: applied.to } : {})
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
      gateway: draft.gateway,
      order_id: (draft.order_id || '').trim(),
      from: draft.from,
      to: draft.to
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
        placeholder="Gateway ids…"
        sx={{ minWidth: 180 }}
      />
      <TextField
        select
        size="small"
        label="Status"
        value={draft.status}
        onChange={(e) => setDraft({ status: e.target.value })}
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
        value={draft.gateway}
        onChange={(e) => setDraft({ gateway: e.target.value })}
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
        value={draft.order_id}
        onChange={(e) => setDraft({ order_id: e.target.value })}
        sx={{ minWidth: 260 }}
      />
      <TextField
        size="small"
        type="date"
        label="From"
        InputLabelProps={{ shrink: true }}
        value={draft.from}
        onChange={(e) => setDraft({ from: e.target.value })}
      />
      <TextField
        size="small"
        type="date"
        label="To"
        InputLabelProps={{ shrink: true }}
        value={draft.to}
        onChange={(e) => setDraft({ to: e.target.value })}
      />
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <>
      <PaymentsTableSection
        rows={data}
        handleAddButton={() => {
          setSelected(null);
          setOpen(true);
        }}
        handleEditButton={(row) => {
          setSelected(row);
          setOpen(true);
        }}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || 20}
        totalPageCount={totalPages}
        totalCount={total}
        onPaginationChange={handlePaginationChange}
        topActionsLeft={topActionsLeft}
      />
      <PaymentsFormDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
        initialData={selected}
      />
    </>
  );
}

export default PaymentsView;
