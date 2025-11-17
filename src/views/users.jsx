'use client';

import MainCard from 'components/MainCard';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserTableSection from 'sections/users/UserTableSection';
import UserFormDialog from 'sections/users/UserFormDialog';
import { clearError, fetchUsersRequest } from 'store/user/userSlice';
import { enqueueSnackbar } from 'notistack';

export function UsersView() {
  const dispatch = useDispatch();
  const { usersData, error } = useSelector((state) => state.user);
  const { count, page, pageSize, totalPages, data } = usersData;

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchUsersRequest({ page, limit: pageSize, type: 'ADMIN' }));
  }, [dispatch]);


  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelectedUser(null);
  };

  const handleAddButton = () => {
    setSelectedUser(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    if (row.subType !== 'admin') {
      setSelectedUser(row);
      setOpen(true);
    } else {
      enqueueSnackbar('You dont have access to update this user profile.', { variant: 'warning' });
    }
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(fetchUsersRequest({ page: next.pageIndex + 1, limit: next.pageSize }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
      dispatch(clearError());
    }
  }, [error]);

  return (
    <>
      <UserTableSection
        users={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <UserFormDialog open={open} onClose={handleDialogToggle} initialData={selectedUser} />
    </>
  );
}

export default UsersView;