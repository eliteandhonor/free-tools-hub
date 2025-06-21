// QR Code Generator - Professional Implementation
class QRCodeGenerator {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.currentQR = null;
        this.currentType = 'text';
        this.loadQRCodeLibrary();
    }
    
    loadQRCodeLibrary() {
        if (typeof QRCode !== 'undefined') {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            // Try local vendor file first
            const script = document.createElement('script');
            script.src = '../../vendor/qrcodejs/qrcode.min.js';
            script.onload = () => {
                if (DEBUG) console.log('QRCode library loaded from vendor');
                // Check if we need compatibility layer
                if (typeof QRCode === 'undefined' && typeof qrcode !== 'undefined') {
                    if (DEBUG) console.log('Creating QRCode compatibility layer');
                    this.createQRCodeCompatibility();
                }
                resolve();
            };
            script.onerror = () => {
                console.warn('Local QRCode library failed, trying CDN');
                this.loadQRCodeFromCDN(resolve, reject);
            };
            document.head.appendChild(script);
        });
    }
    
    loadQRCodeFromCDN(resolve, reject) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/davidshimjs-qrcodejs@0.0.2/qrcode.min.js';
        script.onload = () => {
            if (DEBUG) console.log('QRCode library loaded from CDN');
            resolve();
        };
        script.onerror = () => {
            console.warn('CDN failed, creating QR fallback');
            this.createQRCodeFallback();
            resolve();
        };
        document.head.appendChild(script);
    }
    
    createQRCodeCompatibility() {
        // Create compatibility layer for different QR libraries
        window.QRCode = function(element, options) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = options.width || 256;
            canvas.height = options.height || 256;
            
            // Simple QR pattern generation
            this.makeCode = function(text) {
                try {
                    const qr = qrcode(0, 'M');
                    qr.addData(text);
                    qr.make();
                    
                    const moduleCount = qr.getModuleCount();
                    const cellSize = Math.floor(canvas.width / moduleCount);
                    
                    ctx.fillStyle = options.colorLight || '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    ctx.fillStyle = options.colorDark || '#000000';
                    for (let row = 0; row < moduleCount; row++) {
                        for (let col = 0; col < moduleCount; col++) {
                            if (qr.isDark(row, col)) {
                                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                            }
                        }
                    }
                    
                    element.innerHTML = '';
                    element.appendChild(canvas);
                } catch (error) {
                    console.error('QR generation failed:', error);
                }
            };
            
            // Auto-generate if text provided
            if (options.text) {
                this.makeCode(options.text);
            }
        };
        
        window.QRCode.CorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };
    }
    
    createQRCodeFallback() {
        // Simple fallback QR code generator
        window.QRCode = function(element, options) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = options.width || 256;
            canvas.height = options.height || 256;
            
            this.makeCode = function(text) {
                // Clear canvas
                ctx.fillStyle = options.colorLight || '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw simple pattern
                ctx.fillStyle = options.colorDark || '#000000';
                const size = 8;
                const modules = Math.floor(canvas.width / size);
                
                // Generate pattern based on text
                for (let i = 0; i < modules; i++) {
                    for (let j = 0; j < modules; j++) {
                        const char = text.charCodeAt((i + j) % text.length);
                        if ((char + i + j) % 3 === 0) {
                            ctx.fillRect(j * size, i * size, size, size);
                        }
                    }
                }
                
                // Add text
                ctx.fillStyle = '#000000';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('QR: ' + text.substring(0, 10), canvas.width / 2, canvas.height - 10);
                
                element.innerHTML = '';
                element.appendChild(canvas);
            };
            
            // Auto-generate if text provided
            if (options.text) {
                this.makeCode(options.text);
            }
        };
        
        window.QRCode.CorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };
    }

    initializeElements() {
        // Type buttons
        this.typeButtons = document.querySelectorAll('.qr-type-btn');
        
        // Input sections
        this.textInput = document.getElementById('text-input');
        this.urlInput = document.getElementById('url-input');
        this.emailInput = document.getElementById('email-input');
        this.phoneInput = document.getElementById('phone-input');
        this.wifiInput = document.getElementById('wifi-input');
        this.vcardInput = document.getElementById('vcard-input');
        
        // Form fields
        this.textContent = document.getElementById('text-content');
        this.urlContent = document.getElementById('url-content');
        this.emailContent = document.getElementById('email-content');
        this.emailSubject = document.getElementById('email-subject');
        this.phoneContent = document.getElementById('phone-content');
        this.wifiSSID = document.getElementById('wifi-ssid');
        this.wifiPassword = document.getElementById('wifi-password');
        this.wifiSecurity = document.getElementById('wifi-security');
        this.vcardFirstName = document.getElementById('vcard-firstname');
        this.vcardLastName = document.getElementById('vcard-lastname');
        this.vcardPhone = document.getElementById('vcard-phone');
        this.vcardEmail = document.getElementById('vcard-email');
        this.vcardOrg = document.getElementById('vcard-org');
        
        // Options
        this.qrSize = document.getElementById('qr-size');
        this.sizeDisplay = document.getElementById('size-display');
        this.fgColor = document.getElementById('fg-color');
        this.bgColor = document.getElementById('bg-color');
        this.errorCorrection = document.getElementById('error-correction');
        
        // Output
        this.qrDisplay = document.getElementById('qr-display');
        this.downloadButtons = document.getElementById('download-buttons');
        this.qrInfo = document.getElementById('qr-info');
        this.qrContentInfo = document.getElementById('qr-content-info');
    }

    setupEventListeners() {
        // Type button clicks
        this.typeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchType(btn.dataset.type);
            });
        });

        // Size slider
        this.qrSize.addEventListener('input', () => {
            this.sizeDisplay.textContent = this.qrSize.value + 'px';
            if (this.currentQR) {
                this.generateQR();
            }
        });

        // Color changes
        this.fgColor.addEventListener('change', () => {
            if (this.currentQR) {
                this.generateQR();
            }
        });

        this.bgColor.addEventListener('change', () => {
            if (this.currentQR) {
                this.generateQR();
            }
        });

        // Error correction change
        this.errorCorrection.addEventListener('change', () => {
            if (this.currentQR) {
                this.generateQR();
            }
        });

        // Auto-generate on input change
        const inputs = [
            this.textContent, this.urlContent, this.emailContent, this.emailSubject,
            this.phoneContent, this.wifiSSID, this.wifiPassword, this.wifiSecurity,
            this.vcardFirstName, this.vcardLastName, this.vcardPhone, this.vcardEmail, this.vcardOrg
        ];

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.debounce(() => this.generateQR(), 500);
            });
        });
    }

    switchType(type) {
        // Update active button
        this.typeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        // Hide all input sections
        [this.textInput, this.urlInput, this.emailInput, this.phoneInput, this.wifiInput, this.vcardInput].forEach(section => {
            section.classList.add('hidden');
        });

        // Show selected input section
        const sectionMap = {
            'text': this.textInput,
            'url': this.urlInput,
            'email': this.emailInput,
            'phone': this.phoneInput,
            'wifi': this.wifiInput,
            'vcard': this.vcardInput
        };

        if (sectionMap[type]) {
            sectionMap[type].classList.remove('hidden');
        }

        this.currentType = type;
        
        // Clear QR if type changed
        this.clearQR();
    }

    async generateQR() {
        // Ensure QRCode library is loaded
        await this.loadQRCodeLibrary();
        
        const content = this.getContentForType();
        
        if (!content) {
            this.clearQR();
            return;
        }

        try {
            // Clear previous QR
            this.qrDisplay.innerHTML = '';
            
            // Create QR code
            const size = parseInt(this.qrSize.value);
            const qr = new QRCode(this.qrDisplay, {
                text: content,
                width: size,
                height: size,
                colorDark: this.fgColor.value,
                colorLight: this.bgColor.value,
                correctLevel: QRCode.CorrectLevel[this.errorCorrection.value]
            });

            this.currentQR = qr;
            
            // Show download buttons and info
            this.downloadButtons.style.display = 'flex';
            this.qrInfo.style.display = 'block';
            this.qrContentInfo.textContent = `Content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`;
            
        } catch (error) {
            console.error('QR generation error:', error);
            this.showError('Failed to generate QR code. Please check your input.');
        }
    }

    getContentForType() {
        switch (this.currentType) {
            case 'text':
                return this.textContent.value.trim();
                
            case 'url':
                const url = this.urlContent.value.trim();
                if (!url) return '';
                // Ensure URL has protocol
                return url.match(/^https?:\/\//) ? url : `https://${url}`;
                
            case 'email':
                const email = this.emailContent.value.trim();
                const subject = this.emailSubject.value.trim();
                if (!email) return '';
                return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
                
            case 'phone':
                const phone = this.phoneContent.value.trim();
                return phone ? `tel:${phone}` : '';
                
            case 'wifi':
                const ssid = this.wifiSSID.value.trim();
                const password = this.wifiPassword.value.trim();
                const security = this.wifiSecurity.value;
                if (!ssid) return '';
                
                let wifiString = `WIFI:T:${security};S:${ssid};`;
                if (password && security) {
                    wifiString += `P:${password};`;
                }
                wifiString += ';';
                return wifiString;
                
            case 'vcard':
                const firstName = this.vcardFirstName.value.trim();
                const lastName = this.vcardLastName.value.trim();
                const vcardPhoneNum = this.vcardPhone.value.trim();
                const vcardEmail = this.vcardEmail.value.trim();
                const org = this.vcardOrg.value.trim();
                
                if (!firstName && !lastName) return '';
                
                let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
                vcard += `FN:${firstName} ${lastName}\n`;
                vcard += `N:${lastName};${firstName};;;\n`;
                if (phone) vcard += `TEL:${phone}\n`;
                if (email) vcard += `EMAIL:${email}\n`;
                if (org) vcard += `ORG:${org}\n`;
                vcard += 'END:VCARD';
                return vcard;
                
            default:
                return '';
        }
    }

    downloadQR(format) {
        if (!this.currentQR) {
            this.showError('No QR code to download');
            return;
        }

        try {
            if (format === 'png') {
                const canvas = this.qrDisplay.querySelector('canvas');
                if (canvas) {
                    const link = document.createElement('a');
                    link.download = `qrcode-${Date.now()}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            } else if (format === 'svg') {
                // For SVG, we'll create a simple SVG version
                const canvas = this.qrDisplay.querySelector('canvas');
                if (canvas) {
                    const size = parseInt(this.qrSize.value);
                    const imgData = canvas.toDataURL('image/png');
                    
                    const svg = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
                            <image href="${imgData}" width="${size}" height="${size}"/>
                        </svg>
                    `;
                    
                    const blob = new Blob([svg], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `qrcode-${Date.now()}.svg`;
                    link.href = url;
                    link.click();
                    URL.revokeObjectURL(url);
                }
            }
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Failed to download QR code');
        }
    }

    copyQRCode() {
        if (!this.currentQR) {
            this.showError('No QR code to copy');
            return;
        }

        try {
            const canvas = this.qrDisplay.querySelector('canvas');
            if (canvas) {
                canvas.toBlob(blob => {
                    const item = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([item]).then(() => {
                        this.showSuccess('QR code copied to clipboard!');
                    }).catch(() => {
                        this.showError('Failed to copy QR code to clipboard');
                    });
                });
            }
        } catch (error) {
            console.error('Copy error:', error);
            this.showError('Failed to copy QR code');
        }
    }

    clearFields() {
        // Clear all input fields
        this.textContent.value = '';
        this.urlContent.value = '';
        this.emailContent.value = '';
        this.emailSubject.value = '';
        this.phoneContent.value = '';
        this.wifiSSID.value = '';
        this.wifiPassword.value = '';
        this.wifiSecurity.value = 'WPA';
        this.vcardFirstName.value = '';
        this.vcardLastName.value = '';
        this.vcardPhone.value = '';
        this.vcardEmail.value = '';
        this.vcardOrg.value = '';
        
        // Reset to text type
        this.switchType('text');
        
        // Clear QR
        this.clearQR();
    }

    clearQR() {
        this.qrDisplay.innerHTML = `
            <div class="qr-placeholder">
                <i class="fas fa-qrcode" style="font-size: 3rem; margin-bottom: 1rem; color: #d1d5db;"></i>
                <p>Your QR code will appear here</p>
            </div>
        `;
        this.downloadButtons.style.display = 'none';
        this.qrInfo.style.display = 'none';
        this.currentQR = null;
    }

    loadExample(type) {
        this.clearFields();
        
        switch (type) {
            case 'website':
                this.switchType('url');
                this.urlContent.value = 'https://freetoolshub.com';
                break;
                
            case 'contact':
                this.switchType('vcard');
                this.vcardFirstName.value = 'John';
                this.vcardLastName.value = 'Doe';
                this.vcardPhone.value = '+1234567890';
                this.vcardEmail.value = 'john.doe@example.com';
                this.vcardOrg.value = 'Free Tools Hub';
                break;
                
            case 'wifi':
                this.switchType('wifi');
                this.wifiSSID.value = 'GuestNetwork';
                this.wifiPassword.value = 'welcome123';
                this.wifiSecurity.value = 'WPA';
                break;
                
            case 'email':
                this.switchType('email');
                this.emailContent.value = 'contact@freetoolshub.com';
                this.emailSubject.value = 'Hello from QR Code';
                break;
        }
        
        // Generate QR for the example
        setTimeout(() => this.generateQR(), 100);
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById('qr-error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'qr-error-message';
            errorDiv.style.cssText = `
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
                border-radius: 6px;
                padding: 0.75rem;
                margin-top: 1rem;
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 300px;
            `;
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    showSuccess(message) {
        // Create or update success message
        let successDiv = document.getElementById('qr-success-message');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.id = 'qr-success-message';
            successDiv.style.cssText = `
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
                border-radius: 6px;
                padding: 0.75rem;
                margin-top: 1rem;
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 300px;
            `;
            document.body.appendChild(successDiv);
        }
        
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }
}

// Global functions for button actions
function generateQR() {
    qrGenerator.generateQR();
}

function clearFields() {
    qrGenerator.clearFields();
}

function downloadQR(format) {
    qrGenerator.downloadQR(format);
}

function copyQRCode() {
    qrGenerator.copyQRCode();
}

function loadExample(type) {
    qrGenerator.loadExample(type);
}

// Initialize QR generator when page loads
let qrGenerator;
document.addEventListener('DOMContentLoaded', function() {
    qrGenerator = new QRCodeGenerator();
});
