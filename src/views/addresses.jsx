'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, Stack, TextField } from '@mui/material';
import { actions as geo } from 'store/geo/slice';
import AddressesTableSection from 'sections/addresses/AddressesTableSection';
import AddressesFormDialog from 'sections/addresses/AddressesFormDialog';
import useUrlFilters from 'hooks/useUrlFilters';

const FILTER_DEFAULTS = {
  q: '',
  user_id: '',
  page: 1,
  limit: 20
};

export function AddressesView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.geo || {});
  const list = state.addresses || {
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

  useEffect(() => {
    setSearchQuery(applied.q || '');
  }, [applied.q]);

  useEffect(() => {
    dispatch(
      geo.addressesListRequest({
        params: {
          page: Number(applied.page) || 1,
          limit: Number(applied.limit) || 20,
          ...(applied.q ? { q: applied.q } : {}),
          ...(applied.user_id ? { user_id: applied.user_id } : {})
        }
      })
    );
  }, [dispatch, urlKey, applied]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      user_id: (draft.user_id || '').trim()
    });
  };

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
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
        value={draft.user_id}
        onChange={(e) => setDraft({ user_id: e.target.value })}
        sx={{ minWidth: 280 }}
      />
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <>
      <AddressesTableSection
        rows={data}
        handleAddButton={() => {
          setSelected(null);
          setOpen(true);
        }}
        handleEditButton={(row) => {
          setSelected(row);
          setOpen(true);
        }}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || 20}
        totalPageCount={totalPages}
        totalCount={total}
        onPaginationChange={handlePaginationChange}
        topActionsLeft={topActionsLeft}
      />
      <AddressesFormDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
        initialData={selected}
      />
    </>
  );
}

export default AddressesView;
