'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { get } from 'utils/api';

/**
 * Paginated GET list helper.
 * Pass stable `params` (applied filters only). Changing params refetches from page 1
 * when `autoLoad` is true (default). Call `load()` after Search if you keep draft
 * filters outside and only update `params` on apply.
 */
export default function useAxiosPaginatedList(
  url,
  { params: extraParams = {}, errorMessage = 'Failed to load', autoLoad = true } = {}
) {
  const [rows, setRows] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const paramsKey = JSON.stringify(extraParams);
  const prevParamsKey = useRef(paramsKey);

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
    setPageIndex(next.pageIndex);
    setPageSize(next.pageSize);
  };

  useEffect(() => {
    if (prevParamsKey.current !== paramsKey) {
      prevParamsKey.current = paramsKey;
      setPageIndex(0);
    }
  }, [paramsKey]);

  const load = useCallback(
    async (override = {}) => {
      setLoading(true);
      try {
        const queryParams = {
          page: (override.pageIndex ?? pageIndex) + 1,
          limit: override.pageSize ?? pageSize,
          ...JSON.parse(paramsKey)
        };
        const payload = await get(url, queryParams);
        setRows(payload?.data || []);
        setTotalPages(payload?.meta?.totalPages ?? payload?.totalPages ?? 1);
        setTotalCount(payload?.meta?.total ?? payload?.total ?? 0);
      } catch {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [url, pageIndex, pageSize, paramsKey, errorMessage]
  );

  useEffect(() => {
    if (!autoLoad) return;
    load();
  }, [load, autoLoad]);

  return {
    rows,
    pageIndex,
    pageSize,
    totalPages,
    totalCount,
    loading,
    load,
    setPageIndex,
    setPageSize,
    handlePaginationChange
  };
}
