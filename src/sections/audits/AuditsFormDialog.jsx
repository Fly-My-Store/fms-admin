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
import { actions as audit } from 'store/audit/slice';

export default function AuditsFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ actor_id: '', entity: '', action: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ actor_id: '', entity: '', action: '' }, ...initialData });
    } else {
      setForm({ actor_id: '', entity: '', action: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(audit.auditsUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(audit.auditsCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Audit Log' : 'Add New Audit Log'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>Actor ID</InputLabel>
            <TextField id="actor_id" name="actor_id" type="text" value={form.actor_id || ''} onChange={handleChange} placeholder="Actor ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Entity</InputLabel>
            <TextField id="entity" name="entity" type="text" value={form.entity || ''} onChange={handleChange} placeholder="Entity" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Action</InputLabel>
            <TextField id="action" name="action" type="text" value={form.action || ''} onChange={handleChange} placeholder="Action" fullWidth />
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

AuditsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
