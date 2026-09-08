'use client';

import { Alert, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import EntityLink from 'components/EntityLink';
import { formatINR } from 'utils/currency';
import { formatAddressLine, formatDistance, formatReceiverLine } from 'utils/orderDisplay';
import { getOrderCustomerHref, getOrderDeliveryHref, getOrderRiderHref, getOrderStoreHref } from 'utils/orderLinks';
import { getDeliveryStatusLabel, getPaymentStatusLabel } from 'utils/orderStatusLabels';
import { MoneyDivider, MoneyRow } from './MoneyRows';

export default function OrderRiderPerspective({ order }) {
  const view = order?.rider_view || {};
  const delivery = order?.delivery;
  const store = order?.store;
  const pickupPhone = store?.phone || store?.support_phone;
  const drop = formatAddressLine(order?.delivery_address);
  const receiver = formatReceiverLine(order);
  const paymentLabel = getPaymentStatusLabel(order?.payment_status, {
    gateway: order?.payments?.[0]?.gateway
  });
  const showCollect =
    view.is_cod && String(order?.payment_status || '').toUpperCase() === 'PENDING';
  const showNotCollected =
    view.is_cod && String(order?.payment_status || '').toUpperCase() === 'CANCELLED';
  const gstTotal =
    Number(view.customer_delivery_gst_cents || 0) +
    Number(view.seller_delivery_gst_cents || 0) +
    Number(view.km_gst_cents || 0) +
    Number(view.service_gst_cents || 0);
  const hasBreakdown =
    Number(view.customer_delivery_cents || 0) > 0 ||
    Number(view.seller_delivery_cents || 0) > 0 ||
    Number(view.km_surcharge_cents || 0) > 0 ||
    Number(view.service_fee_cents || 0) > 0 ||
    Number(view.earning_cents || 0) > 0;

  return (
    <MainCard title="Rider view">
      <Stack spacing={1.5}>
        {showCollect ? (
          <Alert severity="warning">Pay on Delivery · collect {formatINR(view.order_total_cents)}</Alert>
        ) : null}
        {showNotCollected ? (
          <Alert severity="info">Pay on Delivery · not collected</Alert>
        ) : null}

        <Typography variant="subtitle2">Earning</Typography>
        {hasBreakdown ? (
          <>
            <MoneyRow label="Delivery fee (customer)" cents={view.customer_delivery_cents} hideZero />
            <MoneyRow label="Km surcharge" cents={view.km_surcharge_cents} hideZero />
            <MoneyRow label="Delivery commission (seller)" cents={view.seller_delivery_cents} hideZero />
            <MoneyRow label="Service fee" cents={view.service_fee_cents} hideZero />
            <MoneyRow label="GST (platform)" cents={gstTotal} hideZero negative />
            <MoneyDivider />
          </>
        ) : null}
        <MoneyRow label="Total earning" cents={view.earning_cents ?? order?.rider_share_cents} bold />
        {gstTotal > 0 ? (
          <Typography variant="caption" color="text.secondary">
            Fees above are tax-inclusive. GST {formatINR(gstTotal)} stays with platform.
          </Typography>
        ) : null}

        <Typography variant="body2" color="text.secondary">
          Trip {formatDistance(view.distance_m)}
        </Typography>
        <Typography variant="body2">
          Delivery:{' '}
          <EntityLink href={getOrderDeliveryHref(order)} variant="body2">
            {getDeliveryStatusLabel(delivery?.status) || '—'}
          </EntityLink>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Payment: {paymentLabel || '—'}
        </Typography>

        {delivery?.rider ? (
          <>
            <Typography variant="subtitle2">Rider</Typography>
            <EntityLink href={getOrderRiderHref(order)}>{delivery.rider.name || 'Rider'}</EntityLink>
            {delivery.rider.phone ? (
              <Typography variant="body2" color="text.secondary">
                {delivery.rider.phone}
              </Typography>
            ) : null}
          </>
        ) : null}

        <Typography variant="subtitle2">Pickup</Typography>
        <EntityLink href={getOrderStoreHref(order)}>{store?.name || 'Store'}</EntityLink>
        <Typography variant="body2" color="text.secondary">
          {store?.address_text || '—'}
        </Typography>
        {pickupPhone ? (
          <Typography variant="body2" color="text.secondary">
            {pickupPhone}
          </Typography>
        ) : null}

        <Typography variant="subtitle2">Drop</Typography>
        <EntityLink href={getOrderCustomerHref(order)}>{order?.customer?.name || 'Customer'}</EntityLink>
        <Typography variant="body2">{drop}</Typography>
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
      </Stack>
    </MainCard>
  );
}
