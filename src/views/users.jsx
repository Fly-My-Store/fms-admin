'use client';

import { useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import UserTableSection from 'sections/users/UserTableSection';
import UserFormDialog from 'sections/users/UserFormDialog';
import { ACCOUNT_STATUS } from 'utils/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: String(ACCOUNT_STATUS.ACTIVE), label: 'Active' },
  { value: String(ACCOUNT_STATUS.INACTIVE), label: 'Inactive' },
  { value: String(ACCOUNT_STATUS.SUSPENDED), label: 'Suspended' },
  { value: String(ACCOUNT_STATUS.DELETED), label: 'Deleted' }
];

export default function UsersView() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '' });

  const listParams = {
    type: 'ADMIN',
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.status ? { status: filters.status } : {})
  };

  const { rows, pageIndex, pageSize, totalPages, load, handlePaginationChange } = useAxiosPaginatedList(
    'admin/iam/users',
    { params: listParams, errorMessage: 'Failed to load admin users' }
  );

  const handleSearch = () => setFilters((p) => ({ ...p, q: searchQuery.trim() }));

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelectedUser(null);
  };

  const handleAddButton = () => {
    setSelectedUser(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelectedUser(row);
    setOpen(true);
  };

  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Name, email, phone…"
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          sx={{ minWidth: 140 }}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value || 'all'} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" size="small" onClick={handleSearch} sx={{ alignSelf: 'center' }}>
          Search
        </Button>
      </Stack>

      <UserTableSection
        users={rows}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <UserFormDialog open={open} onClose={handleDialogToggle} initialData={selectedUser} onSaved={load} />
    </>
  );
}
