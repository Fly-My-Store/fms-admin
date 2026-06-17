'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function AddressesTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  hideUserIdColumn = false,
  showActions = true,
  showTitle = true
}) {
  const columns = useMemo(
    () => {
      const cols = [
      { header: 'User ID', accessorKey: 'user_id' },
      { header: 'Line 1', accessorKey: 'line1' },
      { header: 'City', accessorKey: 'city' },
      { header: 'Pincode', accessorKey: 'postal_code' },
    ];
      return hideUserIdColumn ? cols.filter((c) => c.accessorKey !== 'user_id') : cols;
    },
    [hideUserIdColumn]
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Addresses"
      showTitle={showTitle}
      ariaLebel="Add Address"
      handleAddButton={showActions ? handleAddButton : undefined}
      handleEditButton={showActions ? handleEditButton : undefined}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'addresse'}
      showActions={showActions}
    />
  );
}
