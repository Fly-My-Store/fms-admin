'use client';

import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import { cancelOrder } from 'api/ordersPayments';

const CANCELLABLE = ['CREATED', 'CONFIRMED', 'PACKING', 'PACKED'];

export default function OrderCancelCard({ order, onSuccess }) {
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!order || !CANCELLABLE.includes(order.status)) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await cancelOrder(order.id, { reason: reason.trim() });
      setOpen(false);
      setReason('');
      onSuccess?.('Order cancelled');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Cancel failed';
      onSuccess?.(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Cancel order">
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Cancelling will restock items, cancel the delivery, and notify the customer.
        </Typography>
        <TextField
          label="Cancellation reason"
          required
          multiline
          minRows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
        />
        <Button
          variant="outlined"
          color="error"
          disabled={!reason.trim()}
          onClick={() => setOpen(true)}
        >
          Cancel order
        </Button>
      </Stack>

      <Dialog open={open} onClose={() => !loading && setOpen(false)}>
        <DialogTitle>Confirm cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will cancel order {order.id}, restock reserved inventory, cancel any active delivery, and update
            payment records where applicable.
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Reason: {reason}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Back
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Cancelling…' : 'Confirm cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
