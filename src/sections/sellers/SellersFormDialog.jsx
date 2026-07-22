'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { CloseOutlined } from '@ant-design/icons';
import { actions as sellersStores } from 'store/sellersStores/slice';

const EMPTY = {
  display_name: '',
  email: '',
  phone: '',
  is_tester: false,
  tester_otp: ''
};

export default function SellersFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const actorIsTester = useSelector((s) => Boolean(s.auth?.user?.is_tester));
  const [form, setForm] = useState({ ...EMPTY });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY,
        display_name: initialData.display_name || initialData.legal_name || '',
        email: initialData.user?.email || initialData.email || '',
        phone: initialData.user?.phone || initialData.phone || '',
        is_tester: Boolean(initialData.user?.is_tester ?? initialData.is_demo),
        tester_otp: ''
      });
    } else {
      setForm({ ...EMPTY, is_tester: actorIsTester });
    }
  }, [initialData, open, actorIsTester]);

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
    if (!actorIsTester) {
      payload.is_tester = Boolean(form.is_tester);
      if (form.tester_otp.trim()) payload.tester_otp = form.tester_otp.trim();
    }
    if (initialData?.id) {
      dispatch(sellersStores.sellersUpdateRequest({ params: { id: initialData.id, data: payload } }));
    } else {
      const name = form.display_name.trim();
      dispatch(
        sellersStores.sellersCreateRequest({
          params: {
            display_name: name,
            legal_name: name,
            user: {
              name,
              email: form.email.trim().toLowerCase(),
              phone: form.phone.trim() || undefined,
              ...(!actorIsTester ? { is_tester: Boolean(form.is_tester) } : {})
            },
            ...(!actorIsTester ? { is_tester: Boolean(form.is_tester) } : {}),
            ...(!actorIsTester && form.tester_otp.trim() ? { tester_otp: form.tester_otp.trim() } : {})
          }
        })
      );
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
              disabled={Boolean(initialData?.id)}
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
              disabled={Boolean(initialData?.id)}
            />
          </Stack>

          {!actorIsTester && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(form.is_tester)}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_tester: e.target.checked }))}
                  />
                }
                label="Tester / demo seller (is_tester)"
              />
              {form.is_tester && (
                <Stack sx={{ gap: 1 }}>
                  <InputLabel>Tester OTP (optional)</InputLabel>
                  <TextField
                    id="tester_otp"
                    name="tester_otp"
                    value={form.tester_otp}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current / default"
                    fullWidth
                  />
                </Stack>
              )}
            </>
          )}
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
