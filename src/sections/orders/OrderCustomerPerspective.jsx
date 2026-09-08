'use client';

import { Alert, Chip, Link, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import EntityLink from 'components/EntityLink';
import { formatINR } from 'utils/currency';
import { formatAddressLine, formatReceiverLine, parsePrescriptionUrls } from 'utils/orderDisplay';
import { getOrderCustomerHref } from 'utils/orderLinks';
import { MoneyDivider, MoneyRow } from './MoneyRows';

export default function OrderCustomerPerspective({ order }) {
  const pricing = order?.pricing || {};
  const addr = order?.delivery_address;
  const receiver = formatReceiverLine(order);
  const prescriptions = parsePrescriptionUrls(order?.prescription_url);
  const summary = order?.refund_summary || {};
  const cancelMessage = order?.cancel_summary?.customer_message;
  const oosNames = (order?.cancel_summary?.oos_items || []).map((item) => item?.name).filter(Boolean);
  const isCancelled = String(order?.status || '').toUpperCase() === 'CANCELLED';
  const gstTotal =
    Number(pricing.delivery_gst_cents || 0) +
    Number(pricing.km_gst_cents || 0) +
    Number(pricing.platform_gst_cents || 0) +
    Number(pricing.gateway_gst_cents || 0) +
    Number(pricing.service_gst_cents || 0);

  return (
    <MainCard title="Customer view">
      <Stack spacing={1.5}>
        <EntityLink href={getOrderCustomerHref(order)}>{order?.customer?.name || 'Customer'}</EntityLink>

        {isCancelled ? (
          <Alert severity="error">
            {cancelMessage ||
              (summary.scenario === 'cancelled_no_payment'
                ? 'This order was cancelled. No online payment was collected.'
                : 'This order was cancelled.')}
            {oosNames.length ? ` ${oosNames.join(', ')}` : ''}
          </Alert>
        ) : null}
        {summary.show_refund_card ? (
          <Alert severity={String(summary.status).toUpperCase() === 'FAILED' ? 'error' : 'info'}>
            Refund {String(summary.status || '').toLowerCase() || 'pending'} · {formatINR(summary.amount_cents)}
          </Alert>
        ) : null}

        <Typography variant="subtitle2">Bill</Typography>
        <MoneyRow label="Items total" cents={pricing.items_total_cents ?? order?.items_total_cents} />
        <MoneyRow label="Delivery fee" cents={pricing.delivery_fee_cents} hideZero />
        <MoneyRow label="Km surcharge" cents={pricing.km_surcharge_cents} hideZero />
        <MoneyRow label="Platform fee" cents={pricing.platform_fee_cents} hideZero />
        <MoneyRow label="Payment gateway" cents={pricing.gateway_fee_cents} hideZero />
        <MoneyRow label="Service fee" cents={pricing.service_fee_cents} hideZero />
        <MoneyRow label="Discount" cents={pricing.discount_cents ?? order?.discount_cents} hideZero negative />
        <MoneyDivider />
        <MoneyRow label="Grand total" cents={pricing.total_cents ?? order?.total_cents} bold />
        {gstTotal > 0 ? (
          <Typography variant="caption" color="text.secondary">
            Taxes are included. GST {formatINR(gstTotal)}
          </Typography>
        ) : null}

        <MoneyDivider />
        <Typography variant="subtitle2">Delivery</Typography>
        {addr?.label ? (
          <Typography variant="body2" color="text.secondary">
            Saved as: {addr.label}
          </Typography>
        ) : null}
        <Typography variant="body2">{formatAddressLine(addr)}</Typography>
        {receiver ? (
          <Typography variant="body2" color="text.secondary">
            Receiver: {receiver}
          </Typography>
        ) : null}
        {order?.delivery_instructions ? (
          <Typography variant="body2" color="text.secondary">
            Instructions: {order.delivery_instructions}
          </Typography>
        ) : null}

        {prescriptions.length ? (
          <>
            <MoneyDivider />
            <Typography variant="subtitle2">Prescription</Typography>
            {order?.prescription_rejected_at ? (
              <Chip size="small" color="warning" label="Rejected — customer asked to replace" variant="light" />
            ) : null}
            <Stack spacing={0.5}>
              {prescriptions.map((url) => (
                <Link key={url} href={url} target="_blank" rel="noopener noreferrer" variant="body2">
                  Open prescription
                </Link>
              ))}
            </Stack>
          </>
        ) : null}
      </Stack>
    </MainCard>
  );
}
