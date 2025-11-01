import axiosServices from 'utils/axios';

const endpoints = {
  getUsers: 'admin/users',
  getUserById: (id) => `admin/user/${id}`,
  createUser: 'admin/user',
  updateUser: (id) => `admin/user/${id}`,
  businessUser: 'admin/user/business',
  businessUserById: (id) => `admin/user/business/${id}`
};

export async function getUsers(params) {
  const response = await axiosServices.get(endpoints.getUsers, { params });
  return response.data;
}
export async function getBusinessUsers(params) {
  const response = await axiosServices.get(endpoints.businessUser, { params });
  return response.data;
}

export async function getUserById(id, params) {
  const response = await axiosServices.get(endpoints.getUserById(id), { params });
  return response.data;
}

export async function createUser(payload) {
  const response = await axiosServices.post(endpoints.createUser, payload);
  return response.data;
}

export async function updateUser(id, payload) {
  const response = await axiosServices.put(endpoints.updateUser(id), payload);
  return response.data;
}

export async function createBusinessUser(payload) {
  const response = await axiosServices.post(endpoints.businessUser, payload);
  return response.data;
}

export async function updateBusinessUser(id, payload) {
  const response = await axiosServices.put(endpoints.businessUserById(id), payload);
  return response.data;
}
