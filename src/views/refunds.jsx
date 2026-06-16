'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { actions as ordersPayments } from 'store/ordersPayments/slice';
import RefundsTableSection from 'sections/refunds/RefundsTableSection';

export function RefundsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.orderspayments || {});
  const list = state.refunds || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  useEffect(() => {
    dispatch(ordersPayments.refundsListRequest({ params: { page, limit: pageSize } }));
  }, [dispatch, page, pageSize]);

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
      <Alert severity="info" sx={{ mb: 2 }}>
        Refund history is read-only. Refunds are issued automatically when an order is cancelled from the order detail page.
      </Alert>
      <RefundsTableSection
        rows={data}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
}

export default RefundsView;
