'use client';

import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { createPayout } from 'api/adminFarePayouts';

const PAYEE_TYPES = [
  { value: 'RIDER', label: 'Rider' },
  { value: 'SELLER', label: 'Seller' }
];

const formatINR = (cents) => {
  const n = Number(cents);
  if (!Number.isFinite(n)) return null;
  return `₹${(n / 100).toFixed(2)}`;
};

const emptyForm = {
  payee_type: 'RIDER',
  payee_id: '',
  payee_name: '',
  amount_cents: '',
  reference: '',
  notes: ''
};

export default function RecordPayoutDialog({
  open,
  onClose,
  payee,
  amountCents = '',
  lockPayee = false,
  onSuccess
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      payee_type: payee?.payee_type || 'RIDER',
      payee_id: payee?.payee_id || '',
      payee_name: payee?.payee_name || '',
      amount_cents: amountCents === '' || amountCents == null ? '' : String(amountCents),
      reference: '',
      notes: ''
    });
  }, [open, payee, amountCents]);

  const amountInrPreview = useMemo(() => {
    const amount = Number(form.amount_cents);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return formatINR(amount);
  }, [form.amount_cents]);

  const handleSubmit = async () => {
    const amount = form.amount_cents === '' ? 0 : Number(form.amount_cents);
    if (!form.payee_id?.trim()) {
      enqueueSnackbar('Payee ID is required', { variant: 'error' });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      enqueueSnackbar('Amount must be a positive number (in paisa)', { variant: 'error' });
      return;
    }

    setSaving(true);
    try {
      await createPayout({
        payee_type: form.payee_type,
        payee_id: form.payee_id.trim(),
        amount_cents: Math.round(amount),
        reference: form.reference?.trim() || undefined,
        notes: form.notes?.trim() || undefined
      });
      enqueueSnackbar('Payout recorded', { variant: 'success' });
      onClose();
      onSuccess?.();
    } catch (e) {
      enqueueSnackbar(e?.message || e?.response?.data?.message || 'Failed to create payout', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Record payout</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {!lockPayee && (
            <FormControl fullWidth size="small">
              <InputLabel>Payee type</InputLabel>
              <Select
                value={form.payee_type}
                label="Payee type"
                onChange={(e) => setForm((p) => ({ ...p, payee_type: e.target.value }))}
              >
                {PAYEE_TYPES.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {form.payee_name ? (
            <Typography variant="body2" color="text.secondary">
              Payee: <strong>{form.payee_name}</strong>
            </Typography>
          ) : null}
          {!lockPayee && (
            <TextField
              label="Payee ID"
              value={form.payee_id}
              onChange={(e) => setForm((p) => ({ ...p, payee_id: e.target.value }))}
              fullWidth
              size="small"
              placeholder="Seller or rider UUID"
              required
            />
          )}
          <TextField
            label="Amount (paisa)"
            type="number"
            inputProps={{ min: 1 }}
            value={form.amount_cents}
            onChange={(e) => setForm((p) => ({ ...p, amount_cents: e.target.value }))}
            fullWidth
            size="small"
            helperText={
              amountInrPreview
                ? `${amountInrPreview} · 10000 paisa = ₹100.00`
                : 'Enter amount in paisa (e.g. 10000 = ₹100.00)'
            }
            required
          />
          <TextField
            label="Reference"
            value={form.reference}
            onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
            fullWidth
            size="small"
            placeholder="UTR / bank reference"
          />
          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            fullWidth
            size="small"
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : 'Record'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RecordPayoutDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  payee: PropTypes.shape({
    payee_type: PropTypes.string,
    payee_id: PropTypes.string,
    payee_name: PropTypes.string
  }),
  amountCents: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lockPayee: PropTypes.bool,
  onSuccess: PropTypes.func
};
