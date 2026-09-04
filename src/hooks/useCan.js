import { useSelector } from 'react-redux';

const norm = (s) =>
  String(s || '')
    .trim()
    .toLowerCase();

export function isSuperAdminUser(user) {
  if (!user) return false;
  if (user.is_super_admin) return true;
  return String(user.role?.code || '').toUpperCase() === 'SUPER_ADMIN';
}

export function useCan() {
  const { user, permissionsByName, isLoaded } = useSelector((s) => s.auth || {});

  const can = (permissionName, action) => {
    if (!isLoaded) return false;
    if (isSuperAdminUser(user)) return true;
    const row = permissionsByName?.[norm(permissionName)];
    return !!row?.[action];
  };

  const canRead = (perm) => can(perm, 'read');
  const canCreate = (perm) => can(perm, 'create');
  const canModify = (perm) => can(perm, 'modify');
  const canDelete = (perm) => can(perm, 'delete');

  return { can, canRead, canCreate, canModify, canDelete, isLoaded, user };
}
