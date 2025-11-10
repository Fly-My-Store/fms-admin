import { get, post, patch, del } from '../utils/api';

export const listDeliveries = (params) => get('admin/logistics/deliveries', params);
export const getDelivery = (id) => get(`admin/logistics/deliveries/${id}`);
export const createDelivery = (data) => post('admin/logistics/deliveries', data);
export const updateDelivery = (id, data) => patch(`admin/logistics/deliveries/${id}`, data);

export const listDeliveryJobs = (deliveryId, params) => get(`admin/logistics/deliveries/${deliveryId}/jobs`, params);
export const createDeliveryJob = (deliveryId, data) => post(`admin/logistics/deliveries/${deliveryId}/jobs`, data);
export const updateDeliveryJob = (id, data) => patch(`admin/logistics/jobs/${id}`, data);
export const deleteDeliveryJob = (id) => del(`admin/logistics/jobs/${id}`);
export const assignDeliveryJob = (id, rider_id) => post(`admin/logistics/jobs/${id}/assign`, { rider_id });
export const reassignDeliveryJob = (id, rider_id) => post(`admin/logistics/jobs/${id}/reassign`, { rider_id });

export const listRiders = (params) => get('admin/logistics/riders', params);
export const getRider = (id) => get(`admin/logistics/riders/${id}`);
export const createRider = (data) => post('admin/logistics/riders', data);
export const updateRider = (id, data) => patch(`admin/logistics/riders/${id}`, data);

export const listRiderLocations = (riderId, params) => get(`admin/logistics/riders/${riderId}/locations`, params);
