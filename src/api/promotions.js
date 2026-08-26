import { get, post, patch, del } from '../utils/api';

export const listPromotions = (params) => get('admin/promotions', params);
export const getPromotion = (id) => get(`admin/promotions/${id}`);
export const createPromotion = (data) => post('admin/promotions', data);
export const updatePromotion = (id, data) => patch(`admin/promotions/${id}`, data);
export const deletePromotion = (id) => del(`admin/promotions/${id}`);
export const approvePromotion = (id) => post(`admin/promotions/${id}/approve`);
export const rejectPromotion = (id, data) => post(`admin/promotions/${id}/reject`, data || {});
