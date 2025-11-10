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

export default function ProductVariantsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ product_id: '', sku: '', option_summary: '', status: '' });

  useEffect(() => {
    if (initialData) setForm({ ...{ product_id: '', sku: '', option_summary: '', status: '' }, ...initialData });
    else setForm({ product_id: '', sku: '', option_summary: '', status: '' });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (initialData?.id) await axiosServices.put('admin/catalog/product-variants/' + initialData.id, payload);
      else await axiosServices.post('admin/catalog/product-variants', payload);
      onSaved && onSaved();
      onClose();
    } catch (e) {}
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Product Variant' : 'Add New Product Variant'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Product ID</InputLabel>
            <TextField id="product_id" name="product_id" value={form.product_id || ''} onChange={(e)=>setForm(p=>({...p, product_id: e.target.value}))} placeholder="Product ID" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>SKU</InputLabel>
            <TextField id="sku" name="sku" value={form.sku || ''} onChange={(e)=>setForm(p=>({...p, sku: e.target.value}))} placeholder="SKU" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Option Summary</InputLabel>
            <TextField id="option_summary" name="option_summary" value={form.option_summary || ''} onChange={(e)=>setForm(p=>({...p, option_summary: e.target.value}))} placeholder="Option Summary" fullWidth />
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

ProductVariantsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
