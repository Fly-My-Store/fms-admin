'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as audit } from 'store/audit/slice';
import AuditsTableSection from 'sections/audits/AuditsTableSection';

export default function AuditsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.audit || {});
  const list = state.audits || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  useEffect(() => {
    dispatch(audit.auditsListRequest({ params: { page, limit: pageSize } }));
  }, [dispatch, page, pageSize]);

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(audit.auditsListRequest({ params: { page: next.pageIndex + 1, limit: next.pageSize } }));
  };

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  return (
    <AuditsTableSection
      rows={data}
      pageIndex={page - 1}
      pageSize={pageSize}
      totalPageCount={totalPages}
      onPaginationChange={handlePaginationChange}
    />
  );
}
