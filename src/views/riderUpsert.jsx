'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useParams, useRouter } from 'next/navigation';

import {
  Alert,
  Button,
  Divider,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  LinearProgress
} from '@mui/material';

import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

import { actions as logistics } from 'store/logistics/slice';
import { createRider, updateRider } from 'api/logistics';

const KYC_STATUSES = ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMIT'];
const AVAILABILITY_STATUSES = ['OFFLINE', 'IDLE', 'ASSIGNED', 'ON_TRIP'];
const VEHICLE_TYPES = ['BIKE', 'SCOOTER', 'CAR', 'CYCLE'];

const EMPTY = {
  id: '',
  user_id: '',
  vehicle_type: '',
  vehicle_number: '',
  dl_number: '',
  kyc_status: 'PENDING',
  kyc_reason: '',
  aadhar_last4: '',
  availability_status: 'OFFLINE',
  service_radius_km: '',
  capacity_kg: '',
  working_hours: '',
  payout_account: '',
  documents: '',
  screen_guard_eligible: false,
  status: 1
};

function toNumberOrNull(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function RiderUpsertView() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { ridersDetail } = useSelector((s) => s.logistics || {});
  const detail = ridersDetail || { data: null, loading: false, error: null };
  const data = detail.data;

  const [form, setForm] = useState({ ...EMPTY });
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(id);

  const breadcrumb = {
    heading: isEdit ? 'Edit Rider' : 'Add Rider',
    links: [
      { title: 'home', to: '/dashboard' },
      { title: 'riders', to: '/riders' },
      { title: isEdit ? 'edit' : 'add', i18n: false }
    ]
  };

  useEffect(() => {
    if (isEdit) {
      dispatch(logistics.ridersGetRequest({ params: { id } }));
    } else {
      setForm({ ...EMPTY });
      setErrors({});
    }
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (!isEdit || !data) return;
    const rider = data;
    setForm({
      id: rider.id || '',
      user_id: rider.user_id || '',
      vehicle_type: rider.vehicle_type || '',
      vehicle_number: rider.vehicle_number || '',
      dl_number: rider.dl_number || '',
      kyc_status: rider.kyc_status || 'PENDING',
      kyc_reason: rider.kyc_reason || '',
      aadhar_last4: rider.aadhar_last4 || '',
      availability_status: rider.availability_status || 'OFFLINE',
      service_radius_km: rider.service_radius_km != null ? String(rider.service_radius_km) : '',
      capacity_kg: rider.capacity_kg != null ? String(rider.capacity_kg) : '',
      working_hours: rider.working_hours ? JSON.stringify(rider.working_hours, null, 2) : '',
      payout_account: rider.payout_account ? JSON.stringify(rider.payout_account, null, 2) : '',
      documents: rider.documents ? JSON.stringify(rider.documents, null, 2) : '',
      screen_guard_eligible: Boolean(rider.screen_guard_eligible),
      status: rider.status ?? 1
    });
  }, [data, isEdit]);

  useEffect(() => {
    if (detail.error) {
      enqueueSnackbar(detail.error, { variant: 'error' });
    }
  }, [detail.error]);

  const handleField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const validateForm = () => {
    const e = {};
    if (!form.user_id) e.user_id = 'User ID is required';
    if (!form.vehicle_type) e.vehicle_type = 'Vehicle type is required';
    if (!form.availability_status) e.availability_status = 'Availability status is required';
    const radius = toNumberOrNull(form.service_radius_km);
    if (radius == null || radius <= 0) e.service_radius_km = 'Enter a valid radius';
    const capacity = toNumberOrNull(form.capacity_kg);
    if (capacity == null || capacity <= 0) e.capacity_kg = 'Enter a valid capacity';
    if ((form.kyc_status === 'REJECTED' || form.kyc_status === 'RESUBMIT') && !form.kyc_reason) {
      e.kyc_reason = 'Reason is required for this KYC status';
    }

    // JSON fields validation
    ['working_hours', 'payout_account', 'documents'].forEach((field) => {
      const raw = form[field];
      if (!raw) return;
      try {
        JSON.parse(raw);
      } catch {
        e[field] = 'Invalid JSON';
      }
    });

    return e;
  };

  const handleSubmit = async () => {
    try {
      const e = validateForm();
      if (Object.keys(e).length) {
        setErrors(e);
        enqueueSnackbar('Please fix the highlighted fields.', { variant: 'warning' });
        return;
      }

      const payload = {
        user_id: form.user_id,
        vehicle_type: form.vehicle_type,
        vehicle_number: form.vehicle_number || null,
        dl_number: form.dl_number || null,
        kyc_status: form.kyc_status,
        kyc_reason: form.kyc_reason || null,
        aadhar_last4: form.aadhar_last4 || null,
        availability_status: form.availability_status,
        service_radius_km: toNumberOrNull(form.service_radius_km),
        capacity_kg: toNumberOrNull(form.capacity_kg),
        screen_guard_eligible: Boolean(form.screen_guard_eligible),
        status: form.status
      };

      ['working_hours', 'payout_account', 'documents'].forEach((field) => {
        const raw = form[field];
        if (!raw) return;
        try {
          payload[field] = JSON.parse(raw);
        } catch {
          // already validated above
        }
      });

      if (isEdit) {
        await updateRider(id, payload);
        enqueueSnackbar('Rider updated', { variant: 'success' });
      } else {
        await createRider(payload);
        enqueueSnackbar('Rider created', { variant: 'success' });
      }
      router.push('/riders');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Operation failed';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        {detail.loading && <LinearProgress />}
        <Stack spacing={2}>
          {detail.error && <Alert severity="error">{detail.error}</Alert>}

          <Typography variant="h6">User</Typography>
          {isEdit && <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>User ID *</InputLabel>
              <TextField
                size="small"
                value={form.user_id}
                onChange={(e) => handleField('user_id', e.target.value)}
                error={!!errors.user_id}
                helperText={errors.user_id || ''}
                placeholder="User UUID"
                disabled={isEdit}
              />
            </Stack>
          </Stack>}

          {isEdit && <Divider />}

          <Typography variant="h6">Vehicle</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>Vehicle Type *</InputLabel>
              <TextField
                select
                size="small"
                value={form.vehicle_type}
                onChange={(e) => handleField('vehicle_type', e.target.value)}
                error={!!errors.vehicle_type}
                helperText={errors.vehicle_type || ''}
              >
                {VEHICLE_TYPES.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Vehicle Number</InputLabel>
              <TextField
                size="small"
                value={form.vehicle_number}
                onChange={(e) => handleField('vehicle_number', e.target.value)}
                error={!!errors.vehicle_number}
                helperText={errors.vehicle_number || ''}
              />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>DL Number</InputLabel>
              <TextField
                size="small"
                value={form.dl_number}
                onChange={(e) => handleField('dl_number', e.target.value)}
                error={!!errors.dl_number}
                helperText={errors.dl_number || ''}
              />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel>Aadhar Last 4</InputLabel>
              <TextField
                size="small"
                inputProps={{ maxLength: 4 }}
                value={form.aadhar_last4}
                onChange={(e) => handleField('aadhar_last4', e.target.value)}
                error={!!errors.aadhar_last4}
                helperText={errors.aadhar_last4 || ''}
              />
            </Stack>
          </Stack>

          <Divider />

          <Typography variant="h6">KYC</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>KYC Status *</InputLabel>
              <TextField
                select
                size="small"
                value={form.kyc_status}
                onChange={(e) => handleField('kyc_status', e.target.value)}
                error={!!errors.kyc_status}
                helperText={errors.kyc_status || ''}
              >
                {KYC_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack sx={{ gap: 1, flex: 2 }}>
              <InputLabel>KYC Reason</InputLabel>
              <TextField
                size="small"
                multiline
                minRows={2}
                value={form.kyc_reason}
                onChange={(e) => handleField('kyc_reason', e.target.value)}
                error={!!errors.kyc_reason}
                helperText={errors.kyc_reason || ''}
              />
            </Stack>
          </Stack>

          <Divider />

          <Typography variant="h6">Service & Availability</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>Availability *</InputLabel>
              <TextField
                select
                size="small"
                value={form.availability_status}
                onChange={(e) => handleField('availability_status', e.target.value)}
                error={!!errors.availability_status}
                helperText={errors.availability_status || ''}
              >
                {AVAILABILITY_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>Service Radius (km) *</InputLabel>
              <TextField
                size="small"
                type="number"
                value={form.service_radius_km}
                onChange={(e) => handleField('service_radius_km', e.target.value)}
                error={!!errors.service_radius_km}
                helperText={errors.service_radius_km || ''}
              />
            </Stack>
            <Stack sx={{ gap: 1, flex: 1 }}>
              <InputLabel required>Capacity (kg) *</InputLabel>
              <TextField
                size="small"
                type="number"
                value={form.capacity_kg}
                onChange={(e) => handleField('capacity_kg', e.target.value)}
                error={!!errors.capacity_kg}
                helperText={errors.capacity_kg || ''}
              />
            </Stack>
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={Boolean(form.screen_guard_eligible)}
                onChange={(e) => handleField('screen_guard_eligible', e.target.checked)}
              />
            }
            label="Screen guard delivery eligible"
          />
          <Divider />

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button onClick={() => router.push('/riders')}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {isEdit ? 'Update Rider' : 'Create Rider'}
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}

