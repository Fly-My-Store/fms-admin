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
import { actions as geo } from 'store/geo/slice';

export default function PincodesFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ pincode: '', city: '', state: '', active: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ pincode: '', city: '', state: '', active: '' }, ...initialData });
    } else {
      setForm({ pincode: '', city: '', state: '', active: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(geo.pincodesUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(geo.pincodesCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Pincode' : 'Add New Pincode'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>Pincode</InputLabel>
            <TextField id="pincode" name="pincode" type="text" value={form.pincode || ''} onChange={handleChange} placeholder="Pincode" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>City</InputLabel>
            <TextField id="city" name="city" type="text" value={form.city || ''} onChange={handleChange} placeholder="City" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>State</InputLabel>
            <TextField id="state" name="state" type="text" value={form.state || ''} onChange={handleChange} placeholder="State" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Active</InputLabel>
            <TextField id="active" name="active" type="text" value={form.active || ''} onChange={handleChange} placeholder="Active" fullWidth />
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

PincodesFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
