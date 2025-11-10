'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function VariantBarcodesTableSection({
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
      { header: 'Variant ID', accessorKey: 'variant_id' },
      { header: 'Barcode', accessorKey: 'barcode' },
      { header: 'Type', accessorKey: 'type' },
      { header: 'Primary', accessorKey: 'is_primary' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Variant Barcodes"
      ariaLebel="Add Variant Barcode"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'variantBarcode'}
    />
  );
}
