'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function ProductImagesTableSection({
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
      { header: 'URL', accessorKey: 'url' },
      { header: 'Alt Text', accessorKey: 'alt_text' },
      { header: 'Position', accessorKey: 'position' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Product Images"
      ariaLebel="Add Product Image"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'productImage'}
    />
  );
}
