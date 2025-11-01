import axiosServices from 'utils/axios';

const endpoints = {
  login: 'auth/login',
  forgotPassword: 'auth/forgot-password',
  resetPassword: 'auth/reset-password',
  changePassword: 'auth/change-password'
};

export async function loginUser(payload) {
  const response = await axiosServices.post(endpoints.login, payload);
  return response.data;
}
export async function forgotPassword(payload) {
  const response = await axiosServices.post(endpoints.forgotPassword, payload);
  return response.data;
}
export async function resetPassword(payload) {
  const response = await axiosServices.post(endpoints.resetPassword, payload);
  return response.data;
}
export async function changePassword(payload) {
  const response = await axiosServices.post(endpoints.changePassword, payload);
  return response.data;
}
