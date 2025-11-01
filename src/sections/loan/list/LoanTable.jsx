'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { LOAN_STEP_TEXT_MAP, TABLE_STATUS } from 'utils/constants';
import Link from 'next/link';
import { formatCurrency } from 'utils/text-formatter';

export default function LoanTable({
  handleAddButton,
  handleEditButton,
  handleViewButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  loans,
  topActionsLeft,
  totalCount
}) {

  const columns = useMemo(
    () => [
      {
        header: 'Loan Number',
        accessorKey: 'loanNumber',
        cell: ({ row }) => (
          <span
            style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => handleViewButton(row.original)}
          >
            {row.original.loanNumber}
          </span>
        )
      },
      {
        header: 'Customer Name',
        accessorKey: 'name'
      },
      {
        header: 'Mobile',
        accessorKey: 'mobile'
      },
      {
        header: 'Branch',
        accessorFn: (row) => row.branch
      },
      {
        header: 'Sanction Amount',
        accessorFn: (row) => `₹ ${formatCurrency(row.sanctionedAmount || 0)}`,
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: 'Completed',
        accessorFn: (row) => `${row.completedPercent || 0}%`,
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: 'Disbursed',
        accessorFn: (row) => `${row.disbursementPercent || 0}%`,
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: 'Step',
        accessorFn: (row) => LOAN_STEP_TEXT_MAP[row.step] || 'Old',
        meta: {
          sx: { textAlign: 'center' }
        }
      },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={loans}
      title="Loans"
      ariaLebel="Add Loan"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      topActionsLeft={topActionsLeft}
      totalCount={totalCount}
      permissionName={'loan'}
    />
  );
}