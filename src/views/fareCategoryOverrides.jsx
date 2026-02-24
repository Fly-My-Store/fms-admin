'use client';

import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import MainCard from 'components/MainCard';
import { listFareCategoryOverrides, createFareCategoryOverride, updateFareCategoryOverride, deleteFareCategoryOverride } from 'api/adminFarePayouts';
import { listCategories } from 'api/catalog';
import { Button, Stack, TextField, Typography, CircularProgress, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const formatCents = (v) => (v === '' || v == null ? '' : Number(v) / 100);
const toCents = (v) => {
  if (v === '' || v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

const defaultForm = { category_id: '', tier: '', customer_charge_cents: '', vendor_platform_percent: '', vendor_delivery_cents: '' };

export function FareCategoryOverridesView() {
  const [loading, setLoading] = useState(true);
  const [overrides, setOverrides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const loadOverrides = async () => {
    try {
      const res = await listFareCategoryOverrides();
      setOverrides(res?.data ?? []);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to load overrides', { variant: 'error' });
    }
  };

  const loadCategories = async () => {
    try {
      const res = await listCategories({ limit: 500 });
      setCategories(res?.data?.rows ?? res?.rows ?? []);
    } catch (_) {
      setCategories([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadOverrides(), loadCategories()]).finally(() => setLoading(false));
  }, []);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const openAdd = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      category_id: row.category_id ?? '',
      tier: row.tier ?? '',
      customer_charge_cents: formatCents(row.customer_charge_cents) ?? '',
      vendor_platform_percent: row.vendor_platform_percent ?? '',
      vendor_delivery_cents: formatCents(row.vendor_delivery_cents) ?? ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.category_id) {
      enqueueSnackbar('Select a category', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        category_id: form.category_id,
        tier: form.tier || null,
        customer_charge_cents: toCents(form.customer_charge_cents),
        vendor_platform_percent: Number(form.vendor_platform_percent) || 0,
        vendor_delivery_cents: toCents(form.vendor_delivery_cents)
      };
      if (editingId) {
        await updateFareCategoryOverride(editingId, payload);
        enqueueSnackbar('Override updated', { variant: 'success' });
      } else {
        await createFareCategoryOverride(payload);
        enqueueSnackbar('Override created', { variant: 'success' });
      }
      setDialogOpen(false);
      loadOverrides();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Failed to save', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this override?')) return;
    try {
      await deleteFareCategoryOverride(id);
      enqueueSnackbar('Override deleted', { variant: 'success' });
      loadOverrides();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Failed to delete', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <MainCard title="Category pricing overrides">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Category pricing overrides (e.g. screen guard)" secondary={<Button startIcon={<PlusOutlined />} onClick={openAdd} variant="contained">Add override</Button>}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Tier</TableCell>
              <TableCell>Customer charge (₹)</TableCell>
              <TableCell>Vendor platform %</TableCell>
              <TableCell>Vendor delivery (₹)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {overrides.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No overrides. Add one for categories like screen guard.</TableCell></TableRow>
            ) : (
              overrides.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.category?.name ?? row.category_id}</TableCell>
                  <TableCell>{row.tier || '-'}</TableCell>
                  <TableCell>{formatCents(row.customer_charge_cents)}</TableCell>
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
        <DialogTitle>{editingId ? 'Edit override' : 'Add override'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField select label="Category" value={form.category_id} onChange={handleChange('category_id')} fullWidth size="small" disabled={!!editingId}>
              <MenuItem value="">Select…</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name} ({c.slug})</MenuItem>
              ))}
            </TextField>
            <TextField label="Tier (optional)" value={form.tier} onChange={handleChange('tier')} fullWidth size="small" placeholder="e.g. premium" />
            <TextField label="Customer charge (₹)" type="number" value={form.customer_charge_cents} onChange={handleChange('customer_charge_cents')} fullWidth size="small" />
            <TextField label="Vendor platform %" type="number" value={form.vendor_platform_percent} onChange={handleChange('vendor_platform_percent')} fullWidth size="small" />
            <TextField label="Vendor delivery (₹)" type="number" value={form.vendor_delivery_cents} onChange={handleChange('vendor_delivery_cents')} fullWidth size="small" />
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

export default FareCategoryOverridesView;
