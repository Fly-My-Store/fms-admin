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

export default function ProductApprovalsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ name: '', brand_id: '', status: 'PROPOSED' });

  useEffect(() => {
    if (initialData) setForm({ ...{ name: '', brand_id: '', status: 'PROPOSED' }, ...initialData });
    else setForm({ name: '', brand_id: '', status: 'PROPOSED' });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (initialData?.id) await axiosServices.put('admin/catalog/products?status=PROPOSED/' + initialData.id, payload);
      else await axiosServices.post('admin/catalog/products?status=PROPOSED', payload);
      onSaved && onSaved();
      onClose();
    } catch (e) {}
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Product' : 'Add New Product'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Name</InputLabel>
            <TextField id="name" name="name" value={form.name || ''} onChange={(e)=>setForm(p=>({...p, name: e.target.value}))} placeholder="Name" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Brand ID</InputLabel>
            <TextField id="brand_id" name="brand_id" value={form.brand_id || ''} onChange={(e)=>setForm(p=>({...p, brand_id: e.target.value}))} placeholder="Brand ID" fullWidth />
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

ProductApprovalsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
