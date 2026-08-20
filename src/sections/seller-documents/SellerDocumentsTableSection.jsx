'use client';

import { useMemo } from 'react';
import Link from '@mui/material/Link';
import BasicReactTable from 'components/tables/basicTable';

function sellerName(row) {
  return row?.seller?.display_name || row?.seller?.legal_name || row?.seller_id || '—';
}

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
      {
        header: 'Seller',
        accessorKey: 'seller_id',
        cell: ({ row }) => sellerName(row.original),
      },
      { header: 'Type', accessorKey: 'doc_type' },
      {
        header: 'File',
        accessorKey: 'file_url',
        cell: ({ row }) => {
          const url = row.original?.file_url;
          if (!url) return '—';
          return (
            <Link href={url} target="_blank" rel="noopener noreferrer">
              View
            </Link>
          );
        },
      },
      {
        header: 'Status',
        accessorKey: 'verified_status',
      },
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
