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
import EntityLink from 'components/EntityLink';
import {
  getRefundStatusChipColor,
  getRefundStatusLabel,
  getRefundTimelineNote,
  hasCapturedPaymentWithoutRefund
} from 'utils/refundLabels';
import { getOrderRefundsHref } from 'utils/orderLinks';
import { formatINR } from 'utils/currency';
import { buildAdminPartialOrderView } from 'utils/partialOrderDisplay';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

export default function OrderRefundCard({ order, refunds = [] }) {
  const showGapAlert = hasCapturedPaymentWithoutRefund(order, refunds);
  const partialView = buildAdminPartialOrderView(order);
  const showDeferredPartial = Boolean(partialView?.deferredRefund) && refunds.length === 0;
  const latest = refunds[0] || null;
  const timelineNote = latest ? getRefundTimelineNote(latest.status) : null;

  if (!refunds.length && !showGapAlert && !showDeferredPartial) {
    return null;
  }

  return (
    <MainCard
      title="Refunds"
      secondary={
        <EntityLink href={getOrderRefundsHref(order)} variant="caption">
          Open refunds
        </EntityLink>
      }
    >
      <Stack spacing={2}>
        {showGapAlert ? (
          <Alert severity="warning">
            This order was cancelled but no refund record exists for a captured payment. Check Razorpay
            dashboard or retry cancel/refund.
          </Alert>
        ) : null}

        {showDeferredPartial ? (
          <Alert severity="info">
            Partial order adjustment · customer refund {formatINR(partialView.refundCents)} after
            delivery (no refund row yet).
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
        ) : showDeferredPartial ? null : (
          <Typography variant="body2" color="text.secondary">
            No refund rows recorded yet.
          </Typography>
        )}
      </Stack>
    </MainCard>
  );
}
