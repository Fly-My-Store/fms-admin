'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function parseValue(raw, fallback) {
  if (raw == null || raw === '') return fallback;
  if (typeof fallback === 'number') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }
  return String(raw);
}

function buildQuery(values, defaults, keys, preserved = {}) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(preserved)) {
    if (v == null || v === '') continue;
    sp.set(k, String(v));
  }
  for (const key of keys) {
    const v = values[key];
    if (v == null || v === '') continue;
    if (key === 'page' && Number(v) === 1) continue;
    sp.set(key, String(v));
  }
  return sp.toString();
}

/**
 * Draft vs applied filters synced to the URL.
 * Edit `draft` freely (no fetch). Call `applySearch()` to commit + write URL.
 * Pagination helpers update applied filters + URL.
 */
export default function useUrlFilters({ defaults, keys: keysProp, preserveKeys = [] } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const keys = useMemo(() => keysProp || Object.keys(defaults || {}), [keysProp, defaults]);
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;
  const skipNextUrlSync = useRef(false);
  const preserveKeysRef = useRef(preserveKeys);
  preserveKeysRef.current = preserveKeys;

  const readFromUrl = useCallback(() => {
    const d = defaultsRef.current || {};
    const next = { ...d };
    for (const key of keys) {
      const raw = searchParams?.get(key);
      next[key] = raw == null || raw === '' ? d[key] : parseValue(raw, d[key]);
    }
    if (!next.page) next.page = d.page || 1;
    if (!next.limit) next.limit = d.limit || 20;
    return next;
  }, [keys, searchParams]);

  const [draft, setDraftState] = useState(readFromUrl);
  const [applied, setApplied] = useState(readFromUrl);

  const writeUrl = useCallback(
    (values) => {
      skipNextUrlSync.current = true;
      const preserved = {};
      for (const k of preserveKeysRef.current || []) {
        if (Object.prototype.hasOwnProperty.call(values, k)) continue;
        const raw = searchParams?.get(k);
        if (raw != null && raw !== '') preserved[k] = raw;
      }
      const qs = buildQuery(values, defaultsRef.current || {}, keys, preserved);
      const href = qs ? `${pathname}?${qs}` : pathname;
      router.replace(href, { scroll: false });
    },
    [keys, pathname, router, searchParams]
  );

  const urlKey = searchParams?.toString() || '';

  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }
    const next = readFromUrl();
    setDraftState(next);
    setApplied(next);
  }, [urlKey, readFromUrl]);

  const setDraft = useCallback((patch) => {
    setDraftState((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const applySearch = useCallback(
    (patch) => {
      setDraftState((prev) => {
        const next = {
          ...prev,
          ...(typeof patch === 'function' ? patch(prev) : patch || {}),
          page: 1
        };
        setApplied(next);
        writeUrl(next);
        return next;
      });
    },
    [writeUrl]
  );

  const handlePaginationChange = useCallback(
    (updater) => {
      setApplied((prev) => {
        const current = { pageIndex: (Number(prev.page) || 1) - 1, pageSize: Number(prev.limit) || 20 };
        const nextState = typeof updater === 'function' ? updater(current) : updater;
        const next = {
          ...prev,
          page: (nextState.pageIndex || 0) + 1,
          limit: nextState.pageSize || prev.limit
        };
        setDraftState((d) => ({ ...d, page: next.page, limit: next.limit }));
        writeUrl(next);
        return next;
      });
    },
    [writeUrl]
  );

  return {
    draft,
    setDraft,
    applied,
    applySearch,
    handlePaginationChange,
    urlKey
  };
}
