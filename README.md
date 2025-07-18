# Free Tools Hub

This repository contains the static files for the **Free Tools Hub** website. It houses 59 browser-based utilities organised under the `tools/` directory.

## Project Doctor

Run the `project-doctor.sh` script before committing to check code quality and validate the site.

### Requirements

- Bash
- Python 3
- Node.js

Python steps are skipped automatically if the repository contains no Python code.

### Usage

```bash
# Optional: preinstall Node packages
npm install
chmod +x project-doctor.sh
./project-doctor.sh
# Quick lint only
npm run lint
```

Use `npm run lint` when you only need to validate HTML and CSS without running
the full doctor script.

The script automatically installs missing Node dependencies if needed.

The script lints HTML/CSS assets (ignoring third-party files in `vendor/`) and optionally runs Python checks. Review the output for any warnings.
Custom lint rules are stored in `.htmlhintrc` and `.csslintrc` at the project root.

### ID Naming Convention

IDs use **camelCase** to make JavaScript hooks predictable. The `.htmlhintrc` file sets `id-class-value` to `"hump"`, and each HTML page disables the rule with `<!--htmlhint id-class-value:false -->` so existing dash-case classes remain valid.


## Sitemap Generation

Run `node scripts/generate-sitemap.js` after adding or updating tools. The script reads `data/tools-config.json`, writes a `<url>` entry for each tool, and updates all `<lastmod>` dates to the current day using `new Date().toISOString().slice(0,10)`. Validate the result with `xmllint --noout sitemap.xml`.

## Maintaining Category Pages

When editing pages under `tools/` that list multiple tools (such as `/tools/generator/`), keep their structured data in sync with `data/tools-config.json`.

1. Extract all tools belonging to the category using `jq`:

   ```bash
   jq '[.tools[] | select(.category=="<category>") | {"@type":"WebApplication","name":.name,"description":.description}]' data/tools-config.json
   ```

2. Update the JSON-LD `ItemList` in the category page so `numberOfItems` matches the count from the command and the `itemListElement` array reflects the extracted objects.

This ensures search engines get an accurate view of the available tools.

## Tool JavaScript Integration

Each tool's logic resides in a `script.js` file within its folder. Include this script before the closing </body> element:

```html
<script src="script.js"></script>
```

Avoid duplicating logic with inline JavaScript.

Common functionality shared across tools now lives in `js/tool-common.js`. Load
this script before any tool specific scripts:

```html
<script src="../../js/tool-common.js"></script>
<script src="script.js"></script>
```

### Word Counter Notes

The Word Counter tool now guards optional UI elements before wiring events.
Listeners for goal inputs, undo/redo, and keyword-density toggles are only
registered when the corresponding elements exist. Updates to goal progress or
keyword density are likewise skipped if their elements are missing. These
safeguards prevent console errors when the feature markup is omitted. The
copy statistics button handler now checks for `.copy-stats-btn` before
registering its event listener to avoid errors when the button is absent.

### Slug Generator Notes

The inline JavaScript has been moved to `script.js` so the page only loads one external script. The generator still works in the browser.

### Icon Generator Notes

As with the slug tool, its inline logic now resides in `script.js`. All features continue to function normally.

### HTML CSS JS Beautifier Notes

Both inline script blocks were consolidated into a single `script.js` file. The beautifier behaves the same as before.

## Housekeeping

Removed unused `script_backup.js` from the barcode generator tool.
- Added `const DEBUG = false` to barcode generator script to silence console logs.

## Formatting

Ensure all HTML and JSON files end with a newline at EOF. The doctor script
checks for this requirement.


## Testing

Run `npm test` to execute the Mocha test suite. Install dependencies first with
`npm install` if necessary. All tests must pass before committing changes.
## License

This project is licensed under the [MIT License](LICENSE).


