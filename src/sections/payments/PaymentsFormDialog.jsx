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
import { centsToRupees } from 'utils/currency';

export default function PaymentsFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ order_id: '', amount_rupees: '', status: '', gateway: '' });

  useEffect(() => {
    if (initialData) {
      setForm({
        order_id: initialData.order_id ?? '',
        amount_rupees: initialData.amount_cents != null ? centsToRupees(initialData.amount_cents) : '',
        status: initialData.status ?? '',
        gateway: initialData.gateway ?? ''
      });
    } else {
      setForm({ order_id: '', amount_rupees: '', status: '', gateway: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const payload = { order_id: form.order_id, status: form.status, gateway: form.gateway };
    if (initialData?.id) {
      dispatch(ordersPayments.paymentsUpdateRequest({ params: { id: initialData.id, data: payload } }));
    } else {
      dispatch(ordersPayments.paymentsCreateRequest({ params: payload }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Payment' : 'Add New Payment'}
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
            <InputLabel>Amount (₹)</InputLabel>
            <TextField id="amount_rupees" name="amount_rupees" type="text" value={form.amount_rupees || ''} onChange={handleChange} placeholder="e.g. 99.00 (display only)" fullWidth disabled={!!initialData} />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Status</InputLabel>
            <TextField id="status" name="status" type="text" value={form.status || ''} onChange={handleChange} placeholder="Status" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Gateway</InputLabel>
            <TextField id="gateway" name="gateway" type="text" value={form.gateway || ''} onChange={handleChange} placeholder="Gateway" fullWidth />
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

PaymentsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
