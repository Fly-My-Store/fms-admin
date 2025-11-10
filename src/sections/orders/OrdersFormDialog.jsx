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
import { actions as ordersPayments } from 'store/ordersPayments/slice';

export default function OrdersFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ order_no: '', user_id: '', store_id: '', status: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ order_no: '', user_id: '', store_id: '', status: '' }, ...initialData });
    } else {
      setForm({ order_no: '', user_id: '', store_id: '', status: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(ordersPayments.ordersUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(ordersPayments.ordersCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Order' : 'Add New Order'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>Order No</InputLabel>
            <TextField id="order_no" name="order_no" type="text" value={form.order_no || ''} onChange={handleChange} placeholder="Order No" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>User ID</InputLabel>
            <TextField id="user_id" name="user_id" type="text" value={form.user_id || ''} onChange={handleChange} placeholder="User ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Store ID</InputLabel>
            <TextField id="store_id" name="store_id" type="text" value={form.store_id || ''} onChange={handleChange} placeholder="Store ID" fullWidth />
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

OrdersFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
