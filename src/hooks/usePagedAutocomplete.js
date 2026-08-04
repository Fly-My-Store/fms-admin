'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Server-paged Autocomplete helper shared by catalog list filters and quick-create.
 * @param {(params: object) => Promise<any>} listFn
 * @param {object} [extraParams] always merged into the request
 */
export default function usePagedAutocomplete(listFn, extraParams = {}) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (p = 1, q = query, append = false) => {
      try {
        setLoading(true);
        const res = await listFn({
          page: p,
          limit: 20,
          q: q || undefined,
          ...extraParams
        });
        const rows = res?.data || res?.rows || [];
        const meta = res?.meta || { page: p, totalPages: 1 };
        setOptions((prev) => (append ? [...prev, ...rows] : rows));
        setPage(meta.page || p);
        setTotalPages(meta.totalPages || 1);
      } catch {
        if (!append) setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listFn, query, JSON.stringify(extraParams)]
  );

  useEffect(() => {
    const t = setTimeout(() => load(1, query, false), 300);
    return () => clearTimeout(t);
  }, [query, load]);

  const handleScroll = (event) => {
    const node = event.currentTarget;
    const nearBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 32;
    if (nearBottom && !loading && page < totalPages) {
      load(page + 1, query, true);
    }
  };

  return { query, setQuery, options, setOptions, loading, load, handleScroll };
}
