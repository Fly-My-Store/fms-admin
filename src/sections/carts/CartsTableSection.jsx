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
  onPaginationChange,
  hideCustomerColumn = false,
  showActions = true,
  topActionsLeft,
  showTitle = true
}) {
  const columns = useMemo(
    () => {
      const cols = [
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
    ];
      return hideCustomerColumn ? cols.filter((c) => c.header !== 'Customer') : cols;
    },
    [hideCustomerColumn]
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Carts"
      showTitle={showTitle}
      ariaLebel="Add Cart"
      handleAddButton={showActions ? handleAddButton : undefined}
      handleEditButton={showActions ? handleEditButton : undefined}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'cart'}
      showActions={showActions}
      topActionsLeft={topActionsLeft}
    />
  );
}
