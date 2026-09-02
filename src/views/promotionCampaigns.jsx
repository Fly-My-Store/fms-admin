'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import PromotionCampaignsTableSection from 'sections/promotionCampaigns/PromotionCampaignsTableSection';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import useUrlFilters from 'hooks/useUrlFilters';
import { PROMOTION_CAMPAIGN_STATUS_OPTIONS } from 'utils/promotionCampaignLabels';

const FILTER_DEFAULTS = {
  q: '',
  status: '',
  page: 1,
  limit: 20
};

const STATUS_FILTER_OPTIONS = [{ value: '', label: 'All' }, ...PROMOTION_CAMPAIGN_STATUS_OPTIONS];

export default function PromotionCampaignsView() {
  const router = useRouter();
  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [searchQuery, setSearchQuery] = useState(draft.q || '');

  const listParams = useMemo(
    () => ({
      ...(applied.q ? { q: applied.q } : {}),
      ...(applied.status ? { status: applied.status } : {})
    }),
    [applied.q, applied.status]
  );

  const { rows, totalPages, totalCount, load, setPageIndex, setPageSize } = useAxiosPaginatedList(
    'admin/promotion-campaigns',
    { params: listParams, errorMessage: 'Failed to load campaigns' }
  );

  useEffect(() => {
    setSearchQuery(applied.q || '');
    setPageIndex((Number(applied.page) || 1) - 1);
    setPageSize(Number(applied.limit) || 20);
  }, [urlKey, applied.q, applied.page, applied.limit, setPageIndex, setPageSize]);

  const handleSearch = () => {
    applySearch({
      q: searchQuery.trim(),
      status: draft.status
    });
  };

  const topActionsLeft = () => (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
      <TextField
        size="small"
        label="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        sx={{ minWidth: 200 }}
      />
      <TextField
        select
        size="small"
        label="Status"
        value={draft.status || ''}
        onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
        sx={{ minWidth: 140 }}
      >
        {STATUS_FILTER_OPTIONS.map((o) => (
          <MenuItem key={o.value || 'all'} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="contained" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  return (
    <PromotionCampaignsTableSection
      rows={rows}
      handleAddButton={() => router.push('/promotion-campaigns/create')}
      handleViewButton={(row) => row?.id && router.push(`/promotion-campaigns/${row.id}`)}
      handleEditButton={(row) => row?.id && router.push(`/promotion-campaigns/edit/${row.id}`)}
      pageIndex={(Number(applied.page) || 1) - 1}
      pageSize={Number(applied.limit) || 20}
      totalPageCount={totalPages}
      totalCount={totalCount}
      onPaginationChange={(next) => {
        handlePaginationChange(next);
        setPageIndex(next.pageIndex);
        setPageSize(next.pageSize);
        load({ pageIndex: next.pageIndex, pageSize: next.pageSize });
      }}
      topActionsLeft={topActionsLeft}
    />
  );
}
