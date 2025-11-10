'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function ProductAttrsTableSection({
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
      { header: 'Code', accessorKey: 'code' },
      { header: 'Value', accessorKey: 'value_text' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Product Attributes"
      ariaLebel="Add Product Attribute"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'productAttributeValue'}
    />
  );
}
