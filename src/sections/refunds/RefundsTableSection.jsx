'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

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
      { header: 'Amount', accessorKey: 'amount' },
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
