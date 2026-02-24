'use client';

import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import MainCard from 'components/MainCard';
import { getActiveFare, updateActiveFare } from 'api/adminFarePayouts';
import {
  Button,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Box,
  InputAdornment
} from '@mui/material';

const formatCents = (v) => (v === '' || v == null ? '' : Number(v) / 100);
const toCents = (v) => {
  if (v === '' || v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

const formatTime = (v) => {
  if (!v) return '';
  const s = String(v);
  const m = s.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : '';
};

export function FareView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    platform_fee_percent: '',
    gst_percent: '',
    gst_on_platform_percent: '',
    gst_on_delivery_percent: '',
    gst_on_gateway_percent: '',
    free_km: '',
    km_surcharge_cents: '',
    platform_fee_flat_cents: '',
    payment_gateway_percent: '',
    delivery_fee_base_cents: '',
    delivery_fee_per_km_cents: '',
    rider_fee_base_cents: '',
    rider_fee_per_km_cents: '',
    night_charge_start: '',
    night_charge_end: '',
    night_charge_cents: ''
  });

  const loadFare = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getActiveFare();
      const data = res?.data ?? res;
      if (!data) {
        setError('No active fare found');
        return;
      }
      setForm({
        platform_fee_percent: data.platform_fee_percent ?? '',
        gst_percent: data.gst_percent ?? '',
        gst_on_platform_percent: data.gst_on_platform_percent ?? '',
        gst_on_delivery_percent: data.gst_on_delivery_percent ?? '',
        gst_on_gateway_percent: data.gst_on_gateway_percent ?? '',
        free_km: data.free_km ?? '',
        km_surcharge_cents: formatCents(data.km_surcharge_cents),
        platform_fee_flat_cents: formatCents(data.platform_fee_flat_cents),
        payment_gateway_percent: data.payment_gateway_percent ?? '',
        delivery_fee_base_cents: formatCents(data.delivery_fee_base_cents),
        delivery_fee_per_km_cents: formatCents(data.delivery_fee_per_km_cents),
        rider_fee_base_cents: formatCents(data.rider_fee_base_cents),
        rider_fee_per_km_cents: formatCents(data.rider_fee_per_km_cents),
        night_charge_start: formatTime(data.night_charge_start),
        night_charge_end: formatTime(data.night_charge_end),
        night_charge_cents: formatCents(data.night_charge_cents)
      });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load fare';
      setError(msg);
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFare();
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateActiveFare({
        platform_fee_percent: form.platform_fee_percent === '' ? 0 : Number(form.platform_fee_percent),
        gst_percent: form.gst_percent === '' ? 0 : Number(form.gst_percent),
        gst_on_platform_percent: form.gst_on_platform_percent === '' ? null : Number(form.gst_on_platform_percent),
        gst_on_delivery_percent: form.gst_on_delivery_percent === '' ? null : Number(form.gst_on_delivery_percent),
        gst_on_gateway_percent: form.gst_on_gateway_percent === '' ? null : Number(form.gst_on_gateway_percent),
        free_km: form.free_km === '' ? null : Number(form.free_km),
        km_surcharge_cents: form.km_surcharge_cents === '' ? null : toCents(form.km_surcharge_cents),
        platform_fee_flat_cents: form.platform_fee_flat_cents === '' ? null : toCents(form.platform_fee_flat_cents),
        payment_gateway_percent: form.payment_gateway_percent === '' ? null : Number(form.payment_gateway_percent),
        delivery_fee_base_cents: toCents(form.delivery_fee_base_cents),
        delivery_fee_per_km_cents: toCents(form.delivery_fee_per_km_cents),
        rider_fee_base_cents: toCents(form.rider_fee_base_cents),
        rider_fee_per_km_cents: toCents(form.rider_fee_per_km_cents),
        night_charge_start: form.night_charge_start || null,
        night_charge_end: form.night_charge_end || null,
        night_charge_cents: toCents(form.night_charge_cents)
      });
      enqueueSnackbar('Fare updated successfully', { variant: 'success' });
      loadFare();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Failed to update fare', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainCard title="Fare &amp; Pricing">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (error) {
    return (
      <MainCard title="Fare &amp; Pricing">
        <Typography color="error">{error}</Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={loadFare}>
          Retry
        </Button>
      </MainCard>
    );
  }

  return (
    <MainCard title="Fare &amp; Pricing">
      <form onSubmit={handleSubmit}>
        <Stack spacing={2.5} sx={{ maxWidth: 480 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Platform &amp; tax
          </Typography>
          <TextField
            label="Platform fee (%)"
            type="number"
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            value={form.platform_fee_percent}
            onChange={handleChange('platform_fee_percent')}
            fullWidth
            size="small"
          />
          <TextField
            label="GST (%) default"
            type="number"
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            value={form.gst_percent}
            onChange={handleChange('gst_percent')}
            fullWidth
            size="small"
            helperText="Used when per-component GST not set"
          />
          <Typography variant="caption" color="text.secondary">GST per component (optional, overrides default)</Typography>
          <Stack direction="row" spacing={2}>
            <TextField label="GST on platform (%)" type="number" inputProps={{ min: 0, max: 100, step: 0.01 }} value={form.gst_on_platform_percent} onChange={handleChange('gst_on_platform_percent')} fullWidth size="small" />
            <TextField label="GST on delivery (%)" type="number" inputProps={{ min: 0, max: 100, step: 0.01 }} value={form.gst_on_delivery_percent} onChange={handleChange('gst_on_delivery_percent')} fullWidth size="small" />
            <TextField label="GST on gateway (%)" type="number" inputProps={{ min: 0, max: 100, step: 0.01 }} value={form.gst_on_gateway_percent} onChange={handleChange('gst_on_gateway_percent')} fullWidth size="small" />
          </Stack>

          <Typography variant="subtitle2" color="text.secondary" sx={{ pt: 1 }}>
            Dynamic pricing (customer)
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField label="Free km" type="number" inputProps={{ min: 0, step: 0.1 }} value={form.free_km} onChange={handleChange('free_km')} fullWidth size="small" />
            <TextField label="Km surcharge (₹/km)" type="number" inputProps={{ min: 0, step: 0.01 }} value={form.km_surcharge_cents} onChange={handleChange('km_surcharge_cents')} fullWidth size="small" InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Platform fee flat (₹)" type="number" inputProps={{ min: 0, step: 0.01 }} value={form.platform_fee_flat_cents} onChange={handleChange('platform_fee_flat_cents')} fullWidth size="small" InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
            <TextField label="Payment gateway (%)" type="number" inputProps={{ min: 0, max: 100, step: 0.01 }} value={form.payment_gateway_percent} onChange={handleChange('payment_gateway_percent')} fullWidth size="small" />
          </Stack>

          <Typography variant="subtitle2" color="text.secondary" sx={{ pt: 1 }}>
            Delivery fee (customer-facing, fallback)
          </Typography>
          <TextField
            label="Base delivery fee (₹)"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={form.delivery_fee_base_cents}
            onChange={handleChange('delivery_fee_base_cents')}
            fullWidth
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />
          <TextField
            label="Delivery fee per km (₹)"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={form.delivery_fee_per_km_cents}
            onChange={handleChange('delivery_fee_per_km_cents')}
            fullWidth
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />

          <Typography variant="subtitle2" color="text.secondary" sx={{ pt: 1 }}>
            Rider fee (payout)
          </Typography>
          <TextField
            label="Base rider fee (₹)"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={form.rider_fee_base_cents}
            onChange={handleChange('rider_fee_base_cents')}
            fullWidth
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />
          <TextField
            label="Rider fee per km (₹)"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={form.rider_fee_per_km_cents}
            onChange={handleChange('rider_fee_per_km_cents')}
            fullWidth
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />

          <Typography variant="subtitle2" color="text.secondary" sx={{ pt: 1 }}>
            Night charges
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Start (HH:mm)"
              type="time"
              value={form.night_charge_start}
              onChange={handleChange('night_charge_start')}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End (HH:mm)"
              type="time"
              value={form.night_charge_end}
              onChange={handleChange('night_charge_end')}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <TextField
            label="Night charge amount (₹)"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={form.night_charge_cents}
            onChange={handleChange('night_charge_cents')}
            fullWidth
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />

          <Button type="submit" variant="contained" disabled={saving} sx={{ mt: 2 }}>
            {saving ? 'Saving…' : 'Save fare'}
          </Button>
        </Stack>
      </form>
    </MainCard>
  );
}

export default FareView;
