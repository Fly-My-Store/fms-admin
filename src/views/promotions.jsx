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
import PromotionsTableSection from 'sections/promotions/PromotionsTableSection';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import useUrlFilters from 'hooks/useUrlFilters';
import { approvePromotion, rejectPromotion } from 'api/promotions';
import { PROMOTION_FUNDING_LABELS, PROMOTION_STATUS_OPTIONS } from 'utils/promotionLabels';

const FILTER_DEFAULTS = {
  q: '',
  status: '',
  funding: '',
  page: 1,
  limit: 20
};

const STATUS_FILTER_OPTIONS = [{ value: '', label: 'All' }, ...PROMOTION_STATUS_OPTIONS];

const FUNDING_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  ...Object.entries(PROMOTION_FUNDING_LABELS).map(([value, label]) => ({ value, label }))
];

export default function PromotionsView() {
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
      ...(applied.funding ? { funding: applied.funding } : {})
    }),
    [applied.q, applied.status, applied.funding]
  );

  const { rows, totalPages, totalCount, load, setPageIndex, setPageSize } = useAxiosPaginatedList(
    'admin/promotions',
    { params: listParams, errorMessage: 'Failed to load promotions' }
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
      funding: draft.funding
    });
  };

  const handleApprove = async (row) => {
    try {
      await approvePromotion(row.id);
      enqueueSnackbar('Promotion approved', { variant: 'success' });
      load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Approve failed', { variant: 'error' });
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
        placeholder="Code or title…"
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
        label="Funding"
        value={draft.funding}
        onChange={(e) => setDraft({ funding: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        {FUNDING_FILTER_OPTIONS.map((o) => (
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
      <PromotionsTableSection
        rows={rows}
        handleAddButton={() => router.push('/promotions/create')}
        handleViewButton={(row) => row?.id && router.push(`/promotions/${row.id}`)}
        handleEditButton={(row) => row?.id && router.push(`/promotions/edit/${row.id}`)}
        onApprove={handleApprove}
        onReject={(row) => setRejectId(row.id)}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || 20}
        totalPageCount={totalPages}
        totalCount={totalCount}
        onPaginationChange={handlePaginationChange}
        topActionsLeft={topActionsLeft}
      />

      <Dialog open={Boolean(rejectId)} onClose={() => setRejectId(null)} fullWidth maxWidth="sm">
        <DialogTitle>Reject promotion</DialogTitle>
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
                await rejectPromotion(rejectId, { reason: rejectReason });
                setRejectId(null);
                setRejectReason('');
                enqueueSnackbar('Promotion rejected', { variant: 'success' });
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
