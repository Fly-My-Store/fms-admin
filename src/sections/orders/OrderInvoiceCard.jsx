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
  Divider,
  Link,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import { getPlatformInvoice, rejectStoreInvoice } from 'api/ordersPayments';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

export default function OrderInvoiceCard({ order, onSuccess }) {
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feesLoading, setFeesLoading] = useState(false);

  if (!order) return null;

  const hasInvoice = !!order.store_invoice_url;
  const rejected = !!order.store_invoice_rejected_at;
  const status = String(order.status || '').toUpperCase();
  const feesAvailable = !['CREATED', 'CANCELLED', 'REFUNDED', 'RETURNED'].includes(status);

  const handleOpenFeesInvoice = async () => {
    if (!feesAvailable || feesLoading) return;
    setFeesLoading(true);
    try {
      const res = await getPlatformInvoice(order.id);
      const url = res?.data?.url || res?.url;
      if (!url) {
        onSuccess?.('Could not generate fees invoice', 'error');
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Fees invoice failed';
      onSuccess?.(msg, 'error');
    } finally {
      setFeesLoading(false);
    }
  };

  const handleConfirm = async () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await rejectStoreInvoice(order.id, { reason: trimmed });
      setOpen(false);
      setReason('');
      onSuccess?.('Store invoice rejected — seller notified');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Reject failed';
      onSuccess?.(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Invoices">
      <Stack spacing={2}>
        <Stack spacing={1}>
          <Typography variant="subtitle2">Platform fees invoice</Typography>
          <Typography variant="body2" color="text.secondary">
            Delivery, platform, service, and payment fees (not goods).
          </Typography>
          <Button
            variant="outlined"
            onClick={handleOpenFeesInvoice}
            disabled={!feesAvailable || feesLoading}
          >
            {feesLoading ? 'Generating…' : 'Open fees invoice'}
          </Button>
          {!feesAvailable ? (
            <Typography variant="caption" color="text.secondary">
              Not available for this order status.
            </Typography>
          ) : null}
        </Stack>

        <Divider />

        <Stack spacing={1}>
          <Typography variant="subtitle2">Store invoice (goods)</Typography>
          {hasInvoice ? (
            <>
              <Typography variant="body2">
                File:{' '}
                <Link href={order.store_invoice_url} target="_blank" rel="noopener noreferrer">
                  {order.store_invoice_file_name || 'Open PDF'}
                </Link>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Uploaded: {formatDate(order.store_invoice_uploaded_at)}
              </Typography>
              <Button color="error" variant="outlined" onClick={() => setOpen(true)}>
                Reject invoice
              </Button>
            </>
          ) : rejected ? (
            <Alert severity="warning">
              Invoice rejected on {formatDate(order.store_invoice_rejected_at)}.
              {order.store_invoice_reject_reason
                ? ` Reason: ${order.store_invoice_reject_reason}`
                : ' Awaiting new upload from store.'}
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No store invoice uploaded yet.
            </Typography>
          )}
        </Stack>
      </Stack>

      <Dialog open={open} onClose={() => !loading && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reject store invoice</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This removes the invoice for the customer and notifies the seller to upload a corrected PDF.
          </DialogContentText>
          <TextField
            label="Reason for seller"
            required
            multiline
            minRows={2}
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Wrong GSTIN / amounts do not match order"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirm} disabled={loading || !reason.trim()}>
            {loading ? 'Rejecting…' : 'Reject & notify'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
