'use client';

import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import ProductImagesTableSection from 'sections/images/ProductImagesTableSection';
import ProductImageFormDialog from 'sections/images/ProductImageFormDialog';
import axiosServices from 'utils/axios';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';

export default function ProductImagesView() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [productId, setProductId] = useState('');

  const load = async () => {
    try {
      if (!productId) return;
      const resp = await axiosServices.get(`admin/catalog/products/${productId}/images`);
      const payload = resp?.data || {};
      setRows(payload.data || payload || []);
    } catch (e) { enqueueSnackbar('Failed to load', { variant: 'error' }); }
  };

  const handleDialogToggle = () => { setOpen((p)=>!p); if (open) setSelected(null); };
  const handleAddButton = () => { setSelected(null); setOpen(true); };
  const handleEditButton = (row) => { setSelected(row); setOpen(true); };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Stack sx={{ gap: 1, minWidth: 360 }}>
          <InputLabel>Product ID</InputLabel>
          <TextField value={productId} onChange={(e)=>setProductId(e.target.value)} placeholder="Enter Product UUID" fullWidth />
        </Stack>
        <Stack alignItems="flex-end" justifyContent="flex-end">
          <Button variant="contained" onClick={load} sx={{ mt: 'auto' }}>Load</Button>
        </Stack>
      </Stack>

      <ProductImagesTableSection rows={rows} handleAddButton={handleAddButton} handleEditButton={handleEditButton} />
      <ProductImageFormDialog open={open} onClose={handleDialogToggle} initialData={selected} productId={productId} onSaved={load} />
    </>
  );
}
