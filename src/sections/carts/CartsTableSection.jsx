'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function CartsTableSection({
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
      { header: 'User ID', accessorKey: 'user_id' },
      { header: 'Store ID', accessorKey: 'store_id' },
      { header: 'Record Status', accessorKey: 'record_status' },
      { header: 'Items', accessorKey: 'item_count' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Carts"
      ariaLebel="Add Cart"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'cart'}
    />
  );
}
