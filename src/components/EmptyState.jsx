import { OUTPUT_FORMATS } from '../lib/cloudinary.js';

// Scale each format's aspect ratio into a small preview chip (max 110px wide).
function chipSize(width, height) {
  const maxW = 110;
  const maxH = 110;
  const ratio = width / height;
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  return { width: `${Math.round(w)}px`, height: `${Math.round(h)}px` };
}

export default function EmptyState() {
  return (
    <div className="empty">
      <p className="dropzone__hint" style={{ fontSize: '0.95rem' }}>
        Your three platform-ready formats will appear here once you upload a poster.
      </p>
      <div className="empty__row">
        {OUTPUT_FORMATS.map((format) => (
          <div className="empty-chip" key={format.id}>
            <div className="empty-chip__frame" style={chipSize(format.width, format.height)} />
            <div className="empty-chip__label">{format.name}</div>
            <div className="empty-chip__dims">
              {format.width} × {format.height}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
