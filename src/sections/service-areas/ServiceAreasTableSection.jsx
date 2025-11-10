'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function ServiceAreasTableSection({
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
      { header: 'Store ID', accessorKey: 'store_id' },
      { header: 'Pincode', accessorKey: 'pincode' },
      { header: 'Active', accessorKey: 'is_active' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Service Areas"
      ariaLebel="Add Service Area"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'serviceArea'}
    />
  );
}
