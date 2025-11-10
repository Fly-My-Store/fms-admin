'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function InventorymovementsTableSection({
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
      { header: 'Store Variant', accessorKey: 'store_variant_id' },
      { header: 'Qty', accessorKey: 'qty_change' },
      { header: 'Reason', accessorKey: 'reason' },
      { header: 'Ref', accessorKey: 'ref' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Inventory Movements"
      ariaLebel="Add Inventory Movement"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'inventoryMovement'}
    />
  );
}
