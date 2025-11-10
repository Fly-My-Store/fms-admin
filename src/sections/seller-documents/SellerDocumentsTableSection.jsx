'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function SellerDocumentsTableSection({
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
      { header: 'Seller ID', accessorKey: 'seller_id' },
      { header: 'Type', accessorKey: 'doc_type' },
      { header: 'Number', accessorKey: 'doc_number' },
      { header: 'File URL', accessorKey: 'file_url' },
      { header: 'Status', accessorKey: 'status' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Seller Documents"
      ariaLebel="Add Seller Document"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'sellerDocument'}
    />
  );
}
