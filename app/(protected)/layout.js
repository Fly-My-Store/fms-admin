'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { logout, hydrateFromStorage } from '../../lib/slices/authSlice';

const Nav = () => {
  return (
    <Box className="sidebar" sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>FMS Admin</Typography>
      <Box sx={{ display: 'grid', gap: 1 }}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/users">Users</Link>
        <Link href="/vendors">Vendors</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/payouts">Payouts</Link>
      </Box>
    </Box>
  );
};

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token } = useSelector(s => s.auth);

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  useEffect(() => {
    // if (!token) router.replace('/login');
  }, [token, router]);

  if (!token) return null;

  return (
    <Box className="row">
      <Nav />
      <Box className="main">
        <AppBar position="sticky" color="inherit" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>Admin</Typography>
            <Button onClick={() => dispatch(logout())}>Logout</Button>
          </Toolbar>
        </AppBar>
        <Box className="container">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
