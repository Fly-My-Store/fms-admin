'use client';

import { useCallback, useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { uploadSingle } from 'api/upload';
import {
  createInvoiceSettingVersion,
  getActiveInvoiceSetting,
  listInvoiceSettings
} from 'api/invoiceSettings';

const emptyForm = {
  legal_name: 'Fly My Store',
  brand_name: 'Fly My Store',
  logo_url: '',
  pan: '',
  gstin: '',
  email: 'invoicing@flymystore.com',
  address: '',
  pincode: '',
  state: '',
  state_code: '',
  hsn_code: '999799',
  hsn_description: 'Other Services',
  document_code: 'INV',
  category: 'B2C',
  transaction_type: 'REG',
  invoice_type: 'RG',
  reverse_charge: false,
  cgst_percent: '9',
  sgst_percent: '9'
};

const Field = ({ label, ...props }) => (
  <TextField label={label} fullWidth size="small" {...props} />
);

export default function InvoiceSettingsView() {
  const [form, setForm] = useState(emptyForm);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, listRes] = await Promise.all([
        getActiveInvoiceSetting().catch(() => null),
        listInvoiceSettings()
      ]);
      const active = activeRes?.data || activeRes;
      const rows = listRes?.data || listRes || [];
      setHistory(Array.isArray(rows) ? rows : []);
      if (active) {
        setForm({
          legal_name: active.legal_name || '',
          brand_name: active.brand_name || '',
          logo_url: active.logo_url || '',
          pan: active.pan || '',
          gstin: active.gstin || '',
          email: active.email || '',
          address: active.address || '',
          pincode: active.pincode || '',
          state: active.state || '',
          state_code: active.state_code || '',
          hsn_code: active.hsn_code || '999799',
          hsn_description: active.hsn_description || 'Other Services',
          document_code: active.document_code || 'INV',
          category: active.category || 'B2C',
          transaction_type: active.transaction_type || 'REG',
          invoice_type: active.invoice_type || 'RG',
          reverse_charge: !!active.reverse_charge,
          cgst_percent: String(active.cgst_percent ?? 9),
          sgst_percent: String(active.sgst_percent ?? 9)
        });
      }
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to load invoice settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const onUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadSingle(file);
      const url = res?.url || res?.data?.url;
      if (!url) throw new Error('Upload failed');
      setForm((p) => ({ ...p, logo_url: url }));
      enqueueSnackbar('Logo uploaded', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err?.message || 'Logo upload failed', { variant: 'error' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const onSaveVersion = async () => {
    if (!form.legal_name?.trim()) {
      enqueueSnackbar('Legal name is required', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await createInvoiceSettingVersion({
        ...form,
        legal_name: form.legal_name.trim(),
        brand_name: form.brand_name?.trim() || null,
        logo_url: form.logo_url?.trim() || null,
        pan: form.pan?.trim() || null,
        gstin: form.gstin?.trim() || null,
        email: form.email?.trim() || null,
        address: form.address?.trim() || null,
        pincode: form.pincode?.trim() || null,
        state: form.state?.trim() || null,
        state_code: form.state_code?.trim() || null,
        reverse_charge: !!form.reverse_charge,
        cgst_percent: Number(form.cgst_percent) || 9,
        sgst_percent: Number(form.sgst_percent) || 9
      });
      enqueueSnackbar('New invoice settings version saved (previous deactivated)', { variant: 'success' });
      await load();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || 'Save failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const breadcrumb = {
    heading: 'invoice-settings',
    links: [
      { title: 'home', to: '/dashboard' },
      { title: 'invoice-settings', to: '/invoice-settings' }
    ]
  };

  return (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        Saving creates a <strong>new version</strong> and deactivates the previous active settings. Fee invoices always use the
        active version.
      </Alert>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <MainCard title="Active settings (edit → save new version)" border={false} boxShadow>
            {loading ? (
              <Typography>Loading…</Typography>
            ) : (
              <Stack spacing={2}>
                <Field label="Legal name *" value={form.legal_name} onChange={set('legal_name')} />
                <Field label="Brand name" value={form.brand_name} onChange={set('brand_name')} />
                <Stack direction="row" spacing={2} alignItems="center">
                  <Field label="Logo URL" value={form.logo_url} onChange={set('logo_url')} />
                  <Button variant="outlined" component="label" disabled={uploading} sx={{ whiteSpace: 'nowrap' }}>
                    {uploading ? 'Uploading…' : 'Upload logo'}
                    <input hidden type="file" accept="image/*" onChange={onUploadLogo} />
                  </Button>
                </Stack>
                {form.logo_url ? (
                  <Box component="img" src={form.logo_url} alt="logo" sx={{ height: 48, objectFit: 'contain', alignSelf: 'flex-start' }} />
                ) : null}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Field label="PAN" value={form.pan} onChange={set('pan')} />
                  <Field label="GSTIN" value={form.gstin} onChange={set('gstin')} />
                </Stack>
                <Field label="Email" value={form.email} onChange={set('email')} />
                <Field label="Address" value={form.address} onChange={set('address')} multiline minRows={2} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Field label="Pincode" value={form.pincode} onChange={set('pincode')} />
                  <Field label="State" value={form.state} onChange={set('state')} />
                  <Field label="State code" value={form.state_code} onChange={set('state_code')} />
                </Stack>
                <Divider />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Field label="HSN code" value={form.hsn_code} onChange={set('hsn_code')} />
                  <Field label="HSN description" value={form.hsn_description} onChange={set('hsn_description')} />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Field label="Document code" value={form.document_code} onChange={set('document_code')} />
                  <Field label="Category" value={form.category} onChange={set('category')} />
                  <Field label="Transaction type" value={form.transaction_type} onChange={set('transaction_type')} />
                  <Field label="Invoice type" value={form.invoice_type} onChange={set('invoice_type')} />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Field label="CGST %" value={form.cgst_percent} onChange={set('cgst_percent')} />
                  <Field label="SGST %" value={form.sgst_percent} onChange={set('sgst_percent')} />
                </Stack>
                <Button variant="contained" onClick={onSaveVersion} disabled={saving}>
                  {saving ? 'Saving…' : 'Save as new version'}
                </Button>
              </Stack>
            )}
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <MainCard title="Version history" border={false} boxShadow>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Legal name</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Chip
                        size="small"
                        color={row.is_active ? 'success' : 'default'}
                        label={row.is_active ? 'Active' : 'Inactive'}
                        variant="light"
                      />
                    </TableCell>
                    <TableCell>{row.legal_name}</TableCell>
                    <TableCell>
                      {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                    </TableCell>
                  </TableRow>
                ))}
                {!history.length && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="body2" color="text.secondary">
                        No versions yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}
