'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function CityTableSection({
  data,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  totalCount,
  topActionsLeft
}) {
  const columns = useMemo(() => [
    { header: 'City Name', accessorKey: 'name' },
    { header: 'Code', accessorKey: 'code' },
    {
      header: 'State',
      accessorFn: (row) => row.state?.name || 'N/A',
      id: 'state'
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (cell) => {
        const value = cell.getValue();
        switch (value) {
          case TABLE_STATUS.ACTIVE:
            return <Chip color="success" label="Active" size="small" variant="light" />;
          case TABLE_STATUS.ARCHIVE:
            return <Chip color="default" label="Inactive" size="small" variant="light" />;
          default:
            return <Chip label="Unknown" size="small" variant="light" />;
        }
      }
    }
  ], []);

  return (
    <BasicReactTable
      columns={columns}
      data={data}
      title="Cities"
      ariaLebel="Add City"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      totalCount={totalCount}
      topActionsLeft={topActionsLeft}
      permissionName={'city'}
    />
  );
}