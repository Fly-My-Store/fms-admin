'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useParams, useRouter } from 'next/navigation';

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  LinearProgress
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import RiderKycDocumentsPanel from 'sections/riders/RiderKycDocumentsPanel';

import { actions as logistics } from 'store/logistics/slice';
import { createRider, updateRider } from 'api/logistics';
import { ACCOUNT_STATUS } from 'utils/constants';

const KYC_STATUSES = ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMIT'];
const AVAILABILITY_STATUSES = ['OFFLINE', 'IDLE', 'ASSIGNED', 'ON_TRIP'];
const VEHICLE_TYPES = ['BIKE', 'SCOOTER', 'CAR', 'CYCLE'];
const USER_STATUS_OPTIONS = [
  { value: ACCOUNT_STATUS.ACTIVE, label: 'Active' },
  { value: ACCOUNT_STATUS.INACTIVE, label: 'Inactive' },
  { value: ACCOUNT_STATUS.SUSPENDED, label: 'Suspended' },
  { value: ACCOUNT_STATUS.DELETED, label: 'Deleted' }
];

const EMPTY = {
  id: '',
  user_id: '',
  name: '',
  email: '',
  phone: '',
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
  documents: {},
  screen_guard_eligible: false,
  status: ACCOUNT_STATUS.ACTIVE,
  is_tester: false,
  tester_otp: ''
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
  const actorIsTester = useSelector((s) => Boolean(s.auth?.user?.is_tester));
  const detail = ridersDetail || { data: null, loading: false, error: null };
  const data = detail.data;

  const [form, setForm] = useState({ ...EMPTY });
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(id);

  const breadcrumb = {
    heading: isEdit ? 'edit-rider' : 'create-rider',
    links: [
      { title: 'home', to: '/dashboard' },
      { title: 'riders', to: '/riders' },
      { title: isEdit ? 'edit-rider' : 'create-rider' }
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
    const user = rider.user || rider.User || {};
    setForm({
      id: rider.id || '',
      user_id: rider.user_id || user.id || '',
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
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
      documents: rider.documents && typeof rider.documents === 'object' ? rider.documents : {},
      screen_guard_eligible: Boolean(rider.screen_guard_eligible),
      status: user.status ?? ACCOUNT_STATUS.ACTIVE,
      is_tester: Boolean(user.is_tester),
      tester_otp: ''
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
    if (!String(form.name || '').trim()) e.name = 'Name is required';
    if (!String(form.phone || '').trim()) e.phone = 'Phone is required';
    if (!form.vehicle_type) e.vehicle_type = 'Vehicle type is required';
    if (!form.availability_status) e.availability_status = 'Availability status is required';
    const radius = toNumberOrNull(form.service_radius_km);
    if (radius == null || radius <= 0) e.service_radius_km = 'Enter a valid radius';
    const capacity = toNumberOrNull(form.capacity_kg);
    if (capacity == null || capacity <= 0) e.capacity_kg = 'Enter a valid capacity';
    if ((form.kyc_status === 'REJECTED' || form.kyc_status === 'RESUBMIT') && !form.kyc_reason) {
      e.kyc_reason = 'Reason is required for this KYC status';
    }

    ['working_hours', 'payout_account'].forEach((field) => {
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

      const userPayload = {
        name: String(form.name).trim(),
        email: form.email ? String(form.email).trim() : null,
        phone: String(form.phone).trim(),
        status: Number(form.status)
      };

      const payload = {
        vehicle_type: form.vehicle_type,
        vehicle_number: form.vehicle_number || null,
        dl_number: form.dl_number || null,
        kyc_status: form.kyc_status,
        kyc_reason: form.kyc_reason || null,
        aadhar_last4: form.aadhar_last4 || null,
        availability_status: form.availability_status,
        service_radius_km: toNumberOrNull(form.service_radius_km),
        capacity_kg: toNumberOrNull(form.capacity_kg),
        screen_guard_eligible: Boolean(form.screen_guard_eligible)
      };

      ['working_hours', 'payout_account'].forEach((field) => {
        const raw = form[field];
        if (!raw) return;
        try {
          payload[field] = JSON.parse(raw);
        } catch {
          // already validated above
        }
      });

      if (isEdit) {
        payload.user = userPayload;
        if (!actorIsTester) {
          payload.is_tester = Boolean(form.is_tester);
          if (form.tester_otp.trim()) payload.tester_otp = form.tester_otp.trim();
        }
        await updateRider(id, payload);
        enqueueSnackbar('Rider updated', { variant: 'success' });
      } else {
        payload.user = userPayload;
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
      {detail.loading && <LinearProgress sx={{ mb: 1 }} />}
      {detail.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {detail.error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard title="Account" subheader="Rider login profile and contact">
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Name"
                  required
                  fullWidth
                  value={form.name}
                  onChange={(e) => handleField('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name || ''}
                />
                <TextField
                  size="small"
                  label="Email"
                  type="email"
                  fullWidth
                  value={form.email}
                  onChange={(e) => handleField('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email || ''}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Phone"
                  required
                  fullWidth
                  value={form.phone}
                  onChange={(e) => handleField('phone', e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone || ''}
                />
                <TextField
                  select
                  size="small"
                  label="Account status"
                  fullWidth
                  value={form.status}
                  onChange={(e) => handleField('status', Number(e.target.value))}
                  helperText="Inactive or Suspended blocks app login. KYC is separate."
                >
                  {USER_STATUS_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              {isEdit && form.user_id ? (
                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                  User ID: {form.user_id}
                </Typography>
              ) : null}
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard title="Vehicle" subheader="Registration and identity numbers">
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  size="small"
                  label="Vehicle type"
                  required
                  fullWidth
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
                <TextField
                  size="small"
                  label="Vehicle number"
                  fullWidth
                  value={form.vehicle_number}
                  onChange={(e) => handleField('vehicle_number', e.target.value)}
                  error={!!errors.vehicle_number}
                  helperText={errors.vehicle_number || ''}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="DL number"
                  fullWidth
                  value={form.dl_number}
                  onChange={(e) => handleField('dl_number', e.target.value)}
                  error={!!errors.dl_number}
                  helperText={errors.dl_number || ''}
                />
                <TextField
                  size="small"
                  label="Aadhaar last 4"
                  fullWidth
                  sx={{ maxWidth: { sm: 160 } }}
                  inputProps={{ maxLength: 4 }}
                  value={form.aadhar_last4}
                  onChange={(e) => handleField('aadhar_last4', e.target.value)}
                  error={!!errors.aadhar_last4}
                  helperText={errors.aadhar_last4 || ''}
                />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard title="Service" subheader="Availability and delivery capacity">
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  size="small"
                  label="Availability"
                  required
                  fullWidth
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
                <TextField
                  size="small"
                  label="Service radius (km)"
                  required
                  type="number"
                  fullWidth
                  value={form.service_radius_km}
                  onChange={(e) => handleField('service_radius_km', e.target.value)}
                  error={!!errors.service_radius_km}
                  helperText={errors.service_radius_km || ''}
                />
                <TextField
                  size="small"
                  label="Capacity (kg)"
                  required
                  type="number"
                  fullWidth
                  value={form.capacity_kg}
                  onChange={(e) => handleField('capacity_kg', e.target.value)}
                  error={!!errors.capacity_kg}
                  helperText={errors.capacity_kg || ''}
                />
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
            </Stack>
          </MainCard>
        </Grid>

        {isEdit && !actorIsTester ? (
          <Grid size={{ xs: 12, lg: 6 }}>
            <MainCard title="Tester" subheader="Optional QA / sandbox rider flags">
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(form.is_tester)}
                      onChange={(e) => handleField('is_tester', e.target.checked)}
                    />
                  }
                  label="Mark as tester rider"
                />
                {form.is_tester ? (
                  <TextField
                    size="small"
                    label="Tester OTP (optional)"
                    fullWidth
                    sx={{ maxWidth: 280 }}
                    value={form.tester_otp}
                    onChange={(e) => handleField('tester_otp', e.target.value)}
                    helperText="Leave blank to keep current / default"
                  />
                ) : null}
              </Stack>
            </MainCard>
          </Grid>
        ) : null}

        <Grid size={12}>
          <MainCard
            title="Verification"
            subheader="Review documents and set KYC status"
            secondary={(
              <Chip
                size="small"
                label={`KYC: ${form.kyc_status || '—'}`}
                color={
                  form.kyc_status === 'APPROVED'
                    ? 'success'
                    : form.kyc_status === 'REJECTED'
                      ? 'error'
                      : 'default'
                }
                variant="outlined"
              />
            )}
          >
            <RiderKycDocumentsPanel
              documents={form.documents}
              editable
              title=""
              kycStatuses={KYC_STATUSES}
              errors={errors}
              kyc={{
                status: form.kyc_status,
                reason: form.kyc_reason,
                onStatusChange: (v) => handleField('kyc_status', v),
                onReasonChange: (v) => handleField('kyc_reason', v)
              }}
            />
          </MainCard>
        </Grid>
      </Grid>

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          mt: 2,
          py: 2,
          px: 2,
          mx: -2,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          boxShadow: (theme) => theme.shadows[4]
        }}
      >
        <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mr: 'auto', display: { xs: 'none', sm: 'block' } }}
          >
            {isEdit ? 'Update rider profile and KYC status' : 'Create rider account and profile'}
          </Typography>
          <Button onClick={() => router.push('/riders')}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isEdit ? 'Update rider' : 'Create rider'}
          </Button>
        </Stack>
      </Box>
    </>
  );
}
