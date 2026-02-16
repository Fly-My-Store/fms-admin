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
import { centsToRupees, rupeesToCents } from 'utils/currency';

export default function RefundsFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ payment_id: '', amount_rupees: '', status: '', reason: '' });

  useEffect(() => {
    if (initialData) {
      setForm({
        payment_id: initialData.payment_id ?? '',
        amount_rupees: initialData.amount_cents != null ? centsToRupees(initialData.amount_cents) : '',
        status: initialData.status ?? '',
        reason: initialData.reason ?? ''
      });
    } else {
      setForm({ payment_id: '', amount_rupees: '', status: '', reason: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const payload = { payment_id: form.payment_id, status: form.status, reason: form.reason };
    if (initialData?.id) {
      dispatch(ordersPayments.refundsUpdateRequest({ params: { id: initialData.id, data: payload } }));
    } else {
      payload.amount_cents = rupeesToCents(form.amount_rupees);
      dispatch(ordersPayments.refundsCreateRequest({ params: payload }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Refund' : 'Add New Refund'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>Payment ID</InputLabel>
            <TextField id="payment_id" name="payment_id" type="text" value={form.payment_id || ''} onChange={handleChange} placeholder="Payment ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Amount (₹)</InputLabel>
            <TextField id="amount_rupees" name="amount_rupees" type="text" value={form.amount_rupees || ''} onChange={handleChange} placeholder="e.g. 99.00 (rupees)" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Status</InputLabel>
            <TextField id="status" name="status" type="text" value={form.status || ''} onChange={handleChange} placeholder="Status" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Reason</InputLabel>
            <TextField id="reason" name="reason" type="text" value={form.reason || ''} onChange={handleChange} placeholder="Reason" fullWidth />
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

RefundsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
