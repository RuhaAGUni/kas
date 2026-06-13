# kas

## Cursor Cloud specific instructions

### Repository layout (important context)
- The `main` branch is currently a placeholder: it contains only this `AGENTS.md` and a one-line `README.md`. There is no runnable application on `main` itself.
- The actual product, **SkinTrack AI** (a React 19 + Vite 8 clinician dashboard), lives in the `skintrack-ai/` subdirectory on the feature branch `cursor/create-skintrack-ai-vite-app-2da0`. It has not been merged into `main` yet.
- Because the app may not be present on a fresh `main` checkout, all setup/run guidance below is conditional on `skintrack-ai/package.json` existing. The startup update script is guarded accordingly and is a no-op when the app is absent.

### SkinTrack AI app (`skintrack-ai/`)
- Stack: React 19, Vite 8, ESLint 10, `lucide-react`. Plain JavaScript/JSX (no TypeScript). Package manager: **npm** (uses `package-lock.json`).
- Node v22 and npm are preinstalled in the cloud environment; no extra system dependencies are needed.
- Standard scripts (see `skintrack-ai/package.json`), all run from inside `skintrack-ai/`:
  - `npm run dev` — Vite dev server on `http://localhost:5173/` (HMR enabled).
  - `npm run build` — production build to `dist/`.
  - `npm run lint` — ESLint over the project.
  - `npm run preview` — serve the production build.
- The app is fully client-side: there is no backend, database, or external service required to run or test it end to end.
- Hello-world / smoke flow: open the dev server, go to the "Derm dashboard" section, select a patient in the review queue, click "Approve" — the "Current decision" note updates from "Pending clinician review" to "Approved".
