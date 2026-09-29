'use client';

import { Alert, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { formatINR } from 'utils/currency';
import { formatDistance } from 'utils/orderDisplay';
import { getOrderSurgeBillLines } from 'utils/orderSurgeBill';
import { MoneyDivider, MoneyRow } from './MoneyRows';

/** Inclusive GST on rider fee faces; prefer stored; include seller commission when peeling. */
function resolveRiderGstCents(view) {
  const stored = Number(view?.rider_fee_gst_cents || 0);
  if (stored > 0) return stored;
  const delivery = Number(view?.customer_delivery_cents || 0);
  const km = Number(view?.km_surcharge_cents || 0);
  const service = Number(view?.service_fee_cents || 0);
  const surge = Number(view?.rider_surge_cents || 0);
  const sellerDelivery = Number(view?.seller_delivery_cents || 0);
  const gross = delivery + km + service + surge + sellerDelivery;
  if (gross > 0) return Math.round((gross * 18) / (100 + 18));
  return (
    Number(view?.customer_delivery_gst_cents || 0) +
    Number(view?.km_gst_cents || 0) +
    Number(view?.service_gst_cents || 0) +
    Number(view?.rider_surge_gst_cents || 0) +
    Number(view?.seller_delivery_gst_cents || 0)
  );
}

function shouldShowSellerDelivery(view, earningCents) {
  const seller = Number(view?.seller_delivery_cents || 0);
  if (seller <= 0) return false;
  const customerGross =
    Number(view?.customer_delivery_cents || 0) +
    Number(view?.km_surcharge_cents || 0) +
    Number(view?.service_fee_cents || 0) +
    Number(view?.rider_surge_cents || 0);
  const peel = (g) => (g > 0 ? Math.round((g * 18) / 118) : 0);
  const netWithout = customerGross - peel(customerGross);
  const netWith = customerGross + seller - peel(customerGross + seller);
  const total = Number(earningCents) || 0;
  return Math.abs(total - netWith) <= Math.abs(total - netWithout);
}

export default function OrderRiderPerspective({ order }) {
  const view = order?.rider_view || {};
  const showCollect =
    view.is_cod && String(order?.payment_status || '').toUpperCase() === 'PENDING';
  const showNotCollected =
    view.is_cod && String(order?.payment_status || '').toUpperCase() === 'CANCELLED';
  const earningCents = view.earning_cents ?? order?.rider_share_cents;
  const gstTotal = resolveRiderGstCents(view);
  const showSellerDelivery = shouldShowSellerDelivery(view, earningCents);
  const surgeLines = getOrderSurgeBillLines(order, { beneficiary: 'RIDER' });
  const hasBreakdown =
    Number(view.customer_delivery_cents || 0) > 0 ||
    Number(view.km_surcharge_cents || 0) > 0 ||
    Number(view.service_fee_cents || 0) > 0 ||
    showSellerDelivery ||
    surgeLines.length > 0 ||
    Number(view.earning_cents || 0) > 0;

  return (
    <MainCard title="Rider earnings">
      <Stack spacing={1.5}>
        {showCollect ? (
          <Alert severity="warning">Pay on Delivery · collect {formatINR(view.order_total_cents)}</Alert>
        ) : null}
        {showNotCollected ? (
          <Alert severity="info">Pay on Delivery · not collected</Alert>
        ) : null}

        {hasBreakdown ? (
          <>
            <MoneyRow label="Delivery fee (customer)" cents={view.customer_delivery_cents} hideZero />
            <MoneyRow label="Km surcharge" cents={view.km_surcharge_cents} hideZero />
            <MoneyRow label="Service fee" cents={view.service_fee_cents} hideZero />
            {showSellerDelivery ? (
              <MoneyRow label="Store delivery commission" cents={view.seller_delivery_cents} />
            ) : null}
            {surgeLines.map((row) => (
              <MoneyRow key={row.scope} label={row.label} cents={row.cents} />
            ))}
            <MoneyRow label="GST (platform remits)" cents={gstTotal} hideZero negative />
            <MoneyDivider />
          </>
        ) : null}
        <MoneyRow label="Total earning" cents={earningCents} bold />
        {gstTotal > 0 ? (
          <Typography variant="caption" color="text.secondary">
            Fees above are tax-inclusive. GST {formatINR(gstTotal)} stays with platform. Rider earning is
            net of GST.
          </Typography>
        ) : null}
        {view.distance_m ? (
          <Typography variant="body2" color="text.secondary">
            Trip {formatDistance(view.distance_m)}
          </Typography>
        ) : null}
      </Stack>
    </MainCard>
  );
}
