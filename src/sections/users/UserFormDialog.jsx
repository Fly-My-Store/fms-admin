'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import { CloseOutlined } from '@ant-design/icons';
import { enqueueSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { createUser, listRoles, updateUser } from 'api/iam';
import { TABLE_STATUS } from 'utils/constants';

const STATUS_OPTIONS = [
  { value: TABLE_STATUS.ACTIVE, label: 'Active', description: 'Full access' },
  { value: TABLE_STATUS.INACTIVE, label: 'Inactive', description: 'Restricted — reason required' },
  { value: TABLE_STATUS.SUSPENDED, label: 'Suspended', description: 'Blocked — reason required' }
];

export default function UserFormDialog({ open, onClose, initialData = null, onSaved }) {
  const actorIsTester = useSelector((s) => Boolean(s.auth?.user?.is_tester));
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 1,
    role_id: '',
    is_tester: false,
    receive_order_whatsapp: false
  });
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    listRoles({ domain: 'ADMIN', limit: 100 })
      .then((resp) => {
        if (!cancelled) setRoles(resp?.data || []);
      })
      .catch(() => {
        if (!cancelled) setRoles([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);


  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: '',
        status: initialData.status ?? 1,
        role_id: initialData.role_id || initialData.role?.id || '',
        is_tester: Boolean(initialData.is_tester),
        receive_order_whatsapp: Boolean(initialData.receive_order_whatsapp)
      });
    } else {
      setForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        status: 1,
        role_id: '',
        is_tester: actorIsTester,
        receive_order_whatsapp: false
      });
    }
  }, [initialData, open, actorIsTester]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        status: Number(form.status),
        type: 'ADMIN',
        role_id: form.role_id || undefined,
        is_tester: Boolean(form.is_tester),
        receive_order_whatsapp: Boolean(form.receive_order_whatsapp)
      };
      if (form.password) payload.password = form.password;

      if (initialData?.id) {
        await updateUser(initialData.id, payload);
        enqueueSnackbar('Admin user updated', { variant: 'success' });
      } else {
        if (!payload.name || !payload.email || !form.password) {
          enqueueSnackbar('Name, email, and password are required', { variant: 'warning' });
          return;
        }
        if (!form.role_id) {
          enqueueSnackbar('Role is required', { variant: 'warning' });
          return;
        }
        await createUser(payload);
        enqueueSnackbar('Admin user created', { variant: 'success' });
      }
      onSaved?.();
      onClose();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Save failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit admin user' : 'Add admin user'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={2} mt={1}>
          <Stack spacing={2} minWidth="400px">
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Name</InputLabel>
              <TextField id="name" name="name" value={form.name} onChange={handleChange} placeholder="Full name" fullWidth />
            </Stack>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Email</InputLabel>
              <TextField id="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" fullWidth />
            </Stack>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Phone</InputLabel>
              <TextField id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" fullWidth />
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(form.receive_order_whatsapp)}
                  onChange={(e) => setForm((prev) => ({ ...prev, receive_order_whatsapp: e.target.checked }))}
                />
              }
              label="Receive order WhatsApp (new / cancelled)"
            />
          </Stack>
          <Stack spacing={2} minWidth="400px">
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Role</InputLabel>
              <TextField
                select
                id="role_id"
                name="role_id"
                value={form.role_id || ''}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="">Select a role</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name} ({role.code})
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>{initialData ? 'New password (optional)' : 'Password'}</InputLabel>
              <TextField
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder={initialData ? 'Leave blank to keep current' : 'Enter password'}
                fullWidth
              />
            </Stack>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Account status</InputLabel>
              <TextField
                select
                id="status"
                name="status"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: Number(e.target.value) }))}
                fullWidth
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {!actorIsTester && (
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(form.is_tester)}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_tester: e.target.checked }))}
                  />
                }
                label="Demo admin (is_tester)"
              />
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

UserFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
