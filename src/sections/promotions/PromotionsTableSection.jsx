'use client';

import { useMemo } from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';
import {
  getPromotionFundingLabel,
  getPromotionStatusChipColor,
  getPromotionStatusLabel,
  getPromotionVisibilityLabel
} from 'utils/promotionLabels';

function formatDiscount(row) {
  if (row.discount_type === 'FLAT') return `₹${(Number(row.discount_value) / 100).toFixed(2)}`;
  if (row.discount_type === 'FREE_DELIVERY') return 'Free delivery';
  return `${row.discount_value}%`;
}

export default function PromotionsTableSection({
  rows,
  handleAddButton,
  handleViewButton,
  handleEditButton,
  onApprove,
  onReject,
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
        header: 'Code',
        accessorKey: 'code',
        cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ cursor: handleViewButton ? 'pointer' : 'default', color: 'primary.main' }}
            onClick={() => handleViewButton?.(row.original)}
          >
            {row.original.code}
          </Typography>
        )
      },
      { header: 'Title', accessorKey: 'title' },
      {
        header: 'Discount',
        id: 'discount',
        cell: ({ row }) => formatDiscount(row.original)
      },
      {
        header: 'Funding',
        accessorKey: 'funding',
        cell: ({ row }) => getPromotionFundingLabel(row.original.funding)
      },
      {
        header: 'Visibility',
        accessorKey: 'visibility',
        cell: ({ row }) => getPromotionVisibilityLabel(row.original.visibility)
      },
      {
        header: 'Store',
        id: 'store',
        cell: ({ row }) =>
          row.original.store?.name ||
          (row.original.store_id ? String(row.original.store_id).slice(0, 8) : 'App-wide')
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => (
          <Chip
            size="small"
            label={getPromotionStatusLabel(row.original.status)}
            color={getPromotionStatusChipColor(row.original.status)}
          />
        )
      }
    ],
    [handleViewButton]
  );

  const tableActions = (row) => {
    if (row?.status !== 'PENDING_APPROVAL') return null;
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Button size="small" onClick={() => onApprove?.(row)}>
          Approve
        </Button>
        <Button size="small" color="warning" onClick={() => onReject?.(row)}>
          Reject
        </Button>
      </Stack>
    );
  };

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Promotions"
      ariaLebel="Create"
      handleAddButton={handleAddButton}
      handleViewButton={handleViewButton}
      handleEditButton={handleEditButton}
      tableActions={tableActions}
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
