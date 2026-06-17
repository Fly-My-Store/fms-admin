'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const statusColor = (value) => {
  if (value === 'PROCESSED' || value === 'SUCCESS') return 'success';
  if (value === 'FAILED' || value === 'ERROR') return 'error';
  if (value === 'PENDING') return 'warning';
  return 'default';
};

export default function WebhookeventsTableSection({ rows, pageIndex, pageSize, totalPageCount, onPaginationChange }) {
  const columns = useMemo(
    () => [
      { header: 'Provider', accessorKey: 'provider' },
      { header: 'Event', accessorKey: 'event' },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => (
          <Chip size="small" color={statusColor(row.original.status)} label={row.original.status || '—'} variant="light" />
        )
      },
      {
        header: 'Received',
        accessorKey: 'received_at',
        cell: ({ row }) => formatDate(row.original.received_at || row.original.created_at)
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Webhook Events"
      showActions={false}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName="webhookEvent"
    />
  );
}
