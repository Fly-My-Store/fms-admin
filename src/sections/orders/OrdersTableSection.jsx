'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';

const formatINR = (cents) => {
  const n = Number(cents);
  if (!Number.isFinite(n)) return '—';
  return `₹${(n / 100).toFixed(2)}`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const shortId = (id) => (id ? String(id).slice(0, 8) : '—');

const statusChip = (value) => {
  if (!value) return <Chip size="small" label="—" variant="light" />;
  const color =
    value === 'DELIVERED' || value === 'SUCCESS' || value === 'CAPTURED'
      ? 'success'
      : value === 'CANCELLED' || value === 'FAILED' || value === 'REFUNDED'
        ? 'error'
        : value === 'PENDING'
          ? 'warning'
          : 'default';
  return <Chip size="small" color={color} label={value} variant="light" />;
};

export default function OrdersTableSection({
  rows,
  handleViewButton,
  pageIndex,
  pageSize,
  totalPageCount,
  totalCount,
  onPaginationChange,
  filterBar
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Order',
        accessorKey: 'id',
        cell: ({ row }) => (
          <Typography variant="body2" fontFamily="monospace" title={row.original.id}>
            {shortId(row.original.id)}
          </Typography>
        )
      },
      {
        header: 'Customer',
        id: 'customer',
        cell: ({ row }) => row.original.customer?.name || row.original.customer?.phone || '—'
      },
      {
        header: 'Store',
        id: 'store',
        cell: ({ row }) => row.original.store?.name || '—'
      },
      {
        header: 'Total',
        accessorKey: 'total_cents',
        cell: ({ row }) => formatINR(row.original.total_cents)
      },
      {
        header: 'Order Status',
        accessorKey: 'status',
        cell: ({ row }) => statusChip(row.original.status)
      },
      {
        header: 'Payment',
        accessorKey: 'payment_status',
        cell: ({ row }) => statusChip(row.original.payment_status)
      },
      {
        header: 'Created',
        accessorKey: 'created_at',
        cell: ({ row }) => formatDate(row.original.created_at)
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Orders"
      handleViewButton={handleViewButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      totalCount={totalCount}
      onPaginationChange={onPaginationChange}
      permissionName="order"
      subheader={filterBar}
    />
  );
}
