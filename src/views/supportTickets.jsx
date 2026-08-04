'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import SupportTicketsTableSection from 'sections/support-tickets/SupportTicketsTableSection';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import useUrlFilters from 'hooks/useUrlFilters';

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const REQUESTER_TYPES = ['', 'CUSTOMER', 'SELLER', 'RIDER'];

const FILTER_DEFAULTS = {
  q: '',
  status: '',
  requester_type: '',
  order_id: '',
  page: 1,
  limit: 20
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

export default function SupportTicketsView() {
  const router = useRouter();
  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');

  const listParams = useMemo(
    () => ({
      ...(applied.q ? { q: applied.q } : {}),
      ...(applied.status ? { status: applied.status } : {}),
      ...(applied.requester_type ? { requester_type: applied.requester_type } : {}),
      ...(applied.order_id ? { order_id: applied.order_id } : {})
    }),
    [applied.q, applied.status, applied.requester_type, applied.order_id]
  );

  const { rows: rawRows, totalPages, totalCount, setPageIndex, setPageSize } = useAxiosPaginatedList(
    'admin/support/tickets',
    { params: listParams, errorMessage: 'Failed to load support tickets' }
  );

  const rows = useMemo(
    () =>
      (rawRows || []).map((row) => ({
        ...row,
        requester_label: row.requester?.name || row.requester?.phone || row.requester?.email || '—',
        category_label: row.category_label || row.category,
        created_at: formatDate(row.created_at)
      })),
    [rawRows]
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
      requester_type: draft.requester_type,
      order_id: (draft.order_id || '').trim()
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
        placeholder="Subject or description"
        sx={{ minWidth: 200 }}
      />
      <TextField
        select
        size="small"
        label="Status"
        value={draft.status}
        onChange={(e) => setDraft({ status: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        {STATUSES.map((s) => (
          <MenuItem key={s || 'all'} value={s}>
            {s || 'All'}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Role"
        value={draft.requester_type}
        onChange={(e) => setDraft({ requester_type: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        {REQUESTER_TYPES.map((s) => (
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
        sx={{ minWidth: 220 }}
      />
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Tickets from customer, seller, and rider apps. Filter by role or open a ticket for full context.
      </Typography>
      <SupportTicketsTableSection
        rows={rows}
        handleViewButton={(row) => row?.id && router.push(`/support-tickets/${row.id}`)}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || 20}
        totalPageCount={totalPages}
        totalCount={totalCount}
        onPaginationChange={handlePaginationChange}
        topActionsLeft={topActionsLeft}
      />
    </Stack>
  );
}
