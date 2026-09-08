'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';
import { formatOrderNumberOnly } from 'utils/orderLabel';
import { formatINR } from 'utils/currency';
import {
  getOrderPaymentStatusLabel,
  getOrderStatusLabel,
  statusChipColor
} from 'utils/orderStatusLabels';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const statusChip = (value, label) => {
  if (!value) return <Chip size="small" label="—" variant="light" />;
  return (
    <Chip size="small" color={statusChipColor(value)} label={label || value} variant="light" title={value} />
  );
};

export default function OrdersTableSection({
  rows,
  handleViewButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  filterBar,
  hideStoreColumn = false,
  hideCustomerColumn = false,
  title = 'Orders',
  showTitle = true,
  totalCount,
  topActionsLeft,
  topActions,
  showPagination = true
}) {
  const columns = useMemo(
    () => {
      const cols = [
        {
          header: 'Order',
          accessorKey: 'id',
          cell: ({ row }) => (
            <Typography variant="body2" fontFamily="monospace" title={row.original.id}>
              {formatOrderNumberOnly(row.original)}
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
          cell: ({ row }) => statusChip(row.original.status, getOrderStatusLabel(row.original.status))
        },
        {
          header: 'Payment',
          accessorKey: 'payment_status',
          cell: ({ row }) => statusChip(row.original.payment_status, getOrderPaymentStatusLabel(row.original))
        },
        {
          header: 'Created',
          id: 'created',
          cell: ({ row }) =>
            formatDate(row.original.created_at || row.original.createdAt || row.original.placed_at)
        }
      ];
      return cols.filter((col) => {
        if (hideStoreColumn && col.id === 'store') return false;
        if (hideCustomerColumn && col.id === 'customer') return false;
        return true;
      });
    },
    [hideStoreColumn, hideCustomerColumn]
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title={title}
      showTitle={showTitle}
      handleViewButton={handleViewButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      totalCount={totalCount}
      onPaginationChange={onPaginationChange}
      permissionName="order"
      subheader={filterBar}
      topActions={topActions}
      topActionsLeft={topActionsLeft}
      showPagination={showPagination}
    />
  );
}
