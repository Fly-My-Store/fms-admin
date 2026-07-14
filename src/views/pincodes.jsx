'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as geo } from 'store/geo/slice';
import PincodesTableSection from 'sections/pincodes/PincodesTableSection';
import PincodesFormDialog from 'sections/pincodes/PincodesFormDialog';

export function PincodesView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.geo || {});
  const list = state.pincodes || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ q: '', is_serviceable: '' });

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => ({
    page: pageNum,
    limit,
    ...(f.q ? { q: f.q } : {}),
    ...(f.is_serviceable !== '' ? { is_serviceable: f.is_serviceable } : {})
  });

  useEffect(() => {
    dispatch(geo.pincodesListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.is_serviceable]);

  const handleSearch = () => {
    const next = { ...filters, q: searchQuery.trim() };
    setFilters(next);
    dispatch(geo.pincodesListRequest({ params: buildParams(1, pageSize, next) }));
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
    dispatch(geo.pincodesListRequest({ params: buildParams(next.pageIndex + 1, next.pageSize) }));
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
          placeholder="Pincode, city, state…"
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="Serviceable"
          value={filters.is_serviceable}
          onChange={(e) => setFilters((p) => ({ ...p, is_serviceable: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </TextField>
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <PincodesTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <PincodesFormDialog open={open} onClose={handleDialogToggle} initialData={selected} />
    </>
  );
}

export default PincodesView;
