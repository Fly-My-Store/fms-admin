'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';


export default function BranchTableSection({
  branches,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  topActionsLeft,
  subheader
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Branch Name',
        accessorKey: 'name'
      },
      {
        header: 'Code',
        accessorKey: 'code'
      },
      {
        header: 'City',
        accessorFn: (row) => row.city?.name || 'N/A',
        id: 'city'
      },
      {
        header: 'District',
        accessorFn: (row) => row.district?.name || 'N/A',
        id: 'district'
      },
      {
        header: 'Zone',
        accessorFn: (row) => row.zone?.name || 'N/A',
        id: 'zone'
      },
      {
        header: 'State',
        accessorFn: (row) => row.state?.name || 'N/A',
        id: 'state'
      },
      {
        header: 'Pincode',
        accessorKey: 'pincode'
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

  return <BasicReactTable
    columns={columns}
    data={branches}
    handleAddButton={handleAddButton}
    handleEditButton={handleEditButton}
    pageIndex={pageIndex}
    pageSize={pageSize}
    totalPageCount={totalPageCount}
    onPaginationChange={onPaginationChange}
    topActionsLeft={topActionsLeft}
    subheader={subheader}
    permissionName={'branch'}
  />;
}