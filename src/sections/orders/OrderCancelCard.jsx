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
import { PAYMENT_GATEWAY_TYPE } from 'utils/constants';

const NON_CANCELLABLE = ['DELIVERED', 'CANCELLED', 'REFUNDED', 'RETURNED'];
const CHARGE_BEARERS = [
  { value: 'SELLER', label: 'Seller', help: 'Seller fault — for audit only; Razorpay normal refunds have no processing fee' },
  { value: 'PLATFORM', label: 'Platform', help: 'Platform / ops absorbs cost (e.g. dispatch issues, customer-care goodwill)' }
];

function isAdminCancellable(order) {
  if (!order?.status) return false;
  return !NON_CANCELLABLE.includes(String(order.status).toUpperCase());
}

function latestPaymentGateway(order) {
  const payments = order?.payments || [];
  return String(payments[0]?.gateway || order?.payment?.gateway || '').toUpperCase();
}

export default function OrderCancelCard({ order, onSuccess }) {
  const [reason, setReason] = useState('');
  const [chargeBearer, setChargeBearer] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!order || !isAdminCancellable(order)) return null;

  const gateway = latestPaymentGateway(order);
  const isCod = gateway === PAYMENT_GATEWAY_TYPE.COD;
  const hasCapturedOnline = order.payment_status === 'SUCCESS' && !isCod;
  const hasAssignedRider = Boolean(order.delivery?.rider_id || order.delivery?.rider);
  const bearerMeta = CHARGE_BEARERS.find((b) => b.value === chargeBearer);

  const effects = [
    'The order and any active delivery will be cancelled.',
    'The customer and seller will be notified.',
    hasAssignedRider ? 'The assigned rider will be notified and set to available if they have no other job.' : null,
    hasCapturedOnline
      ? 'The captured online payment will be refunded to the customer.'
      : isCod
        ? 'Pay on Delivery will be marked cancelled. No refund is issued.'
        : 'No captured payment to refund.'
  ].filter(Boolean);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    if (!isCod && !chargeBearer) return;
    setLoading(true);
    try {
      await cancelOrder(order.id, {
        reason: reason.trim(),
        ...(isCod ? {} : {charge_bearer: chargeBearer}),
      });
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
          {effects.join(' ')}
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
        {!isCod ? (
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
        ) : null}
        <Button
          variant="outlined"
          color="error"
          disabled={!reason.trim() || (!isCod && !chargeBearer)}
          onClick={() => setOpen(true)}
        >
          Cancel order
        </Button>
      </Stack>

      <Dialog open={open} onClose={() => !loading && setOpen(false)}>
        <DialogTitle>Confirm cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will cancel order {order.id}. {effects.join(' ')}
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Reason: {reason}
            {!isCod ? (
              <>
                <br />
                Charge bearer: {bearerMeta?.label || chargeBearer}
              </>
            ) : null}
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
