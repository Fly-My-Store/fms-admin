'use client';

import { useCallback, useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { listShareLinks } from 'api/content';
import ShareLinksTableSection from 'sections/share-links/ShareLinksTableSection';
import ShareLinksFormDialog from 'sections/share-links/ShareLinksFormDialog';
import useUrlFilters from 'hooks/useUrlFilters';
import { RECORD_STATUS } from 'utils/constants';

const RECORD_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: String(RECORD_STATUS.ACTIVE), label: 'Active' },
  { value: String(RECORD_STATUS.INACTIVE), label: 'Disabled' }
];

const SOURCE_OPTIONS = [
  { value: '', label: 'All sources' },
  { value: 'customer', label: 'Customer' },
  { value: 'admin', label: 'Admin' }
];

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'variant', label: 'Variant' },
  { value: 'product', label: 'Product' },
  { value: 'store', label: 'Store' },
  { value: 'category', label: 'Category' },
  { value: 'search', label: 'Search' },
  { value: 'cart', label: 'Cart' },
  { value: 'screen_guard', label: 'Screen Guard' },
  { value: 'home', label: 'Home' }
];

const FILTER_DEFAULTS = {
  q: '',
  source: '',
  type: '',
  record_status: '',
  page: 1,
  limit: 20
};

export function ShareLinksView() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');

  const load = useCallback(async () => {
    try {
      const res = await listShareLinks({
        page: Number(applied.page) || 1,
        limit: Number(applied.limit) || 20,
        ...(applied.q ? { q: applied.q } : {}),
        ...(applied.source ? { source: applied.source } : {}),
        ...(applied.type ? { type: applied.type } : {}),
        ...(applied.record_status ? { record_status: applied.record_status } : {})
      });
      setRows(res?.data || []);
      setTotal(res?.meta?.total || 0);
      setTotalPages(res?.meta?.totalPages || 1);
    } catch (e) {
      enqueueSnackbar(e?.message || 'Could not load share links', { variant: 'error' });
    }
  }, [applied]);

  useEffect(() => {
    load();
  }, [load, urlKey]);

  useEffect(() => {
    setSearchQuery(applied.q || '');
  }, [applied.q]);

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
      <TextField
        size="small"
        label="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) =>
          e.key === 'Enter' &&
          applySearch({
            q: searchQuery.trim(),
            source: draft.source,
            type: draft.type,
            record_status: draft.record_status
          })
        }
        placeholder="Code or label…"
        sx={{ minWidth: 200 }}
      />
      <TextField select size="small" label="Source" value={draft.source} onChange={(e) => setDraft({ source: e.target.value })} sx={{ minWidth: 140 }}>
        {SOURCE_OPTIONS.map((o) => (
          <MenuItem key={o.value || 'all'} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField select size="small" label="Type" value={draft.type} onChange={(e) => setDraft({ type: e.target.value })} sx={{ minWidth: 140 }}>
        {TYPE_OPTIONS.map((o) => (
          <MenuItem key={o.value || 'all'} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
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
      <Button
        variant="outlined"
        size="small"
        onClick={() =>
          applySearch({
            q: searchQuery.trim(),
            source: draft.source,
            type: draft.type,
            record_status: draft.record_status
          })
        }
      >
        Search
      </Button>
    </Stack>
  );

  return (
    <>
      <ShareLinksTableSection
        rows={rows}
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
      <ShareLinksFormDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
        initialData={selected}
        onSaved={load}
      />
    </>
  );
}

export default ShareLinksView;
