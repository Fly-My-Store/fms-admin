'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import DataTable from '../../components/DataTable';
import { fetchPayouts } from '../../lib/slices/payoutsSlice';

export default function PayoutsPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.payouts);

  useEffect(() => { dispatch(fetchPayouts()); }, [dispatch]);

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>Payouts</Typography>
      <DataTable
        loading={loading}
        rows={list}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'vendorName', label: 'Vendor' },
          { key: 'amount', label: 'Amount' },
          { key: 'status', label: 'Status' },
          { key: 'createdAt', label: 'Created' },
        ]}
      />
    </div>
  );
}
