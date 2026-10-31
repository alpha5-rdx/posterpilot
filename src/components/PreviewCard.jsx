import { useEffect, useState } from 'react';
import { CopyIcon, DownloadIcon } from './Icons.jsx';
import { buildFormatUrl, buildDownloadUrl } from '../lib/cloudinary.js';

/**
 * A single output-format preview card.
 *
 * @param {Object} props
 * @param {{id,name,description,width,height}} props.format
 * @param {string} props.secureUrl
 * @param {string} props.mode
 * @param {string} props.filename
 * @param {string} props.downloadFormat - 'jpg' or 'png'
 * @param {(url: string) => void} props.onCopy
 * @param {(url: string, name: string) => void} props.onDownload
 */
export default function PreviewCard({ format, secureUrl, mode, filename, downloadFormat, onCopy, onDownload }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const baseName = `${filename || 'poster'}-${format.id}`;
  const downloadName = `${baseName}.${downloadFormat}`;

  let previewUrl = '';
  let downloadUrl = '';
  let buildError = null;
  try {
    previewUrl = buildFormatUrl(secureUrl, mode, format);
    downloadUrl = buildDownloadUrl(secureUrl, mode, format, baseName, downloadFormat);
  } catch (err) {
    buildError = err.message;
  }

  // Reset image load state when the delivery URL changes (mode switch, new image).
  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [previewUrl]);

  // Constrain the stage aspect ratio to the output format for an accurate preview.
  const aspect = `${format.width} / ${format.height}`;

  return (
    <div className="preview-card">
      <div className="preview-card__header">
        <div>
          <div className="preview-card__name">{format.name}</div>
        </div>
        <span className="preview-card__dims">
          {format.width} × {format.height}
        </span>
      </div>

      {buildError ? (
        <div className="preview-card__error">Could not build preview: {buildError}</div>
      ) : (
        <>
          <div className="preview-card__stage">
            <div
              className={`preview-card__frame ${!loaded && !failed ? 'preview-card__frame--loading' : ''}`}
              style={{ aspectRatio: aspect }}
            >
              {!failed ? (
                <img
                  src={previewUrl}
                  alt={`${format.name} preview (${format.width} by ${format.height})`}
                  loading="lazy"
                  onLoad={() => setLoaded(true)}
                  onError={() => setFailed(true)}
                />
              ) : (
                <div className="preview-card__error">Preview unavailable</div>
              )}
            </div>
          </div>

          <div className="preview-card__actions">
            <button
              type="button"
              className="btn btn--subtle btn--sm"
              onClick={() => onCopy(previewUrl)}
              title="Copy the delivery URL"
            >
              <CopyIcon />
              Copy URL
            </button>
            <a
              className="btn btn--primary btn--sm"
              href={downloadUrl}
              onClick={(e) => {
                e.preventDefault();
                onDownload(downloadUrl, downloadName);
              }}
              download={downloadName}
            >
              <DownloadIcon />
              {downloadFormat === 'png' ? 'Download PNG' : 'Download JPG'}
            </a>
          </div>
        </>
      )}
    </div>
  );
}
