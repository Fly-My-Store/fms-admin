'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
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
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import { getPromotionCampaign } from 'api/promotionCampaigns';
import {
  formatINRFromCents,
  getPromotionCampaignStatusChipColor,
  getPromotionCampaignStatusLabel,
  getPromotionCampaignTypeLabel
} from 'utils/promotionCampaignLabels';
import { getPromotionStatusChipColor, getPromotionStatusLabel } from 'utils/promotionLabels';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

function Field({ label, value, mono = false }) {
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined, wordBreak: 'break-word' }}
      >
        {safe(value)}
      </Typography>
    </Stack>
  );
}

function formatDiscount(row) {
  if (!row) return '—';
  if (row.discount_type === 'FLAT') return formatINRFromCents(row.discount_value);
  if (row.discount_type === 'FREE_DELIVERY') return 'Free delivery';
  return `${row.discount_value}%`;
}

export default function PromotionCampaignDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    rows: redemptionRows,
    totalPages,
    totalCount,
    load: loadRedemptions,
    setPageIndex,
    pageIndex
  } = useAxiosPaginatedList(`admin/promotion-campaigns/${id}/redemptions`, {
    errorMessage: 'Failed to load redemptions',
    autoLoad: false
  });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getPromotionCampaign(id);
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
    if (id) loadRedemptions();
  }, [id, loadRedemptions]);

  const stats = row?.stats || {};
  const budget = stats.budget_cents;
  const spent = stats.spent_cents ?? 0;
  const budgetPct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  const breadcrumb = useMemo(
    () => ({
      heading: 'campaign',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'campaigns', to: '/promotion-campaigns' },
        { title: row?.name || id || 'detail', i18n: false }
      ]
    }),
    [row?.name, id]
  );

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard
        border={false}
        boxShadow
        secondary={
          <Button size="small" variant="outlined" onClick={() => router.push(`/promotion-campaigns/edit/${id}`)}>
            Edit
          </Button>
        }
      >
        {loading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : !row ? (
          <Typography color="text.secondary">Campaign not found.</Typography>
        ) : (
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={getPromotionCampaignStatusLabel(row.status)}
                color={getPromotionCampaignStatusChipColor(row.status)}
              />
              <Chip size="small" variant="outlined" label={getPromotionCampaignTypeLabel(row.type)} />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Stack flex={1} spacing={2}>
                <Field label="Name" value={row.name} />
                <Field label="Slug" value={row.slug} mono />
                <Field label="Description" value={row.description} />
                <Field label="Store" value={row.store?.name || (row.store_id ? row.store_id : 'App-wide')} />
              </Stack>
              <Stack flex={1} spacing={2}>
                <Field label="Starts at" value={row.starts_at ? new Date(row.starts_at).toLocaleString() : '—'} />
                <Field label="Ends at" value={row.ends_at ? new Date(row.ends_at).toLocaleString() : '—'} />
                <Field
                  label="Usage"
                  value={`${stats.total_redemptions ?? 0} redemptions · ${stats.unique_users ?? 0} customers`}
                />
                <Field
                  label="Max total uses"
                  value={row.max_total_uses != null ? row.max_total_uses : '∞'}
                />
                <Field
                  label="Max uses per customer"
                  value={row.max_uses_per_user != null ? row.max_uses_per_user : '∞'}
                />
              </Stack>
              <Stack flex={1} spacing={2}>
                <Field label="Budget spent" value={formatINRFromCents(spent)} />
                <Field
                  label="Budget"
                  value={budget != null ? formatINRFromCents(budget) : 'No cap'}
                />
                {budget != null ? (
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Budget used ({budgetPct}%)
                    </Typography>
                    <LinearProgress variant="determinate" value={budgetPct} sx={{ height: 8, borderRadius: 1 }} />
                    <Typography variant="body2">
                      Remaining: {formatINRFromCents(stats.remaining_cents)}
                    </Typography>
                  </Stack>
                ) : null}
              </Stack>
            </Stack>

            <Divider />

            <Typography variant="subtitle1">Member codes</Typography>
            {row.promotions?.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Channel</TableCell>
                    <TableCell>Discount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Uses</TableCell>
                    <TableCell align="right">Discount given</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.promotions.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography
                          component={Link}
                          href={`/promotions/${p.id}`}
                          variant="body2"
                          sx={{ color: 'primary.main', textDecoration: 'none', fontFamily: 'ui-monospace, Menlo, monospace' }}
                        >
                          {p.code}
                        </Typography>
                      </TableCell>
                      <TableCell>{p.title}</TableCell>
                      <TableCell>{p.channel || '—'}</TableCell>
                      <TableCell>{formatDiscount(p)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={getPromotionStatusLabel(p.status)}
                          color={getPromotionStatusChipColor(p.status)}
                        />
                      </TableCell>
                      <TableCell align="right">{p.total_applied ?? 0}</TableCell>
                      <TableCell align="right">{formatINRFromCents(p.total_discount_cents)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No codes attached yet.
              </Typography>
            )}

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Redemptions</Typography>
              <Typography variant="caption" color="text.secondary">
                {totalCount} total
              </Typography>
            </Stack>
            {redemptionRows?.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Discount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {redemptionRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>
                          {r.promotion?.code || '—'}
                        </Typography>
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
                          '—'
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
                  disabled={pageIndex <= 0}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  disabled={pageIndex >= totalPages - 1}
                  onClick={() => setPageIndex((p) => p + 1)}
                >
                  Next
                </Button>
              </Stack>
            ) : null}
          </Stack>
        )}
      </MainCard>
    </>
  );
}
