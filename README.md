# MOORIM EDS — Company Website

Static multi-page website for GitHub Pages.

- URL: https://moorim-tc.github.io/
- Korean: https://moorim-tc.github.io/ko/
- English: https://moorim-tc.github.io/en/

## Structure

- Root language gate: `/index.html`
- Korean pages
  - `/ko/index.html` (About)
  - `/ko/projects/index.html`
  - `/ko/products/index.html`
  - `/ko/contact/index.html`
- English pages
  - `/en/index.html`
  - `/en/projects/index.html`
  - `/en/products/index.html`
  - `/en/contact/index.html`

## GitHub Pages deployment

1. Go to **Settings → Pages**
2. **Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`
3. Save, then wait for the deployment to complete.

## Local preview

For best results, use a local static server (recommended):

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/.

> Tip: Pages use root paths like `/ko/` and `/assets/...`. The included `assets/js/main.js` also tries to make navigation work when opening files directly via `file://`.

## Logo

- Path: `/assets/img/logo.png`
- The repo includes a tiny placeholder PNG. Replace it with your real logo image using the same filename.
