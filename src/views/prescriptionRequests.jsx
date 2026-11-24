'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import PrescriptionRequestsTableSection from 'sections/prescription-requests/PrescriptionRequestsTableSection';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import useUrlFilters from 'hooks/useUrlFilters';

const STATUS_OPTIONS = ['', 'OPEN', 'ACCEPTED', 'CANCELLED', 'EXPIRED'];

const FILTER_DEFAULTS = {
  q: '',
  status: '',
  store_id: '',
  page: 1,
  limit: 20
};

export default function PrescriptionRequestsView() {
  const router = useRouter();
  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');

  const listParams = useMemo(
    () => ({
      ...(applied.q ? { q: applied.q } : {}),
      ...(applied.status ? { status: applied.status } : {}),
      ...(applied.store_id ? { store_id: applied.store_id } : {})
    }),
    [applied.q, applied.status, applied.store_id]
  );

  const { rows, totalPages, totalCount, setPageIndex, setPageSize } = useAxiosPaginatedList(
    'admin/orders-payments/prescription-requests',
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
      store_id: (draft.store_id || '').trim()
    });
  };

  return (
    <PrescriptionRequestsTableSection
      rows={rows}
      pageIndex={(Number(applied.page) || 1) - 1}
      pageSize={Number(applied.limit) || 20}
      totalPageCount={totalPages}
      totalCount={totalCount}
      onPaginationChange={handlePaginationChange}
      onView={(row) => row?.id && router.push(`/prescription-requests/${row.id}`)}
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
