'use client';

import { useState } from 'react';
import { Alert, Button, Link, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { formatINR } from 'utils/currency';
import { getPlatformInvoice } from 'api/ordersPayments';
import { getOrderSurgeBillLines } from 'utils/orderSurgeBill';
import { buildAdminPartialOrderView } from 'utils/partialOrderDisplay';
import { MoneyDivider, MoneyRow } from './MoneyRows';

export default function OrderCustomerPerspective({ order, onInvoiceMessage }) {
  const pricing = order?.pricing || {};
  const summary = order?.refund_summary || {};
  const cancelMessage = order?.cancel_summary?.customer_message;
  const oosNames = (order?.cancel_summary?.oos_items || []).map((item) => item?.name).filter(Boolean);
  const isCancelled = String(order?.status || '').toUpperCase() === 'CANCELLED';
  const partialView = buildAdminPartialOrderView(order);
  const gstTotal =
    Number(pricing.delivery_gst_cents || 0) +
    Number(pricing.km_gst_cents || 0) +
    Number(pricing.platform_gst_cents || 0) +
    Number(pricing.gateway_gst_cents || 0) +
    Number(pricing.service_gst_cents || 0);
  const surgeLines = getOrderSurgeBillLines(order);
  const status = String(order?.status || '').toUpperCase();
  const feesAvailable = !['CREATED', 'CANCELLED', 'REFUNDED', 'RETURNED'].includes(status);
  const [feesLoading, setFeesLoading] = useState(false);

  const handleOpenFeesInvoice = async () => {
    if (!order?.id || !feesAvailable || feesLoading) return;
    setFeesLoading(true);
    try {
      const res = await getPlatformInvoice(order.id);
      const url = res?.data?.url || res?.url;
      if (!url) {
        onInvoiceMessage?.('Could not generate fees invoice', 'error');
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Fees invoice failed';
      onInvoiceMessage?.(msg, 'error');
    } finally {
      setFeesLoading(false);
    }
  };

  return (
    <MainCard title="Customer bill">
      <Stack spacing={1.5}>
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
        {partialView?.deferredRefund && !summary.show_refund_card ? (
          <Alert severity="info">
            Partial adjustment · refund {formatINR(partialView.refundCents)} after delivery
          </Alert>
        ) : null}

        <MoneyRow label="Items total" cents={pricing.items_total_cents ?? order?.items_total_cents} />
        <MoneyRow label="Delivery fee" cents={pricing.delivery_fee_cents} hideZero />
        <MoneyRow label="Km surcharge" cents={pricing.km_surcharge_cents} hideZero />
        <MoneyRow label="Platform fee" cents={pricing.platform_fee_cents} hideZero />
        <MoneyRow label="Payment gateway" cents={pricing.gateway_fee_cents} hideZero />
        <MoneyRow label="Service fee" cents={pricing.service_fee_cents} hideZero />
        <MoneyRow label="Discount" cents={pricing.discount_cents ?? order?.discount_cents} hideZero negative />
        {surgeLines.map((row) => (
          <MoneyRow key={row.scope} label={row.label} cents={row.cents} />
        ))}
        <MoneyDivider />
        {partialView?.adjusted && partialView.originalTotalCents > 0 ? (
          <MoneyRow label="Original total" cents={partialView.originalTotalCents} />
        ) : null}
        <MoneyRow label="Grand total" cents={pricing.total_cents ?? order?.total_cents} bold />
        {gstTotal > 0 ? (
          <Typography variant="caption" color="text.secondary">
            Taxes are included. GST {formatINR(gstTotal)}
          </Typography>
        ) : null}

        <MoneyDivider />
        <Typography variant="subtitle2">Invoices</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            onClick={handleOpenFeesInvoice}
            disabled={!feesAvailable || feesLoading}
          >
            {feesLoading ? 'Generating…' : 'Fees invoice'}
          </Button>
          {order?.store_invoice_url ? (
            <Button
              size="small"
              variant="outlined"
              component={Link}
              href={order.store_invoice_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Store invoice
            </Button>
          ) : null}
        </Stack>
        {!feesAvailable ? (
          <Typography variant="caption" color="text.secondary">
            Fees invoice not available for this order status.
          </Typography>
        ) : null}
      </Stack>
    </MainCard>
  );
}
