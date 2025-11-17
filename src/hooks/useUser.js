'use client';

import { useSelector } from 'react-redux';

export default function useUser() {
  const { user, loading, isLoggedIn } = useSelector((state) => state.auth);
  return {
    name: user?.name?.trim() || '',
    email: user?.email || '',
    avatar: user?.photo || null,
    thumb: user?.photo || null,
    type: user?.type || null,
    isLoggedIn,
    loading
  };
}
