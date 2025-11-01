import axiosServices from 'utils/axios';

const endpoints = {
  brands: 'admin/brands',
  brandById: (id) => `admin/brands/${id}`
};

export async function getBrands(params) {
  const response = await axiosServices.get(endpoints.brands, { params });
  return response.data;
}

export async function getBrandById(id) {
  const response = await axiosServices.get(endpoints.brandById(id));
  return response.data;
}

export async function createBrand(payload) {
  const response = await axiosServices.post(endpoints.brands, payload);
  return response.data;
}

export async function updateBrand(id, payload) {
  const response = await axiosServices.put(endpoints.brandById(id), payload);
  return response.data;
}
