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
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { CloseOutlined } from '@ant-design/icons';
import axiosServices from 'utils/axios';

const DELIVERY_STATUSES = ['PENDING', 'ASSIGNED', 'REACHED_STORE', 'PICKED_UP', 'DELIVERED', 'CANCELLED', 'FAILED'];

export default function DeliveryJobsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ rider_id: '', status: '', notes: '' });

  useEffect(() => {
    if (initialData) {
      setForm({
        rider_id: initialData.rider_id || '',
        status: initialData.status || '',
        notes: initialData.notes || '',
      });
    } else {
      setForm({ rider_id: '', status: '', notes: '' });
    }
  }, [initialData, open]);

  const handleSubmit = async () => {
    if (!initialData?.id) return;
    try {
      const payload = {
        rider_id: form.rider_id || null,
        status: form.status || undefined,
        notes: form.notes || null,
      };
      await axiosServices.patch(`admin/logistics/delivery-jobs/${initialData.id}`, payload);
      onSaved && onSaved();
      onClose();
    } catch (e) {
      // axios interceptor may surface errors
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Edit Delivery Job
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth="420px">
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Rider ID</InputLabel>
            <TextField
              value={form.rider_id || ''}
              onChange={(e) => setForm((p) => ({ ...p, rider_id: e.target.value }))}
              placeholder="Rider user UUID"
              fullWidth
            />
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Status</InputLabel>
            <TextField select value={form.status || ''} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} fullWidth>
              {DELIVERY_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Notes</InputLabel>
            <TextField
              value={form.notes || ''}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Optional notes"
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DeliveryJobsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func,
};
