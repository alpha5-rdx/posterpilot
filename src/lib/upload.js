// Cloudinary unsigned upload logic using XMLHttpRequest so we can report
// upload progress. Only the upload_preset and the file are sent; no signature
// and no API secret are involved.

import {
  CLOUDINARY_UPLOAD_PRESET,
  getUploadEndpoint,
  isCloudinaryConfigured,
} from './config.js';

/**
 * @typedef {Object} UploadResult
 * @property {string} secure_url
 * @property {string} public_id
 * @property {number} version
 * @property {number} width
 * @property {number} height
 * @property {number} bytes
 * @property {string} format
 * @property {string} original_filename
 */

/**
 * Upload a single image file to Cloudinary via unsigned upload.
 *
 * @param {File} file
 * @param {Object} [options]
 * @param {(percent: number) => void} [options.onProgress] - 0..100 progress callback.
 * @param {(xhr: XMLHttpRequest) => void} [options.onStart] - receives the xhr so it can be aborted.
 * @returns {Promise<UploadResult>}
 */
export function uploadImage(file, options = {}) {
  const { onProgress, onStart } = options;

  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided to upload.'));
      return;
    }
    if (!isCloudinaryConfigured()) {
      reject(
        new Error(
          'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME in your .env.local file.'
        )
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', getUploadEndpoint(), true);

    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      let payload;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error('Received an invalid response from Cloudinary.'));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        if (!payload || !payload.secure_url) {
          reject(new Error('Upload succeeded but no image URL was returned.'));
          return;
        }
        resolve(normalizeResult(payload));
      } else {
        const message =
          (payload && payload.error && payload.error.message) ||
          `Upload failed with status ${xhr.status}.`;
        reject(new Error(message));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload. Check your connection and try again.'));
    };

    xhr.onabort = () => {
      reject(new DOMException('Upload cancelled.', 'AbortError'));
    };

    if (typeof onStart === 'function') onStart(xhr);

    xhr.send(formData);
  });
}

/**
 * Pick only the fields we rely on from the Cloudinary response.
 * @param {Object} payload
 * @returns {UploadResult}
 */
export function normalizeResult(payload) {
  return {
    secure_url: payload.secure_url,
    public_id: payload.public_id,
    version: payload.version,
    width: payload.width,
    height: payload.height,
    bytes: payload.bytes,
    format: payload.format,
    original_filename: payload.original_filename,
  };
}
