'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { enqueueSnackbar } from 'notistack';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import {
  cancelPushBroadcast,
  getPushBroadcast,
  queuePushBroadcast,
  resendPushBroadcast
} from 'api/pushBroadcasts';
import {
  getPushBroadcastActionLabel,
  getPushBroadcastAudienceLabel,
  getPushBroadcastStatusChipColor,
  getPushBroadcastStatusLabel,
  getPushBroadcastTemplateLabel
} from 'utils/pushBroadcastLabels';

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res;
}

function canResendStatus(status) {
  return ['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(status);
}

function KV({ label, value }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {value ?? '—'}
      </Typography>
    </Stack>
  );
}

function fmtBool(v) {
  return v ? 'Yes' : 'No';
}

function formatFilterRows(filters = {}) {
  const f = filters && typeof filters === 'object' ? filters : {};
  const rows = [];

  const push = (label, value, { skipEmpty = true } = {}) => {
    if (skipEmpty && (value == null || value === '' || (Array.isArray(value) && !value.length))) return;
    rows.push({ label, value: Array.isArray(value) ? value.join(', ') : String(value) });
  };

  if (Array.isArray(f.user_ids) && f.user_ids.length) {
    push('Target mode', 'Single / listed users', { skipEmpty: false });
    push('User IDs', f.user_ids.join(', '), { skipEmpty: false });
  } else {
    push('Target mode', 'Segment', { skipEmpty: false });
  }

  if (f.name_missing) push('Name missing', 'Yes', { skipEmpty: false });
  if (f.email_missing) push('Email missing', 'Yes', { skipEmpty: false });
  push('Require push token', fmtBool(f.require_push_token !== false), { skipEmpty: false });
  push('Account status', f.status);
  push('Last login before (days)', f.last_login_before_days);

  if (f.near_lat != null && f.near_lng != null && f.near_radius_km != null) {
    push('Location', `${f.near_lat}, ${f.near_lng} within ${f.near_radius_km} km`, { skipEmpty: false });
  }

  if (f.store_not_created) push('Store not created', 'Yes', { skipEmpty: false });
  if (f.seller_data_missing) push('Seller data missing', 'Yes', { skipEmpty: false });
  if (f.store_data_missing) push('Store data missing', 'Yes', { skipEmpty: false });
  if (f.docs_missing) push('Docs missing', 'Yes', { skipEmpty: false });
  push('Onboarding incomplete (days)', f.onboarding_incomplete_days);
  push('No variants (days)', f.no_variants_days);
  push('KYC status', f.kyc_status);
  if (f.kyc_status_in?.length) push('KYC status in', f.kyc_status_in);
  push('KYB status', f.kyb_status);
  if (f.rider_docs_missing) push('Rider docs missing', 'Yes', { skipEmpty: false });

  return rows;
}

export default function PushBroadcastDetailView() {
  const router = useRouter();
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = unwrap(await getPushBroadcast(id));
      setRow(data);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Failed to load', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const templateLabel = useMemo(() => {
    return getPushBroadcastTemplateLabel(row?.template_key);
  }, [row?.template_key]);

  const filterRows = useMemo(() => formatFilterRows(row?.filters_json), [row?.filters_json]);

  const handleQueue = async () => {
    setBusy(true);
    try {
      const data = unwrap(await queuePushBroadcast(id));
      setRow(data);
      enqueueSnackbar('Queued for sending', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Queue failed', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      const data = unwrap(await cancelPushBroadcast(id));
      setRow(data);
      enqueueSnackbar('Cancelled', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Cancel failed', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    const targeted = row?.summary_json?.targeted;
    const confirmMsg =
      targeted != null
        ? `Resend "${row.title}" as a new broadcast (same audience filters; last run targeted ~${targeted})?`
        : `Resend "${row.title}" as a new broadcast with the same filters?`;
    if (!window.confirm(confirmMsg)) return;

    setBusy(true);
    try {
      const data = unwrap(await resendPushBroadcast(id));
      enqueueSnackbar('Resend queued', { variant: 'success' });
      if (data?.id) router.push(`/push-broadcasts/${data.id}`);
      else load();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Resend failed', { variant: 'error' });
    } finally {
      setBusy(false);
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
    return <Typography>Broadcast not found</Typography>;
  }

  const summary = row.summary_json || {};
  const canEdit = row.status === 'DRAFT' || row.status === 'FAILED';
  const canQueue = ['DRAFT', 'FAILED', 'CANCELLED'].includes(row.status);
  const canCancel = ['DRAFT', 'QUEUED'].includes(row.status);
  const canResend = canResendStatus(row.status);
  const action = getPushBroadcastActionLabel(row.data_json?.action, row.data_json?.deeplink);
  const deeplink = row.data_json?.deeplink || null;

  return (
    <>
      <Breadcrumbs
        custom
        heading="push-broadcast"
        links={[
          { title: 'home', to: '/dashboard' },
          { title: 'push-broadcasts', to: '/push-broadcasts' },
          { title: row.title || id || 'detail', i18n: false }
        ]}
      />

      <Stack spacing={2}>
        <MainCard
          title="Message"
          secondary={
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={getPushBroadcastStatusLabel(row.status)}
                color={getPushBroadcastStatusChipColor(row.status)}
              />
              <Button size="small" variant="outlined" onClick={load} disabled={busy || loading}>
                Reload
              </Button>
              {canEdit && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => router.push(`/push-broadcasts/edit/${id}`)}
                >
                  Edit
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={() => router.push(`/push-broadcasts/create?duplicate=${id}`)}
              >
                Duplicate
              </Button>
              {canResend && (
                <Button size="small" variant="outlined" color="warning" onClick={handleResend} disabled={busy}>
                  Resend
                </Button>
              )}
              {canQueue && (
                <Button size="small" variant="contained" onClick={handleQueue} disabled={busy}>
                  Queue send
                </Button>
              )}
              {canCancel && (
                <Button size="small" color="inherit" onClick={handleCancel} disabled={busy}>
                  Cancel
                </Button>
              )}
            </Stack>
          }
        >
          <Grid container spacing={2} alignItems="stretch">
            <Grid size={{ xs: 12, md: 3 }}>
              <Stack spacing={1.5}>
                <KV label="Audience" value={getPushBroadcastAudienceLabel(row.audience)} />
                <KV label="Template" value={templateLabel} />
                <KV
                  label="Schedule"
                  value={row.scheduled_at ? new Date(row.scheduled_at).toLocaleString() : 'Immediate'}
                />
                <KV
                  label="Created by"
                  value={row.creator?.name || row.creator?.email || row.creator?.phone || '—'}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={1.5} sx={{ height: '100%' }}>
                <KV label="Title" value={row.title} />
                <KV label="Body" value={row.body || '—'} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Notification image
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '2 / 1',
                    borderRadius: 1,
                    overflow: 'hidden',
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {row.image_url ? (
                    <Box
                      component="img"
                      src={row.image_url}
                      alt={row.title || 'Push image'}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No image
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Grid>
          </Grid>
          {row.error_message ? (
            <Box sx={{ mt: 2 }}>
              <KV label="Error" value={row.error_message} />
            </Box>
          ) : null}
        </MainCard>

        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, md: 7 }}>
            <MainCard title="Who receives it" sx={{ height: '100%' }}>
              {filterRows.length ? (
                <Grid container spacing={1.5}>
                  {filterRows.map((item) => (
                    <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                      <KV label={item.label} value={item.value} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No filters
                </Typography>
              )}
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <MainCard title="Tap action">
                <Stack spacing={1.5}>
                  <KV label="Opens" value={action} />
                  {deeplink ? <KV label="Deeplink" value={deeplink} /> : null}
                </Stack>
              </MainCard>

              <MainCard title="Delivery">
                <Grid container spacing={1.5}>
                  <Grid size={6}>
                    <KV label="Targeted" value={summary.targeted ?? 0} />
                  </Grid>
                  <Grid size={6}>
                    <KV label="Sent" value={summary.sent ?? 0} />
                  </Grid>
                  <Grid size={6}>
                    <KV label="Failed" value={summary.failed ?? 0} />
                  </Grid>
                  <Grid size={6}>
                    <KV label="No token" value={summary.no_token ?? 0} />
                  </Grid>
                  <Grid size={12}>
                    <KV label="Progress offset" value={row.progress_offset ?? 0} />
                  </Grid>
                  <Grid size={12}>
                    <KV
                      label="Started"
                      value={row.started_at ? new Date(row.started_at).toLocaleString() : '—'}
                    />
                  </Grid>
                  <Grid size={12}>
                    <KV
                      label="Finished"
                      value={row.finished_at ? new Date(row.finished_at).toLocaleString() : '—'}
                    />
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}
