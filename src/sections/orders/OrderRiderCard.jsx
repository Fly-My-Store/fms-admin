'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
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
import { assignRiderToOrder } from 'api/ordersPayments';
import { listRiders } from 'api/logistics';

const TERMINAL_ORDER = ['DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function OrderRiderCard({ order, onSuccess }) {
  const [riders, setRiders] = useState([]);
  const [riderId, setRiderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const delivery = order?.delivery;
  const currentRider = delivery?.rider;
  const disabled = !order || TERMINAL_ORDER.includes(order.status);

  useEffect(() => {
    listRiders({ limit: 200, kyc_status: 'APPROVED' })
      .then((resp) => setRiders(resp?.data || []))
      .catch(() => setRiders([]));
  }, []);

  const eligibleRiders = useMemo(
    () =>
      riders.filter((r) => {
        const avail = r.availability_status;
        return avail === 'IDLE' || avail === 'ASSIGNED' || r.user_id === delivery?.rider_id;
      }),
    [riders, delivery?.rider_id]
  );

  if (disabled) return null;

  const runAssign = async (explicitRiderId) => {
    setLoading(true);
    try {
      const body = explicitRiderId !== undefined ? { rider_id: explicitRiderId || null } : { rider_id: riderId || null };
      await assignRiderToOrder(order.id, body);
      setRiderId('');
      setConfirmOpen(false);
      onSuccess?.(currentRider ? 'Rider reassigned' : 'Rider assigned');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Assignment failed';
      onSuccess?.(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Rider assignment">
      <Stack spacing={2}>
        {currentRider ? (
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={600}>
              {currentRider.name || 'Rider'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentRider.phone || currentRider.email || delivery.rider_id}
            </Typography>
            {currentRider.Rider?.availability_status && (
              <Chip size="small" label={currentRider.Rider.availability_status} variant="light" sx={{ alignSelf: 'flex-start' }} />
            )}
          </Stack>
        ) : (
          <Alert severity="info">No rider assigned yet.</Alert>
        )}

        <TextField
          select
          label={currentRider ? 'Reassign to rider' : 'Select rider'}
          value={riderId}
          onChange={(e) => setRiderId(e.target.value)}
          fullWidth
          size="small"
        >
          <MenuItem value="">Auto-assign next available</MenuItem>
          {eligibleRiders.map((r) => (
            <MenuItem key={r.user_id || r.id} value={r.user_id}>
              {(r.User?.name || r.user?.name || r.display_name || r.user_id)} ({r.availability_status || '—'})
            </MenuItem>
          ))}
        </TextField>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            disabled={loading}
            onClick={() => (currentRider ? setConfirmOpen(true) : runAssign())}
          >
            {loading ? 'Saving…' : currentRider ? 'Reassign rider' : 'Assign rider'}
          </Button>
          {!currentRider && (
            <Button variant="outlined" disabled={loading} onClick={() => runAssign(null)}>
              Auto-assign
            </Button>
          )}
        </Stack>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => !loading && setConfirmOpen(false)}>
        <DialogTitle>Reassign rider?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The previous rider will be set to IDLE. The new rider will receive a job notification.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => runAssign()} disabled={loading}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
