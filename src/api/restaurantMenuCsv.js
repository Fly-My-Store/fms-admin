import { get, post } from '../utils/api';
import axiosServices from 'utils/axios';

const base = (storeId) => `admin/sellers-stores/stores/${storeId}/restaurant/menu`;

export const listRestaurantMenuCsvJobs = (storeId, params) =>
  get(`${base(storeId)}/csv-jobs`, params);

export const getRestaurantMenuCsvJob = (storeId, jobId) =>
  get(`${base(storeId)}/csv-jobs/${jobId}`);

export const presignRestaurantMenuCsvJob = (storeId, body) =>
  post(`${base(storeId)}/csv-jobs/presign`, body);

export const enqueueRestaurantMenuCsvExport = (storeId) =>
  post(`${base(storeId)}/csv-jobs/export`, {});

export const enqueueRestaurantMenuCsvUpdate = (storeId, body, config) =>
  post(`${base(storeId)}/csv-jobs/update`, body, config);

export const enqueueRestaurantMenuCsvImport = (storeId, body, config) =>
  post(`${base(storeId)}/csv-jobs/import`, body, config);

export const abortRestaurantMenuCsvJob = (storeId, jobId, body) =>
  post(`${base(storeId)}/csv-jobs/${jobId}/abort`, body);

export function restaurantMenuCsvJobDownloadPath(storeId, jobId, file = 'result') {
  return `${base(storeId)}/csv-jobs/${jobId}/download?file=${file}`;
}

export async function downloadRestaurantMenuExampleCsv(storeId) {
  const r = await axiosServices.get(`${base(storeId)}/example.csv`, {
    responseType: 'blob',
    timeout: 120000
  });
  const blob = new Blob([r.data], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'restaurant-menu-example.csv';
  a.click();
  URL.revokeObjectURL(url);
}
