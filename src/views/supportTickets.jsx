'use client';

import { useCallback, useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import SupportTicketsTableSection from 'sections/support-tickets/SupportTicketsTableSection';
import { listSupportTickets } from 'api/support';

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const REQUESTER_TYPES = ['', 'CUSTOMER', 'SELLER', 'RIDER'];

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

export default function SupportTicketsView() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ q: '', status: '', requester_type: '', order_id: '' });

  const load = useCallback(
    async (opts = {}) => {
      try {
        const nextPage = opts.page ?? pageIndex + 1;
        const nextLimit = opts.limit ?? pageSize;
        const params = {
          page: nextPage,
          limit: nextLimit,
          ...(filters.q ? { q: filters.q } : {}),
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.requester_type ? { requester_type: filters.requester_type } : {}),
          ...(filters.order_id ? { order_id: filters.order_id } : {})
        };
        const resp = await listSupportTickets(params);
        const payload = resp || {};
        const data = payload.data || [];
        setRows(
          data.map((row) => ({
            ...row,
            requester_label: row.requester?.name || row.requester?.phone || row.requester?.email || '—',
            category_label: row.category_label || row.category,
            created_at: formatDate(row.created_at)
          }))
        );
        setTotalPages(payload?.meta?.totalPages || 1);
        if (opts.page != null) setPageIndex(opts.page - 1);
      } catch {
        enqueueSnackbar('Failed to load support tickets', { variant: 'error' });
      }
    },
    [filters, pageIndex, pageSize]
  );

  useEffect(() => {
    load();
  }, [pageIndex, pageSize]);

  useEffect(() => {
    load({ page: 1 });
  }, [filters.status, filters.requester_type, filters.order_id]);

  const handleSearch = () => load({ page: 1 });

  const handleViewButton = (row) => {
    if (row?.id) router.push(`/support-tickets/${row.id}`);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
    setPageIndex(next.pageIndex);
    setPageSize(next.pageSize);
  };

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tickets from customer, seller, and rider apps. Filter by role or open a ticket for full context.
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Subject or description"
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
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
          value={filters.requester_type}
          onChange={(e) => setFilters((p) => ({ ...p, requester_type: e.target.value }))}
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
          value={filters.order_id}
          onChange={(e) => setFilters((p) => ({ ...p, order_id: e.target.value }))}
          sx={{ minWidth: 220 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Stack>

      <SupportTicketsTableSection
        rows={rows}
        handleViewButton={handleViewButton}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
}
