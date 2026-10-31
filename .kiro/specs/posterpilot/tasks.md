# PosterPilot — Implementation Tasks

> Documentation only. Not an approval gate. All tasks below are complete.

- [x] 1. Scaffold the Vite + React project (package.json, vite.config, index.html, entry).
- [x] 2. Add environment handling: `.env.example`, `.env.local` (placeholder), `.gitignore`.
- [x] 3. Build the design system CSS (`index.css`) and component CSS (`components.css`).
- [x] 4. Implement `config.js` (Cloudinary env + configured check).
- [x] 5. Implement `validation.js` (type + 10 MB client-side validation, size formatting).
- [x] 6. Implement `cloudinary.js` (output presets, transformation builder, URL insertion,
       download URL with `fl_attachment`).
- [x] 7. Implement `upload.js` (unsigned XHR upload with progress + abort + error handling).
- [x] 8. Implement `clipboard.js` (Clipboard API + fallback).
- [x] 9. Build UI components: Header, Hero, Footer, Icons, Toast.
- [x] 10. Build Uploader (drag-and-drop, browse, progress, error, cancel).
- [x] 11. Build OriginalInfo (metadata panel, replace, reset).
- [x] 12. Build ModeSelector (No-Crop default / Crop-to-Fill).
- [x] 13. Build PreviewGrid + PreviewCard (live previews, copy, download, error state).
- [x] 14. Build EmptyState and HowItWorks.
- [x] 15. Wire everything in `App.jsx` with full state machine and toasts.
- [x] 16. Add `useToasts` hook.
- [x] 17. Write unit tests for validation and Cloudinary transformations.
- [x] 18. Install dependencies.
- [x] 19. Run tests (22 passing) and production build (succeeds).
- [x] 20. Start and verify the dev server.
- [x] 21. Write README, spec docs, and `vercel.json` for deployment.

## Remaining (requires user action)
- [ ] Provide a real `VITE_CLOUDINARY_CLOUD_NAME` in `.env.local` to enable live uploads,
      real previews, and downloads.
