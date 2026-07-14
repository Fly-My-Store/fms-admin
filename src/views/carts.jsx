'use client';

import { useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import CartsTableSection from 'sections/carts/CartsTableSection';
import CartsFormDialog from 'sections/carts/CartsFormDialog';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import { CART_STATUS } from 'utils/constants';

const STATUS_OPTIONS = ['', ...Object.values(CART_STATUS)];

export default function CartsView() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', store_id: '' });

  const listParams = {
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.store_id ? { store_id: filters.store_id } : {})
  };

  const { rows, pageIndex, pageSize, totalPages, load, handlePaginationChange } = useAxiosPaginatedList(
    'admin/orders-payments/carts',
    { params: listParams }
  );

  const handleSearch = () => setFilters((p) => ({ ...p, q: searchQuery.trim() }));

  const handleDialogToggle = () => {
    setOpen((p) => !p);
    if (open) setSelected(null);
  };
  const handleAddButton = () => {
    setSelected(null);
    setOpen(true);
  };
  const handleEditButton = (row) => {
    setSelected(row);
    setOpen(true);
  };

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Customer, store…"
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
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s || 'all'} value={s}>
              {s || 'All'}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Store ID"
          value={filters.store_id}
          onChange={(e) => setFilters((p) => ({ ...p, store_id: e.target.value.trim() }))}
          sx={{ minWidth: 280 }}
        />
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <CartsTableSection
        rows={rows}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <CartsFormDialog open={open} onClose={handleDialogToggle} initialData={selected} onSaved={load} />
    </>
  );
}
