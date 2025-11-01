'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function ZoneTableSection({
  zones,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  totalCount
}) {
  
  const columns = useMemo(() => [
    {
      header: 'Zone Name',
      accessorKey: 'name'
    },
    {
      header: 'Code',
      accessorKey: 'code'
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
            return <Chip color="default" label="Archived" size="small" variant="light" />;
          default:
            return <Chip color="default" label="Unknown" size="small" variant="light" />;
        }
      }
    }
  ], []);

  return (
    <BasicReactTable
      columns={columns}
      data={zones}
      title="Zones"
      ariaLebel="Add Zone"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      totalCount={totalCount}
      permissionName={'zone'}
    />
  );
}