'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function ProductApprovalsTableSection({
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
      { header: 'Name', accessorKey: 'name' },
      { header: 'Brand', accessorKey: 'brand_name' },
      { header: 'Status', accessorKey: 'status' },
      { header: 'Created', accessorKey: 'created_at' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Product Approvals"
      ariaLebel="Add Product"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'product'}
    />
  );
}
