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
```

The script automatically installs missing Node dependencies if needed.

The script lints HTML/CSS assets (ignoring third-party files in `vendor/`) and optionally runs Python checks. Review the output for any warnings.
Custom lint rules are stored in `.htmlhintrc` and `.csslintrc` at the project root.


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

## License

This project is licensed under the [MIT License](LICENSE).


