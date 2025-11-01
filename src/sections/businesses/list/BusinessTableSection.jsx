'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function BusinessTableSection({ businesses, handleAddButton, handleEditButton }) {
  const columns = useMemo(
    () => [
      {
        header: 'Business Name',
        accessorKey: 'name'
      },
      {
        header: 'Email',
        accessorFn: (row) => row.user?.email
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
      data={businesses}
      title="Businesses"
      ariaLebel="Add Business"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      permissionName={'business'}
    />
  );
}