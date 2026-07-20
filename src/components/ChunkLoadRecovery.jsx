'use client';

import { useEffect } from 'react';

const CHUNK_ERROR_RE = /Loading chunk [\d]+ failed|ChunkLoadError|Failed to fetch dynamically imported module/i;

function isChunkLoadFailure(reason) {
  const message = reason?.message || reason?.toString?.() || '';
  return CHUNK_ERROR_RE.test(message);
}

function reloadOnce() {
  try {
    const key = 'fms-admin-chunk-reload';
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    window.location.reload();
  } catch {
    window.location.reload();
  }
}

export default function ChunkLoadRecovery() {
  useEffect(() => {
    const onError = (event) => {
      if (isChunkLoadFailure(event?.error || event)) reloadOnce();
    };

    const onRejection = (event) => {
      if (isChunkLoadFailure(event?.reason)) reloadOnce();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
