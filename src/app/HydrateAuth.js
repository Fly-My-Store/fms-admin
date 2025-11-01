'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { hydrateFromStorage } from 'store/auth/authSlice';

export default function HydrateAuth() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);
  return null;
}
