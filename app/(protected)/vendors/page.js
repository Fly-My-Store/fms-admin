'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import DataTable from '../../components/DataTable';
import { fetchVendors } from '../../lib/slices/vendorsSlice';

export default function VendorsPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.vendors);

  useEffect(() => { dispatch(fetchVendors()); }, [dispatch]);

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>Vendors</Typography>
      <DataTable
        loading={loading}
        rows={list}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'status', label: 'Status' },
          { key: 'createdAt', label: 'Created' },
        ]}
      />
    </div>
  );
}
