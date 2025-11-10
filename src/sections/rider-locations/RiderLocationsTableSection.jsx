'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function RiderLocationsTableSection({
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
      { header: 'Latitude', accessorKey: 'lat' },
      { header: 'Longitude', accessorKey: 'lng' },
      { header: 'Recorded At', accessorKey: 'created_at' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Rider Locations"
      ariaLebel="Add Rider Location"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'riderLocation'}
    />
  );
}
