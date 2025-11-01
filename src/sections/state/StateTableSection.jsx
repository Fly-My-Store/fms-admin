'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import useUser from 'hooks/useUser';
import { USER_TYPES } from 'utils/constants';

export default function StateTableSection({
  data,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  totalCount
}) {
  const user = useUser();

  const columns = useMemo(
    () => [
      {
        header: 'State Name',
        accessorKey: 'name'
      },
      {
        header: 'Code',
        accessorKey: 'code'
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const value = getValue();
          if (value === 1) return <Chip color="success" label="Active" size="small" variant="light" />;
          if (value === 2) return <Chip color="default" label="Inactive" size="small" variant="light" />;
          return <Chip color="default" label="Unknown" size="small" variant="light" />;
        }
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={data}
      title="States"
      ariaLebel="Add State"
      handleAddButton={user.type === USER_TYPES.PLATFORM ? handleAddButton : undefined}
      handleEditButton={user.type === USER_TYPES.PLATFORM ? handleEditButton : undefined}
      showActions={user.type === USER_TYPES.PLATFORM}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      totalCount={totalCount}
      permissionName={'state'}
    />
  );
}