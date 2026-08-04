'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as content } from 'store/content/slice';
import BannersTableSection from 'sections/banners/BannersTableSection';
import BannersFormDialog from 'sections/banners/BannersFormDialog';
import useUrlFilters from 'hooks/useUrlFilters';
import { RECORD_STATUS } from 'utils/constants';

const RECORD_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: String(RECORD_STATUS.ACTIVE), label: 'Active' },
  { value: String(RECORD_STATUS.INACTIVE), label: 'Inactive' },
  { value: String(RECORD_STATUS.ARCHIVED), label: 'Archived' }
];

const FILTER_DEFAULTS = {
  q: '',
  record_status: '',
  page: 1,
  limit: 20
};

export function BannersView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.content || {});
  const list = state.banners || {
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
    ...(f.record_status ? { record_status: f.record_status } : {})
  });

  useEffect(() => {
    dispatch(content.bannersListRequest({ params: buildParams(applied) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, urlKey, applied.page, applied.limit, applied.q, applied.record_status]);

  useEffect(() => {
    setSearchQuery(applied.q || '');
  }, [applied.q]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      record_status: draft.record_status
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

  const handleSaved = () => {
    dispatch(content.bannersListRequest({ params: buildParams(applied) }));
  };

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
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
        value={draft.record_status}
        onChange={(e) => setDraft({ record_status: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        {RECORD_STATUS_OPTIONS.map((o) => (
          <MenuItem key={o.value || 'all'} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <>
      <BannersTableSection
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
      <BannersFormDialog open={open} onClose={handleDialogToggle} initialData={selected} onSaved={handleSaved} />
    </>
  );
}

export default BannersView;
