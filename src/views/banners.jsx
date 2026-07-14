'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as content } from 'store/content/slice';
import BannersTableSection from 'sections/banners/BannersTableSection';
import BannersFormDialog from 'sections/banners/BannersFormDialog';
import { RECORD_STATUS } from 'utils/constants';

const RECORD_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: String(RECORD_STATUS.ACTIVE), label: 'Active' },
  { value: String(RECORD_STATUS.INACTIVE), label: 'Inactive' },
  { value: String(RECORD_STATUS.ARCHIVED), label: 'Archived' }
];

export function BannersView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.content || {});
  const list = state.banners || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ q: '', record_status: '' });

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => ({
    page: pageNum,
    limit,
    ...(f.q ? { q: f.q } : {}),
    ...(f.record_status ? { record_status: f.record_status } : {})
  });

  useEffect(() => {
    dispatch(content.bannersListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.record_status]);

  const handleSearch = () => {
    const next = { ...filters, q: searchQuery.trim() };
    setFilters(next);
    dispatch(content.bannersListRequest({ params: buildParams(1, pageSize, next) }));
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
    dispatch(content.bannersListRequest({ params: buildParams(next.pageIndex + 1, next.pageSize) }));
  };

  const handleSaved = () => {
    dispatch(content.bannersListRequest({ params: buildParams(page, pageSize) }));
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
          placeholder="Title…"
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={filters.record_status}
          onChange={(e) => setFilters((p) => ({ ...p, record_status: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          {RECORD_STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value || 'all'} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <BannersTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <BannersFormDialog open={open} onClose={handleDialogToggle} initialData={selected} onSaved={handleSaved} />
    </>
  );
}

export default BannersView;
