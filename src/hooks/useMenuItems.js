'use client';

import { useSelector } from 'react-redux';
import platformMenuGroups from 'menu-items/platform';

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

function filterGroups(groups, can) {
  return groups.map((g) => filterTree(g, can)).filter(Boolean);
}

export default function useMenuItems() {
  const { isLoaded, permissionsByName, user } = useSelector((s) => s.auth || {});

  if (!isLoaded) return { items: [] };

  const isAdmin = String(user?.type || '').toUpperCase() === 'ADMIN';
  const hasPermissions = Object.keys(permissionsByName || {}).length > 0;

  // Admin app: full menu when login has not yet returned role permissions
  if (isAdmin && !hasPermissions) {
    return { items: platformMenuGroups };
  }

  const can = (perm, action = 'read') => {
    const row = permissionsByName?.[norm(perm)];
    return !!row?.[action];
  };

  return { items: filterGroups(platformMenuGroups, can) };
}
