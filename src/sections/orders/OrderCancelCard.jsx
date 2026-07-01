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
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import { cancelOrder } from 'api/ordersPayments';

const NON_CANCELLABLE = ['DELIVERED', 'CANCELLED', 'REFUNDED', 'RETURNED'];
const CHARGE_BEARERS = [
  { value: 'SELLER', label: 'Seller', help: 'Seller fault — for audit only; Razorpay normal refunds have no processing fee' },
  { value: 'PLATFORM', label: 'Platform', help: 'Platform / ops absorbs cost (e.g. dispatch issues, customer-care goodwill)' }
];

function isAdminCancellable(order) {
  if (!order?.status) return false;
  return !NON_CANCELLABLE.includes(String(order.status).toUpperCase());
}

export default function OrderCancelCard({ order, onSuccess }) {
  const [reason, setReason] = useState('');
  const [chargeBearer, setChargeBearer] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!order || !isAdminCancellable(order)) return null;

  const hasCapturedPayment = order.payment_status === 'SUCCESS';
  const bearerMeta = CHARGE_BEARERS.find((b) => b.value === chargeBearer);

  const handleConfirm = async () => {
    if (!reason.trim() || !chargeBearer) return;
    setLoading(true);
    try {
      await cancelOrder(order.id, { reason: reason.trim(), charge_bearer: chargeBearer });
      setOpen(false);
      setReason('');
      setChargeBearer('');
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
          Cancelling will restock inventory, cancel the delivery, and notify the customer.
          {hasCapturedPayment
            ? ' The full online payment will be refunded to the customer automatically.'
            : ' No captured payment to refund.'}
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
        <TextField
          select
          required
          label="Charge bearer"
          value={chargeBearer}
          onChange={(e) => setChargeBearer(e.target.value)}
          fullWidth
          helperText={bearerMeta?.help || 'Who bears the gateway fee and cancel cost'}
        >
          <MenuItem value="" disabled>
            Select bearer
          </MenuItem>
          {CHARGE_BEARERS.map((b) => (
            <MenuItem key={b.value} value={b.value}>
              {b.label}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="outlined"
          color="error"
          disabled={!reason.trim() || !chargeBearer}
          onClick={() => setOpen(true)}
        >
          Cancel order
        </Button>
      </Stack>

      <Dialog open={open} onClose={() => !loading && setOpen(false)}>
        <DialogTitle>Confirm cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will cancel order {order.id}, restock reserved inventory, and cancel any active delivery.
            {hasCapturedPayment ? ' A full refund will be issued to the customer.' : ''}
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Reason: {reason}
            <br />
            Charge bearer: {bearerMeta?.label || chargeBearer}
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
