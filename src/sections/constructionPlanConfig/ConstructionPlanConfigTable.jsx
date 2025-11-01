'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function ConstructionPlanConfigTable({ configs, handleAddButton, handleEditButton }) {
  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name'
      },
      {
        header: 'Loan Type',
        accessorFn: (row) => row.loanType?.name || '—'
      },
      {
        header: 'Stucture Type',
        accessorFn: (row) => row.structureType?.name || '—'
      },
      {
        header: 'Floors',
        accessorKey: 'floors',
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: 'Basement',
        accessorKey: 'basement',
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: 'Residential Floors',
        accessorKey: 'residentialFloors',
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: 'progress',
        accessorFn: (row) => row.progress === 2 ? 'Complete' : 'Pending'
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

  return <BasicReactTable {...{ columns, data: configs, title: 'Construction Plan Configuration', ariaLebel: 'Add Construction Plan Configuration', handleAddButton, handleEditButton, showPagination: false, permissionName: 'constructionPlanConfig' }} />;
}