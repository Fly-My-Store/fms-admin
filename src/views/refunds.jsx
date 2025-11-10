'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as ordersPayments } from 'store/ordersPayments/slice';
import RefundsTableSection from 'sections/refunds/RefundsTableSection';
import RefundsFormDialog from 'sections/refunds/RefundsFormDialog';

export function RefundsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.adminOrderspayments || {});
  const list = state.refunds || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(ordersPayments.refundsListRequest({ params: { page, limit: pageSize } }));
  }, [dispatch]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelected(null);
  };

  const handleAddButton = () => {
    setSelected(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelected(row);
    setOpen(true);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(ordersPayments.refundsListRequest({ params: { page: next.pageIndex + 1, limit: next.pageSize } }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  return (
    <>
      <RefundsTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <RefundsFormDialog open={open} onClose={handleDialogToggle} initialData={selected} />
    </>
  );
}

export default RefundsView;
