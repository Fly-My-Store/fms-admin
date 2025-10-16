'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, Grid2, Typography } from '@mui/material';
import { fetchAdminStats } from '../../../lib/slices/uiSlice';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { stats } = useSelector(s => s.ui);

  // useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

  const Metric = ({ label, value }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="overline">{label}</Typography>
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>Dashboard</Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <Metric label="Users" value={stats.users} />
        <Metric label="Vendors" value={stats.vendors} />
        <Metric label="Orders Today" value={stats.ordersToday} />
        <Metric label="GMV Today" value={`₹${stats.gmvToday}`} />
      </div>
    </div>
  );
}
