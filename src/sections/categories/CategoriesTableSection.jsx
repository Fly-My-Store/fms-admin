'use client';

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
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
  topActions,
  handleViewButton,
  totalCount
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Logo',
        accessorKey: 'icon_url',
        cell: ({ row }) => (
          <Avatar
            src={row.original.icon_thumb_url || row.original.icon_url || undefined}
            alt={row.original.name || ''}
            variant="rounded"
            sx={{ width: 40, height: 40, fontSize: 14 }}
          >
            {(row.original.name || '?').slice(0, 1).toUpperCase()}
          </Avatar>
        )
      },
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
      topActions={topActions}
      data={rows}
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

CategoriesTableSection.propTypes = {
  rows: PropTypes.array,
  handleAddButton: PropTypes.func,
  handleEditButton: PropTypes.func,
  pageIndex: PropTypes.number,
  pageSize: PropTypes.number,
  totalPageCount: PropTypes.number,
  onPaginationChange: PropTypes.func,
  topActionsLeft: PropTypes.func,
  topActions: PropTypes.func,
  tableActions: PropTypes.func,
  handleViewButton: PropTypes.func,
  totalCount: PropTypes.number
};
