'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function StoresTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange
}) {
  const columns = useMemo(
    () => [
      { header: 'Name', accessorKey: 'name' },
      { header: 'Seller ID', accessorKey: 'seller_id' },
      { header: 'Pincode', accessorKey: 'pincode' },

      {
        header: 'Status',
        accessorKey: 'status',
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
      data={rows}
      title="Stores"
      ariaLebel="Add Store"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'store'}
    />
  );
}
