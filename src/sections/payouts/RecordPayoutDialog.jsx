'use client';

import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { createPayout } from 'api/adminFarePayouts';
import { formatINR } from 'utils/currency';

const PAYEE_TYPES = [
  { value: 'RIDER', label: 'Rider' },
  { value: 'SELLER', label: 'Seller' }
];

const emptyForm = {
  payee_type: 'RIDER',
  payee_id: '',
  payee_name: '',
  amount_cents: '',
  reference: '',
  notes: '',
  admin_password: ''
};

export default function RecordPayoutDialog({
  open,
  onClose,
  payee,
  amountCents = '',
  lockPayee = false,
  lockAmount = false,
  isFullPayout = false,
  payoutHint = '',
  onSuccess
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      payee_type: payee?.payee_type || 'RIDER',
      payee_id: payee?.payee_id || '',
      payee_name: payee?.payee_name || '',
      amount_cents: amountCents === '' || amountCents == null ? '' : String(amountCents),
      reference: '',
      notes: isFullPayout ? 'Full pending balance' : '',
      admin_password: ''
    });
    setConfirmed(false);
  }, [open, payee, amountCents, isFullPayout]);

  const amountInrPreview = useMemo(() => {
    const amount = Number(form.amount_cents);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return formatINR(amount);
  }, [form.amount_cents]);

  const canSubmit =
    form.payee_id?.trim() &&
    Number(form.amount_cents) > 0 &&
    form.reference?.trim().length >= 4 &&
    form.admin_password?.length >= 6 &&
    confirmed;

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
    if (!form.reference?.trim() || form.reference.trim().length < 4) {
      enqueueSnackbar('Bank reference / UTR is required (min 4 characters)', { variant: 'error' });
      return;
    }
    if (!form.admin_password || form.admin_password.length < 6) {
      enqueueSnackbar('Enter your admin password to confirm', { variant: 'error' });
      return;
    }
    if (!confirmed) {
      enqueueSnackbar('Please confirm the transfer was completed', { variant: 'error' });
      return;
    }

    setSaving(true);
    try {
      await createPayout({
        payee_type: form.payee_type,
        payee_id: form.payee_id.trim(),
        amount_cents: Math.round(amount),
        reference: form.reference.trim(),
        notes: form.notes?.trim() || undefined,
        admin_password: form.admin_password
      });
      const label = form.payee_name ? ` for ${form.payee_name}` : '';
      enqueueSnackbar(`Payout of ${formatINR(amount)} recorded${label}`, { variant: 'success', autoHideDuration: 6000 });
      onClose();
      onSuccess?.();
    } catch (e) {
      enqueueSnackbar(e?.message || e?.response?.data?.message || 'Failed to create payout', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const hint = payoutHint || payee?.payout_hint || '';

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isFullPayout ? 'Confirm full payout' : 'Record payout'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="warning">
            {isFullPayout
              ? 'This will record a payout for the full pending balance. Only proceed after the bank/UPI transfer is complete.'
              : 'Record a payout only after the bank/UPI transfer is complete. This action cannot be undone.'}
          </Alert>

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
              {isFullPayout && amountInrPreview ? (
                <>
                  {' '}
                  · Amount: <strong>{amountInrPreview}</strong>
                </>
              ) : null}
            </Typography>
          ) : null}

          {hint ? (
            <Typography variant="body2" color="text.secondary">
              Payout to: {hint}
            </Typography>
          ) : (
            <Alert severity="info" variant="outlined">
              No payout account on file — verify payee bank/UPI details before transferring.
            </Alert>
          )}

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
            disabled={lockAmount}
            helperText={
              amountInrPreview
                ? `${amountInrPreview} · 10000 paisa = ₹100.00`
                : 'Enter amount in paisa (e.g. 10000 = ₹100.00)'
            }
            required
          />

          <TextField
            label="Bank reference / UTR"
            value={form.reference}
            onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
            fullWidth
            size="small"
            placeholder="UTR, transaction ID, or bank reference"
            required
            helperText="Required — enter the transfer reference from your bank or UPI app"
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

          <TextField
            label="Your admin password"
            type="password"
            value={form.admin_password}
            onChange={(e) => setForm((p) => ({ ...p, admin_password: e.target.value }))}
            fullWidth
            size="small"
            required
            autoComplete="current-password"
            helperText="Re-enter your password to authorize this payout"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
            }
            label="I confirm the bank/UPI transfer has been completed for this amount"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" color={isFullPayout ? 'warning' : 'primary'} onClick={handleSubmit} disabled={saving || !canSubmit}>
          {saving ? 'Recording…' : isFullPayout ? 'Confirm payout' : 'Record payout'}
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
    payee_name: PropTypes.string,
    payout_hint: PropTypes.string
  }),
  amountCents: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lockPayee: PropTypes.bool,
  lockAmount: PropTypes.bool,
  isFullPayout: PropTypes.bool,
  payoutHint: PropTypes.string,
  onSuccess: PropTypes.func
};
