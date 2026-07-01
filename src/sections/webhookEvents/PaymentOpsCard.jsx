'use client';

import PropTypes from 'prop-types';
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { PlayCircleOutlined, SyncOutlined } from '@ant-design/icons';

function formatOpsResult(action, data) {
  if (!data) return null;
  if (action === 'payment-reconcile') {
    const { scanned = 0, fulfilled = 0, failed = 0, skipped = 0, errors = 0 } = data;
    return `Scanned ${scanned} · Fulfilled ${fulfilled} · Failed ${failed} · Skipped ${skipped} · Errors ${errors}`;
  }
  if (action === 'checkout-expiry') {
    const { expired = 0, scanned = 0 } = data;
    return `Expired ${expired} of ${scanned} overdue session(s)`;
  }
  return JSON.stringify(data);
}

export default function PaymentOpsCard({ loading, action, result, error, onReconcile, onCheckoutExpiry }) {
  const busyReconcile = loading && action === 'payment-reconcile';
  const busyExpiry = loading && action === 'checkout-expiry';

  return (
    <MainCard title="Payment ops">
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Manually reconcile stuck checkouts against Razorpay or expire overdue pending sessions. These jobs also run
          automatically in the background.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="outlined"
            startIcon={busyReconcile ? <CircularProgress size={16} /> : <SyncOutlined />}
            disabled={loading}
            onClick={onReconcile}
          >
            Reconcile payments
          </Button>
          <Button
            variant="outlined"
            startIcon={busyExpiry ? <CircularProgress size={16} /> : <PlayCircleOutlined />}
            disabled={loading}
            onClick={onCheckoutExpiry}
          >
            Expire checkout sessions
          </Button>
        </Stack>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {result && action ? (
          <Alert severity="success">{formatOpsResult(action, result)}</Alert>
        ) : null}
      </Stack>
    </MainCard>
  );
}

PaymentOpsCard.propTypes = {
  loading: PropTypes.bool,
  action: PropTypes.string,
  result: PropTypes.object,
  error: PropTypes.string,
  onReconcile: PropTypes.func,
  onCheckoutExpiry: PropTypes.func
};
