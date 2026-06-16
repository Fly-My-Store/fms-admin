'use client';

import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import MainCard from 'components/MainCard';
import { listFareRules, createFareRule, deactivateFareRule } from 'api/adminFarePayouts';
import { listCategories } from 'api/catalog';
import {
  Autocomplete,
  Button,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Divider,
  InputLabel,
} from '@mui/material';
import { PlusOutlined, StopOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';

const formatCents = (v) => (v === '' || v == null ? '' : Number(v) / 100);
const toCents = (v) => {
  if (v === '' || v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const fmt = (v) => (v == null || v === '' ? '—' : String(v));
const fmtPct = (v) => (v == null || v === '' ? '—' : `${v}%`);
const fmtRupee = (cents) => (cents == null ? '—' : `₹${formatCents(cents)}`);

const defaultKmSlabs = [
  { min_km: '5', max_km: '7', surcharge_rupees: '14', gst_percent: '18' },
  { min_km: '7', max_km: '10', surcharge_rupees: '35', gst_percent: '18' },
];

const defaultForm = {
  category_id: '',
  min_order_cents: '',
  max_order_cents: '9999999',
  sort_order: '0',
  customer_platform_fee_cents: '',
  customer_platform_gst_percent: '18',
  customer_delivery_cents: '',
  customer_delivery_gst_percent: '18',
  customer_gateway_percent: '0',
  customer_gateway_gst_percent: '18',
  seller_platform_percent: '',
  seller_platform_gst_percent: '18',
  seller_delivery_cents: '',
  seller_delivery_gst_percent: '18',
  seller_gateway_percent: '',
  seller_gateway_gst_percent: '18',
  km_surcharge: defaultKmSlabs,
};

function ReadField({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

function ViewFareDialog({ open, rule, onClose }) {
  if (!rule) return null;
  const slabs = Array.isArray(rule.km_surcharge) ? rule.km_surcharge : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Fare rule details</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="subtitle2">Band</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <ReadField label="Category" value={rule.category?.name || 'Default (all categories)'} />
            <ReadField label="Order band" value={`${fmtRupee(rule.min_order_cents)} – ${fmtRupee(rule.max_order_cents)}`} />
            <ReadField label="Sort order" value={fmt(rule.sort_order)} />
            <ReadField label="Status" value={rule.is_active ? 'Active' : 'Inactive'} />
          </Stack>

          <Divider />
          <Typography variant="subtitle2">Customer fees</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
            <ReadField label="Platform fee" value={fmtRupee(rule.customer_platform_fee_cents)} />
            <ReadField label="Platform GST %" value={fmtPct(rule.customer_platform_gst_percent)} />
            <ReadField label="Delivery fee" value={fmtRupee(rule.customer_delivery_cents)} />
            <ReadField label="Delivery GST %" value={fmtPct(rule.customer_delivery_gst_percent)} />
            <ReadField label="Gateway %" value={fmtPct(rule.customer_gateway_percent)} />
            <ReadField label="Gateway GST %" value={fmtPct(rule.customer_gateway_gst_percent)} />
          </Stack>

          <Divider />
          <Typography variant="subtitle2">Seller deductions</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
            <ReadField label="Platform %" value={fmtPct(rule.seller_platform_percent)} />
            <ReadField label="Platform GST %" value={fmtPct(rule.seller_platform_gst_percent)} />
            <ReadField label="Delivery" value={fmtRupee(rule.seller_delivery_cents)} />
            <ReadField label="Delivery GST %" value={fmtPct(rule.seller_delivery_gst_percent)} />
            <ReadField label="Gateway %" value={fmtPct(rule.seller_gateway_percent)} />
            <ReadField label="Gateway GST %" value={fmtPct(rule.seller_gateway_gst_percent)} />
          </Stack>

          <Divider />
          <Typography variant="subtitle2">Km surcharge slabs</Typography>
          {slabs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No km slabs configured.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Min km</TableCell>
                    <TableCell>Max km</TableCell>
                    <TableCell>Surcharge</TableCell>
                    <TableCell>GST %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slabs.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell>{s.min_km}</TableCell>
                      <TableCell>{s.max_km}</TableCell>
                      <TableCell>{fmtRupee(s.surcharge_cents)}</TableCell>
                      <TableCell>{fmtPct(s.gst_percent)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export function FareRulesView() {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewRule, setViewRule] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const [catOptions, setCatOptions] = useState([]);
  const [catSel, setCatSel] = useState(null);
  const [catQuery, setCatQuery] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [catPage, setCatPage] = useState(1);
  const [catTotalPages, setCatTotalPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listFareRules();
      setRules(res?.data ?? []);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to load fare rules', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (p = 1, q = catQuery, append = false) => {
    try {
      setCatLoading(true);
      const res = await listCategories({ page: p, limit: 20, q });
      const rows = res?.data || res?.rows || [];
      const meta = res?.meta || { page: p, totalPages: 1 };
      setCatOptions((prev) => (append ? [...prev, ...rows] : rows));
      setCatPage(meta.page || p);
      setCatTotalPages(meta.totalPages || 1);
    } catch {
      // ignore
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { loadCategories(1, catQuery, false); }, []);
  useEffect(() => {
    const t = setTimeout(() => loadCategories(1, catQuery, false), 300);
    return () => clearTimeout(t);
  }, [catQuery]);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const updateKmSlab = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.km_surcharge];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, km_surcharge: next };
    });
  };

  const addKmSlab = () => {
    setForm((prev) => ({
      ...prev,
      km_surcharge: [...prev.km_surcharge, { min_km: '', max_km: '', surcharge_rupees: '', gst_percent: '18' }],
    }));
  };

  const removeKmSlab = (index) => {
    setForm((prev) => ({
      ...prev,
      km_surcharge: prev.km_surcharge.filter((_, i) => i !== index),
    }));
  };

  const openAdd = () => {
    setForm({ ...defaultForm, km_surcharge: defaultKmSlabs.map((s) => ({ ...s })) });
    setCatSel(null);
    setCreateOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const km_surcharge = (form.km_surcharge || []).map((s) => ({
        min_km: Number(s.min_km) || 0,
        max_km: Number(s.max_km) || 0,
        surcharge_cents: toCents(s.surcharge_rupees),
        gst_percent: Number(s.gst_percent) || 18,
      }));

      const payload = {
        category_id: form.category_id || null,
        min_order_cents: toCents(form.min_order_cents),
        max_order_cents: toCents(form.max_order_cents),
        sort_order: Number(form.sort_order) || 0,
        customer_platform_fee_cents: toCents(form.customer_platform_fee_cents),
        customer_platform_gst_percent: Number(form.customer_platform_gst_percent) ?? 18,
        customer_delivery_cents: toCents(form.customer_delivery_cents),
        customer_delivery_gst_percent: Number(form.customer_delivery_gst_percent) ?? 18,
        customer_gateway_percent: Number(form.customer_gateway_percent) || 0,
        customer_gateway_gst_percent: Number(form.customer_gateway_gst_percent) ?? 18,
        seller_platform_percent: Number(form.seller_platform_percent) || 0,
        seller_platform_gst_percent: Number(form.seller_platform_gst_percent) ?? 18,
        seller_delivery_cents: toCents(form.seller_delivery_cents),
        seller_delivery_gst_percent: Number(form.seller_delivery_gst_percent) ?? 18,
        seller_gateway_percent: Number(form.seller_gateway_percent) || 0,
        seller_gateway_gst_percent: Number(form.seller_gateway_gst_percent) ?? 18,
        km_surcharge,
      };
      await createFareRule(payload);
      enqueueSnackbar('Fare rule created', { variant: 'success' });
      setCreateOpen(false);
      await load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to create fare rule', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this fare rule? Existing orders keep their fare_id.')) return;
    try {
      await deactivateFareRule(id);
      enqueueSnackbar('Fare rule deactivated', { variant: 'success' });
      await load();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to deactivate', { variant: 'error' });
    }
  };

  const onCatListScroll = (e) => {
    const node = e.currentTarget;
    const nearBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 32;
    if (nearBottom && !catLoading && catPage < catTotalPages) loadCategories(catPage + 1, catQuery, true);
  };

  return (
    <MainCard
      title="Fare rules"
      secondary={
        <Button startIcon={<PlusOutlined />} onClick={openAdd} variant="contained">
          Add rule
        </Button>
      }
    >
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Order band (₹)</TableCell>
                <TableCell>Customer plat/del</TableCell>
                <TableCell>Seller %/del/gw</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No fare rules. Add one to get started.</TableCell></TableRow>
              ) : rules.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.category?.name || 'Default'}</TableCell>
                  <TableCell>
                    ₹{formatCents(row.min_order_cents)} – ₹{formatCents(row.max_order_cents)}
                  </TableCell>
                  <TableCell>
                    ₹{formatCents(row.customer_platform_fee_cents)} / ₹{formatCents(row.customer_delivery_cents)}
                  </TableCell>
                  <TableCell>
                    {row.seller_platform_percent}% / ₹{formatCents(row.seller_delivery_cents)} / {row.seller_gateway_percent}%
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setViewRule(row)} title="View details">
                      <EyeOutlined />
                    </IconButton>
                    {row.is_active ? (
                      <IconButton size="small" onClick={() => handleDeactivate(row.id)} title="Deactivate">
                        <StopOutlined />
                      </IconButton>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ViewFareDialog open={!!viewRule} rule={viewRule} onClose={() => setViewRule(null)} />

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create fare rule</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="caption" color="text.secondary">
              Fare rules are immutable after creation. Leave category blank for the default catalog band.
            </Typography>

            <Typography variant="subtitle2">Band</Typography>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Category (optional)</InputLabel>
              <Autocomplete
                options={catOptions}
                value={catSel}
                loading={catLoading}
                size="small"
                onChange={(_, v) => {
                  setCatSel(v);
                  setForm((prev) => ({ ...prev, category_id: v?.id || '' }));
                }}
                onOpen={() => loadCategories(1, catQuery, false)}
                onInputChange={(_, v) => setCatQuery(v)}
                getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
                isOptionEqualToValue={(a, b) => a?.id === b?.id}
                ListboxProps={{ onScroll: onCatListScroll }}
                renderInput={(params) => (
                  <TextField {...params} size="small" placeholder="Search category…" />
                )}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Min order (₹)" type="number" value={form.min_order_cents} onChange={handleChange('min_order_cents')} fullWidth />
              <TextField label="Max order (₹)" type="number" value={form.max_order_cents} onChange={handleChange('max_order_cents')} fullWidth />
              <TextField label="Sort order" type="number" value={form.sort_order} onChange={handleChange('sort_order')} fullWidth />
            </Stack>

            <Divider />
            <Typography variant="subtitle2">Customer fees</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Platform fee (₹)" type="number" value={form.customer_platform_fee_cents} onChange={handleChange('customer_platform_fee_cents')} fullWidth />
              <TextField label="Platform GST %" type="number" value={form.customer_platform_gst_percent} onChange={handleChange('customer_platform_gst_percent')} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Delivery fee (₹)" type="number" value={form.customer_delivery_cents} onChange={handleChange('customer_delivery_cents')} fullWidth />
              <TextField label="Delivery GST %" type="number" value={form.customer_delivery_gst_percent} onChange={handleChange('customer_delivery_gst_percent')} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Gateway %" type="number" value={form.customer_gateway_percent} onChange={handleChange('customer_gateway_percent')} fullWidth />
              <TextField label="Gateway GST %" type="number" value={form.customer_gateway_gst_percent} onChange={handleChange('customer_gateway_gst_percent')} fullWidth />
            </Stack>

            <Divider />
            <Typography variant="subtitle2">Seller deductions</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Platform %" type="number" value={form.seller_platform_percent} onChange={handleChange('seller_platform_percent')} fullWidth />
              <TextField label="Platform GST %" type="number" value={form.seller_platform_gst_percent} onChange={handleChange('seller_platform_gst_percent')} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Delivery (₹)" type="number" value={form.seller_delivery_cents} onChange={handleChange('seller_delivery_cents')} fullWidth />
              <TextField label="Delivery GST %" type="number" value={form.seller_delivery_gst_percent} onChange={handleChange('seller_delivery_gst_percent')} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Gateway %" type="number" value={form.seller_gateway_percent} onChange={handleChange('seller_gateway_percent')} fullWidth />
              <TextField label="Gateway GST %" type="number" value={form.seller_gateway_gst_percent} onChange={handleChange('seller_gateway_gst_percent')} fullWidth />
            </Stack>

            <Divider />
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2">Km surcharge slabs</Typography>
              <Button size="small" onClick={addKmSlab}>Add slab</Button>
            </Stack>
            {(form.km_surcharge || []).map((slab, i) => (
              <Stack key={i} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                <TextField label="Min km" type="number" size="small" value={slab.min_km} onChange={(e) => updateKmSlab(i, 'min_km', e.target.value)} sx={{ minWidth: 90 }} />
                <TextField label="Max km" type="number" size="small" value={slab.max_km} onChange={(e) => updateKmSlab(i, 'max_km', e.target.value)} sx={{ minWidth: 90 }} />
                <TextField label="Surcharge (₹)" type="number" size="small" value={slab.surcharge_rupees} onChange={(e) => updateKmSlab(i, 'surcharge_rupees', e.target.value)} sx={{ minWidth: 120 }} />
                <TextField label="GST %" type="number" size="small" value={slab.gst_percent} onChange={(e) => updateKmSlab(i, 'gst_percent', e.target.value)} sx={{ minWidth: 90 }} />
                <IconButton size="small" onClick={() => removeKmSlab(i)} disabled={(form.km_surcharge || []).length <= 1} title="Remove slab">
                  <DeleteOutlined />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>{saving ? 'Creating…' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

export default FareRulesView;
