import PreviewCard from './PreviewCard.jsx';
import { OUTPUT_FORMATS } from '../lib/cloudinary.js';

/**
 * @param {Object} props
 * @param {string} props.secureUrl
 * @param {string} props.mode
 * @param {string} props.filename
 * @param {(url: string) => void} props.onCopy
 * @param {string} props.downloadFormat
 * @param {(url: string, name: string) => void} props.onDownload
 */
export default function PreviewGrid({ secureUrl, mode, filename, downloadFormat, onCopy, onDownload }) {
  return (
    <div className="previews">
      {OUTPUT_FORMATS.map((format) => (
        <PreviewCard
          key={format.id}
          format={format}
          secureUrl={secureUrl}
          mode={mode}
          filename={filename}
          downloadFormat={downloadFormat}
          onCopy={onCopy}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}
