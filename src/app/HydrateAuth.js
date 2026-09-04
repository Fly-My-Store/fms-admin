'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { hydrateFromStorage, setPermissions, updateAuthUser } from 'store/auth/authSlice';
import { getMe } from 'api/iam';
import { STORAGE_KEYS } from 'utils/constants';

export default function HydrateAuth() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(hydrateFromStorage());
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.TOKEN) : null;
    if (!token) return undefined;
    let cancelled = false;
    getMe()
      .then((resp) => {
        if (cancelled) return;
        const payload = resp?.data || resp;
        if (Array.isArray(payload?.permissions)) dispatch(setPermissions(payload.permissions));
        if (payload?.user) dispatch(updateAuthUser(payload.user));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [dispatch]);
  return null;
}
