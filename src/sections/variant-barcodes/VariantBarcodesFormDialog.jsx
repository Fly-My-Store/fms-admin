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

export default function VariantBarcodesFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ variant_id: '', barcode: '', type: '', is_primary: false });

  useEffect(() => {
    if (initialData) setForm({ ...{ variant_id: '', barcode: '', type: '', is_primary: false }, ...initialData });
    else setForm({ variant_id: '', barcode: '', type: '', is_primary: false });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (initialData?.id) await axiosServices.put('admin/catalog/variant-barcodes/' + initialData.id, payload);
      else await axiosServices.post('admin/catalog/variant-barcodes', payload);
      onSaved && onSaved();
      onClose();
    } catch (e) {}
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Variant Barcode' : 'Add New Variant Barcode'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Variant ID</InputLabel>
            <TextField id="variant_id" name="variant_id" value={form.variant_id || ''} onChange={(e)=>setForm(p=>({...p, variant_id: e.target.value}))} placeholder="Variant ID" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Barcode</InputLabel>
            <TextField id="barcode" name="barcode" value={form.barcode || ''} onChange={(e)=>setForm(p=>({...p, barcode: e.target.value}))} placeholder="Barcode" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Type</InputLabel>
            <TextField id="type" name="type" value={form.type || ''} onChange={(e)=>setForm(p=>({...p, type: e.target.value}))} placeholder="Type" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Is Primary</InputLabel>
            <TextField id="is_primary" name="is_primary" value={form.is_primary || ''} onChange={(e)=>setForm(p=>({...p, is_primary: e.target.value}))} placeholder="Is Primary" fullWidth />
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

VariantBarcodesFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
