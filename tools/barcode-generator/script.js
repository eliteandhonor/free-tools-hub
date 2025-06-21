// Simple Barcode Generator Tool
class BarcodeGenerator {
    constructor() {
        if (DEBUG) console.log('Initializing Simple Barcode Generator');
        this.generatedBarcode = null;
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupGenerator());
        } else {
            this.setupGenerator();
        }
    }
    
    setupGenerator() {
        if (DEBUG) console.log('Setting up barcode generator...');
        
        // Get form elements
        const form = document.getElementById('barcodeForm');
        const textInput = document.getElementById('barcodeText');
        const typeSelect = document.getElementById('barcodeType');
        const preview = document.getElementById('barcodePreview');
        const resultSection = document.getElementById('resultSection');
        
        if (DEBUG) console.log('Elements found:', {
            form: !!form,
            textInput: !!textInput,
            typeSelect: !!typeSelect,
            preview: !!preview,
            resultSection: !!resultSection
        });
        
        if (!form || !textInput || !preview) {
            console.error('Required elements not found');
            return;
        }
        
        // Attach form submission handler
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (DEBUG) console.log('Form submitted!');
            this.generateBarcode(textInput.value.trim(), typeSelect.value, preview, resultSection);
        });
        
        if (DEBUG) console.log('Barcode generator setup complete');
    }
    
    async generateBarcode(text, type, preview, resultSection) {
        if (DEBUG) console.log('Generating barcode:', { text, type });
        
        if (!text) {
            if (DEBUG) console.log('No text provided');
            return;
        }
        
        try {
            // Clear previous barcode
            preview.innerHTML = '';
            
            // Load JsBarcode if needed
            await this.loadJsBarcode();
            
            // Create canvas for barcode
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 150;
            
            // Generate barcode
            if (typeof JsBarcode !== 'undefined') {
                if (DEBUG) console.log('Generating with JsBarcode');
                JsBarcode(canvas, text, {
                    format: type.toUpperCase(),
                    width: 2,
                    height: 100,
                    displayValue: true
                });
            } else {
                if (DEBUG) console.log('Generating with fallback');
                this.drawFallbackBarcode(canvas, text);
            }
            
            // Display barcode
            preview.appendChild(canvas);
            resultSection.style.display = 'block';
            this.generatedBarcode = canvas;
            
            if (DEBUG) console.log('Barcode generated successfully');
            
        } catch (error) {
            console.error('Barcode generation error:', error);
            preview.innerHTML = '<div style="color: red;">Error generating barcode: ' + error.message + '</div>';
        }
    }
    
    async loadJsBarcode() {
        if (typeof JsBarcode !== 'undefined') {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            if (DEBUG) console.log('Loading JsBarcode library...');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
            script.onload = () => {
                if (DEBUG) console.log('JsBarcode loaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.warn('JsBarcode failed to load, using fallback');
                resolve(); // Continue with fallback
            };
            document.head.appendChild(script);
        });
    }
    
    drawFallbackBarcode(canvas, text) {
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw simple barcode pattern
        ctx.fillStyle = '#000000';
        const barWidth = 3;
        let x = 20;
        
        // Generate pattern based on text
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            const pattern = char % 2 === 0 ? [1, 0, 1, 0, 1] : [0, 1, 0, 1, 0];
            
            for (let j = 0; j < pattern.length; j++) {
                if (pattern[j]) {
                    ctx.fillRect(x, 20, barWidth, 80);
                }
                x += barWidth;
            }
            x += barWidth; // spacing between characters
        }
        
        // Add text
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width / 2, canvas.height - 10);
    }
    
    // Download methods
    downloadBarcode(format) {
        if (!this.generatedBarcode) return;
        
        const link = document.createElement('a');
        link.download = `barcode-${Date.now()}.${format}`;
        
        if (format === 'png') {
            link.href = this.generatedBarcode.toDataURL('image/png');
        } else if (format === 'svg') {
            // Convert canvas to SVG (simplified)
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.generatedBarcode.width}" height="${this.generatedBarcode.height}">
                <image href="${this.generatedBarcode.toDataURL()}" width="100%" height="100%"/>
            </svg>`;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            link.href = URL.createObjectURL(blob);
        }
        
        link.click();
    }
}

// Initialize the barcode generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (DEBUG) console.log('Initializing Barcode Generator...');
    const generator = new BarcodeGenerator();
    
    // Attach download handlers
    const downloadPngBtn = document.getElementById('downloadPng');
    const downloadSvgBtn = document.getElementById('downloadSvg');
    
    if (downloadPngBtn) {
        downloadPngBtn.addEventListener('click', () => generator.downloadBarcode('png'));
    }
    
    if (downloadSvgBtn) {
        downloadSvgBtn.addEventListener('click', () => generator.downloadBarcode('svg'));
    }
});

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarNav = document.querySelector('.navbar-nav');
    
    if (navbarToggle && navbarNav) {
        navbarToggle.addEventListener('click', function() {
            navbarNav.classList.toggle('active');
        });
    }
});
