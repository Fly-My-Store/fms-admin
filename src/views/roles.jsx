'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { actions as iam } from 'store/iam/slice';
import RolesTableSection from 'sections/roles/RolesTableSection';
import RolesFormDialog from 'sections/roles/RolesFormDialog';
import useUrlFilters from 'hooks/useUrlFilters';

const DOMAIN_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SELLER', label: 'Seller' }
];

const FILTER_DEFAULTS = {
  q: '',
  domain: 'ADMIN',
  page: 1,
  limit: 20
};

export function RolesView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.iam || {});
  const list = state.roles || {
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
    ...(f.domain ? { domain: f.domain } : {})
  });

  useEffect(() => {
    dispatch(iam.rolesListRequest({ params: buildParams(applied) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, urlKey, applied.page, applied.limit, applied.q, applied.domain]);

  useEffect(() => {
    setSearchQuery(applied.q || '');
  }, [applied.q]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      domain: draft.domain
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
        placeholder="Name or code…"
        sx={{ minWidth: 220 }}
      />
      <TextField
        select
        size="small"
        label="Domain"
        value={draft.domain}
        onChange={(e) => setDraft({ domain: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        {DOMAIN_OPTIONS.map((o) => (
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
      <RolesTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || 20}
        totalPageCount={totalPages}
        totalCount={total}
        onPaginationChange={handlePaginationChange}
        topActionsLeft={topActionsLeft}
        showPagination
      />
      <RolesFormDialog
        open={open}
        onClose={handleDialogToggle}
        initialData={selected}
        onSaved={() => dispatch(iam.rolesListRequest({ params: buildParams(applied) }))}
      />
    </>
  );
}

export default RolesView;
