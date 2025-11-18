// src/api/upload.js
import axiosServices from 'utils/axios';

const endpoints = {
  // Adjust the prefix if your router is mounted differently
  uploadSingle: 'upload/uploadSingle',
  uploadMany: 'upload/uploadMany'
};

/**
 * Upload a single file.
 * @param {File|Blob} file
 * @param {(progressEvent: ProgressEvent) => void} [onUploadProgress]
 * @returns {Promise<{ok: boolean, url: string}>}
 */
export async function uploadSingle(file, onUploadProgress) {
  const form = new FormData();
  form.append('file', file);

  const response = await axiosServices.post(endpoints.uploadSingle, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
  return response.data;
}

/**
 * Upload multiple files.
 * @param {File[]|FileList} files
 * @param {(progressEvent: ProgressEvent) => void} [onUploadProgress]
 * @returns {Promise<{ok: boolean, files: string[]}>}
 */
export async function uploadMany(files, onUploadProgress) {
  const form = new FormData();
  // Multer config on server expects field name 'file' for each
  Array.from(files).forEach((f) => form.append('file', f));

  const response = await axiosServices.post(endpoints.uploadMany, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
  return response.data;
}
