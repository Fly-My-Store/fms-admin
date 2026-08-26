'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { approvePromotion, getPromotion, rejectPromotion } from 'api/promotions';
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

export default function PromotionDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);

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

            <Typography variant="subtitle1">Targets</Typography>
            {row.targets?.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Target ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.targets.map((t) => (
                    <TableRow key={`${t.target_type}-${t.target_id}`}>
                      <TableCell>{getPromotionTargetTypeLabel(t.target_type)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>
                          {t.target_id}
                        </Typography>
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
