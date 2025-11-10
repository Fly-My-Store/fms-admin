import { get, post, patch, del } from '../utils/api';

export const listSellers = (params) => get('admin/sellers-stores/sellers', params);
export const getSeller = (id) => get(`admin/sellers-stores/sellers/${id}`);
export const createSeller = (data) => post('admin/sellers-stores/sellers', data);
export const updateSeller = (id, data) => patch(`admin/sellers-stores/sellers/${id}`, data);
export const removeSeller = (id, data) => patch(`admin/sellers-stores/sellers/${id}`, data);

export const listSellerDocuments = (sellerId, params) => get(`admin/sellers-stores/sellers/${sellerId}/documents`, params);
export const createSellerDocument = (sellerId, data) => post(`admin/sellers-stores/sellers/${sellerId}/documents`, data);
export const updateSellerDocument = (sellerId, docId, data) => patch(`admin/sellers-stores/sellers/${sellerId}/documents/${docId}`, data);
export const deleteSellerDocument = (sellerId, docId) => del(`admin/sellers-stores/sellers/${sellerId}/documents/${docId}`);
export const verifySellerDocument = (sellerId, docId) => post(`admin/sellers-stores/sellers/${sellerId}/documents/${docId}/verify`);

export const listSellerBankAccounts = (sellerId, params) => get(`admin/sellers-stores/sellers/${sellerId}/bank-accounts`, params);
export const createSellerBankAccount = (sellerId, data) => post(`admin/sellers-stores/sellers/${sellerId}/bank-accounts`, data);
export const updateSellerBankAccount = (sellerId, bankId, data) =>
  patch(`admin/sellers-stores/sellers/${sellerId}/bank-accounts/${bankId}`, data);
export const deleteSellerBankAccount = (sellerId, bankId) => del(`admin/sellers-stores/sellers/${sellerId}/bank-accounts/${bankId}`);
export const setPrimaryBankAccount = (sellerId, bankId) => post(`admin/sellers-stores/sellers/${sellerId}/bank-accounts/${bankId}/primary`);

export const getSellerPolicy = (sellerId) => get(`admin/sellers-stores/sellers/${sellerId}/policy`);
export const upsertSellerPolicy = (sellerId, data) => patch(`admin/sellers-stores/sellers/${sellerId}/policy`, data);

export const listStores = (params) => get('admin/sellers-stores/stores', params);
export const getStore = (id) => get(`admin/sellers-stores/stores/${id}`);
export const createStore = (data) => post('admin/sellers-stores/stores', data);
export const updateStore = (id, data) => patch(`admin/sellers-stores/stores/${id}`, data);
export const removeStore = (id) => del(`admin/sellers-stores/stores/${id}`);

export const listServiceAreas = (storeId, params) => get(`admin/sellers-stores/stores/${storeId}/service-areas`, params);
export const createServiceArea = (storeId, data) => post(`admin/sellers-stores/stores/${storeId}/service-areas`, data);
export const deleteServiceArea = (storeId, id) => del(`admin/sellers-stores/stores/${storeId}/service-areas/${id}`);
