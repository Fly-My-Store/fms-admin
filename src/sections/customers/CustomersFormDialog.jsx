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

export default function CustomersFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', status: '' });

  useEffect(() => {
    if (initialData) setForm({ ...{ first_name: '', last_name: '', email: '', phone: '', status: '' }, ...initialData });
    else setForm({ first_name: '', last_name: '', email: '', phone: '', status: '' });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (initialData?.id) await axiosServices.put('admin/iam/users?type=CUSTOMER/' + initialData.id, payload);
      else await axiosServices.post('admin/iam/users?type=CUSTOMER', payload);
      onSaved && onSaved();
      onClose();
    } catch (e) {}
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Customer' : 'Add New Customer'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>First Name</InputLabel>
            <TextField id="first_name" name="first_name" value={form.first_name || ''} onChange={(e)=>setForm(p=>({...p, first_name: e.target.value}))} placeholder="First Name" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Last Name</InputLabel>
            <TextField id="last_name" name="last_name" value={form.last_name || ''} onChange={(e)=>setForm(p=>({...p, last_name: e.target.value}))} placeholder="Last Name" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Email</InputLabel>
            <TextField id="email" name="email" value={form.email || ''} onChange={(e)=>setForm(p=>({...p, email: e.target.value}))} placeholder="Email" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Phone</InputLabel>
            <TextField id="phone" name="phone" value={form.phone || ''} onChange={(e)=>setForm(p=>({...p, phone: e.target.value}))} placeholder="Phone" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Status</InputLabel>
            <TextField id="status" name="status" value={form.status || ''} onChange={(e)=>setForm(p=>({...p, status: e.target.value}))} placeholder="Status" fullWidth />
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

CustomersFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
