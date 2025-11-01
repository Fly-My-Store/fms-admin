'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function LoanTypeTableSection({ loanTypes, handleAddButton, handleEditButton }) {
  const columns = useMemo(
    () => [
      {
        header: 'Loan Type',
        accessorKey: 'name'
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

  return <BasicReactTable {...{
    columns,
    data: loanTypes,
    showPagination: false,
    title: 'Loan Types',
    ariaLebel: 'Add Loan Type',
    handleAddButton,
    handleEditButton,
    permissionName: 'loanType',
  }} />;
}