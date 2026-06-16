'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { enqueueSnackbar } from 'notistack';
import { Chip, Stack, Typography } from '@mui/material';
import BasicReactTable from 'components/tables/basicTable';
import { listAllOrderEvents } from 'api/ordersPayments';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

export default function OrderEventsView() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const load = (page = 1, pageSize = 20) => {
    setLoading(true);
    listAllOrderEvents({ page, limit: pageSize })
      .then((resp) => {
        setRows(resp?.data || []);
        setMeta(resp?.meta || { page, pageSize, total: 0, totalPages: 1 });
      })
      .catch((err) => {
        enqueueSnackbar(err?.response?.data?.message || 'Failed to load events', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1, 20);
  }, []);

  const columns = useMemo(
    () => [
      {
        header: 'When',
        accessorKey: 'created_at',
        cell: ({ row }) => formatDate(row.original.created_at)
      },
      {
        header: 'Type',
        accessorKey: 'type',
        cell: ({ row }) => <Chip size="small" label={row.original.type} variant="light" />
      },
      {
        header: 'Order',
        id: 'order',
        cell: ({ row }) => {
          const orderId = row.original.order_id || row.original.Order?.id;
          if (!orderId) return '—';
          return (
            <Link href={`/orders/${orderId}`} style={{ fontFamily: 'monospace' }}>
              {String(orderId).slice(0, 8)}
            </Link>
          );
        }
      },
      {
        header: 'Order status',
        id: 'order_status',
        cell: ({ row }) => row.original.Order?.status || '—'
      },
      {
        header: 'Payload',
        id: 'payload',
        cell: ({ row }) => (
          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
            {row.original.payload ? JSON.stringify(row.original.payload) : '—'}
          </Typography>
        )
      }
    ],
    []
  );

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: meta.page - 1, pageSize: meta.pageSize }) : updater;
    load(next.pageIndex + 1, next.pageSize);
  };

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Order events"
      pageIndex={meta.page - 1}
      pageSize={meta.pageSize}
      totalPageCount={meta.totalPages}
      totalCount={meta.total}
      onPaginationChange={handlePaginationChange}
      showActions={false}
      subheader={
        loading
          ? () => (
              <Typography variant="caption" color="text.secondary">
                Loading…
              </Typography>
            )
          : undefined
      }
    />
  );
}
