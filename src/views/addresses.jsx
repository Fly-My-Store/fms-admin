'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as geo } from 'store/geo/slice';
import AddressesTableSection from 'sections/addresses/AddressesTableSection';
import AddressesFormDialog from 'sections/addresses/AddressesFormDialog';

export function AddressesView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.geo || {});
  const list = state.addresses || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ q: '', user_id: '' });

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => ({
    page: pageNum,
    limit,
    ...(f.q ? { q: f.q } : {}),
    ...(f.user_id ? { user_id: f.user_id } : {})
  });

  useEffect(() => {
    dispatch(geo.addressesListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleSearch = () => {
    const next = { ...filters, q: searchQuery.trim(), user_id: filters.user_id.trim() };
    setFilters(next);
    dispatch(geo.addressesListRequest({ params: buildParams(1, pageSize, next) }));
  };

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
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

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(geo.addressesListRequest({ params: buildParams(next.pageIndex + 1, next.pageSize) }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="City, pincode, phone…"
          sx={{ minWidth: 220 }}
        />
        <TextField
          size="small"
          label="User ID"
          value={filters.user_id}
          onChange={(e) => setFilters((p) => ({ ...p, user_id: e.target.value }))}
          sx={{ minWidth: 280 }}
        />
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <AddressesTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <AddressesFormDialog open={open} onClose={handleDialogToggle} initialData={selected} />
    </>
  );
}

export default AddressesView;
