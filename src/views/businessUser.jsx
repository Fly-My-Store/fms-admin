'use client';

import MainCard from 'components/MainCard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BusinessUserTableSection from 'sections/businessUser/BusinessUserTableSection';
import { clearUser, fetchBusinessUsersRequest } from 'store/user/userSlice';
import { enqueueSnackbar } from 'notistack';

export function BusinessUsersView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { users, totalPages, currentPage, perPage } = useSelector((state) => state.user.businessUsersData);

  useEffect(() => {
    dispatch(fetchBusinessUsersRequest({ page: currentPage, limit: perPage }));
  }, [dispatch, currentPage, perPage]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelectedUser(null);
  };

  const handleAddButton = () => {
    dispatch(clearUser());
    router.push('/members/add');
  };
  const handleEditButton = (row) => {
    if (row.subType !== 'admin') {
      router.push(`/members/edit/${row.id}`);
    } else {
      enqueueSnackbar('You dont have access to update this user profile.', { variant: 'warning' });
    }
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: currentPage - 1, pageSize: perPage }) : updater;
    dispatch(fetchBusinessUsersRequest({ page: next.pageIndex + 1, limit: next.pageSize }));
  };

  return (
    <>
      <BusinessUserTableSection
        users={users}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={currentPage - 1}
        pageSize={perPage}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
}

export default BusinessUsersView;