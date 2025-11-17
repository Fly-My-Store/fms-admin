import { get, post, patch, del, put } from '../utils/api';

export const listDefs = (params) => get('admin/attributes/defs', params);
export const getDef = (code) => get(`admin/attributes/defs/${encodeURIComponent(code)}`);
export const createDef = (data) => post('admin/attributes/defs', data);
export const updateDef = (code, data) => patch(`admin/attributes/defs/${encodeURIComponent(code)}`, data);
export const removeDef = (code) => del(`admin/attributes/defs/${encodeURIComponent(code)}`);
export const bulkUpsertDefs = (items) => post('admin/attributes/defs/bulk-upsert', items);

export const listCategoryAttrs = (params) => get('admin/attributes/category-attrs', params);
export const getCategoryAttr = (id) => get(`admin/attributes/category-attrs/${id}`);
export const createCategoryAttr = (data) => post('admin/attributes/category-attrs', data);
export const updateCategoryAttr = (id, data) => patch(`admin/attributes/category-attrs/${id}`, data);
export const removeCategoryAttr = (category_id, attribute_code) =>
  del(`admin/attributes/category-attrs/${category_id}/${encodeURIComponent(attribute_code)}`);
export const bulkUpsertCategoryAttrs = (items) => post('admin/attributes/category-attrs/bulk-upsert', items);

export const listGroups = (params) => get('admin/attributes/groups', params);
export const getGroup = (id) => get(`admin/attributes/groups/${id}`);
export const createGroup = (data) => post('admin/attributes/groups', data);
export const updateGroup = (id, data) => patch(`admin/attributes/groups/${id}`, data);
export const removeGroup = (id) => del(`admin/attributes/groups/${id}`);

export const listGroupMembers = (groupId) => get(`admin/attributes/groups/${groupId}/members`);
export const addGroupMember = (groupId, data) => post(`admin/attributes/groups/${groupId}/members`, data);
export const removeGroupMember = (groupId, attributeCode) =>
  del(`admin/attributes/groups/${groupId}/members/${encodeURIComponent(attributeCode)}`);
export const reorderGroupMembers = (groupId, items) => post(`admin/attributes/groups/${groupId}/members/reorder`, { items });

export const listPlpConfigs = (params) => get('admin/attributes/plp-configs', params);
export const getPlpConfig = (categoryId) => get(`admin/attributes/plp/${categoryId}`);
export const createPlpConfig = (data) => post('admin/attributes/plp', data);
export const upsertPlpConfig = (categoryId, data) => patch(`admin/attributes/plp/${categoryId}`, data);
export const removePlpConfig = (categoryId) => del(`admin/attributes/plp/${categoryId}`);

export const listProductAttrs = (params) => get('admin/attributes/product-attrs', params);
export const upsertProductAttr = (code, data) => put(`admin/attributes/product-attrs/${code}`, data);
export const getProductAttr = (code, productId) => get(`admin/attributes/product-attrs/${productId}/${code}`);

export const listVariantAttrs = (params) => get('admin/attributes/variant-attrs', params);
export const upsertVariantAttr = (code, data) => put(`admin/attributes/variant-attrs/${code}`, data);
export const getVariantAttr = (code, variantId) => get(`admin/attributes/variant-attrs/${variantId}/${code}`);
