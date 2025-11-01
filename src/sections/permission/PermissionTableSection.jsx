'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function PermissionTableSection({ permissions, handleAddButton, handleEditButton }) {
  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name'
      },
      {
        header: 'Scope',
        accessorKey: 'scope',
        cell: (cell) => {
          const value = cell.getValue();
          const formatted =
            typeof value === 'string' && value.length > 0
              ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
              : '';

          return <Chip label={formatted} size="small" variant="light" />;
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
      data={permissions}
      title="Permissions"
      ariaLebel="Add Permission"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      permissionName={'permission'}
    />
  );
}