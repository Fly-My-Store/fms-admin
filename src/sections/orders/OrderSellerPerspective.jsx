'use client';

import { Alert, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import EntityLink from 'components/EntityLink';
import { formatINR } from 'utils/currency';
import { getOrderStoreHref } from 'utils/orderLinks';
import { MoneyDivider, MoneyRow } from './MoneyRows';

export default function OrderSellerPerspective({ order }) {
  const earnings = order?.earnings || {};
  const d = earnings.deductions || {};
  const isCancelledPayout = earnings.payout_status === 'cancelled';
  const gstTotal =
    Number(d.platform_gst_cents || 0) + Number(d.delivery_gst_cents || 0) + Number(d.gateway_gst_cents || 0);
  const hasFees =
    Number(d.platform_fee_cents || 0) > 0 ||
    Number(d.delivery_commission_cents || 0) > 0 ||
    Number(d.gateway_fee_cents || 0) > 0;

  return (
    <MainCard title="Seller view">
      <Stack spacing={1.5}>
        {isCancelledPayout ? (
          <Alert severity="warning">
            Order cancelled — no payout.
            {Number(earnings.original_net_payout_cents) > 0
              ? ` Would have been ${formatINR(earnings.original_net_payout_cents)}.`
              : ''}
          </Alert>
        ) : null}

        <EntityLink href={getOrderStoreHref(order)}>{order?.store?.name || 'Store'}</EntityLink>

        <Typography variant="subtitle2">Earnings</Typography>
        <MoneyRow label="Items total" cents={earnings.items_total_cents ?? order?.items_total_cents} />
        {hasFees ? (
          <>
            <Typography variant="caption" color="text.secondary">
              Fees paid by seller
            </Typography>
            <MoneyRow label="Platform fee" cents={d.platform_fee_cents} hideZero negative />
            <MoneyRow label="Delivery commission" cents={d.delivery_commission_cents} hideZero negative />
            <MoneyRow label="Payment gateway" cents={d.gateway_fee_cents} hideZero negative />
            <MoneyRow label="Total fees" cents={earnings.total_deductions_cents} negative />
          </>
        ) : null}
        {gstTotal > 0 ? (
          <Typography variant="caption" color="text.secondary">
            GST included {formatINR(gstTotal)}
          </Typography>
        ) : null}
        <MoneyDivider />
        <MoneyRow label="Net payout" cents={earnings.net_payout_cents} bold />

        {order?.store_invoice_url ? (
          <Typography variant="body2" color="text.secondary">
            Store invoice uploaded
          </Typography>
        ) : order?.store_invoice_rejected_at ? (
          <Alert severity="warning">
            Store invoice rejected
            {order.store_invoice_reject_reason ? `: ${order.store_invoice_reject_reason}` : ''}
          </Alert>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No store invoice uploaded
          </Typography>
        )}
      </Stack>
    </MainCard>
  );
}
