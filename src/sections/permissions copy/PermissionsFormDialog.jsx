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

export default function PermissionsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ name: '', create: false, read: true, modify: false, delete: false });

  useEffect(() => {
    if (initialData) setForm({ ...{ name: '', create: false, read: true, modify: false, delete: false }, ...initialData });
    else setForm({ name: '', create: false, read: true, modify: false, delete: false });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (initialData?.id) await axiosServices.put('admin/iam/permissions/' + initialData.id, payload);
      else await axiosServices.post('admin/iam/permissions', payload);
      onSaved && onSaved();
      onClose();
    } catch (e) {}
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Permission' : 'Add New Permission'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Name</InputLabel>
            <TextField id="name" name="name" value={form.name || ''} onChange={(e)=>setForm(p=>({...p, name: e.target.value}))} placeholder="Name" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Create</InputLabel>
            <TextField id="create" name="create" value={form.create || ''} onChange={(e)=>setForm(p=>({...p, create: e.target.value}))} placeholder="Create" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Read</InputLabel>
            <TextField id="read" name="read" value={form.read || ''} onChange={(e)=>setForm(p=>({...p, read: e.target.value}))} placeholder="Read" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Modify</InputLabel>
            <TextField id="modify" name="modify" value={form.modify || ''} onChange={(e)=>setForm(p=>({...p, modify: e.target.value}))} placeholder="Modify" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Delete</InputLabel>
            <TextField id="delete" name="delete" value={form.delete || ''} onChange={(e)=>setForm(p=>({...p, delete: e.target.value}))} placeholder="Delete" fullWidth />
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

PermissionsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
