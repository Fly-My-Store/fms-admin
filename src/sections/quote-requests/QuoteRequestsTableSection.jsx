'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

function when(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

export default function QuoteRequestsTableSection({
  rows,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  totalCount,
  topActionsLeft,
  onView
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Customer',
        accessorFn: (row) => row.customer?.name || row.customer?.phone || '—'
      },
      { header: 'Status', accessorKey: 'status' },
      {
        header: 'Type',
        accessorFn: (row) => (row.store_type === 'grocery' ? 'Grocery' : 'Pharmacy')
      },
      {
        header: 'Area',
        accessorFn: (row) => [row.city, row.postal_code].filter(Boolean).join(' ') || '—'
      },
      { header: 'Stores', accessorKey: 'notified_store_count' },
      {
        header: 'Created',
        accessorFn: (row) => when(row.created_at)
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Quote requests"
      ariaLebel="Quote requests"
      handleViewButton={onView}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      totalCount={totalCount}
      topActionsLeft={topActionsLeft}
      permissionName="order"
      showActions
    />
  );
}
