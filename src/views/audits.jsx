'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { Button, Stack, TextField } from '@mui/material';
import { actions as audit } from 'store/audit/slice';
import AuditsTableSection from 'sections/audits/AuditsTableSection';

export default function AuditsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.audit || {});
  const list = state.audits || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [filters, setFilters] = useState({
    entity_type: '',
    entity_id: '',
    actor_user_id: ''
  });
  const [applied, setApplied] = useState({
    entity_type: '',
    entity_id: '',
    actor_user_id: ''
  });

  const buildParams = (pageNum = page, limit = pageSize, f = applied) => ({
    page: pageNum,
    limit,
    ...(f.entity_type ? { entity_type: f.entity_type } : {}),
    ...(f.entity_id ? { entity_id: f.entity_id } : {}),
    ...(f.actor_user_id ? { actor_user_id: f.actor_user_id } : {})
  });

  useEffect(() => {
    dispatch(audit.auditsListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, applied.entity_type, applied.entity_id, applied.actor_user_id]);

  const handleSearch = () => {
    const next = {
      entity_type: filters.entity_type.trim(),
      entity_id: filters.entity_id.trim(),
      actor_user_id: filters.actor_user_id.trim()
    };
    setApplied(next);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(audit.auditsListRequest({ params: buildParams(next.pageIndex + 1, next.pageSize) }));
  };

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap">
        <TextField
          size="small"
          label="Entity type"
          value={filters.entity_type}
          onChange={(e) => setFilters((p) => ({ ...p, entity_type: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="e.g. order, store"
          sx={{ minWidth: 160 }}
        />
        <TextField
          size="small"
          label="Entity ID"
          value={filters.entity_id}
          onChange={(e) => setFilters((p) => ({ ...p, entity_id: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ minWidth: 280 }}
        />
        <TextField
          size="small"
          label="Actor user ID"
          value={filters.actor_user_id}
          onChange={(e) => setFilters((p) => ({ ...p, actor_user_id: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ minWidth: 280 }}
        />
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <AuditsTableSection
        rows={data}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
}
