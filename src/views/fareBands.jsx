'use client';

import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import MainCard from 'components/MainCard';
import { listFareBands, createFareBand, updateFareBand, deleteFareBand } from 'api/adminFarePayouts';
import { Button, Stack, TextField, Typography, CircularProgress, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const formatCents = (v) => (v === '' || v == null ? '' : Number(v) / 100);
const toCents = (v) => {
  if (v === '' || v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

const defaultForm = {
  min_order_cents: '',
  max_order_cents: '',
  customer_delivery_cents: '',
  customer_platform_fee_cents: '',
  vendor_platform_percent: '',
  vendor_delivery_cents: '',
  vendor_payment_gateway_percent: '',
  sort_order: 0
};

export function FareBandsView() {
  const [loading, setLoading] = useState(true);
  const [bands, setBands] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listFareBands();
      setBands(res?.data ?? []);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to load bands', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...defaultForm, max_order_cents: '999999999' });
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      min_order_cents: formatCents(row.min_order_cents) ?? '',
      max_order_cents: formatCents(row.max_order_cents) ?? '',
      customer_delivery_cents: formatCents(row.customer_delivery_cents) ?? '',
      customer_platform_fee_cents: row.customer_platform_fee_cents != null ? formatCents(row.customer_platform_fee_cents) : '',
      vendor_platform_percent: row.vendor_platform_percent ?? '',
      vendor_delivery_cents: formatCents(row.vendor_delivery_cents) ?? '',
      vendor_payment_gateway_percent: row.vendor_payment_gateway_percent ?? '',
      sort_order: row.sort_order ?? 0
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        min_order_cents: toCents(form.min_order_cents),
        max_order_cents: toCents(form.max_order_cents),
        customer_delivery_cents: toCents(form.customer_delivery_cents),
        customer_platform_fee_cents: form.customer_platform_fee_cents === '' ? null : toCents(form.customer_platform_fee_cents),
        vendor_platform_percent: Number(form.vendor_platform_percent) || 0,
        vendor_delivery_cents: toCents(form.vendor_delivery_cents),
        vendor_payment_gateway_percent: form.vendor_payment_gateway_percent === '' ? null : Number(form.vendor_payment_gateway_percent),
        sort_order: Number(form.sort_order) || 0
      };
      if (editingId) {
        await updateFareBand(editingId, payload);
        enqueueSnackbar('Band updated', { variant: 'success' });
      } else {
        await createFareBand(payload);
        enqueueSnackbar('Band created', { variant: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Failed to save', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this band?')) return;
    try {
      await deleteFareBand(id);
      enqueueSnackbar('Band deleted', { variant: 'success' });
      load();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Failed to delete', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <MainCard title="Fare Bands">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Fare Bands" secondary={<Button startIcon={<PlusOutlined />} onClick={openAdd} variant="contained">Add band</Button>}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Min order (₹)</TableCell>
              <TableCell>Max order (₹)</TableCell>
              <TableCell>Customer delivery (₹)</TableCell>
              <TableCell>Vendor platform %</TableCell>
              <TableCell>Vendor delivery (₹)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bands.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No bands. Add a default band (e.g. 0 to 999999) for dynamic pricing.</TableCell></TableRow>
            ) : (
              bands.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatCents(row.min_order_cents)}</TableCell>
                  <TableCell>{formatCents(row.max_order_cents)}</TableCell>
                  <TableCell>{formatCents(row.customer_delivery_cents)}</TableCell>
                  <TableCell>{row.vendor_platform_percent}%</TableCell>
                  <TableCell>{formatCents(row.vendor_delivery_cents)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(row)}><EditOutlined /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(row.id)}><DeleteOutlined /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit band' : 'Add band'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Min order (₹)" type="number" value={form.min_order_cents} onChange={handleChange('min_order_cents')} fullWidth size="small" />
            <TextField label="Max order (₹)" type="number" value={form.max_order_cents} onChange={handleChange('max_order_cents')} fullWidth size="small" />
            <TextField label="Customer delivery (₹)" type="number" value={form.customer_delivery_cents} onChange={handleChange('customer_delivery_cents')} fullWidth size="small" />
            <TextField label="Customer platform fee (₹) optional" type="number" value={form.customer_platform_fee_cents} onChange={handleChange('customer_platform_fee_cents')} fullWidth size="small" />
            <TextField label="Vendor platform %" type="number" value={form.vendor_platform_percent} onChange={handleChange('vendor_platform_percent')} fullWidth size="small" />
            <TextField label="Vendor delivery (₹)" type="number" value={form.vendor_delivery_cents} onChange={handleChange('vendor_delivery_cents')} fullWidth size="small" />
            <TextField label="Vendor gateway % optional" type="number" value={form.vendor_payment_gateway_percent} onChange={handleChange('vendor_payment_gateway_percent')} fullWidth size="small" />
            <TextField label="Sort order" type="number" value={form.sort_order} onChange={handleChange('sort_order')} fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

export default FareBandsView;
