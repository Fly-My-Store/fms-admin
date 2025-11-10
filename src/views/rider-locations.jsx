'use client';

import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import RiderLocationsTableSection from 'sections/rider-locations/RiderLocationsTableSection';
import axiosServices from 'utils/axios';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';

export default function RiderLocationsView() {
  const [rows, setRows] = useState([]);
  const [riderId, setRiderId] = useState('');

  const load = async () => {
    try {
      if (!riderId) return;
      const resp = await axiosServices.get(`admin/logistics/riders/${riderId}/locations`);
      const payload = resp?.data || {};
      setRows(payload.data || payload || []);
    } catch (e) { enqueueSnackbar('Failed to load', { variant: 'error' }); }
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Stack sx={{ gap: 1, minWidth: 360 }}>
          <InputLabel>Rider ID</InputLabel>
          <TextField value={riderId} onChange={(e)=>setRiderId(e.target.value)} placeholder="Enter Rider UUID" fullWidth />
        </Stack>
        <Stack alignItems="flex-end" justifyContent="flex-end">
          <Button variant="contained" onClick={load} sx={{ mt: 'auto' }}>Load</Button>
        </Stack>
      </Stack>

      <RiderLocationsTableSection rows={rows} />
    </>
  );
}
