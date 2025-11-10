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

export default function OrderEventsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ event_type: '', note: '' });

  useEffect(() => {
    if (initialData) setForm({ ...{ event_type: '', note: '' }, ...initialData });
    else setForm({ event_type: '', note: '' });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (initialData?.id) await axiosServices.put('admin/orders-payments/orders/{orderId}/events/' + initialData.id, payload);
      else await axiosServices.post('admin/orders-payments/orders/{orderId}/events', payload);
      onSaved && onSaved();
      onClose();
    } catch (e) {}
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Order Event' : 'Add New Order Event'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Event Type</InputLabel>
            <TextField id="event_type" name="event_type" value={form.event_type || ''} onChange={(e)=>setForm(p=>({...p, event_type: e.target.value}))} placeholder="Event Type" fullWidth />
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Note</InputLabel>
            <TextField id="note" name="note" value={form.note || ''} onChange={(e)=>setForm(p=>({...p, note: e.target.value}))} placeholder="Note" fullWidth />
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

OrderEventsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
