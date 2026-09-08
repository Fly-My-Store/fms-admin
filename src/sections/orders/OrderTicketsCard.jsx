'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Chip, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { listSupportTickets } from 'api/support';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

export default function OrderTicketsCard({ orderId }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!orderId) return;
    try {
      const resp = await listSupportTickets({ order_id: orderId, limit: 20, page: 1 });
      setRows(Array.isArray(resp?.data) ? resp.data : []);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load tickets');
      setRows([]);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <MainCard
      title="Support tickets"
      secondary={
        <Typography component={Link} href={`/support-tickets?order_id=${orderId}`} variant="caption" color="primary">
          All tickets
        </Typography>
      }
    >
      <Stack spacing={1.25}>
        {error ? <Alert severity="warning">{error}</Alert> : null}
        {!error && !rows.length ? (
          <Typography variant="body2" color="text.secondary">
            No tickets on this order
          </Typography>
        ) : null}
        {rows.map((row) => (
          <Stack key={row.id} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography
                component={Link}
                href={`/support-tickets/${row.id}`}
                variant="body2"
                color="primary"
                noWrap
              >
                {row.subject || 'Ticket'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.requester_type || '—'} · {formatDate(row.created_at)}
              </Typography>
            </Stack>
            <Chip size="small" variant="light" label={row.status || '—'} />
          </Stack>
        ))}
      </Stack>
    </MainCard>
  );
}
