import { RefreshIcon, UploadIcon } from './Icons.jsx';
import { formatFileSize } from '../lib/validation.js';

/**
 * Shows the uploaded image's metadata and replace/reset actions.
 *
 * @param {Object} props
 * @param {import('../lib/upload.js').UploadResult} props.image
 * @param {string} props.filename
 * @param {() => void} props.onReplace
 * @param {() => void} props.onReset
 */
export default function OriginalInfo({ image, filename, onReplace, onReset }) {
  const metaItems = [
    { label: 'Dimensions', value: image.width && image.height ? `${image.width} × ${image.height}` : '—' },
    { label: 'Format', value: image.format ? image.format.toUpperCase() : '—' },
    { label: 'File size', value: formatFileSize(image.bytes) },
    { label: 'Public ID', value: image.public_id || '—' },
  ];

  return (
    <div className="panel panel--pad">
      <div className="original">
        <div className="original__thumb">
          <img src={image.secure_url} alt={`Original poster: ${filename || image.public_id}`} />
        </div>
        <div className="original__meta">
          <div>
            <div className="meta-item__label">Uploaded poster</div>
            <div className="original__filename">
              {filename || image.original_filename || image.public_id}
            </div>
          </div>
          <div className="meta-grid">
            {metaItems.map((item) => (
              <div className="meta-item" key={item.label}>
                <div className="meta-item__label">{item.label}</div>
                <div className="meta-item__value" style={{ wordBreak: 'break-word' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          <div className="original__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={onReplace}>
              <UploadIcon />
              Replace image
            </button>
            <button type="button" className="btn btn--subtle btn--sm" onClick={onReset}>
              <RefreshIcon />
              Start over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
