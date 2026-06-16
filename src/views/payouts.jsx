'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import MainCard from 'components/MainCard';
import { listPayouts, createPayout, getPayoutSummary } from 'api/adminFarePayouts';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
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

const emptyDialogForm = {
  payee_type: 'RIDER',
  payee_id: '',
  payee_name: '',
  amount_cents: '',
  reference: '',
  notes: ''
};

function PayeeTable({ rows, onPayFull, onRecordCustom, emptyLabel, payingKey }) {
  if (!rows.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        {emptyLabel}
      </Typography>
    );
  }

  return (
    <Box sx={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8 }}>Payee</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Payout details</th>
            <th style={{ textAlign: 'right', padding: 8 }}>Pending</th>
            <th style={{ textAlign: 'right', padding: 8 }}>Earned</th>
            <th style={{ textAlign: 'right', padding: 8 }}>Paid out</th>
            <th style={{ textAlign: 'right', padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const pending = Number(row.balance_pending_cents || 0);
            const canPay = pending > 0;
            const rowKey = `${row.payee_type}-${row.payee_id}`;
            const isPaying = payingKey === rowKey;
            return (
              <tr key={rowKey}>
                <td style={{ padding: 8, verticalAlign: 'top' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {row.payee_name || '—'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {row.payee_email || row.payee_phone || row.payee_id}
                  </Typography>
                </td>
                <td style={{ padding: 8, verticalAlign: 'top', maxWidth: 280 }}>
                  <Typography variant="caption" color="text.secondary">
                    {row.payout_hint || 'No payout details on file'}
                  </Typography>
                </td>
                <td style={{ padding: 8, textAlign: 'right', verticalAlign: 'top' }}>
                  <Typography variant="body2" fontWeight={canPay ? 700 : 400}>
                    {formatINR(pending)}
                  </Typography>
                </td>
                <td style={{ padding: 8, textAlign: 'right', verticalAlign: 'top' }}>{formatINR(row.total_earned_cents)}</td>
                <td style={{ padding: 8, textAlign: 'right', verticalAlign: 'top' }}>{formatINR(row.total_paid_out_cents)}</td>
                <td style={{ padding: 8, textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="contained"
                      disabled={!canPay || isPaying}
                      onClick={() => onPayFull(row)}
                    >
                      {isPaying ? 'Paying…' : 'Pay full'}
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => onRecordCustom(row)}>
                      Custom
                    </Button>
                  </Stack>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
}

export function PayoutsView() {
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState({ riders: [], sellers: [] });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryTab, setSummaryTab] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listParams, setListParams] = useState({ limit: 50, offset: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSaving, setDialogSaving] = useState(false);
  const [payingKey, setPayingKey] = useState('');
  const [dialogForm, setDialogForm] = useState(emptyDialogForm);

  const openDialogForPayee = useCallback((row, amountCents = '') => {
    setDialogForm({
      payee_type: row.payee_type,
      payee_id: row.payee_id,
      payee_name: row.payee_name || '',
      amount_cents: amountCents === '' ? '' : String(amountCents),
      reference: '',
      notes: ''
    });
    setDialogOpen(true);
  }, []);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await getPayoutSummary({ pending_only: true });
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

  useEffect(() => {
    const payeeType = searchParams.get('payee_type');
    const payeeId = searchParams.get('payee_id');
    const amountCents = searchParams.get('amount_cents');
    if (!payeeType || !payeeId) return;

    openDialogForPayee(
      {
        payee_type: payeeType,
        payee_id: payeeId,
        payee_name: decodeURIComponent(searchParams.get('payee_name') || '')
      },
      amountCents || ''
    );
  }, [searchParams, openDialogForPayee]);

  const handleCreatePayout = () => {
    setDialogForm(emptyDialogForm);
    setDialogOpen(true);
  };

  const handleDialogClose = () => setDialogOpen(false);

  const submitPayout = async (form, { closeDialog = true } = {}) => {
    const amount = form.amount_cents === '' ? 0 : Number(form.amount_cents);
    if (!form.payee_id?.trim()) {
      enqueueSnackbar('Payee ID is required', { variant: 'error' });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      enqueueSnackbar('Amount must be a positive number (in paisa)', { variant: 'error' });
      return;
    }

    const rowKey = `${form.payee_type}-${form.payee_id}`;
    if (closeDialog) setDialogSaving(true);
    else setPayingKey(rowKey);

    try {
      await createPayout({
        payee_type: form.payee_type,
        payee_id: form.payee_id.trim(),
        amount_cents: Math.round(amount),
        reference: form.reference?.trim() || undefined,
        notes: form.notes?.trim() || undefined
      });
      enqueueSnackbar('Payout recorded', { variant: 'success' });
      if (closeDialog) handleDialogClose();
      loadSummary();
      loadList();
    } catch (e) {
      enqueueSnackbar(e?.message || e?.response?.data?.message || 'Failed to create payout', { variant: 'error' });
    } finally {
      if (closeDialog) setDialogSaving(false);
      else setPayingKey('');
    }
  };

  const handleDialogSubmit = () => submitPayout(dialogForm);

  const handlePayFull = async (row) => {
    const pending = Number(row.balance_pending_cents || 0);
    if (pending <= 0) return;
    await submitPayout(
      {
        payee_type: row.payee_type,
        payee_id: row.payee_id,
        payee_name: row.payee_name || '',
        amount_cents: String(pending),
        reference: '',
        notes: 'Full pending balance'
      },
      { closeDialog: false }
    );
  };

  const totalRiderPending = useMemo(
    () => summary.riders.reduce((s, w) => s + Number(w.balance_pending_cents || 0), 0),
    [summary.riders]
  );
  const totalSellerPending = useMemo(
    () => summary.sellers.reduce((s, w) => s + Number(w.balance_pending_cents || 0), 0),
    [summary.sellers]
  );

  const amountInrPreview = useMemo(() => {
    const amount = Number(dialogForm.amount_cents);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return formatINR(amount);
  }, [dialogForm.amount_cents]);

  return (
    <>
      <Stack spacing={2}>
        <MainCard title="Payouts" secondary={<Button variant="contained" onClick={handleCreatePayout}>Record payout</Button>}>
          {summaryLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                <Card variant="outlined" sx={{ minWidth: 200 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Riders pending</Typography>
                    <Typography variant="h6">{formatINR(totalRiderPending)}</Typography>
                    <Typography variant="caption">{summary.riders.length} with balance due</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ minWidth: 200 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Sellers pending</Typography>
                    <Typography variant="h6">{formatINR(totalSellerPending)}</Typography>
                    <Typography variant="caption">{summary.sellers.length} with balance due</Typography>
                  </CardContent>
                </Card>
              </Stack>

              <Box>
                <Tabs value={summaryTab} onChange={(_, value) => setSummaryTab(value)} sx={{ mb: 1 }}>
                  <Tab label={`Riders (${summary.riders.length})`} />
                  <Tab label={`Sellers (${summary.sellers.length})`} />
                </Tabs>
                {summaryTab === 0 ? (
                  <PayeeTable
                    rows={summary.riders}
                    onPayFull={handlePayFull}
                    onRecordCustom={(row) => openDialogForPayee(row)}
                    emptyLabel="No riders with pending balance."
                    payingKey={payingKey}
                  />
                ) : (
                  <PayeeTable
                    rows={summary.sellers}
                    onPayFull={handlePayFull}
                    onRecordCustom={(row) => openDialogForPayee(row)}
                    emptyLabel="No sellers with pending balance."
                    payingKey={payingKey}
                  />
                )}
              </Box>
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
                    <th style={{ textAlign: 'left', padding: 8 }}>Payee</th>
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
                        <td style={{ padding: 8 }}>
                          <Chip size="small" label={t.payee_type} variant="light" />
                        </td>
                        <td style={{ padding: 8 }}>
                          <Typography variant="body2">{t.payee_name || '—'}</Typography>
                          <Typography variant="caption" color="text.secondary">{t.payee_id}</Typography>
                        </td>
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
            {dialogForm.payee_name ? (
              <Typography variant="body2" color="text.secondary">
                Payee: <strong>{dialogForm.payee_name}</strong>
              </Typography>
            ) : null}
            <TextField
              label="Payee ID"
              value={dialogForm.payee_id}
              onChange={(e) => setDialogForm((p) => ({ ...p, payee_id: e.target.value }))}
              fullWidth
              size="small"
              placeholder="Seller or rider UUID"
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
              helperText={amountInrPreview ? `${amountInrPreview} · 10000 paisa = ₹100.00` : 'Enter amount in paisa (e.g. 10000 = ₹100.00)'}
              required
            />
            <TextField
              label="Reference"
              value={dialogForm.reference}
              onChange={(e) => setDialogForm((p) => ({ ...p, reference: e.target.value }))}
              fullWidth
              size="small"
              placeholder="UTR / bank reference"
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

export default function PayoutsPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}>
      <PayoutsView />
    </Suspense>
  );
}
