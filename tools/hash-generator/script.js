// Hash Generator Tool - Professional Implementation
class HashGenerator {
    constructor() {
        this.selectedAlgorithms = new Set(['md5', 'sha1', 'sha256']);
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDefaultState();
    }

    bindEvents() {
        // Get DOM elements
        this.textInput = document.getElementById('text-input');
        this.generateBtn = document.getElementById('generate-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.hashResults = document.getElementById('hash-results');
        this.hashResultsContainer = document.getElementById('hash-results-container');
        this.statsContainer = document.getElementById('stats-container');
        this.algorithmCards = document.querySelectorAll('.algorithm-card');
        this.fileInput = document.getElementById('file-input');
        this.fileUploadArea = document.getElementById('file-upload-area');
        this.fileResults = document.getElementById('file-results');

        // Bind events
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generateHashes());
        }
        
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearAll());
        }

        // Real-time hash generation
        if (this.textInput) {
            this.textInput.addEventListener('input', () => this.handleTextInput());
            this.textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) this.generateHashes();
            });
        }

        // Algorithm selection
        this.algorithmCards.forEach(card => {
            card.addEventListener('click', () => this.toggleAlgorithm(card));
        });

        // File upload events
        if (this.fileUploadArea) {
            this.fileUploadArea.addEventListener('click', () => this.fileInput?.click());
            this.fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.fileUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.fileUploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
        }

        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    }

    setupDefaultState() {
        this.clearMessages();
        this.updateStats();
    }

    handleTextInput() {
        const text = this.textInput?.value;
        if (text && text.length > 0) {
            // Auto-generate hashes with a small delay
            clearTimeout(this.inputTimeout);
            this.inputTimeout = setTimeout(() => {
                this.generateHashes(true); // Silent generation
            }, 500);
        } else {
            this.clearResults();
        }
    }

    toggleAlgorithm(card) {
        const algorithm = card.dataset.algorithm;
        
        if (this.selectedAlgorithms.has(algorithm)) {
            this.selectedAlgorithms.delete(algorithm);
            card.classList.remove('active');
        } else {
            this.selectedAlgorithms.add(algorithm);
            card.classList.add('active');
        }

        // Regenerate hashes if text exists
        const text = this.textInput?.value;
        if (text && text.length > 0) {
            this.generateHashes(true);
        }

        this.updateStats();
    }

    generateHashes(silent = false) {
        const text = this.textInput?.value?.trim();
        
        if (!text) {
            if (!silent) this.showError('Please enter text to generate hashes');
            return;
        }

        if (this.selectedAlgorithms.size === 0) {
            if (!silent) this.showError('Please select at least one hash algorithm');
            return;
        }

        try {
            const results = {};
            const startTime = performance.now();

            // Generate hashes for each selected algorithm
            this.selectedAlgorithms.forEach(algorithm => {
                const hashStart = performance.now();
                let hash;

                switch (algorithm) {
                    case 'md5':
                        hash = CryptoJS.MD5(text).toString();
                        break;
                    case 'sha1':
                        hash = CryptoJS.SHA1(text).toString();
                        break;
                    case 'sha256':
                        hash = CryptoJS.SHA256(text).toString();
                        break;
                    case 'sha512':
                        hash = CryptoJS.SHA512(text).toString();
                        break;
                    case 'sha3':
                        hash = CryptoJS.SHA3(text).toString();
                        break;
                    case 'ripemd160':
                        hash = CryptoJS.RIPEMD160(text).toString();
                        break;
                    default:
                        throw new Error(`Unsupported algorithm: ${algorithm}`);
                }

                const hashTime = performance.now() - hashStart;
                results[algorithm] = {
                    hash: hash,
                    length: hash.length,
                    time: hashTime
                };
            });

            const totalTime = performance.now() - startTime;

            // Display results
            this.displayResults(results, totalTime);
            this.updateStats(text, results, totalTime);
            
            if (!silent) this.showSuccess('Hashes generated successfully!');

        } catch (error) {
            if (!silent) this.showError('Failed to generate hashes: ' + error.message);
        }
    }

    displayResults(results, totalTime) {
        if (!this.hashResultsContainer) return;

        let html = '';
        
        Object.entries(results).forEach(([algorithm, data]) => {
            const algorithmInfo = this.getAlgorithmInfo(algorithm);
            
            html += `
                <div class="hash-result-item">
                    <div class="hash-result-header">
                        <div>
                            <span class="hash-algorithm-name">${algorithmInfo.name}</span>
                            <button class="copy-hash-btn" onclick="hashGenerator.copyHash('${data.hash}', '${algorithmInfo.name}')">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <span class="hash-length">${data.length} characters</span>
                    </div>
                    <div class="hash-value" onclick="hashGenerator.selectHash(this)">${data.hash}</div>
                </div>
            `;
        });

        this.hashResultsContainer.innerHTML = html;
        
        // Show results section
        if (this.hashResults) {
            this.hashResults.style.display = 'block';
        }
    }

    selectHash(element) {
        // Select all text in the hash value
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    async copyHash(hash, algorithmName) {
        try {
            await navigator.clipboard.writeText(hash);
            this.showSuccess(`${algorithmName} hash copied to clipboard!`);
        } catch (error) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(hash);
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
            this.showSuccess('Hash copied to clipboard!');
        } catch (error) {
            this.showError('Failed to copy to clipboard');
        }
        
        document.body.removeChild(textArea);
    }

    getAlgorithmInfo(algorithm) {
        const algorithms = {
            md5: { name: 'MD5', bits: 128, secure: false },
            sha1: { name: 'SHA-1', bits: 160, secure: false },
            sha256: { name: 'SHA-256', bits: 256, secure: true },
            sha512: { name: 'SHA-512', bits: 512, secure: true },
            sha3: { name: 'SHA-3', bits: 256, secure: true },
            ripemd160: { name: 'RIPEMD-160', bits: 160, secure: true }
        };
        
        return algorithms[algorithm] || { name: algorithm.toUpperCase(), bits: 0, secure: false };
    }

    // File handling methods
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.fileUploadArea?.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.fileUploadArea?.classList.remove('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.fileUploadArea?.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            this.showError('File too large. Maximum size is 50MB.');
            return;
        }

        if (this.selectedAlgorithms.size === 0) {
            this.showError('Please select at least one hash algorithm for file processing');
            return;
        }

        this.showSuccess(`Processing file: ${file.name}...`);

        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target.result;
                const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
                
                const results = {};
                const startTime = performance.now();

                // Generate hashes for the file
                this.selectedAlgorithms.forEach(algorithm => {
                    const hashStart = performance.now();
                    let hash;

                    switch (algorithm) {
                        case 'md5':
                            hash = CryptoJS.MD5(wordArray).toString();
                            break;
                        case 'sha1':
                            hash = CryptoJS.SHA1(wordArray).toString();
                            break;
                        case 'sha256':
                            hash = CryptoJS.SHA256(wordArray).toString();
                            break;
                        case 'sha512':
                            hash = CryptoJS.SHA512(wordArray).toString();
                            break;
                        default:
                            return; // Skip unsupported algorithms for files
                    }

                    const hashTime = performance.now() - hashStart;
                    results[algorithm] = {
                        hash: hash,
                        length: hash.length,
                        time: hashTime
                    };
                });

                const totalTime = performance.now() - startTime;

                // Display file results
                this.displayFileResults(file, results, totalTime);
                this.showSuccess(`File hashes generated for ${file.name}`);

            } catch (error) {
                this.showError('Failed to process file: ' + error.message);
            }
        };

        reader.onerror = () => {
            this.showError('Failed to read file');
        };

        reader.readAsArrayBuffer(file);
    }

    displayFileResults(file, results, totalTime) {
        if (!this.fileResults) return;

        let html = `
            <div class="file-info">
                <h4><i class="fas fa-file"></i> File Hash Results</h4>
                <div class="file-details">
                    <strong>File:</strong> ${file.name}<br>
                    <strong>Size:</strong> ${this.formatFileSize(file.size)}<br>
                    <strong>Type:</strong> ${file.type || 'Unknown'}<br>
                    <strong>Processing Time:</strong> ${totalTime.toFixed(2)}ms
                </div>
            </div>
            <div class="hash-results-container">
        `;

        Object.entries(results).forEach(([algorithm, data]) => {
            const algorithmInfo = this.getAlgorithmInfo(algorithm);
            
            html += `
                <div class="hash-result-item">
                    <div class="hash-result-header">
                        <div>
                            <span class="hash-algorithm-name">${algorithmInfo.name}</span>
                            <button class="copy-hash-btn" onclick="hashGenerator.copyHash('${data.hash}', '${algorithmInfo.name}')">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <span class="hash-length">${data.length} characters</span>
                    </div>
                    <div class="hash-value" onclick="hashGenerator.selectHash(this)">${data.hash}</div>
                </div>
            `;
        });

        html += '</div>';
        
        this.fileResults.innerHTML = html;
        this.fileResults.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateStats(text = '', results = {}, totalTime = 0) {
        if (!this.statsContainer) return;

        const textLength = text.length || this.textInput?.value?.length || 0;
        const algorithmCount = this.selectedAlgorithms.size;
        const hashCount = Object.keys(results).length;

        let html = `
            <div class="stat-item">
                <span class="stat-value">${textLength}</span>
                <span class="stat-label">Characters</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${algorithmCount}</span>
                <span class="stat-label">Selected Algorithms</span>
            </div>
        `;

        if (hashCount > 0) {
            html += `
                <div class="stat-item">
                    <span class="stat-value">${hashCount}</span>
                    <span class="stat-label">Generated Hashes</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${totalTime.toFixed(1)}ms</span>
                    <span class="stat-label">Processing Time</span>
                </div>
            `;
        }

        this.statsContainer.innerHTML = html;
        this.statsContainer.style.display = textLength > 0 || hashCount > 0 ? 'grid' : 'none';
    }

    clearResults() {
        if (this.hashResults) {
            this.hashResults.style.display = 'none';
        }
        if (this.hashResultsContainer) {
            this.hashResultsContainer.innerHTML = '';
        }
        if (this.fileResults) {
            this.fileResults.style.display = 'none';
            this.fileResults.innerHTML = '';
        }
        this.updateStats();
    }

    clearAll() {
        // Clear inputs
        if (this.textInput) this.textInput.value = '';
        if (this.fileInput) this.fileInput.value = '';
        
        // Clear results and messages
        this.clearResults();
        this.clearMessages();
        
        // Reset to default algorithms
        this.selectedAlgorithms = new Set(['md5', 'sha1', 'sha256']);
        this.algorithmCards.forEach(card => {
            const algorithm = card.dataset.algorithm;
            if (this.selectedAlgorithms.has(algorithm)) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        this.updateStats();
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

// Global instance for external access
let hashGenerator;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    hashGenerator = new HashGenerator();
});

// Analytics tracking
if (typeof gtag === 'function') {
    gtag('event', 'tool_usage', {
        'event_category': 'Developer Tools',
        'event_label': 'Hash Generator'
    });
}
