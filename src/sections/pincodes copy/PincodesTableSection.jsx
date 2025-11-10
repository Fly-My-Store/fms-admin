'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function PincodesTableSection({
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
      { header: 'Pincode', accessorKey: 'pincode' },
      { header: 'City', accessorKey: 'city' },
      { header: 'State', accessorKey: 'state' },
      { header: 'Active', accessorKey: 'is_active' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Pincodes"
      ariaLebel="Add Pincode"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'geoPincode'}
    />
  );
}
