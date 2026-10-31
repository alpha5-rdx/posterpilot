// Cloudinary delivery-URL transformation helper.
//
// Strategy: take the `secure_url` returned by the upload API and insert a
// transformation segment immediately after the `/upload/` marker, preserving the
// version (e.g. `v1700000000`) and the public ID path that follow it. We never
// fabricate a URL from scratch or assume a cloud name — everything is derived
// from the real delivery URL Cloudinary gave us.

/** The three output presets PosterPilot generates. */
export const OUTPUT_FORMATS = [
  {
    id: 'instagram-square',
    name: 'Instagram Square',
    description: 'Feed post',
    width: 1080,
    height: 1080,
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    description: 'Full-screen vertical',
    width: 1080,
    height: 1920,
  },
  {
    id: 'web-preview',
    name: 'Website / Social Preview',
    description: 'Open Graph & link cards',
    width: 1200,
    height: 630,
  },
  {
    id: 'linkedin-portrait',
    name: 'LinkedIn Portrait',
    description: 'Vertical feed post',
    width: 1080,
    height: 1350,
  },
  {
    id: 'linkedin-square',
    name: 'LinkedIn Square',
    description: 'Square feed post',
    width: 1080,
    height: 1080,
  },
];

export const ADAPTATION_MODES = {
  NO_CROP: 'no-crop',
  CROP_TO_FILL: 'crop-to-fill',
};

/** Download file formats the user can choose. */
export const DOWNLOAD_FORMATS = {
  JPG: 'jpg',
  PNG: 'png',
};

// Formats that must never be requested for a downloadable file because many
// desktop viewers cannot open them. `f_auto` can resolve to these, so downloads
// always pin an explicit raster format instead.
const EXPLICIT_DOWNLOAD_FORMATS = new Set(['jpg', 'jpeg', 'png']);

/**
 * Build the Cloudinary transformation string for a given mode and dimensions.
 *
 * NO_CROP     -> c_pad with a white background: the whole original stays visible,
 *                padding is added where the aspect ratio differs.
 * CROP_TO_FILL-> c_fill with g_center: the frame is filled, edges may be cropped.
 *
 * @param {string} mode
 * @param {number} width
 * @param {number} height
 * @param {object} [options]
 * @param {string} [options.format] - Explicit delivery format (e.g. 'jpg', 'png').
 *                                     When omitted, `f_auto` is used (best for on-screen previews).
 * @returns {string}
 */
export function buildTransformation(mode, width, height, options = {}) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('Invalid target dimensions for transformation.');
  }

  const { format } = options;
  const formatSegment = format ? `f_${format}` : 'f_auto';

  if (mode === ADAPTATION_MODES.CROP_TO_FILL) {
    return `c_fill,g_center,w_${width},h_${height},q_auto,${formatSegment}`;
  }
  // Default: No-Crop padding mode.
  return `c_pad,b_white,w_${width},h_${height},q_auto,${formatSegment}`;
}

/**
 * Split a Cloudinary delivery URL into the part up to and including `/upload/`
 * and the remainder (version + public id path). Returns null if the URL is not
 * a recognizable Cloudinary upload delivery URL.
 *
 * @param {string} secureUrl
 * @returns {{ prefix: string, rest: string } | null}
 */
function splitUploadUrl(secureUrl) {
  if (!secureUrl || typeof secureUrl !== 'string') return null;

  // Match `/image/upload/` or the generic `/upload/` marker.
  const marker = '/upload/';
  const index = secureUrl.indexOf(marker);
  if (index === -1) return null;

  const prefix = secureUrl.slice(0, index + marker.length);
  const rest = secureUrl.slice(index + marker.length);
  if (!rest) return null;

  return { prefix, rest };
}

/**
 * Replace the file extension on the public-id portion of a Cloudinary delivery
 * URL remainder. This makes the downloaded file carry the correct extension
 * (e.g. `.jpg`) rather than the original upload's extension.
 *
 * @param {string} rest - The part after `/upload/` (version + public id path).
 * @param {string} extension - The new extension without a dot (e.g. 'jpg').
 * @returns {string}
 */
function replaceExtension(rest, extension) {
  if (!extension) return rest;
  const lastDot = rest.lastIndexOf('.');
  const lastSlash = rest.lastIndexOf('/');
  // Only replace when the dot belongs to the filename (after the last slash).
  if (lastDot > lastSlash && lastDot !== -1) {
    return `${rest.slice(0, lastDot)}.${extension}`;
  }
  return `${rest}.${extension}`;
}

/**
 * Insert a transformation into a Cloudinary delivery URL.
 *
 * @param {string} secureUrl - The original `secure_url` from the upload response.
 * @param {string} transformation - A transformation string, e.g. `c_pad,w_1080,...`.
 * @param {object} [options]
 * @param {string} [options.extension] - Force the delivered file extension (e.g. 'jpg').
 * @returns {string} The transformed delivery URL.
 */
export function insertTransformation(secureUrl, transformation, options = {}) {
  const parts = splitUploadUrl(secureUrl);
  if (!parts) {
    throw new Error('Not a valid Cloudinary delivery URL.');
  }
  const rest = options.extension
    ? replaceExtension(parts.rest, options.extension)
    : parts.rest;
  if (!transformation) {
    return `${parts.prefix}${rest}`;
  }
  return `${parts.prefix}${transformation}/${rest}`;
}

/**
 * Convenience: build a fully transformed delivery URL for a format preset.
 * Previews use `f_auto` (fast, modern) and keep the original extension.
 *
 * @param {string} secureUrl
 * @param {string} mode
 * @param {{ width: number, height: number }} format
 * @returns {string}
 */
export function buildFormatUrl(secureUrl, mode, format) {
  const transformation = buildTransformation(mode, format.width, format.height);
  return insertTransformation(secureUrl, transformation);
}

/**
 * Build a download URL using Cloudinary's `fl_attachment` flag so the browser
 * downloads the file instead of navigating to it. The delivery format is pinned
 * to an explicit raster format (jpg/png) and the URL extension is rewritten to
 * match, so the downloaded file is a widely-openable `.jpg` or `.png` — never
 * JXL/AVIF/WebP from `f_auto`.
 *
 * @param {string} secureUrl
 * @param {string} mode
 * @param {{ width: number, height: number, id: string }} format
 * @param {string} [filename] - Optional base filename (without extension).
 * @param {string} [fileFormat] - 'jpg' or 'png'. Defaults to 'jpg'.
 * @returns {string}
 */
export function buildDownloadUrl(secureUrl, mode, format, filename, fileFormat = DOWNLOAD_FORMATS.JPG) {
  const normalized = String(fileFormat).toLowerCase();
  const deliveryFormat = EXPLICIT_DOWNLOAD_FORMATS.has(normalized) ? normalized : DOWNLOAD_FORMATS.JPG;
  // Use `jpg` as the URL extension for both `jpg` and `jpeg`.
  const extension = deliveryFormat === 'jpeg' ? 'jpg' : deliveryFormat;

  const transformation = buildTransformation(mode, format.width, format.height, {
    format: deliveryFormat,
  });
  const safeName = (filename || `posterpilot-${format.id}`)
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || `posterpilot-${format.id}`;
  const attachment = `fl_attachment:${safeName}`;
  return insertTransformation(secureUrl, `${transformation},${attachment}`, { extension });
}
