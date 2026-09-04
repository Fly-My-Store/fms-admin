'use client';

import { useSelector } from 'react-redux';

export default function useUser() {
  const { user, loading, isLoggedIn } = useSelector((state) => state.auth);
  const roleName = user?.role?.name || user?.role?.code || '';
  return {
    id: user?.id || null,
    name: user?.name?.trim() || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.photo || user?.avatar_url || null,
    thumb: user?.photo || user?.avatar_url || null,
    type: user?.type || null,
    role: roleName || (user?.is_super_admin ? 'Super Admin' : user?.type) || '',
    isLoggedIn,
    loading
  };
}
