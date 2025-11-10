'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function ProductVariantsTableSection({
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
      { header: 'Product ID', accessorKey: 'product_id' },
      { header: 'SKU', accessorKey: 'sku' },
      { header: 'Option Summary', accessorKey: 'option_summary' },
      { header: 'Status', accessorKey: 'status' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Product Variants"
      ariaLebel="Add Product Variant"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'productVariant'}
    />
  );
}
