'use client';

import { useCallback, useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { get } from 'utils/api';

export default function useAxiosPaginatedList(url, { params: extraParams = {}, errorMessage = 'Failed to load' } = {}) {
  const [rows, setRows] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
    setPageIndex(next.pageIndex);
    setPageSize(next.pageSize);
  };

  const paramsKey = JSON.stringify(extraParams);

  // Reset to first page when filter params change
  useEffect(() => {
    setPageIndex(0);
  }, [paramsKey]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = { page: pageIndex + 1, limit: pageSize, ...JSON.parse(paramsKey) };
      const payload = await get(url, queryParams);
      setRows(payload?.data || []);
      setTotalPages(payload?.meta?.totalPages ?? payload?.totalPages ?? 1);
    } catch {
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [url, pageIndex, pageSize, paramsKey, errorMessage]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    rows,
    pageIndex,
    pageSize,
    totalPages,
    loading,
    load,
    handlePaginationChange,
    setPageIndex
  };
}
