import { get, post, patch, del } from '../utils/api';

export const listStoreProducts = (storeId, params) => get(`admin/listings-inventory/stores/${storeId}/products`, params);
export const getStoreProduct = (id) => get(`admin/listings-inventory/stores/${id}/products`);
export const createStoreProduct = (storeId, data) => post(`admin/listings-inventory/stores/${storeId}/products`, data);
export const updateStoreProduct = (storeId, id, data) => patch(`admin/listings-inventory/stores/${storeId}/products/${id}`, data);
export const removeStoreProduct = (storeId, id) => del(`admin/listings-inventory/stores/${storeId}/products/${id}`);

export const listStoreVariants = (storeId, params) => get(`admin/listings-inventory/stores/${storeId}/variants`, params);
export const getStoreVariant = (storeId, id) => get(`admin/listings-inventory/stores/${storeId}/variants/${id}`);
export const createStoreVariant = (storeId, data) => post(`admin/listings-inventory/stores/${storeId}/variants`, data);
export const updateStoreVariant = (storeId, id, data) => patch(`admin/listings-inventory/stores/${storeId}/variants/${id}`, data);
export const removeStoreVariant = (storeId, id) => del(`admin/listings-inventory/stores/${storeId}/variants/${id}`);

export const listInventoryMovements = (params) => get('admin/listings-inventory/inventory/movements', params);
export const createInventoryMovement = (data) => post('admin/listings-inventory/inventory/movements', data);
