'use client';

import { useState } from 'react';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import UserTableSection from 'sections/users/UserTableSection';
import UserFormDialog from 'sections/users/UserFormDialog';

export default function UsersView() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { rows, pageIndex, pageSize, totalPages, load, handlePaginationChange } = useAxiosPaginatedList(
    'admin/iam/users',
    { params: { type: 'ADMIN' }, errorMessage: 'Failed to load admin users' }
  );

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
