import { post } from 'utils/api';

const endpoints = {
  login: 'auth/login',
  forgotPassword: 'auth/forgot-password',
  resetPassword: 'auth/reset-password',
  changePassword: 'auth/change-password'
};

export async function loginUser(payload) {
  return post(endpoints.login, payload);
}

export async function forgotPassword(payload) {
  return post(endpoints.forgotPassword, payload);
}

export async function resetPassword(payload) {
  return post(endpoints.resetPassword, payload);
}

export async function changePassword(payload) {
  return post(endpoints.changePassword, payload);
}
