'use client';

import { useMemo } from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';
import {
  SURGE_BENEFICIARY_LABELS,
  SURGE_SCOPE_LABELS,
  formatSurgeAmount,
  getSurgeStatusChipColor,
  getSurgeStatusLabel
} from 'utils/surgeLabels';

export default function SurgesTableSection({
  rows,
  handleAddButton,
  handleViewButton,
  handleEditButton,
  onEnable,
  onDisable,
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
        header: 'Title',
        accessorKey: 'title',
        cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ cursor: handleViewButton ? 'pointer' : 'default', color: 'primary.main' }}
            onClick={() => handleViewButton?.(row.original)}
          >
            {row.original.title}
          </Typography>
        )
      },
      {
        header: 'Amount',
        id: 'amount',
        cell: ({ row }) => formatSurgeAmount(row.original)
      },
      {
        header: 'Scope',
        accessorKey: 'scope',
        cell: ({ row }) => SURGE_SCOPE_LABELS[row.original.scope] || row.original.scope
      },
      {
        header: 'Beneficiary',
        accessorKey: 'surge_beneficiary',
        cell: ({ row }) =>
          SURGE_BENEFICIARY_LABELS[row.original.surge_beneficiary] || row.original.surge_beneficiary
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
            label={getSurgeStatusLabel(row.original.status)}
            color={getSurgeStatusChipColor(row.original.status)}
          />
        )
      }
    ],
    [handleViewButton]
  );

  const tableActions = (row) => {
    if (!row) return null;
    if (row.status === 'PENDING_APPROVAL') {
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
    }
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {row.status === 'PAUSED' ? (
          <Button size="small" onClick={() => onEnable?.(row)}>
            Enable
          </Button>
        ) : null}
        {row.status === 'ACTIVE' ? (
          <Button size="small" color="warning" onClick={() => onDisable?.(row)}>
            Pause
          </Button>
        ) : null}
      </Stack>
    );
  };

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Surges"
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
