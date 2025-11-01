'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function BranchAccessTableSection({ branchAccessList, handleAddButton, handleEditButton }) {
  const columns = useMemo(
    () => [
      {
        header: 'User ID',
        accessorKey: 'userId'
      },
      {
        header: 'Branch ID',
        accessorKey: 'branchId'
      },
      {
        header: 'Access Level',
        accessorKey: 'accessLevel'
      },
      {
        header: 'Access Value',
        accessorKey: 'accessValue'
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

  return <BasicReactTable {...{ columns, data: branchAccessList, title: 'Branch Access', ariaLebel: 'Add Access', handleAddButton, handleEditButton, permissionName: 'branchAccess' }} />;
}