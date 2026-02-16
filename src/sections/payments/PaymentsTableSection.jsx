'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';
import { formatINR } from 'utils/currency';

export default function PaymentsTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange
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
      ariaLebel="Add Payment"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'payment'}
    />
  );
}
