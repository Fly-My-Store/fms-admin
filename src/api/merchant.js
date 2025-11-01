import axiosServices from 'utils/axios';

const endpoints = {
  branchAccesses: 'branchAccess',
  branchAccessById: (id) => `branchAccess/${id}`
};

export async function getBranchAccesses(params) {
  const response = await axiosServices.get(endpoints.branchAccesses, { params });
  return response.data;
}

export async function getBranchAccessById(id) {
  const response = await axiosServices.get(endpoints.branchAccessById(id));
  return response.data;
}

export async function createBranchAccess(payload) {
  const response = await axiosServices.post(endpoints.branchAccesses, payload);
  return response.data;
}

export async function updateBranchAccess(id, payload) {
  const response = await axiosServices.put(endpoints.branchAccessById(id), payload);
  return response.data;
}
