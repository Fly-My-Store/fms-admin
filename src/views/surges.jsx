'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import SurgesTableSection from 'sections/surges/SurgesTableSection';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import useUrlFilters from 'hooks/useUrlFilters';
import { approveSurge, disableSurge, enableSurge, rejectSurge } from 'api/surges';
import { SURGE_SCOPE_LABELS, SURGE_STATUS_OPTIONS } from 'utils/surgeLabels';

const FILTER_DEFAULTS = {
  q: '',
  status: '',
  scope: '',
  page: 1,
  limit: 20
};

const STATUS_FILTER_OPTIONS = [{ value: '', label: 'All' }, ...SURGE_STATUS_OPTIONS];
const SCOPE_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  ...Object.entries(SURGE_SCOPE_LABELS).map(([value, label]) => ({ value, label }))
];

export default function SurgesView() {
  const router = useRouter();
  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const listParams = useMemo(
    () => ({
      ...(applied.q ? { q: applied.q } : {}),
      ...(applied.status ? { status: applied.status } : {}),
      ...(applied.scope ? { scope: applied.scope } : {})
    }),
    [applied.q, applied.status, applied.scope]
  );

  const { rows, totalPages, totalCount, load, setPageIndex, setPageSize } = useAxiosPaginatedList(
    'admin/surges',
    { params: listParams, errorMessage: 'Failed to load surges' }
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
      scope: draft.scope
    });
  };

  const handleApprove = async (row) => {
    try {
      await approveSurge(row.id);
      enqueueSnackbar('Surge approved', { variant: 'success' });
      load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Approve failed', { variant: 'error' });
    }
  };

  const handleEnable = async (row) => {
    try {
      await enableSurge(row.id);
      enqueueSnackbar('Surge enabled', { variant: 'success' });
      load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Enable failed', { variant: 'error' });
    }
  };

  const handleDisable = async (row) => {
    try {
      await disableSurge(row.id);
      enqueueSnackbar('Surge paused', { variant: 'success' });
      load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Pause failed', { variant: 'error' });
    }
  };

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
      <TextField
        size="small"
        label="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Title…"
        sx={{ minWidth: 220 }}
      />
      <TextField
        select
        size="small"
        label="Status"
        value={draft.status}
        onChange={(e) => setDraft({ status: e.target.value })}
        sx={{ minWidth: 160 }}
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
        label="Scope"
        value={draft.scope}
        onChange={(e) => setDraft({ scope: e.target.value })}
        sx={{ minWidth: 160 }}
      >
        {SCOPE_FILTER_OPTIONS.map((o) => (
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
    <>
      <SurgesTableSection
        rows={rows}
        handleAddButton={() => router.push('/surges/create')}
        handleViewButton={(row) => row?.id && router.push(`/surges/${row.id}`)}
        handleEditButton={(row) => row?.id && router.push(`/surges/edit/${row.id}`)}
        onApprove={handleApprove}
        onReject={(row) => setRejectId(row.id)}
        onEnable={handleEnable}
        onDisable={handleDisable}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || 20}
        totalPageCount={totalPages}
        totalCount={totalCount}
        onPaginationChange={handlePaginationChange}
        topActionsLeft={topActionsLeft}
      />

      <Dialog open={Boolean(rejectId)} onClose={() => setRejectId(null)} fullWidth maxWidth="sm">
        <DialogTitle>Reject surge</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectId(null)}>Cancel</Button>
          <Button
            color="warning"
            variant="contained"
            onClick={async () => {
              try {
                await rejectSurge(rejectId, { reason: rejectReason });
                setRejectId(null);
                setRejectReason('');
                enqueueSnackbar('Surge rejected', { variant: 'success' });
                load();
              } catch (e) {
                enqueueSnackbar(e?.response?.data?.message || 'Reject failed', { variant: 'error' });
              }
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
