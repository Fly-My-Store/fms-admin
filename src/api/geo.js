import { get, post, patch, del } from '../utils/api';

export const listPincodes = (params) => get('admin/geo/pincodes', params);
export const getPincode = (pincode) => get(`admin/geo/pincodes/${pincode}`);
export const createPincode = (data) => post('admin/geo/pincodes', data);
export const updatePincode = (pincode, data) => patch(`admin/geo/pincodes/${pincode}`, data);
export const deletePincode = (pincode) => del(`admin/geo/pincodes/${pincode}`);

export const listAddresses = (params) => get('admin/geo/addresses', params);
export const getAddress = (id) => get(`admin/geo/addresses/${id}`);
