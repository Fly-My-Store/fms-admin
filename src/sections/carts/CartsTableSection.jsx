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
      {
        header: 'Customer',
        accessorFn: (row) => row.user?.name || row.user?.email || row.user_id,
      },
      {
        header: 'Store',
        accessorFn: (row) => row.store?.name || row.store_id,
      },
      { header: 'Status', accessorKey: 'status' },
      { header: 'Items', accessorKey: 'item_count' },
      { header: 'Updated', accessorKey: 'updated_at' },
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
