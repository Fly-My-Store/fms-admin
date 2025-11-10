'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function OrderEventsTableSection({
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
      { header: 'Type', accessorKey: 'event_type' },
      { header: 'Note', accessorKey: 'note' },
      { header: 'At', accessorKey: 'created_at' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Order Events"
      ariaLebel="Add Order Event"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'orderEvent'}
    />
  );
}
