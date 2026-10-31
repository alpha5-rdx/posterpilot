import { useCallback, useRef, useState } from 'react';
import './styles/components.css';

import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Footer from './components/Footer.jsx';
import Uploader from './components/Uploader.jsx';
import OriginalInfo from './components/OriginalInfo.jsx';
import ModeSelector from './components/ModeSelector.jsx';
import PreviewGrid from './components/PreviewGrid.jsx';
import EmptyState from './components/EmptyState.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import ToastStack from './components/Toast.jsx';

import { useToasts } from './hooks/useToasts.js';
import { validateImageFile } from './lib/validation.js';
import { uploadImage } from './lib/upload.js';
import { ADAPTATION_MODES, DOWNLOAD_FORMATS } from './lib/cloudinary.js';
import { copyToClipboard } from './lib/clipboard.js';
import { isCloudinaryConfigured } from './lib/config.js';

export default function App() {
  const [status, setStatus] = useState('idle'); // idle | uploading | ready | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [filename, setFilename] = useState('');
  const [mode, setMode] = useState(ADAPTATION_MODES.NO_CROP);
  const [downloadFormat, setDownloadFormat] = useState(DOWNLOAD_FORMATS.JPG);

  const xhrRef = useRef(null);
  const toasts = useToasts();
  const configured = isCloudinaryConfigured();

  const handleFile = useCallback(
    async (file) => {
      // Guard against repeated uploads while one is in progress.
      if (status === 'uploading') return;

      const { valid, error: validationError } = validateImageFile(file);
      if (!valid) {
        setStatus('error');
        setError(validationError);
        toasts.error(validationError);
        return;
      }

      setFilename(file.name.replace(/\.[^.]+$/, ''));
      setError(null);
      setProgress(0);
      setStatus('uploading');

      try {
        const result = await uploadImage(file, {
          onProgress: setProgress,
          onStart: (xhr) => {
            xhrRef.current = xhr;
          },
        });
        xhrRef.current = null;
        setImage(result);
        setStatus('ready');
        toasts.success('Poster uploaded. Your formats are ready.');
      } catch (err) {
        xhrRef.current = null;
        if (err && err.name === 'AbortError') {
          setStatus('idle');
          setProgress(0);
          toasts.info('Upload cancelled.');
          return;
        }
        setStatus('error');
        setError(err.message || 'Something went wrong during upload.');
        toasts.error(err.message || 'Upload failed.');
      }
    },
    [status, toasts]
  );

  const cancelUpload = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancelUpload();
    setImage(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    setFilename('');
    setMode(ADAPTATION_MODES.NO_CROP);
    setDownloadFormat(DOWNLOAD_FORMATS.JPG);
  }, [cancelUpload]);

  const replace = useCallback(() => {
    cancelUpload();
    setImage(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, [cancelUpload]);

  const handleCopy = useCallback(
    async (url) => {
      const ok = await copyToClipboard(url);
      if (ok) toasts.success('URL copied to clipboard.');
      else toasts.error('Could not copy. Please copy the URL manually.');
    },
    [toasts]
  );

  const handleDownload = useCallback(
    (url, name) => {
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = name || 'poster';
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toasts.info('Download started. Check your downloads folder.');
      } catch {
        // Fallback: open in a new tab so the user can save manually.
        window.open(url, '_blank', 'noopener');
        toasts.info('Opened the image in a new tab — right-click to save.');
      }
    },
    [toasts]
  );

  const hasImage = status === 'ready' && image;

  return (
    <div className="app">
      <Header />
      <Hero />

      <main className="container section">
        <div className="stack">
          {!configured && (
            <div className="banner" role="status">
              <span className="toast__icon" aria-hidden="true">⚠️</span>
              <span>
                <strong>Cloudinary isn’t configured yet.</strong> Set{' '}
                <code>VITE_CLOUDINARY_CLOUD_NAME</code> in your <code>.env.local</code> file and
                restart the dev server. You can explore the interface now, but uploads will stay
                disabled until a real cloud name is provided.
              </span>
            </div>
          )}

          {/* Upload workspace / original info */}
          <section className="section" aria-label="Upload workspace">
            {!hasImage ? (
              <Uploader
                status={status}
                progress={progress}
                error={error}
                disabled={!configured}
                onFile={handleFile}
                onCancel={cancelUpload}
              />
            ) : (
              <OriginalInfo
                image={image}
                filename={filename}
                onReplace={replace}
                onReset={reset}
              />
            )}
          </section>

          {/* Mode selector + previews */}
          <section className="panel panel--pad" aria-label="Output formats">
            <div className="section-head">
              <div>
                <h2>Platform formats</h2>
                <p>Choose how your poster adapts, then copy or download each format.</p>
              </div>
            </div>

            <div className="controls-row">
              <ModeSelector mode={mode} onChange={setMode} />
              <div className="dl-format" role="group" aria-label="Download file format">
                <span className="dl-format__label">Download as</span>
                <div className="segmented">
                  <button
                    type="button"
                    className={`segmented__btn ${downloadFormat === DOWNLOAD_FORMATS.JPG ? 'segmented__btn--active' : ''}`}
                    aria-pressed={downloadFormat === DOWNLOAD_FORMATS.JPG}
                    onClick={() => setDownloadFormat(DOWNLOAD_FORMATS.JPG)}
                  >
                    JPG
                  </button>
                  <button
                    type="button"
                    className={`segmented__btn ${downloadFormat === DOWNLOAD_FORMATS.PNG ? 'segmented__btn--active' : ''}`}
                    aria-pressed={downloadFormat === DOWNLOAD_FORMATS.PNG}
                    onClick={() => setDownloadFormat(DOWNLOAD_FORMATS.PNG)}
                  >
                    PNG
                  </button>
                </div>
                <span className="dl-format__hint">
                  {downloadFormat === DOWNLOAD_FORMATS.PNG
                    ? 'Lossless, larger files'
                    : 'Smaller files, best for photos'}
                </span>
              </div>
            </div>

            {hasImage ? (
              <PreviewGrid
                secureUrl={image.secure_url}
                mode={mode}
                filename={filename}
                downloadFormat={downloadFormat}
                onCopy={handleCopy}
                onDownload={handleDownload}
              />
            ) : (
              <EmptyState />
            )}
          </section>

          <HowItWorks />
        </div>
      </main>

      <Footer />
      <ToastStack toasts={toasts.toasts} onDismiss={toasts.dismiss} />
    </div>
  );
}
