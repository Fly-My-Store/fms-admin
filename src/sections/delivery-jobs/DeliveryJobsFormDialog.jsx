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
import axiosServices from 'utils/axios';

export default function DeliveryJobsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ rider_id: '', status: '', eta_at: '' });

  useEffect(() => {
    if (initialData) setForm({ ...{ rider_id: '', status: '', eta_at: '' }, ...initialData });
    else setForm({ rider_id: '', status: '', eta_at: '' });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (initialData?.id) await axiosServices.put('admin/logistics/deliveries/{deliveryId}/jobs/' + initialData.id, payload);
      else await axiosServices.post('admin/logistics/deliveries/{deliveryId}/jobs', payload);
      onSaved && onSaved();
      onClose();
    } catch (e) {}
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Delivery Job' : 'Add New Delivery Job'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Rider ID</InputLabel>
            <TextField id="rider_id" name="rider_id" value={form.rider_id || ''} onChange={(e)=>setForm(p=>({...p, rider_id: e.target.value}))} placeholder="Rider ID" fullWidth />
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Status</InputLabel>
            <TextField id="status" name="status" value={form.status || ''} onChange={(e)=>setForm(p=>({...p, status: e.target.value}))} placeholder="Status" fullWidth />
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>ETA (ISO)</InputLabel>
            <TextField id="eta_at" name="eta_at" value={form.eta_at || ''} onChange={(e)=>setForm(p=>({...p, eta_at: e.target.value}))} placeholder="ETA (ISO)" fullWidth />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>{initialData ? 'Update' : 'Submit'}</Button>
      </DialogActions>
    </Dialog>
  );
}

DeliveryJobsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
