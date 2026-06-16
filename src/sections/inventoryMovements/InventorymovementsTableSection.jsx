'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function InventorymovementsTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
}) {
  const columns = useMemo(
    () => [
      { header: 'Store Variant', accessorKey: 'store_variant_id' },
      {
        header: 'SKU',
        accessorFn: (row) => row.storeVariant?.product_variant?.sku || '—',
      },
      { header: 'Delta', accessorKey: 'delta' },
      { header: 'Reason', accessorKey: 'reason' },
      { header: 'Ref Type', accessorKey: 'ref_type' },
      { header: 'Ref ID', accessorKey: 'ref_id' },
    ],
    [],
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
      permissionName="inventoryMovement"
    />
  );
}
