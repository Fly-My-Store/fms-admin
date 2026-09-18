'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { approveSurge, disableSurge, enableSurge, getSurge, rejectSurge } from 'api/surges';
import { formatDateTimeDdMmYyyy } from 'utils/dateFormat';
import {
  SURGE_BENEFICIARY_LABELS,
  SURGE_SCOPE_LABELS,
  SURGE_TYPE_LABELS,
  formatSurgeActiveDays,
  formatSurgeAmount,
  formatSurgeDailyHours,
  getSurgeStatusChipColor,
  getSurgeStatusLabel
} from 'utils/surgeLabels';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

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

export default function SurgeDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getSurge(id);
      setRow(res?.data || res);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to load surge', { variant: 'error' });
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const breadcrumb = useMemo(
    () => ({
      heading: 'surge',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'surges', to: '/surges' },
        { title: row?.title || id, i18n: false }
      ]
    }),
    [id, row?.title]
  );

  const onApprove = async () => {
    setActing(true);
    try {
      await approveSurge(id);
      enqueueSnackbar('Surge approved', { variant: 'success' });
      load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Approve failed', { variant: 'error' });
    } finally {
      setActing(false);
    }
  };

  const onEnable = async () => {
    setActing(true);
    try {
      await enableSurge(id);
      enqueueSnackbar('Surge enabled', { variant: 'success' });
      load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Enable failed', { variant: 'error' });
    } finally {
      setActing(false);
    }
  };

  const onDisable = async () => {
    setActing(true);
    try {
      await disableSurge(id);
      enqueueSnackbar('Surge paused', { variant: 'success' });
      load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Pause failed', { variant: 'error' });
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <Stack alignItems="center" py={6}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!row) {
    return (
      <>
        <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
        <Typography>Surge not found.</Typography>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button component={Link} href={`/surges/edit/${id}`} variant="contained">
            Edit
          </Button>
          {row.status === 'PENDING_APPROVAL' ? (
            <>
              <Button variant="outlined" onClick={onApprove} disabled={acting}>
                Approve
              </Button>
              <Button variant="outlined" color="warning" onClick={() => setRejectOpen(true)} disabled={acting}>
                Reject
              </Button>
            </>
          ) : null}
          {row.status === 'PAUSED' ? (
            <Button variant="outlined" onClick={onEnable} disabled={acting}>
              Enable
            </Button>
          ) : null}
          {row.status === 'ACTIVE' ? (
            <Button variant="outlined" color="warning" onClick={onDisable} disabled={acting}>
              Pause
            </Button>
          ) : null}
          <Button variant="text" onClick={() => router.push('/surges')}>
            Back to list
          </Button>
        </Stack>

        <MainCard title={row.title || 'Surge'}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} useFlexGap flexWrap="wrap">
              <Field
                label="Status"
                value={
                  <Chip
                    size="small"
                    label={getSurgeStatusLabel(row.status)}
                    color={getSurgeStatusChipColor(row.status)}
                  />
                }
              />
              <Field label="Amount" value={formatSurgeAmount(row)} />
              <Field label="Type" value={SURGE_TYPE_LABELS[row.surge_type] || row.surge_type} />
              <Field
                label="Max surge"
                value={
                  row.surge_type === 'PERCENT' && row.max_surge_cents != null
                    ? `₹${(Number(row.max_surge_cents) / 100).toFixed(2)}`
                    : '—'
                }
              />
              <Field
                label="Max cart"
                value={
                  row.max_cart_cents != null
                    ? `Under ₹${(Number(row.max_cart_cents) / 100).toFixed(2)}`
                    : '—'
                }
              />
              <Field label="Scope" value={SURGE_SCOPE_LABELS[row.scope] || row.scope} />
              <Field
                label="Beneficiary"
                value={SURGE_BENEFICIARY_LABELS[row.surge_beneficiary] || row.surge_beneficiary}
              />
              <Field
                label="Store"
                value={row.store?.name || (row.store_id ? String(row.store_id) : 'App-wide')}
              />
              <Field label="Starts" value={row.starts_at ? formatDateTimeDdMmYyyy(row.starts_at) : '—'} />
              <Field label="Ends" value={row.ends_at ? formatDateTimeDdMmYyyy(row.ends_at) : '—'} />
              <Field label="Active days" value={formatSurgeActiveDays(row.active_days)} />
              <Field label="Hours" value={formatSurgeDailyHours(row.start_time, row.end_time)} />
            </Stack>
            {row.description ? <Field label="Customer message" value={row.description} /> : null}
            {row.status === 'REJECTED' && row.rejection_reason ? (
              <Field label="Rejection reason" value={row.rejection_reason} />
            ) : null}
          </Stack>
        </MainCard>

        {Array.isArray(row.targets) && row.targets.length ? (
          <MainCard title="Targets">
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
                    <TableCell>{t.target_type}</TableCell>
                    <TableCell>{t.label || t.target_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </MainCard>
        ) : null}
      </Stack>

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reject surge</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button
            color="warning"
            variant="contained"
            disabled={acting}
            onClick={async () => {
              setActing(true);
              try {
                await rejectSurge(id, { reason: rejectReason });
                setRejectOpen(false);
                setRejectReason('');
                enqueueSnackbar('Surge rejected', { variant: 'success' });
                load();
              } catch (e) {
                enqueueSnackbar(e?.response?.data?.message || 'Reject failed', { variant: 'error' });
              } finally {
                setActing(false);
              }
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
