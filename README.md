# PosterPilot

**One Poster. Multiple Platforms. No Unnecessary Cropping.**

PosterPilot helps university societies, campus communities, student clubs, and event
organizers adapt a single event poster into multiple platform-ready image formats —
without cutting off important visual details.

Upload your poster once, and PosterPilot generates three platform formats on the fly
using Cloudinary delivery transformations:

| Format | Dimensions | Use |
| --- | --- | --- |
| Instagram Square | 1080 × 1080 | Feed posts |
| Instagram Story | 1080 × 1920 | Full-screen vertical stories |
| Website / Social Preview | 1200 × 630 | Open Graph & link cards |
| LinkedIn Portrait | 1080 × 1350 | Vertical feed posts |
| LinkedIn Square | 1080 × 1080 | Square feed posts |

Two adaptation modes:

- **No-Crop (default)** — resizes the poster to fit each frame and pads the remaining
  space with a white background (`c_pad,b_white`). The entire poster stays visible.
  Padding is added where aspect ratios differ. PosterPilot does **not** read or detect
  poster text; it simply avoids cropping.
- **Crop-to-Fill** — fills the whole frame from the center (`c_fill,g_center`). Edges may
  be cropped to match the target size.

On-screen **previews** use `q_auto` and `f_auto` for the fastest optimized delivery.
**Downloads** pin an explicit raster format — **JPG** (default) or **PNG**, selectable in the
UI — so the saved file is a widely-openable `.jpg`/`.png` and never a JXL/AVIF/WebP file that
`f_auto` might otherwise hand to a modern browser.

---

## Tech stack

- React 18 + Vite 5 (JavaScript)
- Modern responsive CSS (hand-authored design system, no CSS framework dependency)
- Cloudinary unsigned direct uploads (no backend, no database, no auth)
- Vitest + Testing Library for unit tests
- Vercel-ready static deployment

The app is **100% frontend**. There is no server, no database, and no user accounts.

---

## Prerequisites

- Node.js 18+ (developed and verified on Node 24)
- npm 9+
- A Cloudinary account with an **unsigned** upload preset

---

## Cloudinary configuration

This project expects an unsigned upload preset that is already created in your Cloudinary
account:

- **Preset name:** `posterpilot_unsigned`
- **Mode:** Unsigned
- **Allowed formats:** jpg, jpeg, png, webp
- **Asset folder:** `posterpilot`
- **Disallow public ID:** enabled

### Security

PosterPilot **only** performs unsigned uploads. The Cloudinary **API Secret is never used,
stored, or referenced** anywhere in the frontend. The only values exposed to the browser
are the cloud name and the unsigned preset name, which is expected and safe for unsigned
uploads.

### Environment variables

Create a `.env.local` file (copy from `.env.example`) in the project root:

```bash
VITE_CLOUDINARY_CLOUD_NAME=your_real_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=posterpilot_unsigned
```

- `.env.local` is gitignored and must never be committed.
- Restart the dev server after changing environment variables.
- Until a real cloud name is set, the app loads and is fully browsable, but uploads are
  disabled and an in-app banner explains what to configure.

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure Cloudinary
cp .env.example .env.local
#   then edit .env.local and set VITE_CLOUDINARY_CLOUD_NAME

# 3. Start the dev server
npm run dev
#   → http://localhost:5173/
```

---

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Produce an optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the unit test suite once |
| `npm run test:watch` | Run the tests in watch mode |

---

## Project structure

```
posterpilot/
├─ index.html                 # Vite entry HTML
├─ vite.config.js             # Vite + Vitest config
├─ vercel.json                # Vercel deployment config (SPA rewrites)
├─ .env.example               # Template env vars
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ main.jsx                # React entry
   ├─ App.jsx                 # App state & composition
   ├─ components/             # Reusable UI components
   │  ├─ Header, Hero, Footer
   │  ├─ Uploader             # Drag-and-drop + progress
   │  ├─ OriginalInfo         # Uploaded image metadata
   │  ├─ ModeSelector         # No-Crop / Crop-to-Fill
   │  ├─ PreviewGrid / PreviewCard
   │  ├─ EmptyState, HowItWorks
   │  ├─ Toast, Icons
   ├─ hooks/
   │  └─ useToasts.js
   ├─ lib/                    # Framework-agnostic logic (tested)
   │  ├─ config.js            # Cloudinary env config
   │  ├─ validation.js        # File type + 10 MB validation
   │  ├─ cloudinary.js        # Transformation URL builder
   │  ├─ upload.js            # Unsigned XHR upload w/ progress
   │  └─ clipboard.js         # Clipboard API + fallback
   ├─ styles/
   │  ├─ index.css            # Design system
   │  └─ components.css       # Component styles
   └─ test/
      └─ setup.js
```

---

## Testing

Unit tests cover the two pieces of pure logic most likely to break:

- **File validation** (`src/lib/validation.test.js`) — allowed types, extension fallback,
  10 MB boundary, size formatting.
- **Cloudinary transformation URLs** (`src/lib/cloudinary.test.js`) — correct `c_pad` /
  `c_fill` strings, inserting transformations while preserving version + public ID,
  `fl_attachment` download URLs, and the three required output presets.

```bash
npm test
```

### What requires a real Cloudinary cloud name

Because uploads go to the live Cloudinary API, the following can only be fully exercised
once a real `VITE_CLOUDINARY_CLOUD_NAME` is set:

- Actually uploading a file and receiving a `secure_url`.
- Rendering real transformed previews.
- Downloading transformed files.

Everything else — the UI, validation, empty state, mode switching, the transformation URL
logic, reset/replace, and the production build — works and is verified without credentials.

---

## Deployment (Vercel)

1. Push the repository to GitHub/GitLab/Bitbucket.
2. In Vercel, **New Project → Import** the repository.
3. Framework preset: **Vite** (auto-detected; `vercel.json` is included).
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables in **Project Settings → Environment Variables**:
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET` (`posterpilot_unsigned`)
5. Deploy.

> Do not commit `.env.local`. Configure the environment variables in the Vercel dashboard.

---

## Notes & honesty

- PosterPilot reports only **measured** metadata (dimensions, format, file size returned by
  Cloudinary). It does not invent file-size savings or performance statistics.
- No-Crop preserves your poster by adding padding — it does **not** semantically understand
  or detect poster text or "important" regions.
- The poster is uploaded **once**; every format is a Cloudinary delivery-URL transformation
  of that single asset.
