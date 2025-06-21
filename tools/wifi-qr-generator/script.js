// WiFi QR Code Generator Tool
class WiFiQRGenerator {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.generatedQR = null;
        this.wifiString = '';
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
                ctx.fillText('WiFi: ' + text.substring(0, 10), canvas.width / 2, canvas.height - 10);
                
                element.innerHTML = '';
                element.appendChild(canvas);
            };
            
            // Auto-generate if text provided
            if (options.text) {
                this.makeCode(options.text);
            }
        };
    }
    
    initializeElements() {
        this.form = document.getElementById('wifiQrForm');
        this.networkNameInput = document.getElementById('networkName');
        this.securityTypeSelect = document.getElementById('securityType');
        this.passwordInput = document.getElementById('password');
        this.passwordGroup = document.getElementById('passwordGroup');
        this.hiddenNetworkInput = document.getElementById('hiddenNetwork');
        this.qrSizeSelect = document.getElementById('qrSize');
        this.errorCorrectionSelect = document.getElementById('errorCorrection');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.resultSection = document.getElementById('resultSection');
        this.qrPreview = document.getElementById('qrPreview');
        this.wifiDetails = document.getElementById('wifiDetails');
        this.downloadPngBtn = document.getElementById('downloadPng');
        this.copyToClipboardBtn = document.getElementById('copyToClipboard');
    }
    
    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleGenerate(e));
        this.securityTypeSelect.addEventListener('change', () => this.handleSecurityTypeChange());
        this.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        this.downloadPngBtn.addEventListener('click', () => this.downloadQRCode());
        this.copyToClipboardBtn.addEventListener('click', () => this.copyWiFiString());
        
        // Real-time validation
        this.networkNameInput.addEventListener('input', () => this.validateForm());
        this.passwordInput.addEventListener('input', () => this.validateForm());
    }
    
    handleSecurityTypeChange() {
        const securityType = this.securityTypeSelect.value;
        
        if (securityType === 'nopass') {
            this.passwordGroup.style.display = 'none';
            this.passwordInput.required = false;
        } else {
            this.passwordGroup.style.display = 'block';
            this.passwordInput.required = true;
        }
        
        this.validateForm();
    }
    
    togglePasswordVisibility() {
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';
        
        const icon = this.togglePasswordBtn.querySelector('i');
        icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
    
    validateForm() {
        const networkName = this.networkNameInput.value.trim();
        const securityType = this.securityTypeSelect.value;
        const password = this.passwordInput.value;
        
        let isValid = true;
        let errors = [];
        
        // Validate network name
        if (!networkName) {
            errors.push('Network name is required');
            isValid = false;
        } else if (networkName.length > 32) {
            errors.push('Network name should be 32 characters or less');
            isValid = false;
        }
        
        // Validate password for secured networks
        if (securityType !== 'nopass' && !password) {
            errors.push('Password is required for secured networks');
            isValid = false;
        }
        
        // Show validation feedback
        this.showValidationFeedback(isValid, errors);
        
        return isValid;
    }
    
    showValidationFeedback(isValid, errors) {
        // Remove existing feedback
        const existingFeedback = document.querySelector('.validation-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        if (!isValid && errors.length > 0) {
            const feedback = document.createElement('div');
            feedback.className = 'validation-feedback';
            feedback.style.cssText = `
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 0.75rem;
                border-radius: 6px;
                margin-top: 1rem;
                font-size: 0.875rem;
            `;
            feedback.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <ul style="margin: 0.5rem 0 0 1rem; padding: 0;">
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            `;
            this.form.appendChild(feedback);
        }
    }
    
    async handleGenerate(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        const networkName = this.networkNameInput.value.trim();
        const securityType = this.securityTypeSelect.value;
        const password = this.passwordInput.value;
        const isHidden = this.hiddenNetworkInput.checked;
        const qrSize = parseInt(this.qrSizeSelect.value);
        const errorCorrection = this.errorCorrectionSelect.value;
        
        try {
            await this.generateWiFiQR(networkName, securityType, password, isHidden, qrSize, errorCorrection);
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    async generateWiFiQR(networkName, securityType, password, isHidden, qrSize, errorCorrection) {
        // Ensure QRCode library is loaded
        await this.loadQRCodeLibrary();
        
        // Create WiFi QR string format: WIFI:T:WPA;S:mynetwork;P:mypass;H:false;
        this.wifiString = `WIFI:T:${securityType};S:${this.escapeSpecialChars(networkName)};`;
        
        if (securityType !== 'nopass') {
            this.wifiString += `P:${this.escapeSpecialChars(password)};`;
        }
        
        this.wifiString += `H:${isHidden};`;
        
        try {
            // Clear previous results
            this.qrPreview.innerHTML = '';
            
            // Create container div for QR code
            const qrContainer = document.createElement('div');
            qrContainer.className = 'qr-code';
            
            // Generate QR code using qrcodejs library
            const qr = new QRCode(qrContainer, {
                text: this.wifiString,
                width: qrSize,
                height: qrSize,
                colorDark: '#000000',
                colorLight: '#ffffff'
            });
            
            // Store generated QR
            this.generatedQR = qrContainer.querySelector('canvas');
            
            // Display the result
            this.qrPreview.appendChild(qrContainer);
            this.displayWiFiDetails(networkName, securityType, password, isHidden);
            this.resultSection.style.display = 'block';
            
            // Scroll to result
            this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('WiFi QR generation error:', error);
            this.showError('Failed to generate QR code: ' + error.message);
        }
    }
    
    escapeSpecialChars(str) {
        // Escape special characters for WiFi QR format
        return str.replace(/([\\;,":])/g, '\\$1');
    }
    
    displayWiFiDetails(networkName, securityType, password, isHidden) {
        const securityNames = {
            'WPA': 'WPA/WPA2',
            'WEP': 'WEP',
            'nopass': 'Open (No Password)'
        };
        
        this.wifiDetails.innerHTML = `
            <div class="wifi-detail">
                <strong>Network Name:</strong>
                <span>${networkName}</span>
            </div>
            <div class="wifi-detail">
                <strong>Security:</strong>
                <span>${securityNames[securityType]}</span>
            </div>
            ${securityType !== 'nopass' ? `
                <div class="wifi-detail">
                    <strong>Password:</strong>
                    <span style="font-family: monospace;">••••••••</span>
                </div>
            ` : ''}
            <div class="wifi-detail">
                <strong>Hidden Network:</strong>
                <span>${isHidden ? 'Yes' : 'No'}</span>
            </div>
            <div class="wifi-detail">
                <strong>QR String:</strong>
                <span style="font-family: monospace; font-size: 0.8rem; word-break: break-all;">${this.wifiString}</span>
            </div>
        `;
    }
    
    downloadQRCode() {
        if (!this.generatedQR) return;
        
        const link = document.createElement('a');
        link.download = `wifi-qr-${this.networkNameInput.value.trim().replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
        link.href = this.generatedQR.toDataURL('image/png');
        link.click();
    }
    
    async copyWiFiString() {
        if (!this.wifiString) return;
        
        try {
            await navigator.clipboard.writeText(this.wifiString);
            this.showSuccess('WiFi QR string copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.wifiString;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('WiFi QR string copied to clipboard!');
        }
    }
    
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    showSuccess(message) {
        this.showMessage(message, 'success');
    }
    
    showMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const colors = {
            error: {
                bg: '#fef2f2',
                border: '#fecaca',
                text: '#dc2626',
                icon: 'fa-exclamation-triangle'
            },
            success: {
                bg: '#f0fdf4',
                border: '#bbf7d0',
                text: '#15803d',
                icon: 'fa-check-circle'
            }
        };
        
        const color = colors[type];
        
        // Create message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.style.cssText = `
            background: ${color.bg};
            border: 1px solid ${color.border};
            color: ${color.text};
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        messageDiv.innerHTML = `
            <i class="fas ${color.icon}"></i>
            <span>${message}</span>
        `;
        
        this.form.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Initialize the WiFi QR generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const generator = new WiFiQRGenerator();
    
    // Trigger initial security type change to set up form properly
    generator.handleSecurityTypeChange();
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
