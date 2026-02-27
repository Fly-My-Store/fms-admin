'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { enqueueSnackbar } from 'notistack';

// material-ui
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { CloseOutlined } from '@ant-design/icons';
import { actions as attributes } from 'store/attributes/slice';
import { ATTRIBUTE_DEF_DATA_TYPES, ATTRIBUTE_DEF_STATUS, RECORD_STATUS, RECORD_STATUS_ARRAY } from 'utils/constants';


export default function DefsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const dispatch = useDispatch();

  // Keep allowed_values as an editable JSON string in the UI, parse on submit
  const EMPTY = {
    code: '',
    name: '',
    data_type: 'text',
    unit: '',
    allowed_values_str: '', // UI-only
    status: ATTRIBUTE_DEF_STATUS.APPROVED,
    record_status: RECORD_STATUS.ACTIVE,
  };

  const [form, setForm] = useState(EMPTY);
  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY,
        ...initialData,
        // show JSON nicely if present
        allowed_values_str:
          initialData?.allowed_values != null
            ? JSON.stringify(initialData.allowed_values, null, 2)
            : ''
      });
      setJsonError('');
    } else {
      setForm(EMPTY);
      setJsonError('');
    }
  }, [initialData, open]);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const handleSubmit = () => {
    // parse allowed_values
    let allowed_values = null;
    if (form.allowed_values_str?.trim()) {
      try {
        const parsed = JSON.parse(form.allowed_values_str);
        if (!Array.isArray(parsed)) throw new Error('must be a JSON array');
        allowed_values = parsed;
        setJsonError('');
      } catch (e) {
        setJsonError(`Invalid JSON: ${e.message}`);
        return;
      }
    }

    const payload = {
      code: form.code?.trim(),
      name: form.name?.trim(),
      data_type: form.data_type,
      unit: form.unit?.trim() || null,
      allowed_values,
      status: ATTRIBUTE_DEF_STATUS.APPROVED,
      record_status: form.record_status,
    };

    if (!payload.code) return;

    if (initialData?.code) {
      dispatch(
        attributes.defsUpdateRequest({
          params: { code: initialData.code, data: payload }
        })
      );
      enqueueSnackbar('Attribute updated', { variant: 'success' });
    } else {
      dispatch(attributes.defsCreateRequest({ params: payload }));
      enqueueSnackbar('Attribute created', { variant: 'success' });
    }
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Attribute' : 'Add New Attribute'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} mt={0.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {/* Column 1 */}
            <Stack flex={1} spacing={2}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Code</InputLabel>
                <TextField
                  id="code"
                  name="code"
                  value={form.code || ''}
                  onChange={(e) => setField('code', e.target.value)}
                  placeholder="battery_mah"
                  fullWidth
                  disabled={!!initialData?.code}
                  size="small"
                />
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel>Data Type</InputLabel>
                <TextField
                  id="data_type"
                  name="data_type"
                  value={form.data_type || ''}
                  onChange={(e) => setField('data_type', e.target.value)}
                  select
                  fullWidth
                  size="small"
                >
                  {...Object.values(ATTRIBUTE_DEF_DATA_TYPES).map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>

            {/* Column 2 */}
            <Stack flex={1} spacing={2}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Name</InputLabel>
                <TextField
                  id="name"
                  name="name"
                  value={form.name || ''}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Battery Capacity"
                  fullWidth
                  size="small"
                />
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel>Unit (optional)</InputLabel>
                <TextField
                  id="unit"
                  name="unit"
                  value={form.unit || ''}
                  onChange={(e) => setField('unit', e.target.value)}
                  placeholder='e.g., "mAh", "kg", "cm"'
                  fullWidth
                  size="small"
                />
              </Stack>
            </Stack>
          </Stack>
          <Stack sx={{ gap: 1 }}>
            <InputLabel shrink>Allowed Values (JSON array, optional)</InputLabel>
            <TextField
              id="allowed_values"
              name="allowed_values"
              value={form.allowed_values_str || ''}
              onChange={(e) => setField('allowed_values_str', e.target.value)}
              placeholder={`["64GB", "128GB"] or [{"code":"RED","label":"Red"}]`}
              fullWidth
              multiline
              minRows={4}
              size="small"
            />
            {jsonError ? <FormHelperText error>{jsonError}</FormHelperText> : null}
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>

            {/* Column 2 */}
            <Stack flex={1} spacing={2}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Record Status</InputLabel>
                <TextField
                  id="record_status"
                  name="record_status"
                  value={form.record_status || ''}
                  onChange={(e) => setField('record_status', e.target.value)}
                  select
                  fullWidth
                  size="small"
                >
                  {RECORD_STATUS_ARRAY.map((s) => (
                    <MenuItem key={s.key} value={s.key}>
                      {s.value}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DefsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};