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
import { CloseOutlined } from '@ant-design/icons';
import { enqueueSnackbar } from 'notistack';
import { createUser, updateUser } from 'api/iam';

export default function UserFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', status: 1 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: '',
        status: initialData.status ?? 1
      });
    } else {
      setForm({ name: '', email: '', phone: '', password: '', status: 1 });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        status: Number(form.status),
        type: 'ADMIN'
      };
      if (form.password) payload.password_hash = form.password;

      if (initialData?.id) {
        await updateUser(initialData.id, payload);
        enqueueSnackbar('Admin user updated', { variant: 'success' });
      } else {
        if (!payload.name || !payload.email || !form.password) {
          enqueueSnackbar('Name, email, and password are required', { variant: 'warning' });
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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit admin user' : 'Add admin user'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth="400px">
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
