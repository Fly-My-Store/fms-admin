'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import { CloseOutlined } from '@ant-design/icons';
import { enqueueSnackbar } from 'notistack';
import { createSellerDocument, updateSellerDocument } from 'api/sellersStores';

const DOC_TYPES = ['GST', 'PAN', 'AADHAAR', 'SHOP_ACT', 'BANK_PROOF', 'ADDRESS_PROOF', 'PHARMACY_LICENSE'];
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

const EMPTY = { seller_id: '', doc_type: 'GST', file_url: '', verified_status: 'PENDING' };

export default function SellerDocumentsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        seller_id: initialData.seller_id || '',
        doc_type: initialData.doc_type || 'GST',
        file_url: initialData.file_url || '',
        verified_status: initialData.verified_status || 'PENDING',
      });
    } else {
      setForm({ ...EMPTY });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const sellerId = String(form.seller_id || '').trim();
    if (!sellerId) {
      enqueueSnackbar('Seller ID is required', { variant: 'warning' });
      return;
    }
    if (!form.file_url?.trim()) {
      enqueueSnackbar('File URL is required', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      if (initialData?.id) {
        await updateSellerDocument(sellerId, initialData.id, {
          file_url: form.file_url,
          verification_status: form.verified_status,
        });
      } else {
        await createSellerDocument(sellerId, {
          doc_type: form.doc_type,
          file_url: form.file_url,
          verification_status: form.verified_status,
        });
      }
      enqueueSnackbar(initialData ? 'Document updated' : 'Document added', { variant: 'success' });
      onSaved?.();
      onClose();
    } catch (e) {
      enqueueSnackbar(e?.message || 'Save failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Seller Document' : 'Add New Seller Document'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Seller ID</InputLabel>
            <TextField name="seller_id" value={form.seller_id} onChange={handleChange} placeholder="Seller UUID" fullWidth disabled={Boolean(initialData?.id)} />
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Doc Type</InputLabel>
            <TextField name="doc_type" select value={form.doc_type} onChange={handleChange} fullWidth disabled={Boolean(initialData?.id)}>
              {DOC_TYPES.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>File URL</InputLabel>
            <TextField name="file_url" value={form.file_url} onChange={handleChange} placeholder="File URL" fullWidth />
            {form.file_url ? (
              <Link href={form.file_url} target="_blank" rel="noopener noreferrer">
                Open uploaded file
              </Link>
            ) : null}
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Status</InputLabel>
            <TextField name="verified_status" select value={form.verified_status} onChange={handleChange} fullWidth>
              {STATUSES.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={saving} onClick={handleSubmit}>{initialData ? 'Update' : 'Submit'}</Button>
      </DialogActions>
    </Dialog>
  );
}

SellerDocumentsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
