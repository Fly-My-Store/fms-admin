'use client';

import { useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import DeliveriesList from 'sections/deliveries/DeliveriesList';
import DeliveryJobsFormDialog from 'sections/delivery-jobs/DeliveryJobsFormDialog';

const DELIVERY_STATUSES = ['', 'PENDING', 'ASSIGNED', 'REACHED_STORE', 'PICKED_UP', 'DELIVERED', 'CANCELLED', 'FAILED'];

export default function DeliveriesView() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', rider_id: '', order_id: '' });

  const handleDialogToggle = () => {
    setOpen((p) => !p);
    if (open) setSelected(null);
  };

  const handleEditButton = (row) => {
    setSelected(row);
    setOpen(true);
  };

  const handleSearch = () => setFilters((p) => ({ ...p, q: searchQuery.trim() }));

  const updateFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
  };

  const handleSaved = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Order, rider, store…"
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
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
          onChange={(e) => updateFilter('rider_id', e.target.value)}
          sx={{ minWidth: 280 }}
        />
        <TextField
          size="small"
          label="Order ID"
          value={filters.order_id}
          onChange={(e) => updateFilter('order_id', e.target.value)}
          sx={{ minWidth: 280 }}
        />
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <DeliveriesList filters={filters} variant="page" onEdit={handleEditButton} refreshKey={refreshKey} />
      <DeliveryJobsFormDialog open={open} onClose={handleDialogToggle} initialData={selected} onSaved={handleSaved} />
    </>
  );
}
