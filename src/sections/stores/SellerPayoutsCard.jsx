'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import RecordPayoutDialog from 'sections/payouts/RecordPayoutDialog';
import { getPayoutSummary, listPayouts } from 'api/adminFarePayouts';
import { formatINR } from 'utils/currency';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

export default function SellerPayoutsCard({ sellerId, sellerName, onPayoutRecorded }) {
  const [wallet, setWallet] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAmount, setDialogAmount] = useState('');

  const load = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, listRes] = await Promise.all([
        getPayoutSummary({ payee_type: 'SELLER', payee_id: sellerId }),
        listPayouts({ payee_type: 'SELLER', payee_id: sellerId, limit: 20 })
      ]);
      const summaryData = summaryRes?.data ?? summaryRes;
      setWallet(summaryData?.wallet ?? null);
      const list = listRes?.data ?? listRes;
      setPayouts(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load payout data');
      setWallet(null);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    load();
  }, [load]);

  const pending = Number(wallet?.balance_pending_cents || 0);
  const hasWalletActivity =
    pending > 0 ||
    Number(wallet?.total_earned_cents || 0) > 0 ||
    Number(wallet?.total_paid_out_cents || 0) > 0 ||
    payouts.length > 0;

  const openPayoutDialog = (amountCents = '') => {
    setDialogAmount(amountCents);
    setDialogOpen(true);
  };

  const handlePayoutSuccess = () => {
    load();
    onPayoutRecorded?.();
  };

  const payee = {
    payee_type: 'SELLER',
    payee_id: sellerId || '',
    payee_name: sellerName || wallet?.payee_name || ''
  };

  if (!sellerId) return null;

  return (
    <>
      <MainCard
        title="Payments & payouts"
        secondary={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={() => openPayoutDialog('')}>
              Record payout
            </Button>
            <Button component={Link} href="/payouts" variant="text" size="small">
              All payouts
            </Button>
          </Stack>
        }
      >
        {loading && (
          <Stack alignItems="center" py={2}>
            <CircularProgress size={24} />
          </Stack>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    Pending balance
                  </Typography>
                  <Typography variant="h6">{formatINR(wallet?.balance_pending_cents ?? 0)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    Total earned
                  </Typography>
                  <Typography variant="h6">{formatINR(wallet?.total_earned_cents ?? 0)}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    Paid out
                  </Typography>
                  <Typography variant="h6">{formatINR(wallet?.total_paid_out_cents ?? 0)}</Typography>
                </CardContent>
              </Card>
            </Stack>
            {!hasWalletActivity && (
              <Alert severity="info">
                No earnings recorded yet. Seller wallet balances update after completed orders with captured payments.
              </Alert>
            )}
            {wallet?.payout_hint && (
              <Typography variant="body2" color="text.secondary">
                Payout account: {wallet.payout_hint}
              </Typography>
            )}
            {pending > 0 && (
              <Button
                variant="contained"
                size="small"
                sx={{ alignSelf: 'flex-start' }}
                onClick={() => openPayoutDialog(pending)}
              >
                Pay full pending ({formatINR(pending)})
              </Button>
            )}
            <Typography variant="subtitle2">Recent payouts</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.paid_at || p.created_at)}</TableCell>
                    <TableCell align="right">{formatINR(p.amount_cents)}</TableCell>
                    <TableCell>{p.reference || '—'}</TableCell>
                    <TableCell>{p.status || '—'}</TableCell>
                  </TableRow>
                ))}
                {!payouts.length && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary">
                        No payouts recorded yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Stack>
        )}
      </MainCard>

      <RecordPayoutDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        payee={payee}
        amountCents={dialogAmount}
        lockPayee
        onSuccess={handlePayoutSuccess}
      />
    </>
  );
}

SellerPayoutsCard.propTypes = {
  sellerId: PropTypes.string,
  sellerName: PropTypes.string,
  onPayoutRecorded: PropTypes.func
};
