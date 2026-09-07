import { get, post } from '../utils/api';
import axiosServices from 'utils/axios';

const MAX_CSV_JOB_BYTES = 200 * 1024 * 1024;

export function assertCsvJobFileSize(file) {
  if (file?.size > MAX_CSV_JOB_BYTES) {
    const err = new Error('File exceeds 200MB');
    err.status = 400;
    throw err;
  }
}

export const listStoreCsvJobs = (storeId, params) =>
  get(`admin/listings-inventory/stores/${storeId}/csv-jobs`, params);

export const getStoreCsvJob = (storeId, jobId) =>
  get(`admin/listings-inventory/stores/${storeId}/csv-jobs/${jobId}`);

export const presignStoreCsvJob = (storeId, body) =>
  post(`admin/listings-inventory/stores/${storeId}/csv-jobs/presign`, body);

export const enqueueStoreCsvExport = (storeId, filters) =>
  post(`admin/listings-inventory/stores/${storeId}/csv-jobs/export`, filters);

export const enqueueStoreCsvUpdate = (storeId, body, config) =>
  post(`admin/listings-inventory/stores/${storeId}/csv-jobs/update`, body, config);

export const enqueueStoreCsvImport = (storeId, body, config) =>
  post(`admin/listings-inventory/stores/${storeId}/csv-jobs/import`, body, config);

export const listCatalogCsvJobs = (params) => get('admin/catalog/csv-jobs', params);

export const presignCatalogCsvJob = (body) => post('admin/catalog/csv-jobs/presign', body);

export const enqueueCatalogCsvImport = (body, config) => post('admin/catalog/csv-jobs/import', body, config);

export const abortStoreCsvJob = (storeId, jobId, body) =>
  post(`admin/listings-inventory/stores/${storeId}/csv-jobs/${jobId}/abort`, body);

export const abortCatalogCsvJob = (jobId, body) => post(`admin/catalog/csv-jobs/${jobId}/abort`, body);

async function putToPresign(uploadUrl, file, contentType, onProgress) {
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType || file.type || 'application/octet-stream');
    xhr.upload.onprogress = (evt) => {
      if (!onProgress || !evt.total) return;
      onProgress(Math.round((evt.loaded / evt.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(file);
  });
}

export async function enqueueCsvJobWithFile({
  file,
  presign,
  enqueueJson,
  enqueueForm,
  extraJson = {},
  onProgress
}) {
  assertCsvJobFileSize(file);
  try {
    const signedResp = await presign({
      filename: file.name,
      file_name: file.name,
      content_type: file.type || (String(file.name).toLowerCase().endsWith('.zip') ? 'application/zip' : 'text/csv')
    });
    const signed = signedResp?.data || signedResp;
    if (!signed?.upload_url || !signed?.file_url) throw new Error('Presign failed');
    await putToPresign(signed.upload_url, file, signed.content_type, onProgress);
    return enqueueJson({ ...extraJson, file_url: signed.file_url, file_name: file.name });
  } catch (err) {
    const form = new FormData();
    form.append('file', file);
    return enqueueForm(form, {
      onUploadProgress: (evt) => {
        if (!onProgress || !evt.total) return;
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      },
      timeout: 10 * 60 * 1000
    });
  }
}

export async function downloadCsvJobFile(path) {
  const r = await axiosServices.get(path, { timeout: 120000 });
  const payload = r.data?.data || r.data || {};
  const url = payload.url;
  if (!url) throw new Error('No download URL');
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  if (payload.filename) a.download = payload.filename;
  a.click();
}

export function storeCsvJobDownloadPath(storeId, jobId, file = 'result') {
  return `admin/listings-inventory/stores/${storeId}/csv-jobs/${jobId}/download?file=${file}`;
}

export function catalogCsvJobDownloadPath(jobId, file = 'result') {
  return `admin/catalog/csv-jobs/${jobId}/download?file=${file}`;
}
