'use client';

import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import OrderEventsTableSection from 'sections/order-events/OrderEventsTableSection';
import OrderEventsFormDialog from 'sections/order-events/OrderEventsFormDialog';
import axiosServices from 'utils/axios';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';

export default function OrderEventsView() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [orderId, setOrderId] = useState('');

  const load = async () => {
    try {
      if (!orderId) return;
      const resp = await axiosServices.get(`admin/orders-payments/orders/${orderId}/events`);
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
          <InputLabel>Order ID</InputLabel>
          <TextField value={orderId} onChange={(e)=>setOrderId(e.target.value)} placeholder="Enter Order UUID" fullWidth />
        </Stack>
        <Stack alignItems="flex-end" justifyContent="flex-end">
          <Button variant="contained" onClick={load} sx={{ mt: 'auto' }}>Load</Button>
        </Stack>
      </Stack>

      <OrderEventsTableSection rows={rows} handleAddButton={handleAddButton} handleEditButton={handleEditButton} />
      <OrderEventsFormDialog open={open} onClose={handleDialogToggle} initialData={selected} orderId={orderId} onSaved={load} />
    </>
  );
}
