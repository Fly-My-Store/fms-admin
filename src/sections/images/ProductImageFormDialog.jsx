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

export default function ProductImageFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ url: '', alt_text: '', position: '' });

  useEffect(() => {
    if (initialData) setForm({ ...{ url: '', alt_text: '', position: '' }, ...initialData });
    else setForm({ url: '', alt_text: '', position: '' });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (initialData?.id) await axiosServices.put('admin/catalog/products/{productId}/images/' + initialData.id, payload);
      else await axiosServices.post('admin/catalog/products/{productId}/images', payload);
      onSaved && onSaved();
      onClose();
    } catch (e) {}
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Product Image' : 'Add New Product Image'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>URL</InputLabel>
            <TextField id="url" name="url" value={form.url || ''} onChange={(e)=>setForm(p=>({...p, url: e.target.value}))} placeholder="URL" fullWidth />
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Alt Text</InputLabel>
            <TextField id="alt_text" name="alt_text" value={form.alt_text || ''} onChange={(e)=>setForm(p=>({...p, alt_text: e.target.value}))} placeholder="Alt Text" fullWidth />
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Position</InputLabel>
            <TextField id="position" name="position" value={form.position || ''} onChange={(e)=>setForm(p=>({...p, position: e.target.value}))} placeholder="Position" fullWidth />
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

ProductImageFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
