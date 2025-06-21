# Vendor Libraries Documentation

This directory contains all third-party libraries required for the free tools website builder. All libraries have been downloaded and organized for offline development and deployment.

## Library Overview

| Library | Version | Size (Compressed) | Purpose | License |
|---------|---------|-------------------|---------|---------|
| Bootstrap | 5.3.7 | 1.46MB | Responsive UI Framework | MIT |
| jQuery | 3.7.1 | 365KB | DOM Manipulation | MIT |
| Font Awesome | 6.7.2 | 6.41MB | Icon Library | SIL OFL 1.1 |
| js-beautify | 1.15.4 | 287KB | Code Formatting | MIT |
| CryptoJS | 4.2.0 | 275KB | Cryptographic Functions | MIT |
| FileSaver.js | 2.0.5 | 8.9KB | File Download | MIT |
| Chart.js | 4.5.0 | 580KB | Data Visualization | MIT |
| QRCode.js | Latest | 40KB | QR Code Generation | MIT |
| Math.js | 14.5.2 | 673KB | Mathematical Computing | Apache 2.0 |
| CodeMirror | 6.0.1 | 6.5KB | Code Editor | MIT |

**Total Size**: ~10.1MB compressed

## Integration Guide

### Bootstrap 5.3.7

**Location**: `/vendor/bootstrap/bootstrap-5.3.7-dist/`

**Basic Integration**:
```html
<!-- CSS -->
<link href="vendor/bootstrap/bootstrap-5.3.7-dist/css/bootstrap.min.css" rel="stylesheet">

<!-- JavaScript Bundle (includes Popper) -->
<script src="vendor/bootstrap/bootstrap-5.3.7-dist/js/bootstrap.bundle.min.js"></script>
```

**Available Files**:
- `css/bootstrap.css` (200KB) - Development version
- `css/bootstrap.min.css` (157KB) - Production version
- `js/bootstrap.js` (152KB) - Development version
- `js/bootstrap.min.js` (59KB) - Production version
- `js/bootstrap.bundle.js` (219KB) - Includes Popper
- `js/bootstrap.bundle.min.js` (79KB) - Minified with Popper

**Key Features**:
- Responsive grid system
- Pre-built components (cards, modals, forms)
- Utility classes
- CSS custom properties support

### jQuery 3.7.1

**Location**: `/vendor/jquery/`

**Basic Integration**:
```html
<script src="vendor/jquery/jquery-3.7.1.min.js"></script>
```

**Available Files**:
- `jquery-3.7.1.js` (278KB) - Development version
- `jquery-3.7.1.min.js` (87KB) - Production version

**Usage Example**:
```javascript
$(document).ready(function() {
    $('#myButton').on('click', function() {
        // Handle click event
    });
});
```

### Font Awesome 6.7.2

**Location**: `/vendor/fontawesome/fontawesome-free-6.7.2-web/`

**Basic Integration**:
```html
<link href="vendor/fontawesome/fontawesome-free-6.7.2-web/css/all.min.css" rel="stylesheet">
```

**Available Resources**:
- `css/all.css` - All Font Awesome styles
- `css/fontawesome.css` - Core Font Awesome CSS
- `css/brands.css` - Brand icons only
- `css/regular.css` - Regular weight icons
- `css/solid.css` - Solid weight icons
- `webfonts/` - Font files (WOFF, WOFF2, TTF, EOT, SVG)
- `svgs/` - Individual SVG files organized by style

**Usage Example**:
```html
<i class="fas fa-calculator"></i> <!-- Solid calculator icon -->
<i class="far fa-heart"></i> <!-- Regular heart icon -->
<i class="fab fa-github"></i> <!-- GitHub brand icon -->
```

### js-beautify 1.15.4

**Location**: `/vendor/js-beautify/`

**Basic Integration**:
```html
<script src="vendor/js-beautify/beautify.min.js"></script>
<script src="vendor/js-beautify/beautify-css.min.js"></script>
<script src="vendor/js-beautify/beautify-html.min.js"></script>
```

**Available Files**:
- `beautify.js` (146KB) - JavaScript beautifier
- `beautify-css.js` (36KB) - CSS beautifier
- `beautify-html.js` (45KB) - HTML beautifier
- Minified versions available

**Usage Example**:
```javascript
// Beautify JavaScript
const beautifiedJS = js_beautify(uglyJSCode, {
    indent_size: 2,
    space_in_empty_paren: true
});

// Beautify CSS
const beautifiedCSS = css_beautify(uglyCSSCode, {
    indent_size: 2
});

// Beautify HTML
const beautifiedHTML = html_beautify(uglyHTMLCode, {
    indent_size: 2,
    wrap_line_length: 120
});
```

### CryptoJS 4.2.0

**Location**: `/vendor/cryptojs/`

**Basic Integration**:
```html
<script src="vendor/cryptojs/crypto-js.min.js"></script>
```

**Available Files**:
- `crypto-js.js` (213KB) - Development version
- `crypto-js.min.js` (60KB) - Production version

**Usage Example**:
```javascript
// Generate MD5 hash
const hash = CryptoJS.MD5('Hello World').toString();

// AES Encryption
const encrypted = CryptoJS.AES.encrypt('Secret Message', 'secret-key').toString();
const decrypted = CryptoJS.AES.decrypt(encrypted, 'secret-key').toString(CryptoJS.enc.Utf8);

// Generate random bytes
const randomBytes = CryptoJS.lib.WordArray.random(16).toString();
```

### FileSaver.js 2.0.5

**Location**: `/vendor/filesaver/`

**Basic Integration**:
```html
<script src="vendor/filesaver/FileSaver.min.js"></script>
```

**Available Files**:
- `FileSaver.js` (6KB) - Development version
- `FileSaver.min.js` (2.7KB) - Production version

**Usage Example**:
```javascript
// Save text file
const blob = new Blob(['Hello, world!'], {type: 'text/plain;charset=utf-8'});
saveAs(blob, 'hello-world.txt');

// Save JSON file
const data = {name: 'John', age: 30};
const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
saveAs(jsonBlob, 'data.json');
```

### Chart.js 4.5.0

**Location**: `/vendor/chartjs/`

**Basic Integration**:
```html
<script src="vendor/chartjs/chart.min.js"></script>
```

**Available Files**:
- `chart.js` (398KB) - Development version
- `chart.min.js` (182KB) - Production version

**Usage Example**:
```javascript
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Tool Usage',
            data: [12, 19, 3, 5, 2, 3],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
```

### QRCode.js

**Location**: `/vendor/qrcodejs/`

**Basic Integration**:
```html
<script src="vendor/qrcodejs/qrcode.min.js"></script>
```

**Available Files**:
- `qrcode.js` (19.9KB) - Original from davidshimjs
- `qrcode.min.js` (20.8KB) - Alternative implementation

**Usage Example**:
```javascript
// Create QR code
const qrcode = new QRCode(document.getElementById('qrcode'), {
    text: 'https://example.com',
    width: 256,
    height: 256,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
});

// Update QR code
qrcode.clear();
qrcode.makeCode('New text to encode');
```

### Math.js 14.5.2

**Location**: `/vendor/mathjs/`

**Basic Integration**:
```html
<script src="vendor/mathjs/math.min.js"></script>
```

**Available Files**:
- `math.js` (673KB) - Development version
- `math.min.js` (49 bytes - redirect to CDN) - Use full version instead

**Usage Example**:
```javascript
// Basic calculations
const result = math.evaluate('sqrt(3^2 + 4^2)'); // 5

// Working with matrices
const matrix = math.matrix([[1, 2], [3, 4]]);
const inverse = math.inv(matrix);

// Unit conversions
const distance = math.unit(5, 'km');
const distanceInMiles = distance.to('mile');

// Complex numbers
const complex = math.complex(2, 3);
const magnitude = math.abs(complex);
```

### CodeMirror 6.0.1

**Location**: `/vendor/codemirror/`

**Basic Integration**:
```html
<script src="vendor/codemirror/codemirror.js"></script>
```

**Available Files**:
- `codemirror.js` (4.7KB) - Development version
- `codemirror.min.js` (1.7KB) - Production version

**Note**: These are basic configuration files. For full CodeMirror functionality, you may need additional language support packages from the CDN.

**Usage Example**:
```javascript
// Basic editor setup
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";

const editor = new EditorView({
    extensions: [basicSetup, javascript()],
    parent: document.getElementById('editor')
});
```

## Performance Optimization

### Loading Strategy

**Critical Path**:
1. Bootstrap CSS (required for layout)
2. Core JavaScript libraries (jQuery, Bootstrap JS)
3. Tool-specific libraries as needed

**Lazy Loading Example**:
```javascript
// Load Chart.js only when needed
async function loadChartJS() {
    if (!window.Chart) {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'vendor/chartjs/chart.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    return window.Chart;
}
```

### Bundle Optimization

**Development Bundle** (load all):
```html
<link href="vendor/bootstrap/bootstrap-5.3.7-dist/css/bootstrap.css" rel="stylesheet">
<link href="vendor/fontawesome/fontawesome-free-6.7.2-web/css/all.css" rel="stylesheet">
<script src="vendor/jquery/jquery-3.7.1.js"></script>
<script src="vendor/bootstrap/bootstrap-5.3.7-dist/js/bootstrap.bundle.js"></script>
```

**Production Bundle** (minified only):
```html
<link href="vendor/bootstrap/bootstrap-5.3.7-dist/css/bootstrap.min.css" rel="stylesheet">
<link href="vendor/fontawesome/fontawesome-free-6.7.2-web/css/all.min.css" rel="stylesheet">
<script src="vendor/jquery/jquery-3.7.1.min.js"></script>
<script src="vendor/bootstrap/bootstrap-5.3.7-dist/js/bootstrap.bundle.min.js"></script>
```

## Browser Compatibility

All libraries support:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Internet Explorer 11 (with polyfills)

## Security Considerations

1. **Subresource Integrity**: Consider adding SRI hashes for production
2. **Content Security Policy**: Ensure CSP headers allow these resources
3. **HTTPS Only**: Serve all resources over HTTPS in production
4. **Regular Updates**: Monitor for security updates to libraries

## Maintenance

### Update Checklist

1. Check for new versions monthly
2. Test compatibility with existing tools
3. Update documentation
4. Run security audits
5. Update CDN fallbacks if needed

### Version Pinning

All libraries are pinned to specific versions to ensure consistency:
- **Pros**: Predictable behavior, no breaking changes
- **Cons**: Manual updates required for security patches

## CDN Fallbacks

For production deployment, consider CDN with local fallbacks:

```html
<!-- Bootstrap CSS with fallback -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet" 
      integrity="sha384-LN+7fdVzj6u52u30Kp6M/trliBMCMKTyK833zpbD+pXdCLuTusPj697FH4R/5mcr" 
      crossorigin="anonymous">

<!-- jQuery with fallback -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js" 
        integrity="sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs" 
        crossorigin="anonymous"></script>
<script>
    if (!window.jQuery) {
        document.write('<script src="vendor/jquery/jquery-3.7.1.min.js"><\/script>');
    }
</script>
```

This vendor library collection provides a complete foundation for building professional-grade online tools with modern web technologies.