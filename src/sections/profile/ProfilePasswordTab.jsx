'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import {
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import { changePasswordRequest } from 'store/auth/authSlice';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

export default function ProfilePasswordTab() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const handleField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const handleSubmit = () => {
    if (!form.current_password || !form.new_password) {
      enqueueSnackbar('Fill in all password fields', { variant: 'warning' });
      return;
    }
    if (form.new_password.length < 6) {
      enqueueSnackbar('New password must be at least 6 characters', { variant: 'warning' });
      return;
    }
    if (form.new_password !== form.confirm_password) {
      enqueueSnackbar('New passwords do not match', { variant: 'warning' });
      return;
    }

    setSaving(true);
    dispatch(
      changePasswordRequest({
        params: {
          current_password: form.current_password,
          new_password: form.new_password
        },
        callback: () => {
          setSaving(false);
          setForm({ current_password: '', new_password: '', confirm_password: '' });
          enqueueSnackbar('Password updated', { variant: 'success' });
        },
        onError: (msg) => {
          setSaving(false);
          enqueueSnackbar(msg || 'Password update failed', { variant: 'error' });
        }
      })
    );
  };

  const renderPasswordField = (name, label, visibleKey) => (
    <Stack sx={{ gap: 1 }}>
      <InputLabel>{label}</InputLabel>
      <FormControl fullWidth size="small">
        <OutlinedInput
          type={show[visibleKey] ? 'text' : 'password'}
          value={form[name]}
          onChange={(e) => handleField(name, e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => setShow((p) => ({ ...p, [visibleKey]: !p[visibleKey] }))}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={`toggle ${label}`}
              >
                {show[visibleKey] ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    </Stack>
  );

  return (
    <MainCard title="Change password" border={false} boxShadow>
      <Stack spacing={3} sx={{ maxWidth: 520 }}>
        <Typography variant="body2" color="text.secondary">
          Use a strong password with at least 6 characters.
        </Typography>

        {renderPasswordField('current_password', 'Current password', 'current')}
        {renderPasswordField('new_password', 'New password', 'next')}
        {renderPasswordField('confirm_password', 'Confirm new password', 'confirm')}

        <FormHelperText sx={{ mx: 0 }}>
          You will stay signed in after changing your password.
        </FormHelperText>

        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Updating…' : 'Update password'}
          </Button>
        </Stack>
      </Stack>
    </MainCard>
  );
}
