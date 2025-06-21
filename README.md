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

## License

This project is licensed under the [MIT License](LICENSE).

