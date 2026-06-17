'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import BasicReactTable from 'components/tables/basicTable';
import { listRefunds } from 'api/ordersPayments';
import { formatINR } from 'utils/currency';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

export default function CustomerRefundsCard({ userId, showTitle = true }) {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await listRefunds({ page: pageIndex + 1, limit: pageSize, user_id: userId });
      const list = Array.isArray(resp?.data) ? resp.data : [];
      setRows(list);
      setTotalPages(resp?.meta?.totalPages || 1);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load refunds');
      setRows([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, userId]);

  useEffect(() => {
    setPageIndex(0);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      header: 'Order',
      id: 'order',
      cell: ({ row }) => {
        const orderId = row.original?.payment?.order_id;
        if (!orderId) return '—';
        return (
          <Typography
            variant="body2"
            fontFamily="monospace"
            sx={{ cursor: 'pointer', color: 'primary.main' }}
            onClick={() => router.push(`/orders/${orderId}`)}
          >
            {String(orderId).slice(0, 8)}
          </Typography>
        );
      }
    },
    { header: 'Amount', id: 'amount', accessorFn: (row) => formatINR(row?.amount_cents) },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <Chip size="small" label={row.original.status || '—'} variant="light" />
    },
    { header: 'Reason', accessorKey: 'reason' },
    { header: 'Created', id: 'created', accessorFn: (row) => formatDate(row?.created_at) }
  ];

  if (!userId) return null;

  if (loading && rows.length === 0) {
    return (
      <Stack alignItems="center" py={3}>
        <CircularProgress size={24} />
      </Stack>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Refunds"
      showTitle={showTitle}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPages}
      onPaginationChange={(updater) => {
        const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
        setPageIndex(next.pageIndex);
      }}
      permissionName="refund"
      showActions={false}
      topActionsLeft={() => (
        <Typography component={Link} href="/refunds" variant="body2" color="primary">
          All refunds
        </Typography>
      )}
    />
  );
}

CustomerRefundsCard.propTypes = {
  userId: PropTypes.string
};
