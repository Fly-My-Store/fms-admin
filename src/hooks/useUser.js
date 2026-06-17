'use client';

import { useSelector } from 'react-redux';

export default function useUser() {
  const { user, loading, isLoggedIn } = useSelector((state) => state.auth);
  return {
    id: user?.id || null,
    name: user?.name?.trim() || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.photo || user?.avatar_url || null,
    thumb: user?.photo || user?.avatar_url || null,
    type: user?.type || null,
    isLoggedIn,
    loading
  };
}
