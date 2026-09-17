'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Chip,
  CircularProgress,
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
import { disableSurge, enableSurge, getSurge } from 'api/surges';
import {
  SURGE_BENEFICIARY_LABELS,
  SURGE_SCOPE_LABELS,
  SURGE_TYPE_LABELS,
  formatSurgeAmount,
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
          {row.status !== 'ACTIVE' ? (
            <Button variant="outlined" onClick={onEnable} disabled={acting}>
              Enable
            </Button>
          ) : (
            <Button variant="outlined" color="warning" onClick={onDisable} disabled={acting}>
              Pause
            </Button>
          )}
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
              <Field label="Scope" value={SURGE_SCOPE_LABELS[row.scope] || row.scope} />
              <Field
                label="Beneficiary"
                value={SURGE_BENEFICIARY_LABELS[row.surge_beneficiary] || row.surge_beneficiary}
              />
              <Field
                label="Store"
                value={row.store?.name || (row.store_id ? String(row.store_id) : 'App-wide')}
              />
              <Field label="Starts" value={row.starts_at ? new Date(row.starts_at).toLocaleString() : '—'} />
              <Field label="Ends" value={row.ends_at ? new Date(row.ends_at).toLocaleString() : '—'} />
            </Stack>
            {row.description ? (
              <Field label="Description" value={row.description} />
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
    </>
  );
}
