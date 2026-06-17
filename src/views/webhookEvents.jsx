'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as integrations } from 'store/integrations/slice';
import WebhookeventsTableSection from 'sections/webhookEvents/WebhookeventsTableSection';

export default function WebhookeventsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.integrations || {});
  const list = state.webhookEvents || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  useEffect(() => {
    dispatch(integrations.webhookEventsListRequest({ params: { page, limit: pageSize } }));
  }, [dispatch, page, pageSize]);

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(integrations.webhookEventsListRequest({ params: { page: next.pageIndex + 1, limit: next.pageSize } }));
  };

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  return (
    <WebhookeventsTableSection
      rows={data}
      pageIndex={page - 1}
      pageSize={pageSize}
      totalPageCount={totalPages}
      onPaginationChange={handlePaginationChange}
    />
  );
}
