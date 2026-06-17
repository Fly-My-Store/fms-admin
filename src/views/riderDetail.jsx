'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useParams } from 'next/navigation';
import {
  Alert,
  Avatar,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import RiderLocationMap from 'sections/riders/RiderLocationMap';
import RiderDeliveriesCard from 'sections/riders/RiderDeliveriesCard';
import RiderPayoutsCard from 'sections/riders/RiderPayoutsCard';
import { actions as logistics } from 'store/logistics/slice';
import { TABLE_STATUS, RECORD_STATUS } from 'utils/constants';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const accountStatusLabel = (value) => {
  switch (Number(value)) {
    case TABLE_STATUS.ACTIVE:
      return 'Active';
    case TABLE_STATUS.INACTIVE:
      return 'Inactive';
    case TABLE_STATUS.SUSPENDED:
      return 'Suspended';
    case TABLE_STATUS.DELETED:
      return 'Deleted';
    default:
      return safe(value);
  }
};

const recordStatusLabel = (value) => {
  switch (Number(value)) {
    case RECORD_STATUS.ACTIVE:
      return 'Active';
    case RECORD_STATUS.INACTIVE:
      return 'Inactive';
    case RECORD_STATUS.ARCHIVED:
      return 'Archived';
    default:
      return safe(value);
  }
};

function AccountStatusChip({ value }) {
  switch (Number(value)) {
    case TABLE_STATUS.ACTIVE:
      return <Chip size="small" color="success" label="Active" variant="light" />;
    case TABLE_STATUS.INACTIVE:
      return <Chip size="small" color="warning" label="Inactive" variant="light" />;
    case TABLE_STATUS.SUSPENDED:
      return <Chip size="small" color="error" label="Suspended" variant="light" />;
    case TABLE_STATUS.DELETED:
      return <Chip size="small" color="default" label="Deleted" variant="light" />;
    default:
      return <Chip size="small" color="default" label={safe(value)} variant="light" />;
  }
}

function KycChip({ value }) {
  const color =
    value === 'APPROVED' ? 'success' : value === 'REJECTED' ? 'error' : value === 'IN_REVIEW' ? 'warning' : 'default';
  return <Chip size="small" color={color} label={value ? `KYC: ${value}` : 'KYC: —'} variant="outlined" />;
}

function AvailabilityChip({ value }) {
  const color = value === 'ON_TRIP' || value === 'ASSIGNED' ? 'primary' : value === 'IDLE' ? 'success' : 'default';
  return <Chip size="small" color={color} label={value || 'OFFLINE'} variant="outlined" />;
}

const KV = ({ label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="baseline">
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
      {label}
    </Typography>
    <Typography variant="body2">{safe(value)}</Typography>
  </Stack>
);

export default function RiderDetailView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [deliveriesRefreshKey, setDeliveriesRefreshKey] = useState(0);
  const { ridersDetail } = useSelector((s) => s.logistics || {});
  const detail = ridersDetail || { data: null, loading: false, error: null };
  const data = detail.data;

  useEffect(() => {
    if (!id) return;
    dispatch(logistics.ridersGetRequest({ params: { id } }));
  }, [dispatch, id]);

  useEffect(() => {
    if (detail.error) enqueueSnackbar(detail.error, { variant: 'error' });
  }, [detail.error]);

  const breadcrumb = useMemo(() => {
    const name = data?.user?.name || id || 'rider';
    return {
      heading: 'rider',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'riders', to: '/riders' },
        { title: name, i18n: false }
      ]
    };
  }, [data?.user?.name, id]);

  const handlePayoutRecorded = useCallback(() => {
    setDeliveriesRefreshKey((k) => k + 1);
  }, []);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />

      {detail.loading && <Alert severity="info">Loading rider…</Alert>}

      {!detail.loading && data && (
        <Grid container spacing={2}>
          <Grid size={12}>
            <MainCard border={false} boxShadow>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 48, height: 48 }}>{(data?.user?.name || 'R').slice(0, 1).toUpperCase()}</Avatar>
                  <Stack spacing={0.5}>
                    <Typography variant="h5">{safe(data?.user?.name)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {safe(data?.user?.phone)} · {safe(data?.user?.email)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                      {data.id}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                  <AccountStatusChip value={data?.user?.status} />
                  <KycChip value={data?.kyc_status} />
                  <AvailabilityChip value={data?.availability_status} />
                </Stack>
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Profile">
              <Stack spacing={1}>
                <KV label="Phone" value={data?.user?.phone} />
                <KV label="Email" value={data?.user?.email} />
                <KV label="Country code" value={data?.user?.country_code} />
                <KV label="Account status" value={accountStatusLabel(data?.user?.status)} />
                <KV label="Rating" value={data?.user?.rating != null ? `${data.user.rating} (${data.user.rating_count ?? 0})` : '—'} />
                <KV label="Joined" value={formatDate(data?.user?.created_at)} />
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Vehicle & service">
              <Stack spacing={1}>
                <KV label="Vehicle type" value={data?.vehicle_type} />
                <KV label="Vehicle number" value={data?.vehicle_number} />
                <KV label="DL number" value={data?.dl_number} />
                <KV label="Aadhar last 4" value={data?.aadhar_last4} />
                <KV label="Service radius" value={data?.service_radius_km != null ? `${data.service_radius_km} km` : '—'} />
                <KV label="Capacity" value={data?.capacity_kg != null ? `${data.capacity_kg} kg` : '—'} />
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <RiderLocationMap riderId={id} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Status">
              <Stack spacing={1}>
                <KV label="Account status" value={accountStatusLabel(data?.user?.status)} />
                <KV label="KYC status" value={data?.kyc_status} />
                <KV label="KYC reason" value={data?.kyc_reason} />
                <KV label="Availability" value={data?.availability_status} />
                <KV label="Record status" value={recordStatusLabel(data?.record_status)} />
                <KV label="Updated" value={formatDate(data?.updated_at)} />
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={12}>
            <RiderDeliveriesCard
              riderUserId={data?.user_id || data?.user?.id}
              refreshKey={deliveriesRefreshKey}
            />
          </Grid>

          <Grid size={12}>
            <RiderPayoutsCard
              riderId={id}
              riderName={data?.user?.name}
              onPayoutRecorded={handlePayoutRecorded}
            />
          </Grid>
        </Grid>
      )}

      {!detail.loading && !data && !detail.error && (
        <Alert severity="warning">Rider not found.</Alert>
      )}
    </>
  );
}
