'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import {
  Alert,
  Button,
  InputLabel,
  LinearProgress,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import useUser from 'hooks/useUser';
import { getUser, updateUser } from 'api/iam';
import { updateAuthUser } from 'store/auth/authSlice';

export default function ProfilePersonalTab() {
  const dispatch = useDispatch();
  const authUser = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (!authUser.id) {
      setLoading(false);
      setForm({
        name: authUser.name || '',
        email: authUser.email || '',
        phone: authUser.phone || ''
      });
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await getUser(authUser.id);
        const user = resp?.data || resp;
        if (!cancelled) {
          setForm({
            name: user?.name || authUser.name || '',
            email: user?.email || authUser.email || '',
            phone: user?.phone || authUser.phone || ''
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.message || e?.message || 'Failed to load profile');
          setForm({
            name: authUser.name || '',
            email: authUser.email || '',
            phone: authUser.phone || ''
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authUser.id, authUser.name, authUser.email, authUser.phone]);

  const handleSave = async () => {
    if (!authUser.id) {
      enqueueSnackbar('Not signed in', { variant: 'warning' });
      return;
    }
    if (!form.name.trim()) {
      enqueueSnackbar('Name is required', { variant: 'warning' });
      return;
    }

    setSaving(true);
    try {
      const resp = await updateUser(authUser.id, {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined
      });
      const updated = resp?.data || resp;
      dispatch(
        updateAuthUser({
          name: updated?.name || form.name.trim(),
          phone: updated?.phone ?? form.phone.trim()
        })
      );
      enqueueSnackbar('Profile updated', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Update failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainCard title="Personal information" border={false} boxShadow>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3} sx={{ maxWidth: 520 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={form.name} size="lg">
            {(form.name || form.email || 'A').slice(0, 1).toUpperCase()}
          </Avatar>
          <Stack spacing={0.25}>
            <Typography variant="h6">{form.name || 'Admin user'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {form.email || '—'}
            </Typography>
            {authUser.type && (
              <Typography variant="caption" color="text.secondary">
                {authUser.type}
              </Typography>
            )}
          </Stack>
        </Stack>

        <Stack sx={{ gap: 1 }}>
          <InputLabel>Name</InputLabel>
          <TextField
            size="small"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            fullWidth
          />
        </Stack>

        <Stack sx={{ gap: 1 }}>
          <InputLabel>Email</InputLabel>
          <TextField size="small" value={form.email} fullWidth disabled helperText="Contact support to change email" />
        </Stack>

        <Stack sx={{ gap: 1 }}>
          <InputLabel>Phone</InputLabel>
          <TextField
            size="small"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            fullWidth
            placeholder="Optional"
          />
        </Stack>

        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </Stack>
      </Stack>
    </MainCard>
  );
}
