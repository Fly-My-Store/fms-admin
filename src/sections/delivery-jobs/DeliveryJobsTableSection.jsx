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
      { header: 'ID', accessorKey: 'id' },
      { header: 'Rider ID', accessorKey: 'rider_id' },
      { header: 'Status', accessorKey: 'status' },
      { header: 'ETA', accessorKey: 'eta_at' },
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
