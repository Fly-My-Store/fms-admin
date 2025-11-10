'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function VariantAttrsTableSection({
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
      { header: 'Code', accessorKey: 'code' },
      { header: 'Value', accessorKey: 'value_text' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Variant Attributes"
      ariaLebel="Add Variant Attribute"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'variantAttributeValue'}
    />
  );
}
