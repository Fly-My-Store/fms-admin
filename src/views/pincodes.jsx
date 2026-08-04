'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as geo } from 'store/geo/slice';
import PincodesTableSection from 'sections/pincodes/PincodesTableSection';
import PincodesFormDialog from 'sections/pincodes/PincodesFormDialog';
import useUrlFilters from 'hooks/useUrlFilters';

const FILTER_DEFAULTS = {
  q: '',
  is_serviceable: '',
  page: 1,
  limit: 20
};

export function PincodesView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.geo || {});
  const list = state.pincodes || {
    rows: [],
    meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
    loading: false,
    error: null
  };
  const {
    rows: data = [],
    meta: { total = 0, totalPages = 1 } = {},
    error
  } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');

  const buildParams = (f = applied) => ({
    page: Number(f.page) || 1,
    limit: Number(f.limit) || 20,
    ...(f.q ? { q: f.q } : {}),
    ...(f.is_serviceable !== '' ? { is_serviceable: f.is_serviceable } : {})
  });

  useEffect(() => {
    dispatch(geo.pincodesListRequest({ params: buildParams(applied) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, urlKey, applied.page, applied.limit, applied.q, applied.is_serviceable]);

  useEffect(() => {
    setSearchQuery(applied.q || '');
  }, [applied.q]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      is_serviceable: draft.is_serviceable
    });
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

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
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
        value={draft.is_serviceable}
        onChange={(e) => setDraft({ is_serviceable: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="true">Yes</MenuItem>
        <MenuItem value="false">No</MenuItem>
      </TextField>
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <>
      <PincodesTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || 20}
        totalPageCount={totalPages}
        totalCount={total}
        onPaginationChange={handlePaginationChange}
        topActionsLeft={topActionsLeft}
      />
      <PincodesFormDialog open={open} onClose={handleDialogToggle} initialData={selected} />
    </>
  );
}

export default PincodesView;
