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
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import { CloseOutlined } from '@ant-design/icons';
import { upsertVariantAttr } from 'api/attributes';

export default function VariantAttrsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ variant_id: '', code: '', value_text: '' });

  useEffect(() => {
    if (initialData) {
      setForm({
        variant_id: initialData.variant_id || '',
        code: initialData.attribute_code || initialData.code || '',
        value_text: initialData.value_text || ''
      });
    } else {
      setForm({ variant_id: '', code: '', value_text: '' });
    }
  }, [initialData, open]);

  const handleSubmit = async () => {
    try {
      const attribute_code = form.code;
      const payload = {
        variant_id: form.variant_id,
        attribute_code,
        value_text: form.value_text
      };
      await upsertVariantAttr(attribute_code, payload);
      enqueueSnackbar(initialData ? 'Variant attribute updated' : 'Variant attribute created', { variant: 'success' });
      onSaved && onSaved();
      onClose();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to save variant attribute';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Variant Attribute' : 'Add New Variant Attribute'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Variant ID</InputLabel>
            <TextField id="variant_id" name="variant_id" value={form.variant_id || ''} onChange={(e)=>setForm(p=>({...p, variant_id: e.target.value}))} placeholder="Variant ID" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Code</InputLabel>
            <TextField id="code" name="code" value={form.code || ''} onChange={(e)=>setForm(p=>({...p, code: e.target.value}))} placeholder="Code" fullWidth disabled={!!initialData} />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Value</InputLabel>
            <TextField id="value_text" name="value_text" value={form.value_text || ''} onChange={(e)=>setForm(p=>({...p, value_text: e.target.value}))} placeholder="Value" fullWidth />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>{initialData ? 'Update' : 'Submit'}</Button>
      </DialogActions>
    </Dialog>
  );
}

VariantAttrsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
