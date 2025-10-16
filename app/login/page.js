'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { loginRequested } from '../../lib/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { token, loading, error } = useSelector(s => s.auth);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (true) router.replace('/dashboard');
  }, [token, router]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(loginRequested({ phone, otp }));
  };

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', height: '100vh', p: 2 }}>
      <Paper sx={{ p: 4, width: 360, maxWidth: '90vw' }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 2 }}>Admin Login</Typography>
        <form onSubmit={onSubmit}>
          <TextField fullWidth label="Phone" margin="normal" value={phone} onChange={e => setPhone(e.target.value)} />
          <TextField fullWidth label="OTP (dev)" margin="normal" value={otp} onChange={e => setOtp(e.target.value)} />
          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2 }}>Login</Button>
        </form>
        {error ? <Typography color="error" sx={{ mt: 1 }}>{error}</Typography> : null}
      </Paper>
    </Box>
  );
}
