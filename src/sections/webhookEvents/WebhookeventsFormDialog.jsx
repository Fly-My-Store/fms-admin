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
import { actions as integrations } from 'store/integrations/slice';

export default function WebhookeventsFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ provider: '', event_type: '', status: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ provider: '', event_type: '', status: '' }, ...initialData });
    } else {
      setForm({ provider: '', event_type: '', status: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(integrations.webhookEventsUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(integrations.webhookEventsCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Webhook Event' : 'Add New Webhook Event'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>Provider</InputLabel>
            <TextField id="provider" name="provider" type="text" value={form.provider || ''} onChange={handleChange} placeholder="Provider" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Event Type</InputLabel>
            <TextField id="event_type" name="event_type" type="text" value={form.event_type || ''} onChange={handleChange} placeholder="Event Type" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Status</InputLabel>
            <TextField id="status" name="status" type="text" value={form.status || ''} onChange={handleChange} placeholder="Status" fullWidth />
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

WebhookeventsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
