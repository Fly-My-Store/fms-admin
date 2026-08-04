'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';
import { formatINR } from 'utils/currency';

export default function RefundsTableSection({
  rows,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  totalCount,
  topActionsLeft,
  topActions,
  showPagination = true
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
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      totalCount={totalCount}
      topActionsLeft={topActionsLeft}
      topActions={topActions}
      showPagination={showPagination}
      permissionName={'refund'}
      showActions={false}
    />
  );
}
