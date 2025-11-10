'use client';

import { useState } from 'react';
import axiosServices from 'utils/axios';
import { enqueueSnackbar } from 'notistack';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';

export default function SellerPolicyView() {
  const [sellerId, setSellerId] = useState('');
  const [form, setForm] = useState({ return_window_days: '', cancellation_policy: '', shipping_policy: '' });

  const load = async () => {
    try {
      if (!sellerId) return;
      const resp = await axiosServices.get(`admin/sellers-stores/sellers/${sellerId}/policy`);
      const data = resp?.data || {};
      setForm({
        return_window_days: data.return_window_days || '',
        cancellation_policy: data.cancellation_policy || '',
        shipping_policy: data.shipping_policy || ''
      });
    } catch (e) { enqueueSnackbar('Failed to load', { variant: 'error' }); }
  };

  const save = async () => {
    try {
      if (!sellerId) return;
      await axiosServices.put(`admin/sellers-stores/sellers/${sellerId}/policy`, form);
      enqueueSnackbar('Saved', { variant: 'success' });
    } catch (e) { enqueueSnackbar('Save failed', { variant: 'error' }); }
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Stack sx={{ gap: 1, minWidth: 360 }}>
          <InputLabel>Seller ID</InputLabel>
          <TextField value={sellerId} onChange={(e)=>setSellerId(e.target.value)} placeholder="Enter Seller UUID" fullWidth />
        </Stack>
        <Stack alignItems="flex-end" justifyContent="flex-end" direction="row" spacing={2}>
          <Button variant="outlined" onClick={load} sx={{ mt: 'auto' }}>Load</Button>
          <Button variant="contained" onClick={save} sx={{ mt: 'auto' }}>Save</Button>
        </Stack>
      </Stack>

      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        <Stack sx={{ gap: 1 }}>
          <InputLabel>Return Window (days)</InputLabel>
          <TextField name="return_window_days" value={form.return_window_days} onChange={(e)=>setForm(p=>({ ...p, return_window_days: e.target.value }))} placeholder="e.g., 7" />
        </Stack>
        <Stack sx={{ gap: 1 }}>
          <InputLabel>Cancellation Policy</InputLabel>
          <TextField multiline minRows={3} name="cancellation_policy" value={form.cancellation_policy} onChange={(e)=>setForm(p=>({ ...p, cancellation_policy: e.target.value }))} placeholder="Text..." />
        </Stack>
        <Stack sx={{ gap: 1 }}>
          <InputLabel>Shipping Policy</InputLabel>
          <TextField multiline minRows={3} name="shipping_policy" value={form.shipping_policy} onChange={(e)=>setForm(p=>({ ...p, shipping_policy: e.target.value }))} placeholder="Text..." />
        </Stack>
      </Stack>
    </>
  );
}
