/**
 * Vendor Helper Functions
 * Easy-to-use functions for loading specific vendor libraries when needed
 */

// Load jQuery when needed
function loadJQuery() {
    return window.vendorLoader.loadJS(
        'jquery',
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',
        '/vendor/jquery/jquery-3.7.1.min.js',
        '$'
    );
}

// Load Chart.js when needed
function loadChartJS() {
    return window.vendorLoader.loadJS(
        'chartjs',
        'https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.min.js',
        '/vendor/chartjs/chart.min.js',
        'Chart'
    );
}

// Load Math.js when needed
function loadMathJS() {
    return window.vendorLoader.loadJS(
        'mathjs',
        'https://cdnjs.cloudflare.com/ajax/libs/mathjs/14.5.2/math.min.js',
        '/vendor/mathjs/math.min.js',
        'math'
    );
}

// Load QR Code library when needed
function loadQRCode() {
    return window.vendorLoader.loadJS(
        'qrcodejs',
        'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
        '/vendor/qrcodejs/qrcode.min.js',
        'QRCode'
    );
}

// Load CryptoJS when needed
function loadCryptoJS() {
    return window.vendorLoader.loadJS(
        'cryptojs',
        'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js',
        '/vendor/cryptojs/crypto-js.min.js',
        'CryptoJS'
    );
}

// Load JS Beautify when needed
function loadJSBeautify() {
    return window.vendorLoader.loadJS(
        'jsbeautify',
        'https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.15.1/beautify.min.js',
        '/vendor/js-beautify/beautify.min.js',
        'html_beautify'
    );
}

// Load FileSaver when needed
function loadFileSaver() {
    return window.vendorLoader.loadJS(
        'filesaver',
        'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
        '/vendor/filesaver/FileSaver.min.js',
        'saveAs'
    );
}

// Load CodeMirror when needed
function loadCodeMirror() {
    return window.vendorLoader.loadJS(
        'codemirror',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.0.1/codemirror.min.js',
        '/vendor/codemirror/codemirror.min.js',
        'CodeMirror'
    );
}

// Usage example:
// loadJQuery().then(() => {
//     console.log('jQuery is ready to use');
//     $('body').addClass('jquery-loaded');
// });

// Load multiple libraries
function loadMultipleVendors(vendors) {
    const loaders = {
        'jquery': loadJQuery,
        'chartjs': loadChartJS,
        'mathjs': loadMathJS,
        'qrcode': loadQRCode,
        'cryptojs': loadCryptoJS,
        'jsbeautify': loadJSBeautify,
        'filesaver': loadFileSaver,
        'codemirror': loadCodeMirror
    };
    
    const promises = vendors.map(vendor => {
        const loader = loaders[vendor.toLowerCase()];
        return loader ? loader() : Promise.reject(new Error(`Unknown vendor: ${vendor}`));
    });
    
    return Promise.all(promises);
}
