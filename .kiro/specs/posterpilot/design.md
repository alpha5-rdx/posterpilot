# PosterPilot — Design

> Documentation only. Not an approval gate.

## 1. Architecture overview

A single-page React (Vite) app with a clean separation between **framework-agnostic
logic** (`src/lib`) and **UI components** (`src/components`). All application state lives
in the top-level `App` component and flows down via props. There is no backend; the only
network call is the unsigned Cloudinary upload.

```
App (state owner)
├─ Header / Hero / Footer           (presentational)
├─ Uploader                         (idle | uploading | error)
├─ OriginalInfo                     (shown after a successful upload)
├─ ModeSelector                     (No-Crop | Crop-to-Fill)
├─ PreviewGrid → PreviewCard ×3     (live Cloudinary delivery URLs)
├─ EmptyState / HowItWorks
└─ ToastStack                       (notifications)
```

## 2. State model (in `App.jsx`)

| State | Values | Purpose |
| --- | --- | --- |
| `status` | `idle` \| `uploading` \| `ready` \| `error` | Drives which UI is shown |
| `progress` | 0–100 | Upload progress bar |
| `error` | string \| null | Upload/validation error message |
| `image` | upload result \| null | `secure_url`, `public_id`, `version`, `width`, `height`, `bytes`, `format` |
| `filename` | string | Original base filename (for downloads) |
| `mode` | `no-crop` \| `crop-to-fill` | Adaptation mode |

A ref holds the active `XMLHttpRequest` so an in-progress upload can be aborted.

## 3. Core logic modules (`src/lib`)

### config.js
Reads `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET`. `isCloudinaryConfigured()`
treats placeholder values as "not configured" so the UI can warn and disable uploads.

### validation.js
`validateImageFile(file)` enforces allowed MIME types (with extension fallback) and the
10 MB client-side limit. `formatFileSize` renders human-readable sizes.

### cloudinary.js
- `OUTPUT_FORMATS` — the three presets.
- `buildTransformation(mode, w, h)` — `c_pad,b_white,...` or `c_fill,g_center,...`, always
  with `q_auto,f_auto`.
- `insertTransformation(secureUrl, t)` — splits the delivery URL at `/upload/` and inserts
  the transformation, preserving version + public ID. Throws on non-Cloudinary URLs.
- `buildFormatUrl` / `buildDownloadUrl` — convenience builders; download adds
  `fl_attachment:<sanitized-name>`.

### upload.js
`uploadImage(file, { onProgress, onStart })` — unsigned XHR upload returning only the
needed fields. Reports progress, surfaces Cloudinary error messages, supports abort, and
refuses to run when Cloudinary is unconfigured.

### clipboard.js
`copyToClipboard` — async Clipboard API with a hidden-textarea `execCommand` fallback.

## 4. Transformation strategy

The original is uploaded **once**. Each preview/download is a transformation inserted into
the returned `secure_url`:

```
.../image/upload/ <TRANSFORMATION> /v<version>/<folder>/<public_id>.<ext>
```

This preserves exactly what Cloudinary returned and never fabricates a cloud name or path.

## 5. UI / UX design

- Light-theme SaaS dashboard: indigo→violet brand gradient, soft shadows, rounded cards,
  generous spacing, Inter/system font stack.
- Responsive grids: 3-up preview cards collapse to 2-up then 1-up; mode selector and
  original-info panels reflow on small screens.
- Previews sit on a subtle checkerboard stage and use `aspect-ratio` matching each format
  so padding (No-Crop) is visually obvious.
- Accessibility: `radiogroup`/`radio` for modes, keyboard-activatable dropzone,
  `aria-live` progress, focus-visible outlines, `prefers-reduced-motion` support.
- Toasts are polite/alert live regions, auto-dismissing.

## 6. Error handling

- Validation errors short-circuit before any network call.
- Upload errors map Cloudinary messages or network failures to user-friendly toasts and an
  inline banner.
- Preview `<img>` `onError` shows a per-card "Preview unavailable" state.
- URL builders throw on malformed input; the card catches and renders a build-error state.

## 7. Testing strategy

Unit tests target the pure logic (validation + transformation URLs), which is where
correctness bugs are most costly. UI behavior is verified by running the dev server and the
production build. Live upload/preview/download require a real cloud name and are documented
as such.
