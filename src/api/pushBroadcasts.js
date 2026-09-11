import { get, patch, post } from '../utils/api';

export const listPushBroadcastTemplates = () => get('admin/push-broadcasts/templates');
export const previewPushAudience = (data) => post('admin/push-broadcasts/preview-audience', data);
export const testPushBroadcast = (data) => post('admin/push-broadcasts/test', data);
export const listPushBroadcasts = (params) => get('admin/push-broadcasts', params);
export const getPushBroadcast = (id) => get(`admin/push-broadcasts/${id}`);
export const createPushBroadcast = (data) => post('admin/push-broadcasts', data);
export const updatePushBroadcast = (id, data) => patch(`admin/push-broadcasts/${id}`, data);
export const queuePushBroadcast = (id) => post(`admin/push-broadcasts/${id}/queue`);
export const cancelPushBroadcast = (id) => post(`admin/push-broadcasts/${id}/cancel`);
export const resendPushBroadcast = (id) => post(`admin/push-broadcasts/${id}/resend`);
