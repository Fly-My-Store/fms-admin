import { get, post, patch, del, put } from '../utils/api';
import axiosServices from 'utils/axios';

export const listBrands = (params) => get('admin/catalog/brands', params);
export const getBrand = (id) => get(`admin/catalog/brands/${id}`);
export const createBrand = (data) => post('admin/catalog/brands', data);
export const updateBrand = (id, data) => patch(`admin/catalog/brands/${id}`, data);
export const removeBrand = (id) => del(`admin/catalog/brands/${id}`);
export const approveBrand = (id) => post(`admin/catalog/brands/${id}/approve`);
export const approveBrandsBulk = (ids) => post('admin/catalog/brands/approve-bulk', { ids });

/** Multipart brands CSV/ZIP import (name, slug, logo) */
export async function bulkImportBrands(formData, onUploadProgress) {
  const r = await axiosServices.post('admin/catalog/brands/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
    timeout: 10 * 60 * 1000
  });
  return r.data;
}

/** Download brands bulk-import example CSV */
export async function downloadBrandsImportExample() {
  const r = await axiosServices.get('admin/catalog/brands/bulk-import/example.csv', {
    responseType: 'blob'
  });
  const blob = new Blob([r.data], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'brands-import-example.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export const listCategories = (params) => get('admin/catalog/categories', params);
export const getCategory = (id) => get(`admin/catalog/categories/${id}`);
export const createCategory = (data) => post('admin/catalog/categories', data);
export const updateCategory = (id, data) => patch(`admin/catalog/categories/${id}`, data);
export const removeCategory = (id) => del(`admin/catalog/categories/${id}`);
export const listCategoryChildren = (id) => get(`admin/catalog/categories/${id}/children`);
export const checkCategorySlug = (slug) => get(`admin/catalog/categories/slug/${encodeURIComponent(slug)}/available`);
export const approveCategory = (id) => post(`admin/catalog/categories/${id}/approve`);
export const approveCategoriesBulk = (ids) => post('admin/catalog/categories/approve-bulk', { ids });

/** Multipart categories CSV/ZIP import */
export async function bulkImportCategories(formData, onUploadProgress) {
  const r = await axiosServices.post('admin/catalog/categories/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
    timeout: 10 * 60 * 1000
  });
  return r.data;
}

/** Download categories bulk-import example CSV */
export async function downloadCategoriesImportExample() {
  const r = await axiosServices.get('admin/catalog/categories/bulk-import/example.csv', {
    responseType: 'blob'
  });
  const blob = new Blob([r.data], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'categories-import-example.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export const listProducts = (params) => get('admin/catalog/products', params);
export const getProduct = (id) => get(`admin/catalog/products/${id}`);
export const createProduct = (data) => post('admin/catalog/products', data);
export const updateProduct = (id, data) => patch(`admin/catalog/products/${id}`, data);
export const removeProduct = (id) => del(`admin/catalog/products/${id}`);
export const approveProduct = (id) => post(`admin/catalog/products/${id}/approve`);
export const approveProductsBulk = (ids) => post('admin/catalog/products/approve-bulk', { ids });
export const rejectProduct = (id) => post(`admin/catalog/products/${id}/reject`);
export const archiveProduct = (id) => post(`admin/catalog/products/${id}/archive`);

export const listAllVariants = (params) => get('admin/catalog/variants', params);
/** Product-scoped variants (saga) OR global list when first arg is params object */
export function listVariants(productIdOrParams, maybeParams) {
  if (typeof productIdOrParams === 'string') {
    return get(`admin/catalog/products/${productIdOrParams}/variants`, maybeParams);
  }
  return get('admin/catalog/variants', productIdOrParams);
}
export const listProductVariants = (productId, params) => get(`admin/catalog/products/${productId}/variants`, params);
/** @deprecated use listProductVariants */
export const listVariantsForProduct = listProductVariants;
export const createVariant = (productId, data) => post(`admin/catalog/products/${productId}/variants`, data);
export const getVariant = (id) => get(`admin/catalog/variants/${id}`);
export const updateVariant = (id, data) => patch(`admin/catalog/variants/${id}`, data);
export const removeVariant = (id) => del(`admin/catalog/variants/${id}`);
export const approveVariant = (id) => post(`admin/catalog/variants/${id}/approve`);
export const approveVariantsBulk = (ids) => post('admin/catalog/variants/approve-bulk', { ids });

export const listAllImages = (params) => get('admin/catalog/images', params);
export const approveImage = (id) => post(`admin/catalog/images/${id}/approve`);
export const approveImagesBulk = (ids) => post('admin/catalog/images/approve-bulk', { ids });
export const listProductImages = (productId, params) => get(`admin/catalog/products/${productId}/images`, params);
export const createProductImage = (productId, data) => post(`admin/catalog/products/${productId}/images`, data);
export const updateProductImage = (productId, imageId, data) => patch(`admin/catalog/products/${productId}/images/${imageId}`, data);
export const removeProductImage = (productId, imageId) => del(`admin/catalog/products/${productId}/images/${imageId}`);

export const listCompatibilities = (params) => get('admin/catalog/compatibilities', params);
export const putCompatibilities = (data) => put('admin/catalog/compatibilities', data);
export const createCompatibilityProduct = (data) => post('admin/catalog/compatibilities/products', data);
/** @deprecated use createCompatibilityProduct */
export const createCompatibilityDevice = createCompatibilityProduct;

/** Multipart catalog CSV/ZIP import */
export async function bulkImportCatalog(formData, onUploadProgress) {
  const r = await axiosServices.post('admin/catalog/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
    timeout: 10 * 60 * 1000
  });
  return r.data;
}
