'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function DeliveryJobsTableSection({
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
      { header: 'Order', accessorKey: 'order_label' },
      { header: 'Store', accessorKey: 'store_name' },
      { header: 'Rider', accessorKey: 'rider_name' },
      { header: 'Status', accessorKey: 'status' },
      { header: 'Created', accessorKey: 'created_at' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Delivery Jobs"
      ariaLebel="Add Delivery Job"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'deliveryJob'}
    />
  );
}
