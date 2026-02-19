'use client';

import { useCallback, useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import MainCard from 'components/MainCard';
import { listPayouts, createPayout, getPayoutSummary } from 'api/adminFarePayouts';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  Typography,
  CircularProgress
} from '@mui/material';

const PAYEE_TYPES = [
  { value: 'RIDER', label: 'Rider' },
  { value: 'SELLER', label: 'Seller' }
];

const formatINR = (cents) => {
  const n = Number(cents);
  if (!Number.isFinite(n)) return '₹0.00';
  return `₹${(n / 100).toFixed(2)}`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

export function PayoutsView() {
  const [summary, setSummary] = useState({ riders: [], sellers: [] });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listParams, setListParams] = useState({ payee_type: '', payee_id: '', limit: 50, offset: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSaving, setDialogSaving] = useState(false);
  const [dialogForm, setDialogForm] = useState({
    payee_type: 'RIDER',
    payee_id: '',
    amount_cents: '',
    reference: '',
    notes: ''
  });

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await getPayoutSummary();
      const data = res?.data ?? res;
      setSummary({
        riders: data?.riders ?? [],
        sellers: data?.sellers ?? []
      });
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to load summary', { variant: 'error' });
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await listPayouts(listParams);
      const list = res?.data ?? res;
      setRows(Array.isArray(list) ? list : []);
      setTotal(res?.total ?? (Array.isArray(list) ? list.length : 0));
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to load payouts', { variant: 'error' });
      setRows([]);
    } finally {
      setListLoading(false);
    }
  }, [listParams]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleCreatePayout = () => {
    setDialogForm({
      payee_type: 'RIDER',
      payee_id: '',
      amount_cents: '',
      reference: '',
      notes: ''
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => setDialogOpen(false);

  const handleDialogSubmit = async () => {
    const amount = dialogForm.amount_cents === '' ? 0 : Number(dialogForm.amount_cents);
    if (!dialogForm.payee_id?.trim()) {
      enqueueSnackbar('Payee ID is required', { variant: 'error' });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      enqueueSnackbar('Amount must be a positive number (in paisa)', { variant: 'error' });
      return;
    }
    setDialogSaving(true);
    try {
      await createPayout({
        payee_type: dialogForm.payee_type,
        payee_id: dialogForm.payee_id.trim(),
        amount_cents: Math.round(amount),
        reference: dialogForm.reference?.trim() || undefined,
        notes: dialogForm.notes?.trim() || undefined
      });
      enqueueSnackbar('Payout recorded', { variant: 'success' });
      handleDialogClose();
      loadSummary();
      loadList();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to create payout', { variant: 'error' });
    } finally {
      setDialogSaving(false);
    }
  };

  const totalRiderPending = summary.riders.reduce((s, w) => s + Number(w.balance_pending_cents || 0), 0);
  const totalSellerPending = summary.sellers.reduce((s, w) => s + Number(w.balance_pending_cents || 0), 0);

  return (
    <>
      <Stack spacing={2}>
        <MainCard title="Payouts" secondary={<Button variant="contained" onClick={handleCreatePayout}>Record payout</Button>}>
          {summaryLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
              <Card variant="outlined" sx={{ minWidth: 200 }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">Riders pending</Typography>
                  <Typography variant="h6">{formatINR(totalRiderPending)}</Typography>
                  <Typography variant="caption">{summary.riders.length} wallet(s)</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ minWidth: 200 }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">Sellers pending</Typography>
                  <Typography variant="h6">{formatINR(totalSellerPending)}</Typography>
                  <Typography variant="caption">{summary.sellers.length} wallet(s)</Typography>
                </CardContent>
              </Card>
            </Stack>
          )}
        </MainCard>

        <MainCard title="Payout history">
          {listLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box sx={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Type</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Payee ID</th>
                    <th style={{ textAlign: 'right', padding: 8 }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Reference</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 16, color: 'var(--mui-palette-text-secondary)' }}>No payouts yet</td>
                    </tr>
                  ) : (
                    rows.map((t) => (
                      <tr key={t.id}>
                        <td style={{ padding: 8 }}>{formatDate(t.paid_at || t.created_at)}</td>
                        <td style={{ padding: 8 }}>{t.payee_type}</td>
                        <td style={{ padding: 8 }}>{t.payee_id}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{formatINR(t.amount_cents)}</td>
                        <td style={{ padding: 8 }}>{t.reference || '—'}</td>
                        <td style={{ padding: 8 }}>{t.notes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {total > rows.length && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  Showing {rows.length} of {total}
                </Typography>
              )}
            </Box>
          )}
        </MainCard>
      </Stack>

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Record payout</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Payee type</InputLabel>
              <Select
                value={dialogForm.payee_type}
                label="Payee type"
                onChange={(e) => setDialogForm((p) => ({ ...p, payee_type: e.target.value }))}
              >
                {PAYEE_TYPES.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Payee ID"
              value={dialogForm.payee_id}
              onChange={(e) => setDialogForm((p) => ({ ...p, payee_id: e.target.value }))}
              fullWidth
              size="small"
              placeholder="UUID or numeric ID"
              required
            />
            <TextField
              label="Amount (paisa)"
              type="number"
              inputProps={{ min: 1 }}
              value={dialogForm.amount_cents}
              onChange={(e) => setDialogForm((p) => ({ ...p, amount_cents: e.target.value }))}
              fullWidth
              size="small"
              helperText="Enter amount in paisa (e.g. 10000 = ₹100.00)"
              required
            />
            <TextField
              label="Reference"
              value={dialogForm.reference}
              onChange={(e) => setDialogForm((p) => ({ ...p, reference: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Notes"
              value={dialogForm.notes}
              onChange={(e) => setDialogForm((p) => ({ ...p, notes: e.target.value }))}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleDialogSubmit} disabled={dialogSaving}>
            {dialogSaving ? 'Saving…' : 'Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PayoutsView;
