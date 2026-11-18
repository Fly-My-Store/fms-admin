'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';

import BasicReactTable from 'components/tables/basicTable';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import { removeOffer } from 'api/offers';

function productSummary(row) {
  const products = Array.isArray(row.products) ? row.products : [];
  if (!products.length) return '—';
  return products
    .map((item) => (
      item.all_variants
        ? `${item.name} · all variants`
        : `${item.name} · ${item.variants?.length || 0} variants`
    ))
    .join(', ');
}

export default function OffersView() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [appliedQ, setAppliedQ] = useState('');
  const listParams = useMemo(() => (appliedQ ? { q: appliedQ } : {}), [appliedQ]);
  const { rows, totalPages, totalCount, load, pageIndex, pageSize, handlePaginationChange } = useAxiosPaginatedList(
    'admin/offers',
    { params: listParams, errorMessage: 'Failed to load offers' }
  );

  const columns = useMemo(() => [
    { header: 'Offer', accessorKey: 'text' },
    {
      header: 'Products',
      id: 'products',
      cell: ({ row }) => <Typography variant="body2">{productSummary(row.original)}</Typography>
    },
    {
      header: 'Store',
      id: 'store',
      cell: ({ row }) => row.original.store_name || 'All stores'
    }
  ], []);

  const onDelete = async (row) => {
    if (!row?.id) return;
    if (!window.confirm('Delete this offer?')) return;
    try {
      await removeOffer(row.id);
      enqueueSnackbar('Offer deleted', { variant: 'success' });
      load();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Delete failed', { variant: 'error' });
    }
  };

  return (
    <BasicReactTable
      title="Offers"
      ariaLebel="Add offer"
      permissionName="product"
      columns={columns}
      data={rows}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPages}
      totalCount={totalCount}
      onPaginationChange={handlePaginationChange}
      handleAddButton={() => router.push('/offers/create')}
      handleEditButton={(row) => row?.id && router.push(`/offers/edit/${row.id}`)}
      handleDeleteButton={onDelete}
      topActionsLeft={() => (
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setAppliedQ(q.trim())}
            placeholder="Offer text"
          />
          <Button variant="outlined" size="small" onClick={() => setAppliedQ(q.trim())}>
            Search
          </Button>
        </Stack>
      )}
    />
  );
}
