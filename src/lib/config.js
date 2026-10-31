// Centralized Cloudinary configuration sourced from Vite environment variables.
// These are safe to expose in the browser because PosterPilot only ever performs
// UNSIGNED uploads. The API Secret is never present in frontend code.

const PLACEHOLDER_CLOUD_NAMES = new Set(['', 'your_cloud_name_here', 'undefined']);

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'posterpilot_unsigned';

/**
 * Returns true when a real (non-placeholder) Cloudinary cloud name is configured.
 * The UI uses this to warn the user before they attempt an upload.
 */
export function isCloudinaryConfigured() {
  return !PLACEHOLDER_CLOUD_NAMES.has((CLOUDINARY_CLOUD_NAME || '').trim());
}

export function getUploadEndpoint() {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
}
