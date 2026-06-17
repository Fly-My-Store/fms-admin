'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import { CloseOutlined } from '@ant-design/icons';
import { createBanner, updateBanner } from 'api/content';
import { uploadSingle } from 'api/upload';
import { RECORD_STATUS } from 'utils/constants';

const EMPTY = {
  title: '',
  image_url: '',
  deeplink: '',
  active_from: '',
  active_to: '',
  record_status: RECORD_STATUS.ACTIVE
};

const STATUS_OPTIONS = [
  { value: RECORD_STATUS.ACTIVE, label: 'Active' },
  { value: RECORD_STATUS.INACTIVE, label: 'Inactive' }
];

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toIsoOrNull = (local) => {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export default function BannersFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        title: initialData.title || '',
        image_url: initialData.image_url || '',
        deeplink: initialData.deeplink || initialData.target_url || initialData.link_url || '',
        active_from: toLocalInput(initialData.active_from),
        active_to: toLocalInput(initialData.active_to),
        record_status: Number(initialData.record_status) || RECORD_STATUS.ACTIVE
      });
      setImagePreview(initialData.image_url || '');
    } else {
      setForm(EMPTY);
      setImagePreview('');
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      const res = await uploadSingle(file, (pe) => {
        if (pe?.total) {
          setUploadProgress(Math.round((pe.loaded * 100) / pe.total));
        }
      });
      const url = res?.url || res?.data?.url;
      if (!url) throw new Error('Upload failed: no URL returned');
      setForm((prev) => ({ ...prev, image_url: url }));
      setImagePreview(url);
      enqueueSnackbar('Banner image uploaded', { variant: 'success' });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Image upload failed';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageRemove = () => {
    setForm((prev) => ({ ...prev, image_url: '' }));
    setImagePreview('');
  };

  const handleSubmit = async () => {
    if (!form.image_url?.trim()) {
      enqueueSnackbar('Banner image is required', { variant: 'warning' });
      return;
    }

    const payload = {
      title: form.title?.trim() || null,
      image_url: form.image_url.trim(),
      deeplink: form.deeplink?.trim() || null,
      active_from: toIsoOrNull(form.active_from),
      active_to: toIsoOrNull(form.active_to),
      record_status: Number(form.record_status) || RECORD_STATUS.ACTIVE
    };

    try {
      setSaving(true);
      if (initialData?.id) {
        await updateBanner(initialData.id, payload);
        enqueueSnackbar('Banner updated', { variant: 'success' });
      } else {
        await createBanner(payload);
        enqueueSnackbar('Banner created', { variant: 'success' });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Save failed';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Banner' : 'Add Banner'}
        <IconButton onClick={onClose} aria-label="close">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} mt={0.5}>
          <Stack spacing={1}>
            <InputLabel>Banner image</InputLabel>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
              <Box
                sx={{
                  width: 200,
                  height: 88,
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {imagePreview || form.image_url ? (
                  <Box
                    component="img"
                    src={imagePreview || form.image_url}
                    alt={form.title || 'Banner preview'}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <Box component="span" sx={{ typography: 'caption', color: 'text.secondary', px: 1, textAlign: 'center' }}>
                    No image yet
                  </Box>
                )}
              </Box>
              <Stack spacing={0.5}>
                <Button component="label" variant="outlined" size="small" disabled={uploading || saving}>
                  {uploading ? `Uploading… ${uploadProgress || 0}%` : 'Upload image'}
                  <input type="file" accept="image/*" hidden onChange={handleImageSelect} />
                </Button>
                {imagePreview || form.image_url ? (
                  <Button size="small" onClick={handleImageRemove} disabled={uploading || saving}>
                    Remove
                  </Button>
                ) : null}
              </Stack>
            </Stack>
            <FormHelperText>Upload a wide banner image (recommended aspect ratio ~16:9).</FormHelperText>
          </Stack>

          <Stack spacing={1}>
            <InputLabel>Title</InputLabel>
            <TextField
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Optional headline"
              fullWidth
              size="small"
              disabled={saving}
            />
          </Stack>

          <Stack spacing={1}>
            <InputLabel>Deeplink</InputLabel>
            <TextField
              name="deeplink"
              value={form.deeplink}
              onChange={handleChange}
              placeholder="e.g. /products/some-slug or app://screen"
              fullWidth
              size="small"
              disabled={saving}
            />
            <FormHelperText>Where the customer goes when they tap the banner.</FormHelperText>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Stack spacing={1} flex={1}>
              <InputLabel>Active from</InputLabel>
              <TextField
                name="active_from"
                type="datetime-local"
                value={form.active_from}
                onChange={handleChange}
                fullWidth
                size="small"
                disabled={saving}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <Stack spacing={1} flex={1}>
              <InputLabel>Active to</InputLabel>
              <TextField
                name="active_to"
                type="datetime-local"
                value={form.active_to}
                onChange={handleChange}
                fullWidth
                size="small"
                disabled={saving}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>
          <FormHelperText sx={{ mt: -1 }}>Leave blank to show the banner without a schedule window.</FormHelperText>

          <Stack spacing={1}>
            <InputLabel>Status</InputLabel>
            <TextField
              select
              name="record_status"
              value={form.record_status}
              onChange={handleChange}
              fullWidth
              size="small"
              disabled={saving}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Inactive banners are hidden from the customer app.</FormHelperText>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving || uploading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving || uploading}>
          {saving ? 'Saving…' : initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

BannersFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSaved: PropTypes.func,
  initialData: PropTypes.object
};
