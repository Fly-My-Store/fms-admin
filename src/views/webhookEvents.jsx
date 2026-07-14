'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { actions as integrations } from 'store/integrations/slice';
import WebhookeventsTableSection from 'sections/webhookEvents/WebhookeventsTableSection';
import WebhookEventDetailDialog from 'sections/webhookEvents/WebhookEventDetailDialog';
import PaymentOpsCard from 'sections/webhookEvents/PaymentOpsCard';

export default function WebhookeventsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.integrations || {});
  const list = state.webhookEvents || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const detail = state.webhookEventsDetail || { data: null, loading: false, error: null };
  const replay = state.webhookReplay || { loading: false, error: null, data: null };
  const paymentOps = state.paymentOps || { loading: false, error: null, data: null, action: null };

  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [replayingId, setReplayingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventQuery, setEventQuery] = useState('');
  const [filters, setFilters] = useState({ q: '', provider: '', status: '', event: '' });

  const listParams = {
    page,
    limit: pageSize,
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.provider ? { provider: filters.provider } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.event ? { event: filters.event } : {})
  };

  const refreshList = useCallback(() => {
    dispatch(integrations.webhookEventsListRequest({ params: listParams }));
  }, [dispatch, page, pageSize, filters.q, filters.provider, filters.status, filters.event]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const handleSearch = () => {
    setFilters((p) => ({
      ...p,
      q: searchQuery.trim(),
      event: eventQuery.trim()
    }));
  };

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  useEffect(() => {
    if (detail.error) enqueueSnackbar(detail.error, { variant: 'error' });
  }, [detail.error]);

  useEffect(() => {
    if (replay.error) {
      enqueueSnackbar(replay.error, { variant: 'error' });
      setReplayingId(null);
    }
  }, [replay.error]);

  useEffect(() => {
    if (!replay.loading && replay.data && replayingId) {
      enqueueSnackbar('Webhook replay completed', { variant: 'success' });
      if (selectedId) {
        dispatch(integrations.webhookEventsGetRequest({ params: { id: selectedId } }));
      }
      setReplayingId(null);
    }
  }, [replay.data, replay.loading, replayingId, selectedId, dispatch]);

  useEffect(() => {
    if (paymentOps.error) enqueueSnackbar(paymentOps.error, { variant: 'error' });
  }, [paymentOps.error]);

  useEffect(() => {
    if (paymentOps.data && !paymentOps.loading && paymentOps.action) {
      enqueueSnackbar('Payment ops job completed', { variant: 'success' });
    }
  }, [paymentOps.data, paymentOps.loading, paymentOps.action]);

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(
      integrations.webhookEventsListRequest({
        params: {
          page: next.pageIndex + 1,
          limit: next.pageSize,
          ...(filters.q ? { q: filters.q } : {}),
          ...(filters.provider ? { provider: filters.provider } : {}),
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.event ? { event: filters.event } : {})
        }
      })
    );
  };

  const handleView = (row) => {
    setSelectedId(row.id);
    setDetailOpen(true);
    dispatch(integrations.webhookEventsGetRequest({ params: { id: row.id } }));
  };

  const handleReplay = (row) => {
    if (!row?.id) return;
    const confirmed = window.confirm(`Replay webhook "${row.event}" (${row.id})?`);
    if (!confirmed) return;
    setReplayingId(row.id);
    dispatch(
      integrations.webhookEventsReplayRequest({
        id: row.id,
        listParams
      })
    );
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedId(null);
  };

  return (
    <Stack spacing={2}>
      <PaymentOpsCard
        loading={paymentOps.loading}
        action={paymentOps.action}
        result={paymentOps.data}
        error={paymentOps.error}
        onReconcile={() => dispatch(integrations.paymentOpsRequest({ action: 'payment-reconcile' }))}
        onCheckoutExpiry={() => dispatch(integrations.paymentOpsRequest({ action: 'checkout-expiry' }))}
      />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap">
        <TextField
          size="small"
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Event or provider…"
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          label="Provider"
          value={filters.provider}
          onChange={(e) => setFilters((p) => ({ ...p, provider: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="razorpay">Razorpay</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="PROCESSED">Processed</MenuItem>
          <MenuItem value="FAILED">Failed</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Event"
          value={eventQuery}
          onChange={(e) => setEventQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ minWidth: 180 }}
        />
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>
      <WebhookeventsTableSection
        rows={data}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        onView={handleView}
        onReplay={handleReplay}
        replayingId={replayingId}
      />
      <WebhookEventDetailDialog
        open={detailOpen}
        onClose={handleCloseDetail}
        event={detail.data}
        loading={detail.loading}
        replayLoading={replay.loading && replayingId === selectedId}
        replayResult={
          selectedId && replay.data && String(replay.data.webhook_event_id) === String(selectedId)
            ? replay.data
            : null
        }
        onReplay={(ev) => handleReplay(ev)}
      />
    </Stack>
  );
}
