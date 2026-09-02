'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';
import {
  formatINRFromCents,
  getPromotionCampaignStatusChipColor,
  getPromotionCampaignStatusLabel,
  getPromotionCampaignTypeLabel
} from 'utils/promotionCampaignLabels';

function BudgetCell({ row }) {
  const stats = row.stats || {};
  const budget = stats.budget_cents;
  const spent = stats.spent_cents ?? 0;
  if (budget == null) {
    return <Typography variant="body2">{formatINRFromCents(spent)} spent</Typography>;
  }
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  return (
    <Stack spacing={0.5} sx={{ minWidth: 120 }}>
      <Typography variant="body2">
        {formatINRFromCents(spent)} / {formatINRFromCents(budget)}
      </Typography>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 1 }} />
    </Stack>
  );
}

export default function PromotionCampaignsTableSection({
  rows,
  handleAddButton,
  handleViewButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  totalCount,
  onPaginationChange,
  topActionsLeft,
  showPagination = true
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ cursor: handleViewButton ? 'pointer' : 'default', color: 'primary.main' }}
            onClick={() => handleViewButton?.(row.original)}
          >
            {row.original.name}
          </Typography>
        )
      },
      {
        header: 'Slug',
        accessorKey: 'slug',
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>
            {row.original.slug}
          </Typography>
        )
      },
      {
        header: 'Type',
        accessorKey: 'type',
        cell: ({ row }) => getPromotionCampaignTypeLabel(row.original.type)
      },
      {
        header: 'Codes',
        id: 'codes',
        cell: ({ row }) => row.original.stats?.promotion_count ?? 0
      },
      {
        header: 'Redemptions',
        id: 'redemptions',
        cell: ({ row }) => row.original.stats?.total_redemptions ?? 0
      },
      {
        header: 'Budget',
        id: 'budget',
        cell: ({ row }) => <BudgetCell row={row.original} />
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => (
          <Chip
            size="small"
            label={getPromotionCampaignStatusLabel(row.original.status)}
            color={getPromotionCampaignStatusChipColor(row.original.status)}
          />
        )
      }
    ],
    [handleViewButton]
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Campaigns"
      ariaLebel="Create"
      handleAddButton={handleAddButton}
      handleViewButton={handleViewButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      totalCount={totalCount}
      onPaginationChange={onPaginationChange}
      topActionsLeft={topActionsLeft}
      showPagination={showPagination}
    />
  );
}
