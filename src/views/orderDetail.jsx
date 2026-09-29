'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
import Grid from '@mui/material/Grid2';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { actions as ordersPayments } from 'store/ordersPayments/slice';
import OrderCancelCard from 'sections/orders/OrderCancelCard';
import OrderRefundCard from 'sections/orders/OrderRefundCard';
import OrderRiderCard from 'sections/orders/OrderRiderCard';
import OrderInvoiceCard from 'sections/orders/OrderInvoiceCard';
import OrderTrackingPanel from 'sections/orders/OrderTrackingPanel';
import OrderCustomerParty from 'sections/orders/OrderCustomerParty';
import OrderStoreParty from 'sections/orders/OrderStoreParty';
import OrderRiderParty from 'sections/orders/OrderRiderParty';
import OrderCustomerPerspective from 'sections/orders/OrderCustomerPerspective';
import OrderSellerPerspective from 'sections/orders/OrderSellerPerspective';
import OrderRiderPerspective from 'sections/orders/OrderRiderPerspective';
import OrderTicketsCard from 'sections/orders/OrderTicketsCard';
import OrderTimeline from 'sections/orders/OrderTimeline';
import EntityLink from 'components/EntityLink';
import { formatOrderLabel, formatOrderNumberOnly } from 'utils/orderLabel';
import { formatINR } from 'utils/currency';
import { getOrderItemName, getOrderItemVariantLabel } from 'utils/orderDisplay';
import {
  getOrderItemProductHref,
  getOrderItemVariantHref,
  getOrderPaymentsHref
} from 'utils/orderLinks';
import {
  getDeliveryStatusLabel,
  getOrderPaymentStatusLabel,
  getOrderStatusLabel,
  statusChipColor
} from 'utils/orderStatusLabels';
import {
  buildAdminPartialOrderView,
  buildPartialAdjustedAlertLines,
  itemRemovalReasonLabel,
  sortOrderItemsForPartial
} from 'utils/partialOrderDisplay';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const shortId = (id) => (id ? String(id).slice(0, 8) : '—');

function StatusChip({ value, label }) {
  if (!value) return null;
  return (
    <Chip
      size="small"
      color={statusChipColor(value)}
      label={label || value}
      variant="light"
      title={value}
    />
  );
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
        { title: order ? formatOrderNumberOnly(order) : shortId(id), i18n: false }
      ]
    }),
    [id, order]
  );

  const handleActionDone = (message, variant = 'success') => {
    enqueueSnackbar(message, { variant });
    if (variant === 'success') refresh();
  };

  const items = sortOrderItemsForPartial(order?.order_items || []);
  const payments = order?.payments || [];
  const allRefunds = payments.flatMap((p) => p.Refunds || p.refunds || []);
  const partialView = useMemo(() => buildAdminPartialOrderView(order), [order]);
  const partialAlertLines = useMemo(
    () => buildPartialAdjustedAlertLines(partialView),
    [partialView]
  );
  const showStoreInvoice =
    Boolean(order?.store_invoice_url) || Boolean(order?.store_invoice_rejected_at);
  const hasRider = Boolean(order?.delivery?.rider);
  const showRefundsCard =
    allRefunds.length > 0
    || String(order?.status || '').toUpperCase() === 'CANCELLED'
    || Boolean(partialView?.deferredRefund);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />

      {detail.loading && <Alert severity="info">Loading order…</Alert>}

      {!detail.loading && order && (
        <Grid container spacing={2}>
          <Grid size={12}>
            <MainCard border={false} showTitle={false}>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                  <Stack spacing={0.5}>
                    <Typography variant="h5">{formatOrderLabel(order, { prefix: 'Order ' })}</Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                      {order.order_number != null ? `#${order.order_number} · ${order.id}` : order.id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Placed {formatDate(order.placed_at || order.created_at)}
                      {order.cancelled_at ? ` · Cancelled ${formatDate(order.cancelled_at)}` : ''}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <StatusChip value={order.status} label={getOrderStatusLabel(order.status)} />
                    <Chip
                      size="small"
                      variant="outlined"
                      color={statusChipColor(order.payment_status)}
                      label={getOrderPaymentStatusLabel(order)}
                      title={order.payment_status}
                    />
                    {order.delivery?.status ? (
                      <Chip
                        size="small"
                        variant="outlined"
                        color={statusChipColor(order.delivery.status)}
                        label={getDeliveryStatusLabel(order.delivery.status)}
                        title={order.delivery.status}
                      />
                    ) : null}
                    {partialView?.adjusted ? (
                      <Chip size="small" color="info" variant="light" label="Partial adjusted" />
                    ) : partialView?.allowPartial ? (
                      <Chip size="small" color="info" variant="outlined" label="Partial allowed" />
                    ) : null}
                  </Stack>
                </Stack>
                {partialAlertLines.length ? (
                  <Alert severity="info">
                    <Stack spacing={0.25}>
                      {partialAlertLines.map((line) => (
                        <Typography key={line} variant="body2">
                          {line}
                        </Typography>
                      ))}
                    </Stack>
                  </Alert>
                ) : null}
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: hasRider ? 4 : 6 }}>
            <OrderCustomerParty order={order} />
          </Grid>
          <Grid size={{ xs: 12, md: hasRider ? 4 : 6 }}>
            <OrderStoreParty order={order} />
          </Grid>
          {hasRider ? (
            <Grid size={{ xs: 12, md: 4 }}>
              <OrderRiderParty order={order} />
            </Grid>
          ) : null}

          <Grid size={{ xs: 12, md: 4 }}>
            <OrderCustomerPerspective order={order} onInvoiceMessage={handleActionDone} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <OrderSellerPerspective order={order} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <OrderRiderPerspective order={order} />
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <MainCard
              title={
                partialView?.adjusted && partialView.removedCount > 0
                  ? `Items · ${partialView.remainingCount} shipping · ${partialView.removedCount} unavailable`
                  : 'Items'
              }
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Variant</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit</TableCell>
                    <TableCell align="right">Line total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => {
                    const removed = Boolean(item.removed_at);
                    const reason = itemRemovalReasonLabel(item);
                    return (
                      <TableRow
                        key={item.id}
                        sx={removed ? { opacity: 0.55, bgcolor: 'action.hover' } : undefined}
                      >
                        <TableCell>
                          <Stack spacing={0.5}>
                            <EntityLink href={getOrderItemProductHref(item)}>
                              {getOrderItemName(item)}
                            </EntityLink>
                            {removed ? (
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                <Chip size="small" color="warning" variant="light" label="Unavailable" />
                                {reason ? (
                                  <Typography variant="caption" color="text.secondary">
                                    {reason}
                                  </Typography>
                                ) : null}
                              </Stack>
                            ) : null}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <EntityLink href={getOrderItemVariantHref(item)}>
                            {getOrderItemVariantLabel(item) || '—'}
                          </EntityLink>
                        </TableCell>
                        <TableCell>{item.store_variant?.product_variant?.sku || '—'}</TableCell>
                        <TableCell align="right">{item.qty}</TableCell>
                        <TableCell align="right">{formatINR(item.price_cents)}</TableCell>
                        <TableCell align="right">{formatINR(item.total_cents)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {!items.length && (
                    <TableRow>
                      <TableCell colSpan={6}>
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

          <Grid size={{ xs: 12, md: 5 }}>
            <OrderTrackingPanel order={order} />
          </Grid>

          <Grid size={{ xs: 12, md: showStoreInvoice ? 6 : 12 }}>
            <MainCard
              title="Payments"
              secondary={
                <EntityLink href={getOrderPaymentsHref(order)} variant="caption">
                  Open payments
                </EntityLink>
              }
            >
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

          {showStoreInvoice ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <OrderInvoiceCard order={order} onSuccess={handleActionDone} />
            </Grid>
          ) : null}

          {showRefundsCard ? (
            <Grid size={12}>
              <OrderRefundCard order={order} refunds={allRefunds} />
            </Grid>
          ) : null}

          <Grid size={12}>
            <OrderTimeline order={order} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <OrderRiderCard order={order} onSuccess={handleActionDone} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <OrderCancelCard order={order} onSuccess={handleActionDone} />
          </Grid>
          <Grid size={12}>
            <OrderTicketsCard orderId={order.id} />
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
