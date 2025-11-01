// ==============================|| ROLE & PERMISSION API ||============================== //
import axiosServices from 'utils/axios';

const endpoints = {
  roles: 'role',
  roleById: (id) => `role/${id}`,
  permissions: 'role/permissions',
  permissionById: (id) => `role/permissions/${id}`,
  assignPermissions: (roleId) => `role/${roleId}/permissions`
};

export const getRoles = async () => {
  const response = await axiosServices.get(endpoints.roles);
  return response.data;
};

export const getRoleById = async (id) => {
  const response = await axiosServices.get(endpoints.roleById(id));
  return response.data;
};

export const createRole = async (payload) => {
  const response = await axiosServices.post(endpoints.roles, payload);
  return response.data;
};

export const updateRole = async (id, payload) => {
  const response = await axiosServices.put(endpoints.roleById(id), payload);
  return response.data;
};

export const getPermissions = async (params) => {
  const response = await axiosServices.get(endpoints.permissions, { params });
  return response.data;
};

export const getPermissionById = async (id) => {
  const response = await axiosServices.get(endpoints.permissionById(id));
  return response.data;
};

export const createPermission = async (payload) => {
  const response = await axiosServices.post(endpoints.permissions, payload);
  return response.data;
};

export const updatePermission = async (id, payload) => {
  const response = await axiosServices.put(endpoints.permissionById(id), payload);
  return response.data;
};

export const assignPermissions = async ({ roleId, permissionIds, createdBy }) => {
  const response = await axiosServices.post(endpoints.assignPermissions(roleId), {
    permissionIds,
    createdBy
  });
  return response.data;
};
