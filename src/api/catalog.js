import { get, post, patch, del } from '../utils/api';

export const listBrands = (params) => get('admin/catalog/brands', params);
export const getBrand = (id) => get(`admin/catalog/brands/${id}`);
export const createBrand = (data) => post('admin/catalog/brands', data);
export const updateBrand = (id, data) => patch(`admin/catalog/brands/${id}`, data);
export const removeBrand = (id) => del(`admin/catalog/brands/${id}`);

export const listCategories = (params) => get('admin/catalog/categories', params);
export const getCategory = (id) => get(`admin/catalog/categories/${id}`);
export const createCategory = (data) => post('admin/catalog/categories', data);
export const updateCategory = (id, data) => patch(`admin/catalog/categories/${id}`, data);
export const removeCategory = (id) => del(`admin/catalog/categories/${id}`);
export const listCategoryChildren = (id) => get(`admin/catalog/categories/${id}/children`);
export const checkCategorySlug = (slug) => get(`admin/catalog/categories/slug/${encodeURIComponent(slug)}/available`);

export const listProducts = (params) => get('admin/catalog/products', params);
export const getProduct = (id) => get(`admin/catalog/products/${id}`);
export const createProduct = (data) => post('admin/catalog/products', data);
export const updateProduct = (id, data) => patch(`admin/catalog/products/${id}`, data);
export const removeProduct = (id) => del(`admin/catalog/products/${id}`);
export const approveProduct = (id) => post(`admin/catalog/products/${id}/approve`);
export const rejectProduct = (id) => post(`admin/catalog/products/${id}/reject`);
export const archiveProduct = (id) => post(`admin/catalog/products/${id}/archive`);

export const listVariants = (productId, params) => get(`admin/catalog/products/${productId}/variants`, params);
export const createVariant = (productId, data) => post(`admin/catalog/products/${productId}/variants`, data);
export const getVariant = (id) => get(`admin/catalog/variants/${id}`);
export const updateVariant = (id, data) => patch(`admin/catalog/variants/${id}`, data);
export const removeVariant = (id) => del(`admin/catalog/variants/${id}`);

export const listProductImages = (productId, params) => get(`admin/catalog/products/${productId}/images`, params);
export const createProductImage = (productId, data) => post(`admin/catalog/products/${productId}/images`, data);
export const updateProductImage = (productId, imageId, data) => patch(`admin/catalog/products/${productId}/images/${imageId}`, data);
export const removeProductImage = (productId, imageId) => del(`admin/catalog/products/${productId}/images/${imageId}`);
