'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Alert,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { actions as ordersPayments } from 'store/ordersPayments/slice';
import OrderCancelCard from 'sections/orders/OrderCancelCard';
import OrderRefundCard from 'sections/orders/OrderRefundCard';
import OrderRiderCard from 'sections/orders/OrderRiderCard';
import OrderInvoiceCard from 'sections/orders/OrderInvoiceCard';
import OrderTrackingPanel from 'sections/orders/OrderTrackingPanel';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const formatINR = (cents) => {
  const n = Number(cents);
  if (!Number.isFinite(n)) return '—';
  return `₹${(n / 100).toFixed(2)}`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const shortId = (id) => (id ? String(id).slice(0, 8) : '—');

const KV = ({ label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="baseline">
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
      {label}
    </Typography>
    <Typography variant="body2">{safe(value)}</Typography>
  </Stack>
);

function StatusChip({ value }) {
  if (!value) return null;
  const color =
    value === 'DELIVERED' || value === 'SUCCESS'
      ? 'success'
      : value === 'CANCELLED' || value === 'FAILED' || value === 'REFUNDED'
        ? 'error'
        : 'default';
  return <Chip size="small" color={color} label={value} variant="light" />;
}

export default function OrderDetailView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { ordersDetail } = useSelector((s) => s.ordersPayments || {});
  const detail = ordersDetail || { data: null, loading: false, error: null };
  const order = detail.data;

  const refresh = useCallback(() => {
    if (!id) return;
    dispatch(ordersPayments.ordersGetRequest({ params: { id } }));
  }, [dispatch, id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (detail.error) enqueueSnackbar(detail.error, { variant: 'error' });
  }, [detail.error]);

  const breadcrumb = useMemo(
    () => ({
      heading: 'order',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'orders', to: '/orders' },
        { title: shortId(id), i18n: false }
      ]
    }),
    [id]
  );

  const handleActionDone = (message, variant = 'success') => {
    enqueueSnackbar(message, { variant });
    if (variant === 'success') refresh();
  };

  const items = order?.order_items || [];
  const payments = order?.payments || [];
  const events = order?.OrderEvents || order?.order_events || [];
  const allRefunds = payments.flatMap((p) => p.Refunds || p.refunds || []);

  const productName = (item) =>
    item?.store_variant?.product_variant?.product?.name ||
    item?.store_variant?.product_variant?.sku ||
    'Item';

  const addressLine = order?.delivery_address
    ? [
        order.delivery_address.line1,
        order.delivery_address.line2,
        order.delivery_address.city,
        order.delivery_address.state,
        order.delivery_address.postal_code
      ]
        .filter(Boolean)
        .join(', ')
    : '—';

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />

      {detail.loading && <Alert severity="info">Loading order…</Alert>}

      {!detail.loading && order && (
        <Grid container spacing={2}>
          <Grid size={12}>
            <MainCard border={false} boxShadow>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Stack spacing={0.5}>
                  <Typography variant="h5">Order {shortId(order.id)}</Typography>
                  <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                    {order.id}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <StatusChip value={order.status} />
                  <Chip size="small" variant="outlined" label={`Payment: ${order.payment_status}`} />
                  {order.delivery?.status && (
                    <Chip size="small" variant="outlined" label={`Delivery: ${order.delivery.status}`} />
                  )}
                </Stack>
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Customer">
              <Stack spacing={1}>
                <KV label="Name" value={order.customer?.name} />
                <KV label="Phone" value={order.customer?.phone} />
                <KV label="Email" value={order.customer?.email} />
                {order.customer?.id && (
                  <Typography variant="caption" color="text.secondary">
                    User ID: {order.customer.id}
                  </Typography>
                )}
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Store & delivery">
              <Stack spacing={1}>
                <KV label="Store" value={order.store?.name} />
                <KV label="Store address" value={order.store?.address_text} />
                <KV label="Deliver to" value={addressLine} />
                <KV label="Instructions" value={order.delivery_instructions} />
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <MainCard title="Items">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit</TableCell>
                    <TableCell align="right">Line total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{productName(item)}</TableCell>
                      <TableCell>{item.store_variant?.product_variant?.sku || '—'}</TableCell>
                      <TableCell align="right">{item.qty}</TableCell>
                      <TableCell align="right">{formatINR(item.price_cents)}</TableCell>
                      <TableCell align="right">{formatINR(item.total_cents)}</TableCell>
                    </TableRow>
                  ))}
                  {!items.length && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">
                          No items
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <MainCard title="Totals">
              <Stack spacing={1}>
                <KV label="Items" value={formatINR(order.items_total_cents)} />
                <KV label="Rider share" value={formatINR(order.rider_share_cents)} />
                <KV label="Discount" value={formatINR(order.discount_cents)} />
                <Divider />
                <KV label="Total" value={formatINR(order.total_cents)} />
                <KV label="Placed" value={formatDate(order.placed_at || order.created_at)} />
                {order.cancelled_at ? (
                  <KV label="Cancelled" value={formatDate(order.cancelled_at)} />
                ) : null}
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Delivery">
              <Stack spacing={1}>
                <KV label="Rider" value={order.delivery?.rider?.name || 'Unassigned'} />
                <KV label="Rider phone" value={order.delivery?.rider?.phone} />
                <KV label="Distance" value={order.delivery?.distance_m != null ? `${order.delivery.distance_m} m` : '—'} />
                <KV label="ETA" value={order.delivery?.eta_seconds != null ? `${Math.round(order.delivery.eta_seconds / 60)} min` : '—'} />
                <KV label="Started" value={formatDate(order.delivery?.started_at)} />
                <KV label="Picked up" value={formatDate(order.delivery?.picked_up_at)} />
                <KV label="Delivered" value={formatDate(order.delivery?.delivered_at)} />
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Payments">
              {payments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No payments
                </Typography>
              ) : (
                payments.map((p) => (
                  <Stack key={p.id} spacing={0.5} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                      {p.gateway} · {p.status} · {formatINR(p.amount_cents)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.gateway_payment_id || p.gateway_order_id || p.id}
                    </Typography>
                  </Stack>
                ))
              )}
            </MainCard>
          </Grid>

          {allRefunds.length > 0 || String(order?.status || '').toUpperCase() === 'CANCELLED' ? (
            <Grid size={12}>
              <OrderRefundCard order={order} refunds={allRefunds} />
            </Grid>
          ) : null}

          <Grid size={12}>
            <MainCard title="Timeline">
              <Stack spacing={1.5}>
                {events.map((ev) => (
                  <Stack key={ev.id} direction="row" spacing={2} alignItems="flex-start">
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140 }}>
                      {formatDate(ev.created_at)}
                    </Typography>
                    <Chip size="small" label={ev.type} variant="light" />
                    {ev.payload && (
                      <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                        {JSON.stringify(ev.payload)}
                      </Typography>
                    )}
                  </Stack>
                ))}
                {!events.length && (
                  <Typography variant="body2" color="text.secondary">
                    No events yet
                  </Typography>
                )}
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <OrderCancelCard order={order} onSuccess={handleActionDone} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <OrderRiderCard order={order} onSuccess={handleActionDone} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <OrderInvoiceCard order={order} onSuccess={handleActionDone} />
          </Grid>
          <Grid size={12}>
            <OrderTrackingPanel orderId={order.id} deliveryStatus={order.delivery?.status} />
          </Grid>
        </Grid>
      )}

      {!detail.loading && !order && !detail.error && (
        <Alert severity="warning">
          Order not found.{' '}
          <Link href="/orders">Back to orders</Link>
        </Alert>
      )}
    </>
  );
}
