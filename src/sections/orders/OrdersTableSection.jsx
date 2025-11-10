'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function OrdersTableSection({
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
      { header: 'Order No', accessorKey: 'order_no' },
      { header: 'User ID', accessorKey: 'user_id' },
      { header: 'Store ID', accessorKey: 'store_id' },
      { header: 'Status', accessorKey: 'status' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Orders"
      ariaLebel="Add Order"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'order'}
    />
  );
}
