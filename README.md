# Free Tools Hub

This repository contains the static files for the **Free Tools Hub** website. It houses more than 50 browser-based utilities organised under the `tools/` directory.

## Project Doctor

Run the `project-doctor.sh` script before committing to check code quality and validate the site.

### Requirements

- Bash
- Python 3
- Node.js

Python steps are skipped automatically if the repository contains no Python code.

### Usage

```bash
chmod +x project-doctor.sh
./project-doctor.sh
```

The script lints HTML/CSS assets and optionally runs Python checks. Review the output for any warnings.
