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

export default function CartsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ user_id: '', store_id: '', reacord_status: '' });

  useEffect(() => {
    if (initialData) setForm({ ...{ user_id: '', store_id: '', reacord_status: '' }, ...initialData });
    else setForm({ user_id: '', store_id: '', reacord_status: '' });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (initialData?.id) await axiosServices.put('admin/orders-payments/carts/' + initialData.id, payload);
      else await axiosServices.post('admin/orders-payments/carts', payload);
      onSaved && onSaved();
      onClose();
    } catch (e) { }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Cart' : 'Add New Cart'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>User ID</InputLabel>
            <TextField id="user_id" name="user_id" value={form.user_id || ''} onChange={(e) => setForm(p => ({ ...p, user_id: e.target.value }))} placeholder="User ID" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Store ID</InputLabel>
            <TextField id="store_id" name="store_id" value={form.store_id || ''} onChange={(e) => setForm(p => ({ ...p, store_id: e.target.value }))} placeholder="Store ID" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Record Status</InputLabel>
            <TextField id="record_status" name="Record Status" value={form.record_status || ''} onChange={(e) => setForm(p => ({ ...p, record_status: e.target.value }))} placeholder="Status" fullWidth />
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

CartsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
