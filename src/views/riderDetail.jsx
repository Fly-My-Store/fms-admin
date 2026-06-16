'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useParams, useRouter } from 'next/navigation';

import {
  Alert,
  Avatar,
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
  Button,
  TextField,
  MenuItem
} from '@mui/material';

import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import RiderLocationsTableSection from 'sections/rider-locations/RiderLocationsTableSection';

import { actions as logistics } from 'store/logistics/slice';
import { updateRider } from 'api/logistics';
import axiosServices from 'utils/axios';
import { TABLE_STATUS } from 'utils/constants';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const KYC_STATUSES = ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMIT'];
const AVAILABILITY_STATUSES = ['OFFLINE', 'IDLE', 'ASSIGNED', 'ON_TRIP'];

const KV = ({ label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="baseline">
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
      {label}
    </Typography>
    <Typography variant="body2">{safe(value)}</Typography>
  </Stack>
);

const StatusChip = ({ value }) => {
  switch (value) {
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
};

export default function RiderDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { ridersDetail } = useSelector((s) => s.logistics || {});
  const detail = ridersDetail || { data: null, loading: false, error: null };
  const data = detail.data;

  const [locationRows, setLocationRows] = useState([]);
  const [locationPageIndex, setLocationPageIndex] = useState(0);
  const [locationPageSize, setLocationPageSize] = useState(20);
  const [locationTotalPages, setLocationTotalPages] = useState(1);
  const [locationsLoading, setLocationsLoading] = useState(false);

  const loadLocations = useCallback(async () => {
    if (!id) return;
    setLocationsLoading(true);
    try {
      const resp = await axiosServices.get(`admin/logistics/riders/${id}/locations`, {
        params: { page: locationPageIndex + 1, limit: locationPageSize },
      });
      const payload = resp?.data || {};
      setLocationRows(payload.data || []);
      setLocationTotalPages(payload?.meta?.totalPages || 1);
    } catch (e) {
      enqueueSnackbar('Failed to load rider locations', { variant: 'error' });
    } finally {
      setLocationsLoading(false);
    }
  }, [id, locationPageIndex, locationPageSize]);

  useEffect(() => {
    if (!id) return;
    dispatch(logistics.ridersGetRequest({ params: { id } }));
  }, [dispatch, id]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    if (detail.error) {
      enqueueSnackbar(detail.error, { variant: 'error' });
    }
  }, [detail.error]);

  const handleLocationPaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: locationPageIndex, pageSize: locationPageSize }) : updater;
    setLocationPageIndex(next.pageIndex);
    setLocationPageSize(next.pageSize);
  };

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

  const handleQuickUpdate = async (patch) => {
    if (!id) return;
    try {
      await updateRider(id, patch);
      enqueueSnackbar('Rider updated', { variant: 'success' });
      dispatch(logistics.ridersGetRequest({ params: { id } }));
    } catch (err) {
      const msg = err?.response?.data?.message || 'Update failed';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        <Stack spacing={2}>
          {detail.loading && <Alert severity="info">Loading…</Alert>}
          {!detail.loading && data && (
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar>{(data?.user?.name || 'R').slice(0, 1).toUpperCase()}</Avatar>
                  <Stack spacing={0.25}>
                    <Typography variant="h5">{safe(data?.user?.name)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {safe(data?.user?.email)}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => router.push(`/payouts?payee_type=RIDER&payee_id=${id}&payee_name=${encodeURIComponent(data?.user?.name || '')}`)}
                  >
                    Record payout
                  </Button>
                  <StatusChip value={data?.status} />
                  <Chip size="small" variant="light" label={`KYC: ${safe(data?.kyc_status)}`} />
                  <Chip size="small" variant="light" label={`Availability: ${safe(data?.availability_status)}`} />
                </Stack>
              </Stack>

              <Divider />

              <Typography variant="overline">User</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Stack spacing={1.25} flex={1}>
                  <KV label="Name" value={data?.user?.name} />
                  <KV label="Email" value={data?.user?.email} />
                  <KV label="Phone" value={data?.user?.phone} />
                  <KV label="Country Code" value={data?.user?.country_code} />
                </Stack>
                <Stack spacing={1.25} flex={1}>
                  <KV label="Status" value={data?.user?.status} />
                  <KV label="Rating" value={data?.user?.rating} />
                  <KV label="Rating Count" value={data?.user?.rating_count} />
                  <KV label="Created At" value={data?.user?.created_at} />
                </Stack>
              </Stack>

              <Divider />

              <Typography variant="overline">Vehicle</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Stack spacing={1.25} flex={1}>
                  <KV label="Vehicle Type" value={data?.vehicle_type} />
                  <KV label="Vehicle Number" value={data?.vehicle_number} />
                  <KV label="DL Number" value={data?.dl_number} />
                </Stack>
                <Stack spacing={1.25} flex={1}>
                  <KV label="Aadhar Last 4" value={data?.aadhar_last4} />
                </Stack>
              </Stack>

              <Divider />

              <Typography variant="overline">Service & Availability</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Stack spacing={1.25} flex={1}>
                  <KV label="Availability" value={data?.availability_status} />
                  <KV label="Service Radius (km)" value={data?.service_radius_km} />
                  <KV label="Capacity (kg)" value={data?.capacity_kg} />
                </Stack>
                <Stack spacing={1.25} flex={1}>
                  <KV label="Record Status" value={data?.record_status} />
                  <KV label="Created At" value={data?.created_at} />
                  <KV label="Updated At" value={data?.updated_at} />
                </Stack>
              </Stack>

              <Divider />

              <Typography variant="overline">KYC</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Stack spacing={1.25} flex={1}>
                  <KV label="KYC Status" value={data?.kyc_status} />
                  <KV label="KYC Reason" value={data?.kyc_reason} />
                </Stack>
              </Stack>

              <Divider />

              <Typography variant="overline">Quick Status Update</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    select
                    size="small"
                    label="KYC Status"
                    defaultValue={data?.kyc_status || 'PENDING'}
                    onChange={(e) => handleQuickUpdate({ kyc_status: e.target.value })}
                    sx={{ mr: 2, minWidth: 160 }}
                  >
                    {KYC_STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    select
                    size="small"
                    label="Availability"
                    defaultValue={data?.availability_status || 'OFFLINE'}
                    onChange={(e) => handleQuickUpdate({ availability_status: e.target.value })}
                    sx={{ mr: 2, minWidth: 160 }}
                  >
                    {AVAILABILITY_STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    select
                    size="small"
                    label="Account Status"
                    defaultValue={data?.status ?? TABLE_STATUS.ACTIVE}
                    onChange={(e) => handleQuickUpdate({ status: Number(e.target.value) })}
                    sx={{ mr: 2, minWidth: 160 }}
                  >
                    <MenuItem value={TABLE_STATUS.ACTIVE}>ACTIVE</MenuItem>
                    <MenuItem value={TABLE_STATUS.INACTIVE}>INACTIVE</MenuItem>
                    <MenuItem value={TABLE_STATUS.SUSPENDED}>SUSPENDED</MenuItem>
                    <MenuItem value={TABLE_STATUS.DELETED}>DELETED</MenuItem>
                  </TextField>
                </Box>
              </Stack>
            </>
          )}
        </Stack>
      </MainCard>

      <Box sx={{ mt: 2 }}>
        <MainCard border={false} boxShadow content={false}>
          {locationsLoading && (
            <Alert severity="info" sx={{ m: 2 }}>
              Loading locations…
            </Alert>
          )}
          <RiderLocationsTableSection
            rows={locationRows}
            pageIndex={locationPageIndex}
            pageSize={locationPageSize}
            totalPageCount={locationTotalPages}
            onPaginationChange={handleLocationPaginationChange}
          />
        </MainCard>
      </Box>
    </>
  );
}

