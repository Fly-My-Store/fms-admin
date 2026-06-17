'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import {
  Alert,
  Button,
  InputLabel,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { getUser, updateUser } from 'api/iam';
import { TABLE_STATUS } from 'utils/constants';

const STATUS_OPTIONS = [
  { value: TABLE_STATUS.ACTIVE, label: 'Active', description: 'Full access' },
  { value: TABLE_STATUS.INACTIVE, label: 'Inactive', description: 'Restricted — reason required' },
  { value: TABLE_STATUS.SUSPENDED, label: 'Suspended', description: 'Blocked — reason required' }
];

const needsReason = (status) =>
  status === TABLE_STATUS.INACTIVE || status === TABLE_STATUS.SUSPENDED;

export default function CustomerEditView() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    status: TABLE_STATUS.ACTIVE,
    status_reason: ''
  });

  const breadcrumb = {
    heading: 'Manage customer account',
    links: [
      { title: 'home', to: '/dashboard' },
      { title: 'customers', to: '/customers' },
      { title: 'manage', i18n: false }
    ]
  };

  const reasonRequired = useMemo(() => needsReason(Number(form.status)), [form.status]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await getUser(id);
        const user = resp?.data || resp;
        if (!cancelled) {
          setForm({
            name: user?.name || '',
            phone: user?.phone || '',
            email: user?.email || '',
            status: user?.status ?? TABLE_STATUS.ACTIVE,
            status_reason: user?.status_reason || ''
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.message || e?.message || 'Failed to load customer');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const status = Number(form.status);
    if (needsReason(status) && !form.status_reason.trim()) {
      enqueueSnackbar('A reason is required when restricting or blocking a customer', { variant: 'warning' });
      return;
    }

    setSaving(true);
    try {
      const payload = { status };
      if (needsReason(status)) {
        payload.status_reason = form.status_reason.trim();
      }
      await updateUser(id, payload);
      enqueueSnackbar('Account status updated', { variant: 'success' });
      router.push(`/customers/${id}`);
    } catch (e) {
      const msg =
        e?.response?.data?.errors?.status_reason ||
        e?.response?.data?.message ||
        e?.message ||
        'Update failed';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
          <Typography variant="h5">Manage customer account</Typography>
          <Typography variant="body2" color="text.secondary">
            Customer identity (name, email, phone) cannot be changed here. Update account status to restrict or block access.
          </Typography>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Name</InputLabel>
            <TextField size="small" value={form.name} fullWidth disabled />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Email</InputLabel>
            <TextField size="small" value={form.email} fullWidth disabled />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Phone</InputLabel>
            <TextField size="small" value={form.phone} fullWidth disabled />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Account status</InputLabel>
            <TextField
              select
              size="small"
              value={form.status}
              onChange={(e) => handleField('status', Number(e.target.value))}
              fullWidth
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label} — {opt.description}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>
              {reasonRequired ? 'Reason (required)' : 'Reason'}
            </InputLabel>
            <TextField
              size="small"
              value={form.status_reason}
              onChange={(e) => handleField('status_reason', e.target.value)}
              placeholder={
                reasonRequired
                  ? 'Internal note: why is this account restricted or blocked?'
                  : 'Not used for active accounts'
              }
              fullWidth
              multiline
              minRows={3}
              disabled={!reasonRequired}
              helperText={
                reasonRequired
                  ? 'Visible to admins on the customer profile. Not shown to the customer.'
                  : 'Clearing status to Active removes the stored reason.'
              }
            />
          </Stack>

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button onClick={() => router.push(`/customers/${id}`)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={saving || loading}>
              {saving ? 'Saving…' : 'Update status'}
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}
