'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import PushBroadcastsTableSection from 'sections/pushBroadcasts/PushBroadcastsTableSection';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import useUrlFilters from 'hooks/useUrlFilters';
import { resendPushBroadcast } from 'api/pushBroadcasts';
import {
  PUSH_BROADCAST_AUDIENCE_OPTIONS,
  PUSH_BROADCAST_STATUS_OPTIONS,
  PUSH_BROADCAST_TEMPLATE_FILTER_OPTIONS
} from 'utils/pushBroadcastLabels';

const FILTER_DEFAULTS = {
  q: '',
  status: '',
  audience: '',
  template_key: '',
  page: 1,
  limit: 20
};

const STATUS_FILTER_OPTIONS = [{ value: '', label: 'All' }, ...PUSH_BROADCAST_STATUS_OPTIONS];
const AUDIENCE_FILTER_OPTIONS = [{ value: '', label: 'All' }, ...PUSH_BROADCAST_AUDIENCE_OPTIONS];
const TEMPLATE_FILTER_OPTIONS = PUSH_BROADCAST_TEMPLATE_FILTER_OPTIONS;

export default function PushBroadcastsView() {
  const router = useRouter();
  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');
  const [resendingId, setResendingId] = useState(null);

  const listParams = useMemo(
    () => ({
      ...(applied.q ? { q: applied.q } : {}),
      ...(applied.status ? { status: applied.status } : {}),
      ...(applied.audience ? { audience: applied.audience } : {}),
      ...(applied.template_key ? { template_key: applied.template_key } : {})
    }),
    [applied.q, applied.status, applied.audience, applied.template_key]
  );

  const { rows, totalPages, totalCount, load, setPageIndex, setPageSize } = useAxiosPaginatedList(
    'admin/push-broadcasts',
    { params: listParams, errorMessage: 'Failed to load push broadcasts' }
  );

  useEffect(() => {
    setSearchQuery(applied.q || '');
    setPageIndex((Number(applied.page) || 1) - 1);
    setPageSize(Number(applied.limit) || 20);
  }, [urlKey, applied.q, applied.page, applied.limit, setPageIndex, setPageSize]);

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      status: draft.status,
      audience: draft.audience,
      template_key: draft.template_key
    });
  };

  const handleDuplicate = (row) => {
    if (!row?.id) return;
    router.push(`/push-broadcasts/create?duplicate=${row.id}`);
  };

  const handleResend = async (row) => {
    if (!row?.id || resendingId) return;
    const targeted = row.summary_json?.targeted;
    const confirmMsg =
      targeted != null
        ? `Resend "${row.title}" as a new broadcast (same audience filters; last run targeted ~${targeted})?`
        : `Resend "${row.title}" as a new broadcast with the same filters?`;
    if (!window.confirm(confirmMsg)) return;

    setResendingId(row.id);
    try {
      await resendPushBroadcast(row.id);
      enqueueSnackbar('Resend queued', { variant: 'success' });
      load();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Resend failed', { variant: 'error' });
    } finally {
      setResendingId(null);
    }
  };

  const topActionsLeft = () => (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
      <TextField
        size="small"
        label="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        sx={{ minWidth: 200 }}
      />
      <TextField
        select
        size="small"
        label="Audience"
        value={draft.audience || ''}
        onChange={(e) => setDraft((d) => ({ ...d, audience: e.target.value }))}
        sx={{ minWidth: 140 }}
      >
        {AUDIENCE_FILTER_OPTIONS.map((o) => (
          <MenuItem key={o.value || 'all'} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Status"
        value={draft.status || ''}
        onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
        sx={{ minWidth: 140 }}
      >
        {STATUS_FILTER_OPTIONS.map((o) => (
          <MenuItem key={o.value || 'all'} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Template"
        value={draft.template_key || ''}
        onChange={(e) => setDraft((d) => ({ ...d, template_key: e.target.value }))}
        sx={{ minWidth: 220 }}
      >
        {TEMPLATE_FILTER_OPTIONS.map((o) => (
          <MenuItem key={o.value || 'all-templates'} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="contained" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <PushBroadcastsTableSection
      rows={rows}
      handleAddButton={() => router.push('/push-broadcasts/create')}
      handleViewButton={(row) => row?.id && router.push(`/push-broadcasts/${row.id}`)}
      handleDuplicate={handleDuplicate}
      handleResend={handleResend}
      resendingId={resendingId}
      pageIndex={(Number(applied.page) || 1) - 1}
      pageSize={Number(applied.limit) || 20}
      totalPageCount={totalPages}
      totalCount={totalCount}
      onPaginationChange={handlePaginationChange}
      topActionsLeft={topActionsLeft}
    />
  );
}
