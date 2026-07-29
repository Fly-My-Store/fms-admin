// src/api/upload.js
import { post } from 'utils/api';

const endpoints = {
  uploadSingle: 'upload/uploadSingle',
  uploadMany: 'upload/uploadMany'
};

function buildUploadParams({ purpose, product_id, variant_id, brand_id, category_id, store_id, order_id } = {}) {
  const params = {};
  if (purpose) params.purpose = purpose;
  if (product_id) params.product_id = product_id;
  if (variant_id) params.variant_id = variant_id;
  if (brand_id) params.brand_id = brand_id;
  if (category_id) params.category_id = category_id;
  if (store_id) params.store_id = store_id;
  if (order_id) params.order_id = order_id;
  return Object.keys(params).length ? params : undefined;
}

/**
 * Upload a single file.
 * @param {File|Blob} file
 * @param {(progressEvent: ProgressEvent) => void} [onUploadProgress]
 * @param {object} [opts]
 * @param {string} [opts.purpose] product | variant | brand | category | banner | profile | kyc | support | invoice
 * @param {string} [opts.product_id]
 * @param {string} [opts.variant_id]
 * @param {string} [opts.brand_id]
 * @param {string} [opts.category_id]
 * @param {string} [opts.store_id]
 * @param {string} [opts.order_id]
 * @returns {Promise<{ok: boolean, url: string}>}
 */
export async function uploadSingle(file, onUploadProgress, opts = {}) {
  const form = new FormData();
  form.append('file', file);

  return post(endpoints.uploadSingle, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: buildUploadParams(opts),
    onUploadProgress
  });
}

/**
 * Upload multiple files.
 * @param {File[]|FileList} files
 * @param {(progressEvent: ProgressEvent) => void} [onUploadProgress]
 * @param {object} [opts] same as uploadSingle opts
 * @returns {Promise<{ok: boolean, files: string[]}>}
 */
export async function uploadMany(files, onUploadProgress, opts = {}) {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append('file', f));

  return post(endpoints.uploadMany, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: buildUploadParams(opts),
    onUploadProgress
  });
}
