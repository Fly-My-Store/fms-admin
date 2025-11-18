'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function CategoriesTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  topActionsLeft,
  tableActions,
  handleViewButton,
  totalCount
}) {
  const columns = useMemo(
    () => [
      { header: 'Name', accessorKey: 'name' },
      { header: 'Slug', accessorKey: 'slug' },
      {
        header: 'Parent',
        accessorKey: 'parent',
        cell: (cell) => {
          const parent = cell.getValue(); // expects object { id, name } from API include
          if (!parent || !parent.id) return '—';
          return <span title={parent.id}>{parent.name}</span>;
        }
      },

      {
        header: 'Record Status',
        accessorKey: 'record_status',
        cell: (cell) => {
          const value = cell.getValue();
          switch (value) {
            case TABLE_STATUS.ACTIVE:
              return <Chip color="success" label="Active" size="small" variant="light" />;
            case TABLE_STATUS.INACTIVE:
              return <Chip color="warning" label="Inactive" size="small" variant="light" />;
            case TABLE_STATUS.SUSPENDED:
              return <Chip color="error" label="Suspended" size="small" variant="light" />;
            case TABLE_STATUS.DELETED:
              return <Chip color="default" label="Deleted" size="small" variant="light" />;
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
      topActionsLeft={topActionsLeft}
      data={rows}
      title="Categories"
      ariaLebel="Add Category"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      handleViewButton={handleViewButton}
      tableActions={tableActions}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'category'}
      totalCount={totalCount}
    />
  );
}
