'use client';

import { useCallback, useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import DeliveryJobsTableSection from 'sections/delivery-jobs/DeliveryJobsTableSection';
import DeliveryJobsFormDialog from 'sections/delivery-jobs/DeliveryJobsFormDialog';
import axiosServices from 'utils/axios';

const DELIVERY_STATUSES = ['', 'PENDING', 'ASSIGNED', 'REACHED_STORE', 'PICKED_UP', 'DELIVERED', 'CANCELLED', 'FAILED'];

export default function DeliveryJobsView() {
  const [rows, setRows] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ q: '', status: '', rider_id: '', order_id: '' });

  const handleDialogToggle = () => {
    setOpen((p) => !p);
    if (open) setSelected(null);
  };

  const handleEditButton = (row) => {
    setSelected(row);
    setOpen(true);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
    setPageIndex(next.pageIndex);
    setPageSize(next.pageSize);
  };

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
          ...(filters.rider_id ? { rider_id: filters.rider_id } : {}),
          ...(filters.order_id ? { order_id: filters.order_id } : {}),
        };
        const resp = await axiosServices.get('admin/logistics/deliveries', { params });
        const payload = resp?.data || {};
        const data = payload.data || [];
        setRows(
          data.map((row) => ({
            ...row,
            order_label: row.order?.id || row.order_id,
            store_name: row.store?.name || '—',
            rider_name: row.rider?.name || '—',
          }))
        );
        setTotalPages(payload?.meta?.totalPages || 1);
        if (opts.page != null) setPageIndex(opts.page - 1);
      } catch (e) {
        enqueueSnackbar('Failed to load delivery jobs', { variant: 'error' });
      }
    },
    [filters, pageIndex, pageSize]
  );

  useEffect(() => {
    load();
  }, [pageIndex, pageSize]);

  useEffect(() => {
    load({ page: 1 });
  }, [filters.status, filters.rider_id, filters.order_id]);

  const handleSearch = () => load({ page: 1 });

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={filters.q}
          onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Order, rider, store…"
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          sx={{ minWidth: 160 }}
        >
          {DELIVERY_STATUSES.map((s) => (
            <MenuItem key={s || 'all'} value={s}>
              {s || 'All'}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Rider ID"
          value={filters.rider_id}
          onChange={(e) => setFilters((p) => ({ ...p, rider_id: e.target.value }))}
          sx={{ minWidth: 280 }}
        />
        <TextField
          size="small"
          label="Order ID"
          value={filters.order_id}
          onChange={(e) => setFilters((p) => ({ ...p, order_id: e.target.value }))}
          sx={{ minWidth: 280 }}
        />
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <DeliveryJobsTableSection
        rows={rows}
        handleEditButton={handleEditButton}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <DeliveryJobsFormDialog open={open} onClose={handleDialogToggle} initialData={selected} onSaved={load} />
    </>
  );
}
