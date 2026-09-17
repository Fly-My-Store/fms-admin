import { get, post, patch, del } from 'utils/api';

export const listSurges = (params) => get('admin/surges', params);
export const getSurge = (id) => get(`admin/surges/${id}`);
export const createSurge = (data) => post('admin/surges', data);
export const updateSurge = (id, data) => patch(`admin/surges/${id}`, data);
export const deleteSurge = (id) => del(`admin/surges/${id}`);
export const enableSurge = (id) => post(`admin/surges/${id}/enable`);
export const disableSurge = (id) => post(`admin/surges/${id}/disable`);
