import { get, post, patch, del } from '../utils/api';

export const listUsers = (params) => get('admin/iam/users', params);
export const getUser = (id) => get(`admin/iam/users/${id}`);
export const createUser = (data) => post('admin/iam/users', data);
export const updateUser = (id, data) => patch(`admin/iam/users/${id}`, data);
export const removeUser = (id) => del(`admin/iam/users/${id}`);
export const listUserSessions = (id, params) => get(`admin/iam/users/${id}/sessions`, params);
export const deleteSession = (sessionId) => del(`admin/iam/sessions/${sessionId}`);

export const listRoles = (params) => get('admin/iam/roles', params);
export const getRole = (id) => get(`admin/iam/roles/${id}`);
export const createRole = (data) => post('admin/iam/roles', data);
export const updateRole = (id, data) => patch(`admin/iam/roles/${id}`, data);
export const removeRole = (id) => del(`admin/iam/roles/${id}`);

export const listPermissions = (params) => get('admin/iam/permissions', params);
export const getPermission = (id) => get(`admin/iam/permissions/${id}`);
export const createPermission = (data) => post('admin/iam/permissions', data);
export const updatePermission = (id) => patch('admin/iam/permissions/${id}');
export const removePermission = (id) => del(`admin/iam/permissions/${id}`);

export const setRolePermissions = (roleId, permission_ids) => post(`admin/iam/roles/${roleId}/permissions`, { permission_ids });
export const setUserRoles = (userId, role_ids) => post(`admin/iam/users/${userId}/roles`, { role_ids });
