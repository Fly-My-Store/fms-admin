import axiosServices from 'utils/axios';

const endpoints = {
  businesses: 'business',
  businessById: (id) => `business/${id}`,
  businessConfiguration: 'business/businessConfiguration'
};

export async function getBusinesses(params) {
  const response = await axiosServices.get(endpoints.businesses, { params });
  return response.data;
}

export async function getBusinessById(id) {
  const response = await axiosServices.get(endpoints.businessById(id));
  return response.data;
}

export async function createBusiness(data) {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } };
  const res = await axiosServices.post(endpoints.businesses, data, config);
  return res.data;
}

export async function updateBusiness(id, data) {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } };
  const res = await axiosServices.put(endpoints.businessById(id), data, config);
  return res.data;
}

export async function upsertBusinessConfiguration(payload) {
  const response = await axiosServices.put(endpoints.businessConfiguration, payload);
  return response.data;
}
