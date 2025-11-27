# defui – TurboSign Default UI Harness

This repository contains a static build of the **TurboSign** PDF viewer UI, based on the Mozilla PDF.js viewer, together with the assets needed to run it on GitHub Pages or any other static host.

The goal of this repo is to provide a clean, portable harness for testing and iterating on the TurboSign UI without dragging in a full backend or build pipeline.

---

## Structure

- `index.html`  
  Lightweight entry file that redirects to `web/viewer.html` while preserving the query string and hash.  
  The redirect logic now computes a **relative base path**, so it works both at the domain root and when served from a subdirectory (e.g. GitHub Pages: `/defui/`).

- `404.html`  
  Custom 404 page used primarily for GitHub Pages.  
  Any unknown path will be redirected back to `web/viewer.html` (again using a computed base path) while preserving the URL hash, so deep links into the viewer keep working.

- `.nojekyll`  
  Disables Jekyll processing on GitHub Pages so that static assets (like `cmaps`, fonts, and JS modules) are served as-is.

- `CNAME`  
  Optional custom domain mapping for GitHub Pages. Update or remove this file if you change the domain.

- `web/`  
  Contains the main **PDF.js viewer** and TurboSign UI surface:
  - `viewer.html` – the main viewer shell.
  - `viewer.mjs` / `viewer.mjs.map` – ES module bundle for the viewer.
  - `viewer.css` – styling for the viewer.
  - `images/`, `locale/`, and sample `compressed.tracemonkey-pldi-09.pdf` used for testing.

- `build/`  
  Compiled assets and bundles used by the viewer. This folder is treated as build output and is not currently tied to a reproducible build pipeline in this repo.

- `cmaps/` and `standard_fonts/`  
  Standard PDF.js font and character-map assets required for full text rendering support.

---

## Usage

### GitHub Pages / Static Hosting

1. Point your static host or GitHub Pages site at the root of this repo.
2. Ensure the `CNAME` (if present) matches your desired domain.
3. When a user hits `/` (or the root of your subdirectory, such as `/defui/`), `index.html` will immediately redirect them to:

   - `web/viewer.html` at the **correct base path**, and  
   - preserve any `?query` and `#hash` values.

4. If a user hits an unknown URL, `404.html` will redirect them back to the viewer, preserving the hash so deep-links continue to work.

### Local File Usage

You can open `index.html` or `web/viewer.html` directly from disk in a modern browser.  
Note that some browsers apply stricter rules to `file://` URLs for modules and XHR; using a simple static server (like `python -m http.server`) is recommended.

---

## Notes and Next Steps

- This repo currently acts as a **static harness** rather than a full source project.
- If you want a reproducible build pipeline (npm, bundler, TypeScript, etc.), that should be added in a separate step.
- The redirects in `index.html` and `404.html` have been hardened so they work reliably at:
  - Domain root (`/`)
  - GitHub Pages subdirectory (e.g. `/defui/`)
  - Custom domains backed by this repo.



## UI Kit

The `web/ui.css` and `web/ui-kit.html` files define a small, self-contained UI framework
that can be reused across TurboSign-style apps:

- `web/ui.css` – design tokens (colors, radii, typography) plus patterns for buttons,
  cards, alerts, forms, badges, toolbar, and compact tables.
- `web/ui-kit.html` – a “kitchen sink” demo of those components, intended as a visual
  reference while you wire the same patterns into other pages.

You can link `ui.css` into new HTML files alongside the viewer to get a consistent,
viewer-friendly interface without pulling in a heavier framework.
