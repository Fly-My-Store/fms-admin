'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import QuoteRequestsTableSection from 'sections/quote-requests/QuoteRequestsTableSection';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import useUrlFilters from 'hooks/useUrlFilters';

const STATUS_OPTIONS = ['', 'OPEN', 'ACCEPTED', 'CANCELLED', 'EXPIRED'];

const FILTER_DEFAULTS = {
  q: '',
  status: '',
  store_type: '',
  store_id: '',
  page: 1,
  limit: 20
};

export default function QuoteRequestsView() {
  const router = useRouter();
  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');

  const listParams = useMemo(
    () => ({
      ...(applied.q ? { q: applied.q } : {}),
      ...(applied.status ? { status: applied.status } : {}),
      ...(applied.store_type ? { store_type: applied.store_type } : {}),
      ...(applied.store_id ? { store_id: applied.store_id } : {})
    }),
    [applied.q, applied.status, applied.store_type, applied.store_id]
  );

  const { rows, totalPages, totalCount, setPageIndex, setPageSize } = useAxiosPaginatedList(
    'admin/orders-payments/quote-requests',
    { params: listParams }
  );

  useEffect(() => {
    setSearchQuery(applied.q || '');
    setPageIndex((Number(applied.page) || 1) - 1);
    setPageSize(Number(applied.limit) || 20);
  }, [urlKey, applied.q, applied.page, applied.limit, setPageIndex, setPageSize]);

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      status: draft.status,
      store_type: draft.store_type,
      store_id: (draft.store_id || '').trim()
    });
  };

  return (
    <QuoteRequestsTableSection
      rows={rows}
      pageIndex={(Number(applied.page) || 1) - 1}
      pageSize={Number(applied.limit) || 20}
      totalPageCount={totalPages}
      totalCount={totalCount}
      onPaginationChange={handlePaginationChange}
      onView={(row) => row?.id && router.push(`/quote-requests/${row.id}`)}
      topActionsLeft={() => (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
          <TextField
            size="small"
            label="Customer"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Name, phone, email"
            sx={{ minWidth: 200 }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={draft.status}
            onChange={(e) => setDraft({ status: e.target.value })}
            sx={{ minWidth: 140 }}
          >
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status || 'all'} value={status}>
                {status || 'All'}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Type"
            value={draft.store_type}
            onChange={(e) => setDraft({ store_type: e.target.value })}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pharmacy">Pharmacy</MenuItem>
            <MenuItem value="grocery">Grocery</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Store ID"
            value={draft.store_id}
            onChange={(e) => setDraft({ store_id: e.target.value })}
            sx={{ minWidth: 280 }}
          />
          <Button variant="outlined" size="small" onClick={handleSearch}>
            Search
          </Button>
        </Stack>
      )}
    />
  );
}
