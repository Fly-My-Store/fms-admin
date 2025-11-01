import { useSelector } from 'react-redux';

const norm = (s) =>
  String(s || '')
    .trim()
    .toLowerCase();

export function useCan() {
  const { user, permissionsByName, isLoaded } = useSelector((s) => s.auth || {});

  const isAdminBypass = user?.subType === 'admin';

  const can = (permissionName, action) => {
    if (!isLoaded) return false; // avoid flicker until auth loaded
    if (isAdminBypass) return true; // ADMIN subtype bypass
    const row = permissionsByName[norm(permissionName)];
    return !!row?.[action];
  };

  const canRead = (perm) => can(perm, 'read');
  const canCreate = (perm) => can(perm, 'create');
  const canModify = (perm) => can(perm, 'modify');
  const canDelete = (perm) => can(perm, 'delete');

  return { can, canRead, canCreate, canModify, canDelete, isLoaded, user };
}
