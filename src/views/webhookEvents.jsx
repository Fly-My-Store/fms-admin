'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { actions as integrations } from 'store/integrations/slice';
import WebhookeventsTableSection from 'sections/webhookEvents/WebhookeventsTableSection';
import WebhookEventDetailDialog from 'sections/webhookEvents/WebhookEventDetailDialog';
import PaymentOpsCard from 'sections/webhookEvents/PaymentOpsCard';
import useUrlFilters from 'hooks/useUrlFilters';

const FILTER_DEFAULTS = {
  q: '',
  provider: '',
  status: '',
  event: '',
  page: 1,
  limit: 20
};

export default function WebhookeventsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.integrations || {});
  const list = state.webhookEvents || {
    rows: [],
    meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
    loading: false,
    error: null
  };
  const detail = state.webhookEventsDetail || { data: null, loading: false, error: null };
  const replay = state.webhookReplay || { loading: false, error: null, data: null };
  const paymentOps = state.paymentOps || { loading: false, error: null, data: null, action: null };

  const {
    rows: data = [],
    meta: { total = 0, totalPages = 1 } = {},
    error
  } = list;

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [replayingId, setReplayingId] = useState(null);
  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');
  const [eventQuery, setEventQuery] = useState(draft.event || '');

  const listParams = useMemo(
    () => ({
      page: Number(applied.page) || 1,
      limit: Number(applied.limit) || 20,
      ...(applied.q ? { q: applied.q } : {}),
      ...(applied.provider ? { provider: applied.provider } : {}),
      ...(applied.status ? { status: applied.status } : {}),
      ...(applied.event ? { event: applied.event } : {})
    }),
    [applied]
  );

  useEffect(() => {
    setSearchQuery(applied.q || '');
    setEventQuery(applied.event || '');
  }, [applied.q, applied.event]);

  useEffect(() => {
    dispatch(integrations.webhookEventsListRequest({ params: listParams }));
  }, [dispatch, urlKey, listParams]);

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

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      provider: draft.provider,
      status: draft.status,
      event: eventQuery.trim()
    });
  };

  const handleView = (row) => {
    setSelectedId(row.id);
    setDetailOpen(true);
    dispatch(integrations.webhookEventsGetRequest({ params: { id: row.id } }));
  };

  const handleReplay = useCallback(
    (row) => {
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
    },
    [dispatch, listParams]
  );

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
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
        value={draft.provider}
        onChange={(e) => setDraft({ provider: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="razorpay">Razorpay</MenuItem>
      </TextField>
      <TextField
        select
        size="small"
        label="Status"
        value={draft.status}
        onChange={(e) => setDraft({ status: e.target.value })}
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
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <>
      <PaymentOpsCard
        loading={paymentOps.loading}
        action={paymentOps.action}
        result={paymentOps.data}
        error={paymentOps.error}
        onReconcile={() => dispatch(integrations.paymentOpsRequest({ action: 'payment-reconcile' }))}
        onCheckoutExpiry={() => dispatch(integrations.paymentOpsRequest({ action: 'checkout-expiry' }))}
      />
      <WebhookeventsTableSection
        rows={data}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || 20}
        totalPageCount={totalPages}
        totalCount={total}
        onPaginationChange={handlePaginationChange}
        onView={handleView}
        onReplay={handleReplay}
        replayingId={replayingId}
        topActionsLeft={topActionsLeft}
      />
      <WebhookEventDetailDialog
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedId(null);
        }}
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
    </>
  );
}
