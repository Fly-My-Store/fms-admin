'use client';

import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import MainCard from 'components/MainCard';
import {
  listFareCategoryRules,
  createFareCategoryRule,
  cloneFareCategoryRule,
  deactivateFareCategoryRule,
  listFareGatewayRules,
  createFareGatewayRule,
  cloneFareGatewayRule,
  deactivateFareGatewayRule,
} from 'api/adminFarePayouts';
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
  Alert,
  Link,
  MenuItem,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import { PlusOutlined, StopOutlined, EyeOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { RAZORPAY_PLATFORM_FEE_GST_PERCENT, RAZORPAY_PLATFORM_FEE_PERCENT } from 'utils/constants';

const GATEWAY_HELPER =
  `Razorpay bills ~${RAZORPAY_PLATFORM_FEE_PERCENT}% + ${RAZORPAY_PLATFORM_FEE_GST_PERCENT}% GST on their fee (exclusive, ≈ ${(
    RAZORPAY_PLATFORM_FEE_PERCENT *
    (1 + RAZORPAY_PLATFORM_FEE_GST_PERCENT / 100)
  ).toFixed(2)}% total). ` +
  'In this form, gateway % is GST-inclusive: enter the full burden you want to recover ' +
  `(e.g. ${(RAZORPAY_PLATFORM_FEE_PERCENT * (1 + RAZORPAY_PLATFORM_FEE_GST_PERCENT / 100)).toFixed(2)} to match Razorpay, or ${RAZORPAY_PLATFORM_FEE_PERCENT} if you ignore GST). ` +
  'GST % on the rule only splits tax inside that amount — it is not added on top. ' +
  'Keep it simple: usually one active rule covering all orders (₹0 – max) is enough. ' +
  'Gateway % applies once to the full cart total.';

const CATEGORY_HELPER =
  "Category fees (platform + delivery + km) use each product group's subtotal band. Mixed carts take MAX delivery / platform and SUM seller platform %. " +
  'Service/install fee is charged per unit (fee × qty), summed across all lines, and paid 100% to the rider. ' +
  'Missing category fare falls back to parent then default; an explicit ₹0 service fee stays 0. ' +
  'Rupee amounts and seller platform % are GST-inclusive; GST % only splits tax inside the fee.';

const formatCents = (v) => {
  if (v === '' || v == null) return '';
  const n = Number(v) / 100;
  return Number.isFinite(n) ? n.toFixed(2) : '';
};
const toCents = (v) => {
  if (v === '' || v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const fmtPct = (v) => (v == null || v === '' ? '—' : `${v}%`);
const fmtRupee = (cents) => {
  if (cents == null) return '—';
  const n = Number(cents) / 100;
  if (!Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const defaultKmSlabs = [
  { min_km: '5', max_km: '7', surcharge_rupees: '14', gst_percent: '18' },
  { min_km: '7', max_km: '10', surcharge_rupees: '35', gst_percent: '18' },
];

const defaultCategoryForm = {
  category_id: '',
  min_order_cents: '',
  max_order_cents: '9999999',
  sort_order: '0',
  customer_platform_fee_cents: '',
  customer_platform_gst_percent: '18',
  customer_delivery_cents: '',
  customer_delivery_gst_percent: '18',
  customer_service_fee_cents: '',
  customer_service_gst_percent: '18',
  seller_platform_percent: '',
  seller_platform_gst_percent: '18',
  seller_delivery_cents: '',
  seller_delivery_gst_percent: '18',
  km_surcharge: defaultKmSlabs,
};

const defaultGatewayForm = {
  min_order_cents: '0',
  max_order_cents: '9999999',
  sort_order: '0',
  customer_gateway_percent: '0',
  customer_gateway_gst_percent: String(RAZORPAY_PLATFORM_FEE_GST_PERCENT),
  seller_gateway_percent: String(RAZORPAY_PLATFORM_FEE_PERCENT),
  seller_gateway_gst_percent: String(RAZORPAY_PLATFORM_FEE_GST_PERCENT),
};

function ReadField({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

export function FareRulesView() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryRules, setCategoryRules] = useState([]);
  const [gatewayRules, setGatewayRules] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [replaceSourceId, setReplaceSourceId] = useState(null);
  const [viewRule, setViewRule] = useState(null);
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);
  const [gatewayForm, setGatewayForm] = useState(defaultGatewayForm);
  const [saving, setSaving] = useState(false);

  const [catOptions, setCatOptions] = useState([]);
  const [catSel, setCatSel] = useState(null);
  const [catQuery, setCatQuery] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterActive, setFilterActive] = useState('');
  const [filterCatQuery, setFilterCatQuery] = useState('');
  const [filterCatOptions, setFilterCatOptions] = useState([]);
  const [filterCatLoading, setFilterCatLoading] = useState(false);

  const loadCategory = async () => {
    setLoading(true);
    try {
      const res = await listFareCategoryRules({
        ...(filterCategory?.id ? { category_id: filterCategory.id } : {}),
        ...(filterActive !== '' ? { is_active: filterActive } : {}),
      });
      setCategoryRules(res?.data ?? []);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to load category fares', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadGateway = async () => {
    setLoading(true);
    try {
      const res = await listFareGatewayRules({
        ...(filterActive !== '' ? { is_active: filterActive } : {}),
      });
      setGatewayRules(res?.data ?? []);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to load gateway fares', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const load = () => (tab === 0 ? loadCategory() : loadGateway());

  useEffect(() => { load(); }, [tab, filterCategory?.id, filterActive]);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setCatLoading(true);
        const res = await listCategories({ page: 1, limit: 20, q: catQuery });
        setCatOptions(res?.data || res?.rows || []);
      } finally {
        setCatLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [catQuery]);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setFilterCatLoading(true);
        const res = await listCategories({ page: 1, limit: 20, q: filterCatQuery });
        setFilterCatOptions(res?.data || res?.rows || []);
      } finally {
        setFilterCatLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [filterCatQuery]);

  const openAdd = () => {
    setReplaceSourceId(null);
    if (tab === 0) {
      setCategoryForm({ ...defaultCategoryForm, km_surcharge: defaultKmSlabs.map((s) => ({ ...s })) });
      setCatSel(null);
    } else {
      setGatewayForm({ ...defaultGatewayForm });
    }
    setCreateOpen(true);
  };

  const openCopyCategory = (row) => {
    if (!row?.is_active) return;
    const km_surcharge = (Array.isArray(row.km_surcharge) ? row.km_surcharge : []).map((s) => ({
      min_km: String(s.min_km ?? ''),
      max_km: String(s.max_km ?? ''),
      surcharge_rupees: String(formatCents(s.surcharge_cents) ?? ''),
      gst_percent: String(s.gst_percent ?? 18),
    }));
    setCategoryForm({
      category_id: row.category_id || '',
      min_order_cents: String(formatCents(row.min_order_cents) ?? ''),
      max_order_cents: String(formatCents(row.max_order_cents) ?? ''),
      sort_order: String(row.sort_order ?? 0),
      customer_platform_fee_cents: String(formatCents(row.customer_platform_fee_cents) ?? ''),
      customer_platform_gst_percent: String(row.customer_platform_gst_percent ?? 18),
      customer_delivery_cents: String(formatCents(row.customer_delivery_cents) ?? ''),
      customer_delivery_gst_percent: String(row.customer_delivery_gst_percent ?? 18),
      customer_service_fee_cents: String(formatCents(row.customer_service_fee_cents) ?? ''),
      customer_service_gst_percent: String(row.customer_service_gst_percent ?? 18),
      seller_platform_percent: String(row.seller_platform_percent ?? ''),
      seller_platform_gst_percent: String(row.seller_platform_gst_percent ?? 18),
      seller_delivery_cents: String(formatCents(row.seller_delivery_cents) ?? ''),
      seller_delivery_gst_percent: String(row.seller_delivery_gst_percent ?? 18),
      km_surcharge: km_surcharge.length ? km_surcharge : defaultKmSlabs.map((s) => ({ ...s })),
    });
    setCatSel(row.category || null);
    setReplaceSourceId(row.id);
    setCreateOpen(true);
  };

  const openCopyGateway = (row) => {
    if (!row?.is_active) return;
    setGatewayForm({
      min_order_cents: String(formatCents(row.min_order_cents) ?? ''),
      max_order_cents: String(formatCents(row.max_order_cents) ?? ''),
      sort_order: String(row.sort_order ?? 0),
      customer_gateway_percent: String(row.customer_gateway_percent ?? 0),
      customer_gateway_gst_percent: String(row.customer_gateway_gst_percent ?? RAZORPAY_PLATFORM_FEE_GST_PERCENT),
      seller_gateway_percent: String(row.seller_gateway_percent ?? RAZORPAY_PLATFORM_FEE_PERCENT),
      seller_gateway_gst_percent: String(row.seller_gateway_gst_percent ?? RAZORPAY_PLATFORM_FEE_GST_PERCENT),
    });
    setReplaceSourceId(row.id);
    setCreateOpen(true);
  };

  const handleSubmitCategory = async () => {
    setSaving(true);
    try {
      const km_surcharge = (categoryForm.km_surcharge || []).map((s) => ({
        min_km: Number(s.min_km) || 0,
        max_km: Number(s.max_km) || 0,
        surcharge_cents: toCents(s.surcharge_rupees),
        gst_percent: Number(s.gst_percent) || 18,
      }));
      const payload = {
        category_id: categoryForm.category_id || null,
        min_order_cents: toCents(categoryForm.min_order_cents),
        max_order_cents: toCents(categoryForm.max_order_cents),
        sort_order: Number(categoryForm.sort_order) || 0,
        customer_platform_fee_cents: toCents(categoryForm.customer_platform_fee_cents),
        customer_platform_gst_percent: Number(categoryForm.customer_platform_gst_percent) ?? 18,
        customer_delivery_cents: toCents(categoryForm.customer_delivery_cents),
        customer_delivery_gst_percent: Number(categoryForm.customer_delivery_gst_percent) ?? 18,
        customer_service_fee_cents: toCents(categoryForm.customer_service_fee_cents),
        customer_service_gst_percent: Number(categoryForm.customer_service_gst_percent) ?? 18,
        seller_platform_percent: Number(categoryForm.seller_platform_percent) || 0,
        seller_platform_gst_percent: Number(categoryForm.seller_platform_gst_percent) ?? 18,
        seller_delivery_cents: toCents(categoryForm.seller_delivery_cents),
        seller_delivery_gst_percent: Number(categoryForm.seller_delivery_gst_percent) ?? 18,
        km_surcharge,
      };
      if (replaceSourceId) {
        await cloneFareCategoryRule(replaceSourceId, payload);
        enqueueSnackbar('Copied to new rule and disabled the old one', { variant: 'success' });
      } else {
        await createFareCategoryRule(payload);
        enqueueSnackbar('Category fare created', { variant: 'success' });
      }
      setCreateOpen(false);
      setReplaceSourceId(null);
      await loadCategory();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to create', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitGateway = async () => {
    setSaving(true);
    try {
      const payload = {
        min_order_cents: toCents(gatewayForm.min_order_cents),
        max_order_cents: toCents(gatewayForm.max_order_cents),
        sort_order: Number(gatewayForm.sort_order) || 0,
        customer_gateway_percent: Number(gatewayForm.customer_gateway_percent) || 0,
        customer_gateway_gst_percent: Number(gatewayForm.customer_gateway_gst_percent) ?? 18,
        seller_gateway_percent: Number(gatewayForm.seller_gateway_percent) || 0,
        seller_gateway_gst_percent: Number(gatewayForm.seller_gateway_gst_percent) ?? 18,
      };
      if (replaceSourceId) {
        await cloneFareGatewayRule(replaceSourceId, payload);
        enqueueSnackbar('Copied to new rule and disabled the old one', { variant: 'success' });
      } else {
        await createFareGatewayRule(payload);
        enqueueSnackbar('Gateway fare created', { variant: 'success' });
      }
      setCreateOpen(false);
      setReplaceSourceId(null);
      await loadGateway();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to create', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateCategory = async (id) => {
    if (!window.confirm('Deactivate this category fare?')) return;
    try {
      await deactivateFareCategoryRule(id);
      enqueueSnackbar('Deactivated', { variant: 'success' });
      await loadCategory();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed', { variant: 'error' });
    }
  };

  const handleDeactivateGateway = async (id) => {
    if (!window.confirm('Deactivate this gateway fare?')) return;
    try {
      await deactivateFareGatewayRule(id);
      enqueueSnackbar('Deactivated', { variant: 'success' });
      await loadGateway();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed', { variant: 'error' });
    }
  };

  const updateKmSlab = (index, field, value) => {
    setCategoryForm((prev) => {
      const next = [...prev.km_surcharge];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, km_surcharge: next };
    });
  };

  return (
    <MainCard
      title="Fare rules"
      secondary={
        <Button startIcon={<PlusOutlined />} onClick={openAdd} variant="contained">
          Add {tab === 0 ? 'category' : 'gateway'} rule
        </Button>
      }
    >
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Category fees" />
        <Tab label="Gateway fees" />
      </Tabs>

      {tab === 1 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {GATEWAY_HELPER}{' '}
          <Link href="https://razorpay.com/pricing/" target="_blank" rel="noopener noreferrer">
            Razorpay pricing
          </Link>
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          {CATEGORY_HELPER}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        {tab === 0 ? (
          <Autocomplete
            sx={{ minWidth: 240 }}
            options={filterCatOptions}
            value={filterCategory}
            loading={filterCatLoading}
            onChange={(_, v) => setFilterCategory(v)}
            getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
            isOptionEqualToValue={(a, b) => a?.id === b?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Category"
                onChange={(e) => setFilterCatQuery(e.target.value)}
              />
            )}
          />
        ) : null}
        <TextField
          select
          size="small"
          label="Status"
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Active</MenuItem>
          <MenuItem value="false">Inactive</MenuItem>
        </TextField>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : tab === 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Order band (₹)</TableCell>
                <TableCell>Customer plat/del/svc</TableCell>
                <TableCell>Seller %/del</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoryRules.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No category fare rules.</TableCell></TableRow>
              ) : categoryRules.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.category?.name || 'Default'}</TableCell>
                  <TableCell>{fmtRupee(row.min_order_cents)} – {fmtRupee(row.max_order_cents)}</TableCell>
                  <TableCell>
                    {fmtRupee(row.customer_platform_fee_cents)} / {fmtRupee(row.customer_delivery_cents)} /{' '}
                    {fmtRupee(row.customer_service_fee_cents)}
                  </TableCell>
                  <TableCell>
                    {row.seller_platform_percent}% / {fmtRupee(row.seller_delivery_cents)}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => setViewRule({ ...row, _kind: 'category' })}><EyeOutlined /></IconButton>
                    </Tooltip>
                    {row.is_active ? (
                      <>
                        <Tooltip title="Copy & disable old">
                          <IconButton size="small" onClick={() => openCopyCategory(row)}><CopyOutlined /></IconButton>
                        </Tooltip>
                        <Tooltip title="Disable">
                          <IconButton size="small" onClick={() => handleDeactivateCategory(row.id)}><StopOutlined /></IconButton>
                        </Tooltip>
                      </>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Order band (₹)</TableCell>
                <TableCell>Customer gw %</TableCell>
                <TableCell>Seller gw %</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gatewayRules.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No gateway fare rules.</TableCell></TableRow>
              ) : gatewayRules.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{fmtRupee(row.min_order_cents)} – {fmtRupee(row.max_order_cents)}</TableCell>
                  <TableCell>{row.customer_gateway_percent}%</TableCell>
                  <TableCell>{row.seller_gateway_percent}%</TableCell>
                  <TableCell>
                    <Chip size="small" label={row.is_active ? 'Active' : 'Inactive'} color={row.is_active ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => setViewRule({ ...row, _kind: 'gateway' })}><EyeOutlined /></IconButton>
                    </Tooltip>
                    {row.is_active ? (
                      <>
                        <Tooltip title="Copy & disable old">
                          <IconButton size="small" onClick={() => openCopyGateway(row)}><CopyOutlined /></IconButton>
                        </Tooltip>
                        <Tooltip title="Disable">
                          <IconButton size="small" onClick={() => handleDeactivateGateway(row.id)}><StopOutlined /></IconButton>
                        </Tooltip>
                      </>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!viewRule} onClose={() => setViewRule(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Fare details</DialogTitle>
        <DialogContent dividers>
          {viewRule?._kind === 'gateway' ? (
            <Stack spacing={1}>
              <ReadField label="Band" value={`${fmtRupee(viewRule.min_order_cents)} – ${fmtRupee(viewRule.max_order_cents)}`} />
              <ReadField label="Customer gateway %" value={fmtPct(viewRule.customer_gateway_percent)} />
              <ReadField label="Seller gateway %" value={fmtPct(viewRule.seller_gateway_percent)} />
            </Stack>
          ) : viewRule ? (
            <Stack spacing={1}>
              <ReadField label="Category" value={viewRule.category?.name || 'Default'} />
              <ReadField label="Band" value={`${fmtRupee(viewRule.min_order_cents)} – ${fmtRupee(viewRule.max_order_cents)}`} />
              <ReadField label="Customer platform" value={fmtRupee(viewRule.customer_platform_fee_cents)} />
              <ReadField label="Customer delivery" value={fmtRupee(viewRule.customer_delivery_cents)} />
              <ReadField label="Customer service (per unit)" value={fmtRupee(viewRule.customer_service_fee_cents)} />
              <ReadField label="Seller platform %" value={fmtPct(viewRule.seller_platform_percent)} />
              <ReadField label="Seller delivery" value={fmtRupee(viewRule.seller_delivery_cents)} />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewRule(null)}>Close</Button></DialogActions>
      </Dialog>

      <Dialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setReplaceSourceId(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {replaceSourceId
            ? tab === 0
              ? 'Copy category fare (old will be disabled)'
              : 'Copy gateway fare (old will be disabled)'
            : tab === 0
              ? 'Create category fare'
              : 'Create gateway fare'}
        </DialogTitle>
        <DialogContent dividers>
          {replaceSourceId ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Saving creates a new active rule and disables the original. Edit values below before saving.
            </Alert>
          ) : null}
          {tab === 0 ? (
            <Stack spacing={2}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Category (optional = default)</InputLabel>
                <Autocomplete
                  options={catOptions}
                  value={catSel}
                  loading={catLoading}
                  size="small"
                  onChange={(_, v) => {
                    setCatSel(v);
                    setCategoryForm((prev) => ({ ...prev, category_id: v?.id || '' }));
                  }}
                  onInputChange={(_, v) => setCatQuery(v)}
                  getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
                  isOptionEqualToValue={(a, b) => a?.id === b?.id}
                  renderInput={(params) => <TextField {...params} size="small" placeholder="Search category…" />}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Min order (₹)" type="number" value={categoryForm.min_order_cents} onChange={(e) => setCategoryForm((p) => ({ ...p, min_order_cents: e.target.value }))} fullWidth />
                <TextField label="Max order (₹)" type="number" value={categoryForm.max_order_cents} onChange={(e) => setCategoryForm((p) => ({ ...p, max_order_cents: e.target.value }))} fullWidth />
                <TextField label="Sort" type="number" value={categoryForm.sort_order} onChange={(e) => setCategoryForm((p) => ({ ...p, sort_order: e.target.value }))} fullWidth />
              </Stack>
              <Divider />
              <Typography variant="subtitle2">Customer</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Platform fee (₹)"
                  type="number"
                  value={categoryForm.customer_platform_fee_cents}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, customer_platform_fee_cents: e.target.value }))}
                  helperText="GST-inclusive"
                  fullWidth
                />
                <TextField
                  label="Delivery fee (₹)"
                  type="number"
                  value={categoryForm.customer_delivery_cents}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, customer_delivery_cents: e.target.value }))}
                  helperText="GST-inclusive · MAX across groups"
                  fullWidth
                />
                <TextField
                  label="Service fee (₹)"
                  type="number"
                  value={categoryForm.customer_service_fee_cents}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, customer_service_fee_cents: e.target.value }))}
                  helperText="GST-inclusive · per unit → rider"
                  fullWidth
                />
              </Stack>
              <Typography variant="subtitle2">Seller</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Platform %"
                  type="number"
                  value={categoryForm.seller_platform_percent}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, seller_platform_percent: e.target.value }))}
                  helperText="GST-inclusive % of group subtotal"
                  fullWidth
                />
                <TextField
                  label="Delivery (₹)"
                  type="number"
                  value={categoryForm.seller_delivery_cents}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, seller_delivery_cents: e.target.value }))}
                  helperText="GST-inclusive"
                  fullWidth
                />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Km slabs</Typography>
                <Button size="small" onClick={() => setCategoryForm((p) => ({ ...p, km_surcharge: [...p.km_surcharge, { min_km: '', max_km: '', surcharge_rupees: '', gst_percent: '18' }] }))}>Add slab</Button>
              </Stack>
              {(categoryForm.km_surcharge || []).map((slab, i) => (
                <Stack key={i} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField label="Min km" size="small" type="number" value={slab.min_km} onChange={(e) => updateKmSlab(i, 'min_km', e.target.value)} />
                  <TextField label="Max km" size="small" type="number" value={slab.max_km} onChange={(e) => updateKmSlab(i, 'max_km', e.target.value)} />
                  <TextField label="₹" size="small" type="number" value={slab.surcharge_rupees} onChange={(e) => updateKmSlab(i, 'surcharge_rupees', e.target.value)} />
                  <IconButton size="small" onClick={() => setCategoryForm((p) => ({ ...p, km_surcharge: p.km_surcharge.filter((_, idx) => idx !== i) }))}><DeleteOutlined /></IconButton>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Min order (₹)" type="number" value={gatewayForm.min_order_cents} onChange={(e) => setGatewayForm((p) => ({ ...p, min_order_cents: e.target.value }))} fullWidth />
                <TextField label="Max order (₹)" type="number" value={gatewayForm.max_order_cents} onChange={(e) => setGatewayForm((p) => ({ ...p, max_order_cents: e.target.value }))} fullWidth />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Customer gateway %"
                  type="number"
                  value={gatewayForm.customer_gateway_percent}
                  onChange={(e) => setGatewayForm((p) => ({ ...p, customer_gateway_percent: e.target.value }))}
                  helperText="GST-inclusive % of cart (usually 0)"
                  fullWidth
                />
                <TextField
                  label="Seller gateway %"
                  type="number"
                  value={gatewayForm.seller_gateway_percent}
                  onChange={(e) => setGatewayForm((p) => ({ ...p, seller_gateway_percent: e.target.value }))}
                  helperText={`GST-inclusive % of cart deducted from seller (Razorpay ≈ ${(RAZORPAY_PLATFORM_FEE_PERCENT * (1 + RAZORPAY_PLATFORM_FEE_GST_PERCENT / 100)).toFixed(2)})`}
                  fullWidth
                />
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateOpen(false);
              setReplaceSourceId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={saving}
            onClick={tab === 0 ? handleSubmitCategory : handleSubmitGateway}
          >
            {saving ? 'Saving…' : replaceSourceId ? 'Save copy & disable old' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

export default FareRulesView;
