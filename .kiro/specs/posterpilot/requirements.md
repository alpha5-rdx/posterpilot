# PosterPilot — Requirements

> Documentation only. This file records the agreed scope; it is not an approval gate.

## 1. Product summary

PosterPilot is a frontend-only web app that adapts one uploaded event poster into three
platform-ready image formats using Cloudinary delivery transformations, without
unnecessarily cropping the artwork. Target users: university societies, campus
communities, student clubs, and event organizers.

Out of scope: backend, database, authentication, user accounts, social publishing.

## 2. Functional requirements

### 2.1 Image upload
- Drag-and-drop area and a browse/select button.
- Client-side validation before upload:
  - Allowed: JPG/JPEG, PNG, WebP.
  - Maximum size: 10 MB, enforced in the browser (not via the upload preset).
- Display original image name, dimensions, format, and file size.
- Upload progress indicator (0–100%).
- Distinct loading, success, and error states.
- Replace image and full reset.
- Prevent repeated uploads while one is in progress.
- Allow cancelling an in-progress upload.

### 2.2 Cloudinary upload
- Unsigned upload only, via `POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`.
- Send `file` and `upload_preset` via FormData; use XMLHttpRequest for progress.
- Never expose/store/use the API Secret.
- Use the folder configured in the preset; do not override folder or public ID.
- Capture `secure_url`, `public_id`, `version`, `width`, `height`, `bytes`, `format`.
- Handle network errors, invalid responses, and Cloudinary API errors.

### 2.3 Output formats
- Instagram Square — 1080 × 1080
- Instagram Story — 1080 × 1920
- Website / Social Preview — 1200 × 630
- LinkedIn Portrait — 1080 × 1350
- LinkedIn Square — 1080 × 1080

### 2.4 Adaptation modes
- **No-Crop (default):** `c_pad,b_white` — full poster visible, padded.
- **Crop-to-Fill:** `c_fill,g_center` — fills frame, may crop edges.
- Both use `q_auto` and `f_auto`.
- Switching mode updates all previews.

### 2.5 Transformed image generation
- Upload the original once; generate outputs as delivery URLs.
- A reusable, tested URL helper inserts transformations after `/upload/`, preserving
  version and public ID.
- No fabricated URLs; handle invalid/missing URLs safely.

### 2.6 Preview dashboard
- Three responsive preview cards, each with format name, exact dimensions, transformed
  preview, a working Copy URL button, and a working Download button.
- Copy uses the Clipboard API with a fallback.
- Download uses `fl_attachment`, with graceful fallback.

### 2.7 UX
- Default to No-Crop; clear empty state before upload.
- Toast notifications for copy/download/upload/errors.
- Reset / new-image action.
- Only measured metadata is displayed; no invented statistics.

## 3. Non-functional requirements
- Premium, modern, responsive SaaS UI (desktop/tablet/mobile).
- Accessible: labels, keyboard interaction, adequate contrast, reduced-motion support.
- Clean, modular, maintainable component architecture.
- Minimal dependencies.
- Production build must succeed; logic unit tests must pass.
- Vercel-ready.

## 4. Acceptance criteria
- `npm install`, `npm test`, and `npm run build` all succeed.
- Validation rejects non-allowed types and >10 MB files with clear messaging.
- Transformation URLs match the required `c_pad` / `c_fill` patterns and preserve the
  Cloudinary version/public-id path.
- UI is browsable and functional without credentials; a banner explains the missing
  cloud name; uploads are disabled until configured.
