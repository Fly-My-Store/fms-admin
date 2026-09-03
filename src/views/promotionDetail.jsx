'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { approvePromotion, getPromotion, listPromotionRedemptions, rejectPromotion } from 'api/promotions';
import {
  getPromotionFundingLabel,
  getPromotionStatusChipColor,
  getPromotionStatusLabel,
  getPromotionTargetTypeLabel,
  getPromotionVisibilityLabel
} from 'utils/promotionLabels';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

function formatINRFromCents(cents) {
  if (cents == null || cents === '') return '—';
  return `₹${(Number(cents) / 100).toFixed(2)}`;
}

function formatDiscount(row) {
  if (!row) return '—';
  if (row.discount_type === 'FLAT') return formatINRFromCents(row.discount_value);
  if (row.discount_type === 'FREE_DELIVERY') return 'Free delivery (+ km)';
  return `${row.discount_value}%`;
}

function Field({ label, value, mono = false }) {
  const isPrimitive = value === null || value === undefined || typeof value === 'string' || typeof value === 'number';
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      {isPrimitive ? (
        <Typography
          variant="body2"
          sx={{ fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined, wordBreak: 'break-word' }}
        >
          {safe(value)}
        </Typography>
      ) : (
        value
      )}
    </Stack>
  );
}

export default function PromotionDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redemptionRows, setRedemptionRows] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);

  const loadRedemptions = useCallback(async (page = 0) => {
      if (!id) return;
      setRedemptionsLoading(true);
      try {
        const res = await listPromotionRedemptions(id, { page: page + 1, limit: 20 });
        setRedemptionRows(res?.data || []);
        setTotalPages(res?.meta?.totalPages ?? 1);
        setTotalCount(res?.meta?.total ?? 0);
      } catch (e) {
        enqueueSnackbar(e?.response?.data?.message || 'Failed to load redemptions', { variant: 'error' });
      } finally {
        setRedemptionsLoading(false);
      }
    },
    [id]
  );

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getPromotion(id);
      setRow(res?.data || res);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e.message || 'Failed to load', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (id) loadRedemptions(pageIndex);
  }, [id, pageIndex, loadRedemptions]);

  const usage = row?.usage || {};
  const ordersToShow = redemptionRows.length ? redemptionRows : usage.redemptions || [];
  const ordersTotal = totalCount || usage.total_applied || 0;

  const breadcrumb = useMemo(
    () => ({
      heading: 'promotion',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'promotions', to: '/promotions' },
        { title: row?.code || id || 'detail', i18n: false }
      ]
    }),
    [row?.code, id]
  );

  const onApprove = async () => {
    try {
      await approvePromotion(id);
      enqueueSnackbar('Approved', { variant: 'success' });
      load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Approve failed', { variant: 'error' });
    }
  };

  const onReject = async () => {
    const reason = window.prompt('Rejection reason (optional)') || '';
    try {
      await rejectPromotion(id, { reason });
      enqueueSnackbar('Rejected', { variant: 'success' });
      load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Reject failed', { variant: 'error' });
    }
  };

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard
        border={false}
        boxShadow
        secondary={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {row?.status === 'PENDING_APPROVAL' ? (
              <>
                <Button size="small" variant="contained" onClick={onApprove}>
                  Approve
                </Button>
                <Button size="small" color="warning" variant="outlined" onClick={onReject}>
                  Reject
                </Button>
              </>
            ) : null}
            <Button size="small" variant="outlined" onClick={() => router.push(`/promotions/edit/${id}`)}>
              Edit
            </Button>
          </Stack>
        }
      >
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : !row ? (
          <Typography color="text.secondary">Promotion not found.</Typography>
        ) : (
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={getPromotionStatusLabel(row.status)}
                color={getPromotionStatusChipColor(row.status)}
              />
              <Chip size="small" variant="outlined" label={getPromotionFundingLabel(row.funding)} />
              <Chip size="small" variant="outlined" label={getPromotionVisibilityLabel(row.visibility)} />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Stack flex={1} spacing={2}>
                <Field label="Code" value={row.code} mono />
                <Field label="Title" value={row.title} />
                <Field label="Description" value={row.description} />
                <Field label="Store" value={row.store?.name || (row.store_id ? row.store_id : 'App-wide')} />
                <Field label="Channel" value={row.channel} />
                <Field
                  label="Campaign"
                  value={
                    row.campaign?.id ? (
                      <Typography
                        component={Link}
                        href={`/promotion-campaigns/${row.campaign.id}`}
                        variant="body2"
                        sx={{ color: 'primary.main', textDecoration: 'none' }}
                      >
                        {row.campaign.name}
                      </Typography>
                    ) : (
                      '—'
                    )
                  }
                />
              </Stack>
              <Stack flex={1} spacing={2}>
                <Field label="Discount" value={formatDiscount(row)} />
                <Field label="Max discount cap" value={formatINRFromCents(row.max_discount_cents)} />
                <Field label="Min cart" value={formatINRFromCents(row.min_cart_cents)} />
                <Field
                  label="Usage limits"
                  value={`Total: ${row.max_total_uses ?? '∞'} · Per user: ${row.max_uses_per_user ?? '∞'}`}
                />
              </Stack>
              <Stack flex={1} spacing={2}>
                <Field label="Starts at" value={row.starts_at ? new Date(row.starts_at).toLocaleString() : '—'} />
                <Field label="Ends at" value={row.ends_at ? new Date(row.ends_at).toLocaleString() : '—'} />
                <Field label="Rejection reason" value={row.rejection_reason} />
                <Field label="ID" value={row.id} mono />
              </Stack>
            </Stack>

            <Divider />

            <Typography variant="subtitle1">Usage</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Field label="Total uses" value={usage.total_applied ?? 0} />
              <Field label="Unique customers" value={usage.unique_users ?? 0} />
              <Field label="Total discount given" value={formatINRFromCents(usage.total_discount_cents)} />
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Orders</Typography>
              <Typography variant="caption" color="text.secondary">
                {ordersTotal} redemption{ordersTotal === 1 ? '' : 's'}
              </Typography>
            </Stack>
            {redemptionsLoading && !ordersToShow.length ? (
              <Stack alignItems="center" sx={{ py: 2 }}>
                <CircularProgress size={22} />
              </Stack>
            ) : ordersToShow.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Discount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ordersToShow.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell>
                        {r.order?.id ? (
                          <Typography
                            component={Link}
                            href={`/orders/${r.order.id}`}
                            variant="body2"
                            sx={{ color: 'primary.main', textDecoration: 'none' }}
                          >
                            {r.order.order_number || r.order.id.slice(0, 8)}
                          </Typography>
                        ) : (
                          r.order_id?.slice?.(0, 8) || '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {r.user?.name || r.user?.phone || r.user_id?.slice?.(0, 8) || '—'}
                      </TableCell>
                      <TableCell align="right">{formatINRFromCents(r.discount_cents)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No redemptions yet.
              </Typography>
            )}
            {totalPages > 1 ? (
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  size="small"
                  disabled={pageIndex <= 0 || redemptionsLoading}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  disabled={pageIndex >= totalPages - 1 || redemptionsLoading}
                  onClick={() => setPageIndex((p) => p + 1)}
                >
                  Next
                </Button>
              </Stack>
            ) : null}

            <Divider />

            <Typography variant="subtitle1">Targets</Typography>
            {row.targets?.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Target</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.targets.map((t) => (
                    <TableRow key={`${t.target_type}-${t.target_id}`}>
                      <TableCell>{getPromotionTargetTypeLabel(t.target_type)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{t.label || t.target_id}</Typography>
                        {t.label ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
                          >
                            {t.target_id}
                          </Typography>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No targets — applies to all eligible items in scope.
              </Typography>
            )}
          </Stack>
        )}
      </MainCard>
    </>
  );
}
