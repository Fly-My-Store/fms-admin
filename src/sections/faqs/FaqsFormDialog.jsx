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
import { CloseOutlined } from '@ant-design/icons';
import { createFaq, updateFaq } from 'api/content';
import { RECORD_STATUS } from 'utils/constants';

const APP_TYPES = [
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'SELLER', label: 'Seller' },
  { value: 'RIDER', label: 'Rider' }
];

const STATUS_OPTIONS = [
  { value: RECORD_STATUS.ACTIVE, label: 'Active' },
  { value: RECORD_STATUS.INACTIVE, label: 'Inactive' }
];

const EMPTY = {
  app_type: 'CUSTOMER',
  section_title: '',
  section_icon: '',
  section_sort: 0,
  question: '',
  answer: '',
  sort_order: 0,
  record_status: RECORD_STATUS.ACTIVE
};

export default function FaqsFormDialog({ open, onClose, initialData = null, onSaved, defaultAppType = 'CUSTOMER' }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        app_type: initialData.app_type || defaultAppType,
        section_title: initialData.section_title || '',
        section_icon: initialData.section_icon || '',
        section_sort: Number(initialData.section_sort) || 0,
        question: initialData.question || '',
        answer: initialData.answer || '',
        sort_order: Number(initialData.sort_order) || 0,
        record_status: Number(initialData.record_status) || RECORD_STATUS.ACTIVE
      });
    } else {
      setForm({ ...EMPTY, app_type: defaultAppType || 'CUSTOMER' });
    }
  }, [initialData, open, defaultAppType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!String(form.section_title || '').trim()) {
      enqueueSnackbar('Section title is required', { variant: 'warning' });
      return;
    }
    if (!String(form.question || '').trim()) {
      enqueueSnackbar('Question is required', { variant: 'warning' });
      return;
    }
    if (!String(form.answer || '').trim()) {
      enqueueSnackbar('Answer is required', { variant: 'warning' });
      return;
    }

    const payload = {
      app_type: form.app_type,
      section_title: String(form.section_title).trim(),
      section_icon: String(form.section_icon || '').trim() || null,
      section_sort: Number(form.section_sort) || 0,
      question: String(form.question).trim(),
      answer: String(form.answer).trim(),
      sort_order: Number(form.sort_order) || 0,
      record_status: Number(form.record_status) || RECORD_STATUS.ACTIVE
    };

    try {
      setSaving(true);
      if (initialData?.id) {
        await updateFaq(initialData.id, payload);
        enqueueSnackbar('FAQ updated', { variant: 'success' });
      } else {
        await createFaq(payload);
        enqueueSnackbar('FAQ created', { variant: 'success' });
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
        {initialData ? 'Edit FAQ' : 'Add FAQ'}
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField select name="app_type" label="App" value={form.app_type} onChange={handleChange} fullWidth>
            {APP_TYPES.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            name="section_title"
            label="Section title"
            value={form.section_title}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="section_icon"
            label="Section icon"
            value={form.section_icon}
            onChange={handleChange}
            fullWidth
            helperText="Material Community Icon name, e.g. package-variant-closed"
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="section_sort"
              label="Section sort"
              type="number"
              value={form.section_sort}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="sort_order"
              label="Item sort"
              type="number"
              value={form.sort_order}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
          <TextField
            name="question"
            label="Question"
            value={form.question}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="answer"
            label="Answer"
            value={form.answer}
            onChange={handleChange}
            fullWidth
            required
            multiline
            minRows={4}
          />
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
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FaqsFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  onSaved: PropTypes.func,
  defaultAppType: PropTypes.string
};
