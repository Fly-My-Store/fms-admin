'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
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
import { actions as logistics } from 'store/logistics/slice';

export default function DeliveriesFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ order_id: '', rider_id: '', status: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ order_id: '', rider_id: '', status: '' }, ...initialData });
    } else {
      setForm({ order_id: '', rider_id: '', status: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(logistics.deliveriesUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(logistics.deliveriesCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Delivery' : 'Add New Delivery'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>Order ID</InputLabel>
            <TextField id="order_id" name="order_id" type="text" value={form.order_id || ''} onChange={handleChange} placeholder="Order ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Rider ID</InputLabel>
            <TextField id="rider_id" name="rider_id" type="text" value={form.rider_id || ''} onChange={handleChange} placeholder="Rider ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Status</InputLabel>
            <TextField id="status" name="status" type="text" value={form.status || ''} onChange={handleChange} placeholder="Status" fullWidth />
          </Stack>

        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DeliveriesFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
