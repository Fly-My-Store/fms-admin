'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
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
import { actions as attributes } from 'store/attributes/slice';

export default function DefsFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ code: '', label: '', type: '', scope: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ code: '', label: '', type: '', scope: '' }, ...initialData });
    } else {
      setForm({ code: '', label: '', type: '', scope: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(attributes.defsUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(attributes.defsCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Attribute' : 'Add New Attribute'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>Code</InputLabel>
            <TextField id="code" name="code" type="text" value={form.code || ''} onChange={handleChange} placeholder="Code" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Label</InputLabel>
            <TextField id="label" name="label" type="text" value={form.label || ''} onChange={handleChange} placeholder="Label" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Type</InputLabel>
            <TextField id="type" name="type" type="text" value={form.type || ''} onChange={handleChange} placeholder="Type" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Scope</InputLabel>
            <TextField id="scope" name="scope" type="text" value={form.scope || ''} onChange={handleChange} placeholder="Scope" fullWidth />
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
  initialData: PropTypes.object
};
