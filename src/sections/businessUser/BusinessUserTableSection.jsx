'use client';

import { useMemo, useState } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function BusinessUserTableSection({
  users,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
}) {

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessorFn: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim()
      },
      {
        header: 'Email',
        accessorKey: 'email'
      },
      {
        header: 'Role',
        accessorFn: (row) => row.role?.name
      },
      {
        header: 'Type',
        accessorKey: 'subType',
        cell: (cell) => {
          const value = cell.getValue();
          return <Chip label={value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()} size="small" variant="light" />;
        }
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
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={users}
      title="Users"
      ariaLebel="Add User"
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