// menu-items/index.js
'use client';

import { useSelector } from 'react-redux';
import platform from 'menu-items/platform';
import business from 'menu-items/business';

// Recursively filter a menu tree using permissions
function filterTree(node, can, isAdmin) {
  if (!node) return null;

  // leaf item
  if (node.type === 'item') {
    if (isAdmin) return node; // ADMIN subtype bypass
    if (!node.perm) return node; // no perm → visible to any authenticated user
    const action = node.action || 'read';
    return can(node.perm, action) ? node : null;
  }

  // groups/collapses
  if (Array.isArray(node.children)) {
    const children = node.children.map((c) => filterTree(c, can, isAdmin)).filter(Boolean);

    if (!children.length) return null;
    return { ...node, children };
  }

  return node;
}

export default function useMenuItems() {
  const { user, isLoaded, permissionsByName } = useSelector((s) => s.auth || {});
  const isAdminBypass = user?.type === 'ADMIN';

  const can = (perm, action = 'read') => {
    if (!isLoaded) return false; // wait for hydration
    if (isAdminBypass) return true; // ADMIN bypass
    const row = permissionsByName?.[perm];
    return !!row?.[action];
  };

  if (!isLoaded) return { items: [] };

  const src = user?.type === 'ADMIN' ? platform : business;
  const filtered = filterTree(src, can, isAdminBypass);

  return { items: filtered ? [filtered] : [] };
}
