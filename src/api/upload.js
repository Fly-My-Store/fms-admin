// src/api/upload.js
import { post } from 'utils/api';

const endpoints = {
  uploadSingle: 'upload/uploadSingle',
  uploadMany: 'upload/uploadMany',
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

  return post(endpoints.uploadSingle, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
}

/**
 * Upload multiple files.
 * @param {File[]|FileList} files
 * @param {(progressEvent: ProgressEvent) => void} [onUploadProgress]
 * @returns {Promise<{ok: boolean, files: string[]}>}
 */
export async function uploadMany(files, onUploadProgress) {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append('file', f));

  return post(endpoints.uploadMany, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
}
