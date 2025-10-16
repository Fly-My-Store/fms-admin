'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import DataTable from '../../components/DataTable';
import { fetchOrders } from '../../lib/slices/ordersSlice';

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>Orders</Typography>
      <DataTable
        loading={loading}
        rows={list}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'userName', label: 'User' },
          { key: 'vendorName', label: 'Vendor' },
          { key: 'total', label: 'Total' },
          { key: 'status', label: 'Status' },
          { key: 'createdAt', label: 'Created' },
        ]}
      />
    </div>
  );
}
