'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import BasicReactTable from 'components/tables/basicTable';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';

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

export default function WebhookeventsTableSection({
  rows,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  onView,
  onReplay,
  replayingId
}) {
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
      showActions
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName="webhookEvent"
      tableActions={(row) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="View payload">
            <Button size="small" variant="outlined" startIcon={<EyeOutlined />} onClick={() => onView?.(row)}>
              View
            </Button>
          </Tooltip>
          <Tooltip title={row.provider !== 'razorpay' ? 'Replay only for Razorpay' : 'Replay webhook'}>
            <span>
              <Button
                size="small"
                variant="contained"
                startIcon={<ReloadOutlined />}
                disabled={row.provider !== 'razorpay' || replayingId === row.id}
                onClick={() => onReplay?.(row)}
              >
                Replay
              </Button>
            </span>
          </Tooltip>
        </Stack>
      )}
    />
  );
}
