'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, Stack, TextField } from '@mui/material';
import { actions as audit } from 'store/audit/slice';
import AuditsTableSection from 'sections/audits/AuditsTableSection';
import useUrlFilters from 'hooks/useUrlFilters';

const FILTER_DEFAULTS = {
  entity_type: '',
  entity_id: '',
  actor_user_id: '',
  page: 1,
  limit: 20
};

export default function AuditsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.audit || {});
  const list = state.audits || {
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

  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });

  const buildParams = (f = applied) => ({
    page: Number(f.page) || 1,
    limit: Number(f.limit) || 20,
    ...(f.entity_type ? { entity_type: f.entity_type } : {}),
    ...(f.entity_id ? { entity_id: f.entity_id } : {}),
    ...(f.actor_user_id ? { actor_user_id: f.actor_user_id } : {})
  });

  useEffect(() => {
    dispatch(audit.auditsListRequest({ params: buildParams(applied) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    urlKey,
    applied.page,
    applied.limit,
    applied.entity_type,
    applied.entity_id,
    applied.actor_user_id
  ]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleSearch = () => {
    applySearch({
      entity_type: (draft.entity_type || '').trim(),
      entity_id: (draft.entity_id || '').trim(),
      actor_user_id: (draft.actor_user_id || '').trim()
    });
  };

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
      <TextField
        size="small"
        label="Entity type"
        value={draft.entity_type}
        onChange={(e) => setDraft({ entity_type: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="e.g. order, store"
        sx={{ minWidth: 160 }}
      />
      <TextField
        size="small"
        label="Entity ID"
        value={draft.entity_id}
        onChange={(e) => setDraft({ entity_id: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        sx={{ minWidth: 280 }}
      />
      <TextField
        size="small"
        label="Actor user ID"
        value={draft.actor_user_id}
        onChange={(e) => setDraft({ actor_user_id: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        sx={{ minWidth: 280 }}
      />
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <AuditsTableSection
      rows={data}
      pageIndex={(Number(applied.page) || 1) - 1}
      pageSize={Number(applied.limit) || 20}
      totalPageCount={totalPages}
      totalCount={total}
      onPaginationChange={handlePaginationChange}
      topActionsLeft={topActionsLeft}
    />
  );
}
