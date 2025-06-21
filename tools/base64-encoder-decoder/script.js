// Base64 Encoder/Decoder Tool - Professional Implementation
class Base64Tool {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDefaultState();
    }

    bindEvents() {
        // Get DOM elements
        this.textInput = document.getElementById('text-input');
        this.base64Output = document.getElementById('base64-output');
        this.encodeBtn = document.getElementById('encode-btn');
        this.decodeBtn = document.getElementById('decode-btn');
        this.swapBtn = document.getElementById('swap-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.copyBtn = document.getElementById('copy-btn');
        this.fileInput = document.getElementById('file-input');
        this.fileUploadBtn = document.getElementById('file-upload-btn');
        this.fileOutput = document.getElementById('file-output');
        this.downloadBtn = document.getElementById('download-btn');
        this.urlSafeCheckbox = document.getElementById('url-safe');
        this.formatCheckbox = document.getElementById('format-output');

        // Bind events
        if (this.encodeBtn) {
            this.encodeBtn.addEventListener('click', () => this.encodeText());
        }
        
        if (this.decodeBtn) {
            this.decodeBtn.addEventListener('click', () => this.decodeText());
        }

        if (this.swapBtn) {
            this.swapBtn.addEventListener('click', () => this.swapInputOutput());
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearAll());
        }

        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        }

        if (this.fileUploadBtn) {
            this.fileUploadBtn.addEventListener('click', () => this.fileInput?.click());
        }

        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadResult());
        }

        // Real-time encoding/decoding
        if (this.textInput) {
            this.textInput.addEventListener('input', () => this.handleTextInput());
        }

        if (this.base64Output) {
            this.base64Output.addEventListener('input', () => this.handleBase64Input());
        }

        // Checkbox changes
        [this.urlSafeCheckbox, this.formatCheckbox].forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', () => this.handleOptionsChange());
            }
        });
    }

    setupDefaultState() {
        this.clearMessages();
        this.updateStats();
    }

    handleTextInput() {
        const text = this.textInput?.value;
        if (text && text.length > 0) {
            this.encodeText(true); // Silent encoding
        } else {
            this.clearOutput();
        }
    }

    handleBase64Input() {
        const base64 = this.base64Output?.value;
        if (base64 && base64.length > 0) {
            this.decodeText(true); // Silent decoding
        }
    }

    handleOptionsChange() {
        // Re-encode if there's text
        const text = this.textInput?.value;
        if (text && text.length > 0) {
            this.encodeText(true);
        }
    }

    encodeText(silent = false) {
        const text = this.textInput?.value?.trim();
        
        if (!text) {
            if (!silent) this.showError('Please enter text to encode');
            return;
        }

        try {
            // Check for Unicode characters
            let encoded;
            
            if (this.hasUnicodeCharacters(text)) {
                // Use TextEncoder for Unicode support
                const encoder = new TextEncoder();
                const bytes = encoder.encode(text);
                encoded = this.arrayBufferToBase64(bytes);
            } else {
                // Use built-in btoa for ASCII
                encoded = btoa(text);
            }

            // Apply URL-safe encoding if checked
            if (this.urlSafeCheckbox?.checked) {
                encoded = this.makeUrlSafe(encoded);
            }

            // Apply formatting if checked
            if (this.formatCheckbox?.checked) {
                encoded = this.formatBase64(encoded);
            }

            // Display result
            if (this.base64Output) {
                this.base64Output.value = encoded;
            }

            this.updateStats();
            if (!silent) this.showSuccess('Text encoded successfully!');

        } catch (error) {
            if (!silent) this.showError('Failed to encode text: ' + error.message);
        }
    }

    decodeText(silent = false) {
        let base64 = this.base64Output?.value?.trim();
        
        if (!base64) {
            if (!silent) this.showError('Please enter Base64 text to decode');
            return;
        }

        try {
            // Clean up the Base64 string
            base64 = this.cleanBase64(base64);
            
            // Check if it's URL-safe and convert if needed
            base64 = this.fromUrlSafe(base64);

            let decoded;
            
            try {
                // First try with built-in atob
                decoded = atob(base64);
                
                // Check if the result contains non-printable characters (likely binary)
                if (this.containsBinaryData(decoded)) {
                    // Handle as binary data
                    const bytes = this.base64ToArrayBuffer(base64);
                    const decoder = new TextDecoder('utf-8', { fatal: false });
                    decoded = decoder.decode(bytes);
                } else {
                    // Try to decode as UTF-8 if it looks like it might be encoded Unicode
                    try {
                        const bytes = this.base64ToArrayBuffer(base64);
                        const decoder = new TextDecoder('utf-8', { fatal: true });
                        const utf8Decoded = decoder.decode(bytes);
                        // If no error, use UTF-8 decoded version
                        decoded = utf8Decoded;
                    } catch (e) {
                        // Fall back to atob result
                    }
                }
            } catch (e) {
                throw new Error('Invalid Base64 format');
            }

            // Display result
            if (this.textInput) {
                this.textInput.value = decoded;
            }

            this.updateStats();
            if (!silent) this.showSuccess('Base64 decoded successfully!');

        } catch (error) {
            if (!silent) this.showError('Failed to decode Base64: ' + error.message);
        }
    }

    swapInputOutput() {
        if (!this.textInput || !this.base64Output) return;

        const textValue = this.textInput.value;
        const base64Value = this.base64Output.value;

        this.textInput.value = base64Value;
        this.base64Output.value = textValue;

        this.updateStats();
        this.showSuccess('Input and output swapped!');
    }

    clearAll() {
        if (this.textInput) this.textInput.value = '';
        if (this.base64Output) this.base64Output.value = '';
        if (this.fileOutput) this.fileOutput.innerHTML = '';
        if (this.fileInput) this.fileInput.value = '';
        
        this.clearMessages();
        this.updateStats();
    }

    clearOutput() {
        if (this.base64Output) this.base64Output.value = '';
        this.updateStats();
    }

    async copyToClipboard() {
        const text = this.base64Output?.value;
        
        if (!text) {
            this.showError('No text to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('Copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showSuccess('Copied to clipboard!');
        } catch (error) {
            this.showError('Failed to copy to clipboard');
        }
        
        document.body.removeChild(textArea);
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showError('File too large. Maximum size is 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target.result;
                const base64 = result.split(',')[1]; // Remove data URL prefix
                
                if (this.base64Output) {
                    this.base64Output.value = base64;
                }

                // Show file info
                if (this.fileOutput) {
                    this.fileOutput.innerHTML = `
                        <div class="file-info">
                            <i class="fas fa-file"></i>
                            <div class="file-details">
                                <strong>${file.name}</strong>
                                <small>${this.formatFileSize(file.size)} • ${file.type || 'Unknown type'}</small>
                            </div>
                        </div>
                    `;
                }

                this.updateStats();
                this.showSuccess(`File "${file.name}" encoded to Base64!`);

            } catch (error) {
                this.showError('Failed to encode file: ' + error.message);
            }
        };

        reader.onerror = () => {
            this.showError('Failed to read file');
        };

        reader.readAsDataURL(file);
    }

    downloadResult() {
        const base64 = this.base64Output?.value;
        
        if (!base64) {
            this.showError('No Base64 data to download');
            return;
        }

        try {
            const blob = new Blob([base64], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'base64-result.txt';
            link.click();
            URL.revokeObjectURL(url);

            this.showSuccess('Base64 data downloaded!');
        } catch (error) {
            this.showError('Failed to download: ' + error.message);
        }
    }

    // Utility methods
    hasUnicodeCharacters(text) {
        return /[^\x00-\x7F]/.test(text);
    }

    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    makeUrlSafe(base64) {
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    fromUrlSafe(base64) {
        // Convert URL-safe back to standard Base64
        base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
        
        // Add padding if needed
        while (base64.length % 4) {
            base64 += '=';
        }
        
        return base64;
    }

    cleanBase64(base64) {
        // Remove whitespace and line breaks
        return base64.replace(/\s/g, '');
    }

    formatBase64(base64) {
        // Add line breaks every 64 characters
        return base64.match(/.{1,64}/g)?.join('\n') || base64;
    }

    containsBinaryData(text) {
        // Check for non-printable characters (except common whitespace)
        return /[^\x20-\x7E\t\n\r]/.test(text);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateStats() {
        const statsContainer = document.getElementById('stats-container');
        if (!statsContainer) return;

        const textLength = this.textInput?.value?.length || 0;
        const base64Length = this.base64Output?.value?.length || 0;

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Input Length:</span>
                    <span class="stat-value">${textLength} chars</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Base64 Length:</span>
                    <span class="stat-value">${base64Length} chars</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Size Increase:</span>
                    <span class="stat-value">${textLength > 0 ? Math.round((base64Length / textLength) * 100) : 0}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Status:</span>
                    <span class="stat-value">${this.getEncodingStatus()}</span>
                </div>
            </div>
        `;
    }

    getEncodingStatus() {
        const textLength = this.textInput?.value?.length || 0;
        const base64Length = this.base64Output?.value?.length || 0;

        if (textLength > 0 && base64Length > 0) {
            return 'Encoded';
        } else if (textLength === 0 && base64Length > 0) {
            return 'Ready to Decode';
        } else if (textLength > 0 && base64Length === 0) {
            return 'Ready to Encode';
        } else {
            return 'Ready';
        }
    }

    showError(message) {
        this.clearMessages();
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
            errorContainer.style.display = 'block';
        }
    }

    showSuccess(message) {
        this.clearMessages();
        const successContainer = document.getElementById('success-container');
        if (successContainer) {
            successContainer.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            successContainer.style.display = 'block';
        }
        
        // Auto-hide success messages
        setTimeout(() => {
            if (successContainer) {
                successContainer.style.display = 'none';
            }
        }, 3000);
    }

    clearMessages() {
        const errorContainer = document.getElementById('error-container');
        const successContainer = document.getElementById('success-container');
        if (errorContainer) errorContainer.style.display = 'none';
        if (successContainer) successContainer.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Base64Tool();
});

// Analytics tracking
if (typeof gtag === 'function') {
    gtag('event', 'tool_usage', {
        'event_category': 'Developer Tools',
        'event_label': 'Base64 Encoder Decoder'
    });
}
