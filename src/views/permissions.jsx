'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, Stack, TextField } from '@mui/material';
import { actions as iam } from 'store/iam/slice';
import PermissionsTableSection from 'sections/permissions/PermissionsTableSection';
import PermissionsFormDialog from 'sections/permissions/PermissionsFormDialog';

export function PermissionsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.iam || {});
  const list = state.permissions || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ q: '' });

  const buildParams = (pageNum = page, limit = pageSize, f = filters) => ({
    page: pageNum,
    limit,
    ...(f.q ? { q: f.q } : {})
  });

  useEffect(() => {
    dispatch(iam.permissionsListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleSearch = () => {
    const next = { q: searchQuery.trim() };
    setFilters(next);
    dispatch(iam.permissionsListRequest({ params: buildParams(1, pageSize, next) }));
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
    dispatch(iam.permissionsListRequest({ params: buildParams(next.pageIndex + 1, next.pageSize) }));
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
          placeholder="Name, code…"
          sx={{ minWidth: 220 }}
        />
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <PermissionsTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <PermissionsFormDialog open={open} onClose={handleDialogToggle} initialData={selected} />
    </>
  );
}

export default PermissionsView;
