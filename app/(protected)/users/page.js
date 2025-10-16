'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import DataTable from '../../components/DataTable';
import { fetchUsers } from '../../lib/slices/usersSlice';

export default function UsersPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.users);

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>Users</Typography>
      <DataTable
        loading={loading}
        rows={list}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'phone', label: 'Phone' },
          { key: 'createdAt', label: 'Created' },
        ]}
      />
    </div>
  );
}
