'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { CloseOutlined } from '@ant-design/icons';
import { createFoodCraving, updateFoodCraving } from 'api/content';
import { uploadSingle } from 'api/upload';
import { RECORD_STATUS } from 'utils/constants';

const STATUS_OPTIONS = [
  { value: RECORD_STATUS.ACTIVE, label: 'Active' },
  { value: RECORD_STATUS.INACTIVE, label: 'Inactive' }
];

const EMPTY = {
  label: '',
  slug: '',
  image_url: '',
  match_terms: '',
  sort_order: 0,
  record_status: RECORD_STATUS.ACTIVE
};

function termsToText(terms) {
  return Array.isArray(terms) ? terms.join(', ') : String(terms || '');
}

export default function FoodCravingsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        label: initialData.label || '',
        slug: initialData.slug || '',
        image_url: initialData.image_url || '',
        match_terms: termsToText(initialData.match_terms),
        sort_order: Number(initialData.sort_order) || 0,
        record_status: Number(initialData.record_status) || RECORD_STATUS.ACTIVE
      });
    } else {
      setForm({ ...EMPTY });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadSingle(file, undefined, { purpose: 'banner' });
      const url = res?.url || res?.data?.url;
      if (url) setForm((prev) => ({ ...prev, image_url: url }));
      else enqueueSnackbar('Upload completed but URL missing', { variant: 'warning' });
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Upload failed', { variant: 'error' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!String(form.label || '').trim()) {
      enqueueSnackbar('Label is required', { variant: 'warning' });
      return;
    }
    const payload = {
      label: String(form.label).trim(),
      slug: String(form.slug || '').trim(),
      image_url: String(form.image_url || '').trim() || null,
      match_terms: String(form.match_terms || ''),
      sort_order: Number(form.sort_order) || 0,
      record_status: Number(form.record_status) || RECORD_STATUS.ACTIVE
    };
    try {
      setSaving(true);
      if (initialData?.id) {
        await updateFoodCraving(initialData.id, payload);
        enqueueSnackbar('Craving updated', { variant: 'success' });
      } else {
        await createFoodCraving(payload);
        enqueueSnackbar('Craving created', { variant: 'success' });
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Save failed';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        {initialData ? 'Edit food craving' : 'Add food craving'}
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField name="label" label="Label" value={form.label} onChange={handleChange} fullWidth required />
          <TextField
            name="slug"
            label="Slug"
            value={form.slug}
            onChange={handleChange}
            fullWidth
            helperText="Leave blank to generate from the label"
          />
          <TextField
            name="match_terms"
            label="Match terms"
            value={form.match_terms}
            onChange={handleChange}
            fullWidth
            helperText="Comma-separated dish name matches, e.g. pizza, pizzeria"
          />
          <TextField
            name="sort_order"
            label="Sort order"
            type="number"
            value={form.sort_order}
            onChange={handleChange}
            fullWidth
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" component="label" disabled={uploading}>
              {uploading ? 'Uploading…' : 'Upload image'}
              <input hidden type="file" accept="image/*" onChange={handleImageSelect} />
            </Button>
            {form.image_url ? (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundImage: `url(${form.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            ) : null}
          </Stack>
          <TextField select name="record_status" label="Status" value={form.record_status} onChange={handleChange} fullWidth>
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving || uploading}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FoodCravingsFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
