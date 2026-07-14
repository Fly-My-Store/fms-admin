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

const EMPTY = {
  display_name: '',
  email: '',
  phone: ''
};

export default function SellersFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ ...EMPTY });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY,
        ...initialData
      });
    } else {
      setForm({ ...EMPTY });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      display_name: form.display_name,
      email: form.email,
      phone: form.phone
    };
    if (initialData?.id) {
      dispatch(sellersStores.sellersUpdateRequest({ params: { id: initialData.id, data: payload } }));
    } else {
      dispatch(sellersStores.sellersCreateRequest({ params: payload }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Seller' : 'Add New Seller'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth="400px">
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Display Name</InputLabel>
            <TextField
              id="display_name"
              name="display_name"
              type="text"
              value={form.display_name || ''}
              onChange={handleChange}
              placeholder="Display Name"
              fullWidth
            />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Email</InputLabel>
            <TextField
              id="email"
              name="email"
              type="text"
              value={form.email || ''}
              onChange={handleChange}
              placeholder="Email"
              fullWidth
            />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Phone</InputLabel>
            <TextField
              id="phone"
              name="phone"
              type="text"
              value={form.phone || ''}
              onChange={handleChange}
              placeholder="Phone"
              fullWidth
            />
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

SellersFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
