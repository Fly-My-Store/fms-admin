'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { actions as logistics } from 'store/logistics/slice';
import RidersTableSection from 'sections/riders/RidersTableSection';

export function RidersView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const state = useSelector((s) => s.logistics || {});
  const list = state.riders || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  useEffect(() => {
    dispatch(logistics.ridersListRequest({ params: { page, limit: pageSize } }));
  }, [dispatch]);

  const handleAddButton = () => {
    router.push('/riders/add');
  };

  const handleViewButton = (row) => {
    if (!row?.id) return;
    router.push(`/riders/${row.id}`);
  };

  const handleEditButton = (row) => {
    if (!row?.id) return;
    router.push(`/riders/edit/${row.id}`);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(logistics.ridersListRequest({ params: { page: next.pageIndex + 1, limit: next.pageSize } }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  return (
    <RidersTableSection
      rows={data}
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      handleViewButton={handleViewButton}
      pageIndex={page - 1}
      pageSize={pageSize}
      totalPageCount={totalPages}
      onPaginationChange={handlePaginationChange}
    />
  );
}

export default RidersView;
