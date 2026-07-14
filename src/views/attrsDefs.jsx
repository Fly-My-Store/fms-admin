'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, Stack, TextField } from '@mui/material';
import { actions as attributes } from 'store/attributes/slice';
import DefsTableSection from 'sections/defs/DefsTableSection';
import DefsFormDialog from 'sections/defs/DefsFormDialog';

export function DefsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.attributes || {});
  const list = state.defs || { rows: [], count: 0, page: 1, pageSize: 10, totalPages: 1, loading: false, error: null };
  const { rows: data = [], count = 0, page = 1, pageSize = 10, totalPages = 1, error } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ q: '' });

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => ({
    page: pageNum,
    limit,
    ...(f.q ? { q: f.q } : {})
  });

  const reload = (pageNum = page, limit = pageSize, f = filters) => {
    dispatch(attributes.defsListRequest({ params: buildParams(pageNum, limit, f) }));
  };

  useEffect(() => {
    reload(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    const next = { q: searchQuery.trim() };
    setFilters(next);
    reload(1, pageSize, next);
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
    reload(next.pageIndex + 1, next.pageSize);
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
          placeholder="Code or name…"
          sx={{ minWidth: 220 }}
        />
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <DefsTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        totalCount={count}
      />
      <DefsFormDialog open={open} onClose={handleDialogToggle} initialData={selected} onSaved={() => reload()} />
    </>
  );
}

export default DefsView;
