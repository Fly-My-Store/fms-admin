import { get, patch } from '../utils/api';
import axiosServices from 'utils/axios';

export const listStoreVariants = (storeId, params) =>
  get(`admin/listings-inventory/stores/${storeId}/variants`, params);

export async function bulkImportStoreVariants(storeId, formData, onUploadProgress) {
  const r = await axiosServices.post(
    `admin/listings-inventory/stores/${storeId}/variants/bulk-import`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
      timeout: 10 * 60 * 1000
    }
  );
  return r.data;
}

export async function downloadStoreListingImportExample(storeId) {
  const r = await axiosServices.get(
    `admin/listings-inventory/stores/${storeId}/variants/bulk-import/example.csv`,
    { responseType: 'blob' }
  );
  const blob = new Blob([r.data], { type: 'text/csv; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'store-listing-import-example.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export const listStoreListingCsv = (storeId, params) =>
  get(`admin/listings-inventory/stores/${storeId}/listing-csv`, params);

export const approveStoreListingCsv = (storeId, subId) =>
  patch(`admin/listings-inventory/stores/${storeId}/listing-csv/${subId}/approve`);

export const rejectStoreListingCsv = (storeId, subId, reviewer_note) =>
  patch(`admin/listings-inventory/stores/${storeId}/listing-csv/${subId}/reject`, { reviewer_note });
