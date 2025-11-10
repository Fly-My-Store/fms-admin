'use client';

import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import DeliveryJobsTableSection from 'sections/delivery-jobs/DeliveryJobsTableSection';
import DeliveryJobsFormDialog from 'sections/delivery-jobs/DeliveryJobsFormDialog';
import axiosServices from 'utils/axios';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';

export default function DeliveryJobsView() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deliveryId, setDeliveryId] = useState('');

  const load = async () => {
    try {
      if (!deliveryId) return;
      const resp = await axiosServices.get(`admin/logistics/deliveries/${deliveryId}/jobs`);
      const payload = resp?.data || {};
      setRows(payload.data || payload || []);
    } catch (e) { enqueueSnackbar('Failed to load', { variant: 'error' }); }
  };

  const handleDialogToggle = () => { setOpen((p)=>!p); if (open) setSelected(null); };
  const handleAddButton = () => { setSelected(null); setOpen(true); };
  const handleEditButton = (row) => { setSelected(row); setOpen(true); };

  useEffect(()=>{ /* no-op */ },[]);

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Stack sx={{ gap: 1, minWidth: 360 }}>
          <InputLabel>Delivery ID</InputLabel>
          <TextField value={deliveryId} onChange={(e)=>setDeliveryId(e.target.value)} placeholder="Enter Delivery UUID" fullWidth />
        </Stack>
        <Stack alignItems="flex-end" justifyContent="flex-end">
          <Button variant="contained" onClick={load} sx={{ mt: 'auto' }}>Load</Button>
        </Stack>
      </Stack>

      <DeliveryJobsTableSection rows={rows} handleAddButton={handleAddButton} handleEditButton={handleEditButton} />
      <DeliveryJobsFormDialog open={open} onClose={handleDialogToggle} initialData={selected} deliveryId={deliveryId} onSaved={load} />
    </>
  );
}
