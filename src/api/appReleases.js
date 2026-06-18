import axiosServices from 'utils/axios';
import { del, get, patch } from 'utils/api';

export const APP_RELEASE_TYPES = {
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',
  RIDER: 'RIDER',
};

export const listReleases = (appType, params = {}) =>
  get('admin/app-releases', { app_type: appType, ...params });

export const getCurrentRelease = (appType) =>
  get('admin/app-releases/current', { app_type: appType });

export const setCurrentRelease = (id) =>
  patch(`admin/app-releases/${id}/set-current`, {});

export const deleteRelease = (id) =>
  del(`admin/app-releases/${id}`);

/**
 * Upload APK multipart to admin endpoint.
 * @param {FormData} formData
 * @param {(progressEvent: ProgressEvent) => void} [onUploadProgress]
 */
export async function uploadRelease(formData, onUploadProgress) {
  const r = await axiosServices.post('admin/app-releases/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return r.data;
}

export function parseVersionFromFileName(fileName) {
  const match = String(fileName || '').match(/_(\d+\.\d+\.\d+)\.apk$/i);
  return match ? match[1] : '';
}

export function formatFileSize(bytes) {
  const n = Number(bytes || 0);
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
