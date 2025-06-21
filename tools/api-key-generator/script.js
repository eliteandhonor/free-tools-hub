// API Key Generator Tool
class APIKeyGenerator {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializePresets();
        this.generatedKey = '';
    }
    
    initializeElements() {
        this.form = document.getElementById('apiKeyForm');
        this.presetTemplates = document.getElementById('presetTemplates');
        this.keyLengthInput = document.getElementById('keyLength');
        this.keyFormatSelect = document.getElementById('keyFormat');
        this.keyPrefixInput = document.getElementById('keyPrefix');
        this.includeUppercaseCheck = document.getElementById('includeUppercase');
        this.includeLowercaseCheck = document.getElementById('includeLowercase');
        this.includeNumbersCheck = document.getElementById('includeNumbers');
        this.includeSymbolsCheck = document.getElementById('includeSymbols');
        this.excludeSimilarCheck = document.getElementById('excludeSimilar');
        this.excludeAmbiguousCheck = document.getElementById('excludeAmbiguous');
        this.resultSection = document.getElementById('resultSection');
        this.apiKeyDisplay = document.getElementById('apiKeyDisplay');
        this.apiKeyText = document.getElementById('apiKeyText');
        this.copyOverlay = document.getElementById('copyOverlay');
        this.keyDetails = document.getElementById('keyDetails');
        this.copyKeyBtn = document.getElementById('copyKey');
        this.regenerateKeyBtn = document.getElementById('regenerateKey');
    }
    
    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleGenerate(e));
        this.presetTemplates.addEventListener('click', (e) => this.handlePresetClick(e));
        this.apiKeyDisplay.addEventListener('click', () => this.copyToClipboard());
        this.copyKeyBtn.addEventListener('click', () => this.copyToClipboard());
        this.regenerateKeyBtn.addEventListener('click', () => this.regenerateKey());
        
        // Real-time validation
        this.keyLengthInput.addEventListener('input', () => this.validateLength());
        this.keyFormatSelect.addEventListener('change', () => this.handleFormatChange());
    }
    
    initializePresets() {
        this.presets = {
            standard: {
                length: 32,
                format: 'plain',
                prefix: '',
                uppercase: true,
                lowercase: true,
                numbers: true,
                symbols: false,
                excludeSimilar: true,
                excludeAmbiguous: false
            },
            simple: {
                length: 24,
                format: 'plain',
                prefix: '',
                uppercase: true,
                lowercase: true,
                numbers: true,
                symbols: false,
                excludeSimilar: true,
                excludeAmbiguous: true
            },
            complex: {
                length: 64,
                format: 'plain',
                prefix: '',
                uppercase: true,
                lowercase: true,
                numbers: true,
                symbols: true,
                excludeSimilar: false,
                excludeAmbiguous: false
            },
            hex: {
                length: 40,
                format: 'hex',
                prefix: '',
                uppercase: false,
                lowercase: true,
                numbers: true,
                symbols: false,
                excludeSimilar: false,
                excludeAmbiguous: true
            }
        };
    }
    
    handlePresetClick(e) {
        const presetCard = e.target.closest('.preset-card');
        if (!presetCard) return;
        
        // Update active state
        document.querySelectorAll('.preset-card').forEach(card => card.classList.remove('active'));
        presetCard.classList.add('active');
        
        // Apply preset
        const presetName = presetCard.dataset.preset;
        this.applyPreset(presetName);
    }
    
    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) return;
        
        this.keyLengthInput.value = preset.length;
        this.keyFormatSelect.value = preset.format;
        this.keyPrefixInput.value = preset.prefix;
        this.includeUppercaseCheck.checked = preset.uppercase;
        this.includeLowercaseCheck.checked = preset.lowercase;
        this.includeNumbersCheck.checked = preset.numbers;
        this.includeSymbolsCheck.checked = preset.symbols;
        this.excludeSimilarCheck.checked = preset.excludeSimilar;
        this.excludeAmbiguousCheck.checked = preset.excludeAmbiguous;
    }
    
    validateLength() {
        const length = parseInt(this.keyLengthInput.value);
        
        if (length < 8) {
            this.keyLengthInput.value = 8;
        } else if (length > 128) {
            this.keyLengthInput.value = 128;
        }
    }
    
    handleFormatChange() {
        const format = this.keyFormatSelect.value;
        
        // Adjust settings based on format
        if (format === 'hex') {
            this.includeUppercaseCheck.checked = false;
            this.includeLowercaseCheck.checked = true;
            this.includeNumbersCheck.checked = true;
            this.includeSymbolsCheck.checked = false;
        } else if (format === 'base64') {
            this.includeUppercaseCheck.checked = true;
            this.includeLowercaseCheck.checked = true;
            this.includeNumbersCheck.checked = true;
            this.includeSymbolsCheck.checked = false;
        }
    }
    
    handleGenerate(e) {
        e.preventDefault();
        
        const length = parseInt(this.keyLengthInput.value);
        
        if (length < 8 || length > 128) {
            this.showError('Key length must be between 8 and 128 characters');
            return;
        }
        
        if (!this.hasValidCharacterSet()) {
            this.showError('Please select at least one character type');
            return;
        }
        
        this.generateAPIKey();
    }
    
    hasValidCharacterSet() {
        return this.includeUppercaseCheck.checked || 
               this.includeLowercaseCheck.checked || 
               this.includeNumbersCheck.checked || 
               this.includeSymbolsCheck.checked;
    }
    
    generateAPIKey() {
        const length = parseInt(this.keyLengthInput.value);
        const format = this.keyFormatSelect.value;
        const prefix = this.keyPrefixInput.value.trim();
        
        let key = '';
        
        if (format === 'uuid') {
            key = this.generateUUID();
        } else {
            const charset = this.buildCharacterSet();
            const effectiveLength = length - prefix.length;
            
            if (effectiveLength <= 0) {
                this.showError('Key length must be longer than the prefix');
                return;
            }
            
            if (format === 'hex') {
                key = this.generateHexKey(effectiveLength);
            } else if (format === 'base64') {
                key = this.generateBase64Key(effectiveLength);
            } else {
                key = this.generateRandomKey(charset, effectiveLength);
            }
        }
        
        // Add prefix
        if (prefix && format !== 'uuid') {
            key = prefix + key;
        }
        
        this.generatedKey = key;
        this.displayResult(key);
    }
    
    buildCharacterSet() {
        let charset = '';
        
        if (this.includeUppercaseCheck.checked) {
            charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        
        if (this.includeLowercaseCheck.checked) {
            charset += 'abcdefghijklmnopqrstuvwxyz';
        }
        
        if (this.includeNumbersCheck.checked) {
            charset += '0123456789';
        }
        
        if (this.includeSymbolsCheck.checked) {
            charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        }
        
        // Apply exclusions
        if (this.excludeSimilarCheck.checked) {
            charset = charset.replace(/[0Ol1]/g, '');
        }
        
        if (this.excludeAmbiguousCheck.checked) {
            charset = charset.replace(/[{}[\]()]/g, '');
        }
        
        return charset;
    }
    
    generateRandomKey(charset, length) {
        if (charset.length === 0) return '';
        
        let key = '';
        const randomValues = new Uint8Array(length);
        crypto.getRandomValues(randomValues);
        
        for (let i = 0; i < length; i++) {
            key += charset[randomValues[i] % charset.length];
        }
        
        return key;
    }
    
    generateHexKey(length) {
        const hexChars = '0123456789abcdef';
        let key = '';
        const randomValues = new Uint8Array(Math.ceil(length / 2));
        crypto.getRandomValues(randomValues);
        
        for (let i = 0; i < randomValues.length && key.length < length; i++) {
            const hex = randomValues[i].toString(16).padStart(2, '0');
            key += hex;
        }
        
        return key.substring(0, length);
    }
    
    generateBase64Key(length) {
        const randomBytes = new Uint8Array(Math.ceil(length * 3 / 4));
        crypto.getRandomValues(randomBytes);
        
        let base64 = btoa(String.fromCharCode(...randomBytes));
        // Remove padding and non-alphanumeric characters
        base64 = base64.replace(/[+/=]/g, '');
        
        return base64.substring(0, length);
    }
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    displayResult(key) {
        this.apiKeyText.textContent = key;
        this.updateKeyDetails(key);
        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    updateKeyDetails(key) {
        const format = this.keyFormatSelect.value;
        const entropy = this.calculateEntropy(key);
        const strength = this.getStrengthRating(entropy);
        
        this.keyDetails.innerHTML = `
            <div class="key-detail">
                <div class="key-detail-value">${key.length}</div>
                <div class="key-detail-label">Length</div>
            </div>
            <div class="key-detail">
                <div class="key-detail-value">${format.toUpperCase()}</div>
                <div class="key-detail-label">Format</div>
            </div>
            <div class="key-detail">
                <div class="key-detail-value">${entropy.toFixed(1)}</div>
                <div class="key-detail-label">Entropy (bits)</div>
            </div>
            <div class="key-detail">
                <div class="key-detail-value" style="color: ${this.getStrengthColor(strength)}">${strength}</div>
                <div class="key-detail-label">Strength</div>
            </div>
        `;
    }
    
    calculateEntropy(key) {
        const charset = this.buildCharacterSet();
        if (charset.length === 0) return 0;
        
        // For UUID, use fixed charset size
        if (this.keyFormatSelect.value === 'uuid') {
            return 32 * Math.log2(16); // 32 hex chars (excluding hyphens)
        }
        
        // For hex format
        if (this.keyFormatSelect.value === 'hex') {
            return key.length * Math.log2(16);
        }
        
        // For base64 format  
        if (this.keyFormatSelect.value === 'base64') {
            return key.length * Math.log2(64);
        }
        
        // For regular format
        return key.length * Math.log2(charset.length);
    }
    
    getStrengthRating(entropy) {
        if (entropy < 40) return 'Weak';
        if (entropy < 64) return 'Fair';
        if (entropy < 80) return 'Good';
        if (entropy < 128) return 'Strong';
        return 'Very Strong';
    }
    
    getStrengthColor(strength) {
        const colors = {
            'Weak': '#ef4444',
            'Fair': '#f97316',
            'Good': '#eab308',
            'Strong': '#22c55e',
            'Very Strong': '#16a34a'
        };
        return colors[strength] || '#6b7280';
    }
    
    async copyToClipboard() {
        if (!this.generatedKey) return;
        
        try {
            await navigator.clipboard.writeText(this.generatedKey);
            this.showCopyFeedback();
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.generatedKey;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showCopyFeedback();
        }
    }
    
    showCopyFeedback() {
        this.copyOverlay.classList.add('show');
        setTimeout(() => {
            this.copyOverlay.classList.remove('show');
        }, 2000);
    }
    
    regenerateKey() {
        this.generateAPIKey();
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
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
}

// Initialize the API key generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new APIKeyGenerator();
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
