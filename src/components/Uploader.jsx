import { useCallback, useRef, useState } from 'react';
import { UploadIcon } from './Icons.jsx';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_LABEL } from '../lib/validation.js';

/**
 * Drag-and-drop + browse uploader with progress and error states.
 *
 * @param {Object} props
 * @param {'idle'|'uploading'|'error'} props.status
 * @param {number} props.progress
 * @param {string|null} props.error
 * @param {boolean} props.disabled
 * @param {(file: File) => void} props.onFile
 * @param {() => void} props.onCancel
 */
export default function Uploader({ status, progress, error, disabled, onFile, onCancel }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const isUploading = status === 'uploading';

  const openPicker = useCallback(() => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  }, [disabled, isUploading]);

  const handleFiles = useCallback(
    (fileList) => {
      const file = fileList && fileList[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setDragging(false);
      if (disabled || isUploading) return;
      handleFiles(event.dataTransfer.files);
    },
    [disabled, isUploading, handleFiles]
  );

  const onDragOver = useCallback(
    (event) => {
      event.preventDefault();
      if (disabled || isUploading) return;
      setDragging(true);
    },
    [disabled, isUploading]
  );

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPicker();
      }
    },
    [openPicker]
  );

  if (isUploading) {
    return (
      <div className="panel upload-state" aria-live="polite">
        <div className="spinner" />
        <div className="dropzone__title">Uploading your poster…</div>
        <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress__bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="dropzone__hint">{progress}% complete</div>
        <div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
            Cancel upload
          </button>
        </div>
      </div>
    );
  }

  const acceptAttr = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',') + ',image/jpeg,image/png,image/webp';

  return (
    <div>
      <div
        className={[
          'dropzone',
          dragging ? 'dropzone--active' : '',
          disabled ? 'dropzone--disabled' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Upload an image by dropping a file here or pressing Enter to browse"
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
      >
        <div className="dropzone__icon">
          <UploadIcon />
        </div>
        <div className="dropzone__title">Drag &amp; drop your poster here</div>
        <div className="dropzone__hint">or click to browse your files</div>
        <button type="button" className="btn btn--primary" disabled={disabled} tabIndex={-1}>
          <UploadIcon />
          Browse files
        </button>
        <div className="dropzone__formats">
          JPG, PNG or WebP · up to {MAX_FILE_SIZE_LABEL}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>
      {status === 'error' && error && (
        <div className="banner" style={{ marginTop: 16, borderColor: 'var(--error-border)', background: 'var(--error-bg)', color: 'var(--error)' }} role="alert">
          <strong>Upload failed:</strong>&nbsp;{error}
        </div>
      )}
    </div>
  );
}
