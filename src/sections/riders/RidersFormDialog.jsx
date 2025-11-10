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
import { actions as logistics } from 'store/logistics/slice';

export default function RidersFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ user_id: '', vehicle_type: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ user_id: '', vehicle_type: '' }, ...initialData });
    } else {
      setForm({ user_id: '', vehicle_type: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(logistics.ridersUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(logistics.ridersCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Rider' : 'Add New Rider'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>User ID</InputLabel>
            <TextField id="user_id" name="user_id" type="text" value={form.user_id || ''} onChange={handleChange} placeholder="User ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Vehicle Type</InputLabel>
            <TextField id="vehicle_type" name="vehicle_type" type="text" value={form.vehicle_type || ''} onChange={handleChange} placeholder="Vehicle Type" fullWidth />
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

RidersFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
