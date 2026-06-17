'use client';

import { useSelector } from 'react-redux';
import platform from 'menu-items/platform';

const norm = (s) =>
  String(s || '')
    .trim()
    .toLowerCase();

function filterTree(node, can) {
  if (!node) return null;

  if (node.type === 'item') {
    if (!node.perm) return node;
    const action = node.action || 'read';
    return can(node.perm, action) ? node : null;
  }

  if (Array.isArray(node.children)) {
    const children = node.children.map((c) => filterTree(c, can)).filter(Boolean);
    if (!children.length) return null;
    return { ...node, children };
  }

  return node;
}

export default function useMenuItems() {
  const { isLoaded, permissionsByName, user } = useSelector((s) => s.auth || {});

  if (!isLoaded) return { items: [] };

  const isAdmin = String(user?.type || '').toUpperCase() === 'ADMIN';
  const hasPermissions = Object.keys(permissionsByName || {}).length > 0;

  // Admin app: full menu when login has not yet returned role permissions
  if (isAdmin && !hasPermissions) {
    return { items: [platform] };
  }

  const can = (perm, action = 'read') => {
    const row = permissionsByName?.[norm(perm)];
    return !!row?.[action];
  };

  const filtered = filterTree(platform, can);

  return { items: filtered ? [filtered] : [] };
}
