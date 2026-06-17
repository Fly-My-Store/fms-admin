'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';
import { formatINR } from 'utils/currency';

export default function PaymentsTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  handleViewButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  showActions = true,
  topActionsLeft,
  showTitle = true
}) {
  const columns = useMemo(
    () => [
      { header: 'Order ID', accessorKey: 'order_id' },
      { header: 'Amount (₹)', id: 'amount_cents', accessorFn: (row) => formatINR(row?.amount_cents) },
      { header: 'Status', accessorKey: 'status' },
      { header: 'Gateway', accessorKey: 'gateway' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Payments"
      showTitle={showTitle}
      ariaLebel="Add Payment"
      handleAddButton={showActions ? handleAddButton : undefined}
      handleEditButton={showActions ? handleEditButton : undefined}
      handleViewButton={handleViewButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'payment'}
      showActions={showActions}
      topActionsLeft={topActionsLeft}
    />
  );
}
