import { get, post, patch } from '../utils/api';

// Category fees (platform + delivery + km)
export const listFareCategoryRules = (params) => get('admin/fare-category', params);
export const getFareCategoryRule = (id) => get(`admin/fare-category/${id}`);
export const createFareCategoryRule = (data) => post('admin/fare-category', data);
export const cloneFareCategoryRule = (id, data) => post(`admin/fare-category/${id}/clone`, data);
export const deactivateFareCategoryRule = (id) => patch(`admin/fare-category/${id}/deactivate`);

// Gateway fees (order-scoped %)
export const listFareGatewayRules = (params) => get('admin/fare-gateway', params);
export const getFareGatewayRule = (id) => get(`admin/fare-gateway/${id}`);
export const createFareGatewayRule = (data) => post('admin/fare-gateway', data);
export const cloneFareGatewayRule = (id, data) => post(`admin/fare-gateway/${id}/clone`, data);
export const deactivateFareGatewayRule = (id) => patch(`admin/fare-gateway/${id}/deactivate`);
