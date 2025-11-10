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
import { actions as sellersStores } from 'store/sellersStores/slice';

export default function StoresFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', seller_id: '', pincode: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ name: '', seller_id: '', pincode: '' }, ...initialData });
    } else {
      setForm({ name: '', seller_id: '', pincode: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(sellersStores.storesUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(sellersStores.storesCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Store' : 'Add New Store'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>Name</InputLabel>
            <TextField id="name" name="name" type="text" value={form.name || ''} onChange={handleChange} placeholder="Name" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Seller ID</InputLabel>
            <TextField id="seller_id" name="seller_id" type="text" value={form.seller_id || ''} onChange={handleChange} placeholder="Seller ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Pincode</InputLabel>
            <TextField id="pincode" name="pincode" type="text" value={form.pincode || ''} onChange={handleChange} placeholder="Pincode" fullWidth />
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

StoresFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
