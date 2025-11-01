'use client';

import { useSelector } from 'react-redux';

export default function useUser() {
  const { user, loading, isLoggedIn } = useSelector((state) => state.auth);
  console.log('useUser - user:', user);
  return {
    name: user?.name?.trim() || '',
    email: user?.email || '',
    avatar: user?.photo || null,
    thumb: user?.photo || null,
    role: user?.role || null,
    isLoggedIn,
    loading
  };
}
