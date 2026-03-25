'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import BasicReactTable from 'components/tables/basicTable';
import { RECORD_STATUS } from 'utils/constants';

export default function ProductsTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  handleViewButton,
  totalCount
}) {
  const columns = useMemo(
    () => [
      { header: 'Name', accessorKey: 'name' },
      { header: 'Slug', accessorKey: 'slug' },
      {
        header: 'Brand',
        accessorFn: (row) => row?.brand?.name || '',
        cell: ({ row }) => {
          const brand = row?.original?.brand;
          if (!brand) return '—';
          return (
            <Stack direction="row" alignItems="center" spacing={1}>
              {brand.logo_url ? (
                <Avatar src={brand.logo_url} sx={{ width: 22, height: 22 }} />
              ) : null}
              <span>{brand.name}</span>
            </Stack>
          );
        }
      },
      {
        header: 'Category',
        accessorFn: (row) => row?.category?.name || '',
        cell: ({ row }) => row?.original?.category?.name || '—'
      },
      {
        header: 'Rating',
        accessorFn: (row) => row?.rating ?? 0,
        cell: ({ row }) => {
          const r = Number(row?.original?.rating ?? 0);
          const c = Number(row?.original?.rating_count ?? 0);
          return `${r.toFixed ? r.toFixed(2) : r} (${c})`;
        }
      },
      {
        header: 'Record', // record_status numeric → TABLE_STATUS chip
        accessorKey: 'record_status',
        cell: (cell) => {
          const value = cell.getValue();
          switch (value) {
            case RECORD_STATUS.ACTIVE:
              return <Chip color="success" label="Active" size="small" variant="light" />;
            case RECORD_STATUS.INACTIVE:
              return <Chip color="warning" label="Inactive" size="small" variant="light" />;
            case RECORD_STATUS.ARCHIVED:
              return <Chip color="error" label="Suspended" size="small" variant="light" />;
          }
        }
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Products"
      ariaLebel="Add Product"
      handleAddButton={handleAddButton}
      handleViewButton={handleViewButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'product'}
      totalCount={totalCount}
    />
  );
}
