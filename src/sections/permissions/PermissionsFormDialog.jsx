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
import { createPermission, updatePermission } from 'api/iam';
import { getErrorMessage } from 'utils/errors';

export default function PermissionsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name || '', description: initialData.description || '' });
    } else {
      setForm({ name: '', description: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      enqueueSnackbar('Name is required', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      if (initialData?.id) {
        await updatePermission(initialData.id, { description: form.description });
        enqueueSnackbar('Permission updated', { variant: 'success' });
      } else {
        await createPermission({ name: form.name.trim(), description: form.description });
        enqueueSnackbar('Permission created', { variant: 'success' });
      }
      onSaved?.();
      onClose();
    } catch (e) {
      enqueueSnackbar(getErrorMessage(e, 'Save failed'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Permission' : 'Add New Permission'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth="400px">
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Name</InputLabel>
            <TextField
              id="name"
              name="name"
              type="text"
              value={form.name || ''}
              onChange={handleChange}
              placeholder="e.g. order, deliveryJob"
              fullWidth
              disabled={Boolean(initialData?.id)}
              helperText="Must match the admin menu resource key (camelCase)."
            />
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Description</InputLabel>
            <TextField
              id="description"
              name="description"
              type="text"
              value={form.description || ''}
              onChange={handleChange}
              placeholder="What this resource covers"
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
          {saving ? 'Saving…' : initialData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

PermissionsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
