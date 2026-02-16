'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';
import { formatINR } from 'utils/currency';

export default function RefundsTableSection({
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
      { header: 'Payment ID', accessorKey: 'payment_id' },
      { header: 'Amount (₹)', id: 'amount_cents', accessorFn: (row) => formatINR(row?.amount_cents) },
      { header: 'Status', accessorKey: 'status' },
      { header: 'Reason', accessorKey: 'reason' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Refunds"
      ariaLebel="Add Refund"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'refund'}
    />
  );
}
