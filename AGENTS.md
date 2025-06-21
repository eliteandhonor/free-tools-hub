# Repository Overview

This project is a fully static website containing 59 individual tools.  
**Current Tool Count:** 59
Remember to update this count whenever new tools are added.

Core directories:

- `tools/` – each tool has its own folder with `index.html` and `script.js`.
- `data/tools-config.json` – master list of tools and categories used by `js/main.js`.
- `js/` – site‑wide scripts (main application, vendor loader, helpers).
- `css/` – shared styles.
- `vendor/` – third‑party libraries pinned to fixed versions. **Do not modify the files inside this directory.**

Supplementary files include `manifest.json`, `robots.txt`, and common pages under `about/`, `contact/`, `privacy/`, and `terms/`.

## Modifying or Adding Tools

1. Each tool lives in `tools/<tool-id>/`.
2. Create an `index.html` page using existing tools as reference. Include security headers and SEO meta tags like those in `index.html`.
3. Add any JavaScript in a `script.js` file. Keep code modular; use classes similar to current tools.
4. Always include <script src="script.js"></script> before </body> in each tool's index.html.
5. Register the new tool inside `data/tools-config.json` with its id, name, description, category, and features list.
6. Avoid editing vendor libraries; load them via `js/vendor-loader.js` for CDN fallback behaviour.
7. Test the tool locally using a static file server, e.g. `python3 -m http.server` from repository root, then browse to `http://localhost:8000`.

## Site-Wide Development Guidelines

- Maintain the security and SEO meta tags from the existing pages. Example lines are at the top of `index.html`.
- Follow the performance recommendations listed in `DEPLOYMENT-README.md` (Core Web Vitals targets etc.).
- Keep the design mobile-first and responsive using Bootstrap 5 classes.
- When updating vendor libraries, follow the **Update Checklist** in `vendor/README.md`.
- Ensure all tools remain listed in `data/tools-config.json`; see `VERIFICATION_NOTES.md` for confirmation steps.

## Deployment Notes

Deployment is a simple file upload to an HTTP server. For a full guide, see `DEPLOYMENT-README.md`. Important points:
- Replace `SITE_URL_PLACEHOLDER` in `sitemap.xml` with the production domain.
- Configure GZIP compression and HTTPS on the server.
- Optionally submit the sitemap to search engines.

## Commit Etiquette

- Write concise commit messages describing the change.
- Group related file updates in a single commit.
- Do not commit changes to files under `vendor/` unless updating libraries per the checklist.
- When committing future changes, summarize the modifications—e.g., “Add Node checks and enable globstar in doctor script.”

This AGENTS file is the authoritative reference for future modifications to this repository.
