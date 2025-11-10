'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function CustomersTableSection({
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
      { header: 'Email', accessorKey: 'email' },
      { header: 'Phone', accessorKey: 'phone' },
      { header: 'Status', accessorKey: 'status' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Customers"
      ariaLebel="Add Customer"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'user'}
    />
  );
}
