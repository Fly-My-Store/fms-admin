'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import DeliveriesList from 'sections/deliveries/DeliveriesList';
import useUrlFilters from 'hooks/useUrlFilters';

const DELIVERY_STATUSES = ['', 'PENDING', 'ASSIGNED', 'STARTED', 'REACHED_STORE', 'PICKED_UP', 'DELIVERED', 'CANCELLED', 'FAILED'];

const FILTER_DEFAULTS = {
  q: '',
  status: '',
  rider_id: '',
  order_id: '',
  page: 1,
  limit: 20
};

export default function DeliveriesView() {
  const { draft, setDraft, applied, applySearch, handlePaginationChange } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');

  useEffect(() => {
    setSearchQuery(applied.q || '');
  }, [applied.q]);

  const appliedFilters = useMemo(
    () => ({
      q: applied.q || '',
      status: applied.status || '',
      rider_id: applied.rider_id || '',
      order_id: applied.order_id || ''
    }),
    [applied.q, applied.status, applied.rider_id, applied.order_id]
  );

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      status: draft.status,
      rider_id: (draft.rider_id || '').trim(),
      order_id: (draft.order_id || '').trim()
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
        placeholder="Order, rider, store…"
        sx={{ minWidth: 200 }}
      />
      <TextField
        select
        size="small"
        label="Status"
        value={draft.status}
        onChange={(e) => setDraft({ status: e.target.value })}
        sx={{ minWidth: 160 }}
      >
        {DELIVERY_STATUSES.map((s) => (
          <MenuItem key={s || 'all'} value={s}>
            {s || 'All'}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        label="Rider ID"
        value={draft.rider_id}
        onChange={(e) => setDraft({ rider_id: e.target.value })}
        sx={{ minWidth: 280 }}
      />
      <TextField
        size="small"
        label="Order ID"
        value={draft.order_id}
        onChange={(e) => setDraft({ order_id: e.target.value })}
        sx={{ minWidth: 280 }}
      />
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <DeliveriesList
      filters={appliedFilters}
      variant="page"
      pageIndex={(Number(applied.page) || 1) - 1}
      pageSize={Number(applied.limit) || 20}
      onPaginationChange={handlePaginationChange}
      showPagination
      topActionsLeft={topActionsLeft}
    />
  );
}
