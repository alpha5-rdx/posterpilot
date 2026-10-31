// Client-side image validation. We enforce the 10 MB limit and allowed formats
// in the browser rather than relying on the Cloudinary upload preset.

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_FILE_SIZE_LABEL = '10 MB';

// Allowed MIME types and their human-friendly labels.
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

/**
 * Format a byte count into a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(bytes) || bytes < 0) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  const rounded = exponent === 0 ? value : Math.round(value * 100) / 100;
  return `${rounded} ${units[exponent]}`;
}

/**
 * Extract a lowercase file extension from a filename.
 * @param {string} name
 * @returns {string}
 */
export function getExtension(name) {
  if (!name || typeof name !== 'string') return '';
  const dot = name.lastIndexOf('.');
  if (dot === -1 || dot === name.length - 1) return '';
  return name.slice(dot + 1).toLowerCase();
}

/**
 * Validate an uploaded File against type and size rules.
 * @param {File} file
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const type = (file.type || '').toLowerCase();
  const extension = getExtension(file.name);

  // Accept based on MIME type when present, otherwise fall back to extension.
  const typeAllowed = type ? ALLOWED_MIME_TYPES.includes(type) : false;
  const extensionAllowed = ALLOWED_EXTENSIONS.includes(extension);

  if (!typeAllowed && !extensionAllowed) {
    return {
      valid: false,
      error: 'Unsupported file type. Please use JPG, PNG, or WebP.',
    };
  }

  if (typeof file.size === 'number' && file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${formatFileSize(file.size)}). Maximum allowed is ${MAX_FILE_SIZE_LABEL}.`,
    };
  }

  return { valid: true, error: null };
}
