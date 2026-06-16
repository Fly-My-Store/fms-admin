'use client';

import { useMemo, useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { initiateRefundForOrder } from 'api/ordersPayments';

const REFUNDABLE_GATEWAY = ['CAPTURED', 'AUTHORIZED'];

const formatINR = (cents) => {
  const n = Number(cents);
  if (!Number.isFinite(n)) return '₹0.00';
  return `₹${(n / 100).toFixed(2)}`;
};

export default function OrderRefundCard({ order, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);

  const paymentInfo = useMemo(() => {
    const payments = order?.payments || [];
    const payment = payments.find((p) => REFUNDABLE_GATEWAY.includes(p.status));
    if (!payment) return null;
    const refunds = payment.Refunds || payment.refunds || [];
    const refunded = refunds.reduce((sum, r) => sum + Number(r.amount_cents || 0), 0);
    const total = Number(payment.amount_cents || 0);
    const remaining = Math.max(0, total - refunded);
    return { payment, refunded, remaining, total };
  }, [order]);

  if (!paymentInfo || paymentInfo.remaining <= 0) return null;

  const defaultAmount = (paymentInfo.remaining / 100).toFixed(2);
  const displayAmount = amount !== '' ? amount : defaultAmount;

  const handleSubmit = async () => {
    const rupees = Number(displayAmount);
    if (!Number.isFinite(rupees) || rupees <= 0) {
      onSuccess?.('Enter a valid refund amount', 'error');
      return;
    }
    const amount_cents = Math.round(rupees * 100);
    if (amount_cents > paymentInfo.remaining) {
      onSuccess?.('Amount exceeds refundable balance', 'error');
      return;
    }
    setLoading(true);
    try {
      await initiateRefundForOrder(order.id, {
        amount_cents,
        reason: reason.trim() || null,
        gateway_refund_id: reference.trim() || null
      });
      setAmount('');
      setReason('');
      setReference('');
      onSuccess?.('Refund recorded');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Refund failed';
      onSuccess?.(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Record refund">
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Payment: {formatINR(paymentInfo.total)} ({paymentInfo.payment.gateway}) · Already refunded:{' '}
          {formatINR(paymentInfo.refunded)} · Remaining: {formatINR(paymentInfo.remaining)}
        </Typography>
        <TextField
          label="Amount (₹)"
          type="number"
          inputProps={{ min: 0, step: 0.01 }}
          value={displayAmount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
        />
        <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth multiline minRows={2} />
        <TextField
          label="Reference (UPI / bank ref)"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Recording…' : 'Record refund'}
        </Button>
      </Stack>
    </MainCard>
  );
}
