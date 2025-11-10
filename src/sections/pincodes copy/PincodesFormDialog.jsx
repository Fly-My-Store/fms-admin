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

export default function PincodesFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ pincode: '', city: '', state: '', is_active: true });

  useEffect(() => {
    if (initialData) setForm({ ...{ pincode: '', city: '', state: '', is_active: true }, ...initialData });
    else setForm({ pincode: '', city: '', state: '', is_active: true });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (initialData?.id) await axiosServices.put('admin/geo/pincodes/' + initialData.id, payload);
      else await axiosServices.post('admin/geo/pincodes', payload);
      onSaved && onSaved();
      onClose();
    } catch (e) {}
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Pincode' : 'Add New Pincode'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Pincode</InputLabel>
            <TextField id="pincode" name="pincode" value={form.pincode || ''} onChange={(e)=>setForm(p=>({...p, pincode: e.target.value}))} placeholder="Pincode" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>City</InputLabel>
            <TextField id="city" name="city" value={form.city || ''} onChange={(e)=>setForm(p=>({...p, city: e.target.value}))} placeholder="City" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>State</InputLabel>
            <TextField id="state" name="state" value={form.state || ''} onChange={(e)=>setForm(p=>({...p, state: e.target.value}))} placeholder="State" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Active</InputLabel>
            <TextField id="is_active" name="is_active" value={form.is_active || ''} onChange={(e)=>setForm(p=>({...p, is_active: e.target.value}))} placeholder="Active" fullWidth />
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

PincodesFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
