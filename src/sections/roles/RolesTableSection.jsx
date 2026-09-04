'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';

export default function RolesTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  totalCount,
  topActionsLeft,
  topActions,
  showPagination = true
}) {
  const columns = useMemo(
    () => [
      { header: 'Name', accessorKey: 'name' },
      { header: 'Code', accessorKey: 'code' },
      {
        header: 'Domain',
        accessorKey: 'domain',
        cell: (cell) => {
          const value = cell.getValue();
          return <Chip color={value === 'ADMIN' ? 'primary' : 'secondary'} label={value || '—'} size="small" variant="light" />;
        }
      },
      { header: 'Description', accessorKey: 'description' }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Admin Roles"
      ariaLebel="Add Role"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'role'}
      totalCount={totalCount}
      topActionsLeft={topActionsLeft}
      topActions={topActions}
      showPagination={showPagination}
    />
  );
}
