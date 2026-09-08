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
import EntityLink from 'components/EntityLink';
import { assignRiderToOrder } from 'api/ordersPayments';
import { listRiders } from 'api/logistics';
import { getRiderHrefFromUser, nestedRiderProfile } from 'utils/orderLinks';
import { getDeliveryStatusLabel } from 'utils/orderStatusLabels';

const TERMINAL_ORDER = ['DELIVERED', 'CANCELLED', 'REFUNDED', 'RETURNED'];
const LOCKED_DELIVERY = ['PICKED_UP', 'DELIVERED', 'CANCELLED', 'FAILED'];

function isScreenGuardSlug(slug) {
  return slug === 'screen-guard' || (slug && String(slug).startsWith('screen-guard-'));
}

function orderRequiresScreenGuard(order) {
  if (order?.requires_screen_guard_rider) return true;
  const items = order?.order_items || [];
  return items.some((item) => {
    const slug = item?.store_variant?.product_variant?.product?.category?.slug;
    return isScreenGuardSlug(slug);
  });
}

function riderDisplayName(rider) {
  if (!rider) return null;
  return (
    rider.User?.name ||
    rider.user?.name ||
    rider.display_name ||
    rider.name ||
    rider.user_id ||
    null
  );
}

export default function OrderRiderCard({ order, onSuccess }) {
  const [riders, setRiders] = useState([]);
  const [riderId, setRiderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAuto, setConfirmAuto] = useState(false);

  const delivery = order?.delivery;
  const currentRider = delivery?.rider;
  const terminalOrder = !order || TERMINAL_ORDER.includes(order.status);
  const deliveryLocked = LOCKED_DELIVERY.includes(String(delivery?.status || '').toUpperCase());
  const requiresScreenGuard = orderRequiresScreenGuard(order);

  useEffect(() => {
    listRiders({ limit: 200, kyc_status: 'APPROVED' })
      .then((resp) => setRiders(resp?.data || []))
      .catch(() => setRiders([]));
  }, []);

  const eligibleRiders = useMemo(
    () =>
      riders.filter((r) => {
        const avail = r.availability_status;
        const availOk = avail === 'IDLE' || avail === 'ASSIGNED' || r.user_id === delivery?.rider_id;
        if (!availOk) return false;
        if (requiresScreenGuard && !r.screen_guard_eligible) return false;
        return true;
      }),
    [riders, delivery?.rider_id, requiresScreenGuard]
  );

  const selectedRider = eligibleRiders.find((r) => String(r.user_id) === String(riderId));
  const currentName = currentRider?.name || 'the current rider';
  const nextName = confirmAuto
    ? 'the next available rider'
    : riderDisplayName(selectedRider) || 'the selected rider';
  const sameAsCurrent = Boolean(riderId && delivery?.rider_id && String(riderId) === String(delivery.rider_id));

  if (terminalOrder) return null;

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

  const openConfirm = (auto) => {
    setConfirmAuto(auto);
    setConfirmOpen(true);
  };

  const confirmCopy = currentRider
    ? `Reassign this order from ${currentName} to ${nextName}? ${currentName} will be notified and set to available if they have no other job.`
    : `Assign ${nextName} to this order? They will receive a job notification.`;

  return (
    <MainCard title="Rider assignment">
      <Stack spacing={2}>
        {requiresScreenGuard ? (
          <Alert severity="info">
            Screen-guard order — only screen-guard eligible riders are listed.
          </Alert>
        ) : null}

        {deliveryLocked ? (
          <Alert severity="warning">
            Rider cannot be changed after delivery is {getDeliveryStatusLabel(delivery.status)}.
          </Alert>
        ) : null}

        {currentRider ? (
          <Stack spacing={0.5}>
            <EntityLink href={getRiderHrefFromUser(currentRider)} variant="body2" sx={{ fontWeight: 600 }}>
              {currentRider.name || 'Rider'}
            </EntityLink>
            <Typography variant="caption" color="text.secondary">
              {currentRider.phone || currentRider.email || delivery.rider_id}
            </Typography>
            {nestedRiderProfile(currentRider)?.availability_status ? (
              <Chip
                size="small"
                label={nestedRiderProfile(currentRider).availability_status}
                variant="light"
                sx={{ alignSelf: 'flex-start' }}
              />
            ) : null}
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
          disabled={deliveryLocked}
          helperText={
            requiresScreenGuard && !eligibleRiders.length
              ? 'No screen-guard eligible riders available'
              : undefined
          }
        >
          <MenuItem value="">Auto-assign next available</MenuItem>
          {eligibleRiders.map((r) => (
            <MenuItem key={r.user_id || r.id} value={r.user_id}>
              {riderDisplayName(r)} ({r.availability_status || '—'})
            </MenuItem>
          ))}
        </TextField>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            disabled={loading || deliveryLocked || sameAsCurrent}
            onClick={() => openConfirm(!riderId)}
          >
            {loading ? 'Saving…' : currentRider ? 'Reassign rider' : 'Assign rider'}
          </Button>
          {!currentRider && (
            <Button variant="outlined" disabled={loading || deliveryLocked} onClick={() => openConfirm(true)}>
              Auto-assign
            </Button>
          )}
        </Stack>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => !loading && setConfirmOpen(false)}>
        <DialogTitle>{currentRider ? 'Reassign rider?' : 'Assign rider?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmCopy}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => (confirmAuto ? runAssign(null) : runAssign())}
            disabled={loading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

