import { get, put, post, del } from '../utils/api';

// Fare (pricing)
export const getActiveFare = () => get('admin/fare');
export const updateActiveFare = (data) => put('admin/fare', data);

// Fare bands
export const listFareBands = () => get('admin/fare/bands');
export const getFareBand = (id) => get(`admin/fare/bands/${id}`);
export const createFareBand = (data) => post('admin/fare/bands', data);
export const updateFareBand = (id, data) => put(`admin/fare/bands/${id}`, data);
export const deleteFareBand = (id) => del(`admin/fare/bands/${id}`);

// Fare category overrides
export const listFareCategoryOverrides = () => get('admin/fare/category-overrides');
export const getFareCategoryOverride = (id) => get(`admin/fare/category-overrides/${id}`);
export const createFareCategoryOverride = (data) => post('admin/fare/category-overrides', data);
export const updateFareCategoryOverride = (id, data) => put(`admin/fare/category-overrides/${id}`, data);
export const deleteFareCategoryOverride = (id) => del(`admin/fare/category-overrides/${id}`);

// Payouts
export const listPayouts = (params) => get('admin/payouts', params);
export const createPayout = (data) => post('admin/payouts', data);
export const getPayoutSummary = () => get('admin/payouts/summary');
