'use client';

import {
  Alert,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import {
  getRefundStatusChipColor,
  getRefundStatusLabel,
  getRefundTimelineNote,
  hasCapturedPaymentWithoutRefund
} from 'utils/refundLabels';

const formatINR = (cents) => {
  const n = Number(cents);
  if (!Number.isFinite(n)) return '—';
  return `₹${(n / 100).toFixed(2)}`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

export default function OrderRefundCard({ order, refunds = [] }) {
  const showGapAlert = hasCapturedPaymentWithoutRefund(order, refunds);
  const latest = refunds[0] || null;
  const timelineNote = latest ? getRefundTimelineNote(latest.status) : null;

  if (!refunds.length && !showGapAlert) {
    return null;
  }

  return (
    <MainCard title="Refunds">
      <Stack spacing={2}>
        {showGapAlert ? (
          <Alert severity="warning">
            This order was cancelled but no refund record exists for a captured payment. Check Razorpay
            dashboard or retry cancel/refund.
          </Alert>
        ) : null}

        {timelineNote ? <Alert severity="info">{timelineNote}</Alert> : null}

        {refunds.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Initiated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {refunds.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{formatINR(r.amount_cents)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getRefundStatusLabel(r.status)}
                      color={getRefundStatusChipColor(r.status)}
                      variant="light"
                    />
                  </TableCell>
                  <TableCell>{safe(r.reason)}</TableCell>
                  <TableCell>{safe(r.gateway_refund_id)}</TableCell>
                  <TableCell>{formatDate(r.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No refund rows recorded yet.
          </Typography>
        )}
      </Stack>
    </MainCard>
  );
}
