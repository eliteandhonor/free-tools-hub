// JSON Formatter Tool - Professional Implementation
class JSONFormatter {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDefaultState();
    }

    bindEvents() {
        // Get DOM elements
        this.inputTextarea = document.getElementById('json-input');
        this.outputTextarea = document.getElementById('json-output');
        this.formatBtn = document.getElementById('format-btn');
        this.minifyBtn = document.getElementById('minify-btn');
        this.validateBtn = document.getElementById('validate-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.copyBtn = document.getElementById('copy-btn');
        this.downloadBtn = document.getElementById('download-btn');
        this.fileInput = document.getElementById('file-input');
        this.uploadBtn = document.getElementById('upload-btn');
        this.errorContainer = document.getElementById('error-container');
        this.successContainer = document.getElementById('success-container');

        // Bind events
        if (this.formatBtn) this.formatBtn.addEventListener('click', () => this.formatJSON());
        if (this.minifyBtn) this.minifyBtn.addEventListener('click', () => this.minifyJSON());
        if (this.validateBtn) this.validateBtn.addEventListener('click', () => this.validateJSON());
        if (this.clearBtn) this.clearBtn.addEventListener('click', () => this.clearAll());
        if (this.copyBtn) this.copyBtn.addEventListener('click', () => this.copyOutput());
        if (this.downloadBtn) this.downloadBtn.addEventListener('click', () => this.downloadJSON());
        if (this.uploadBtn) this.uploadBtn.addEventListener('click', () => this.fileInput?.click());
        if (this.fileInput) this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Auto-validate on input
        if (this.inputTextarea) {
            this.inputTextarea.addEventListener('input', () => {
                this.clearMessages();
                if (this.inputTextarea.value.trim()) {
                    this.validateJSON(false); // Silent validation
                }
            });
        }
    }

    setupDefaultState() {
        if (this.inputTextarea && !this.inputTextarea.value) {
            this.inputTextarea.placeholder = `{
  "name": "Free Tools Hub",
  "description": "Professional online tools for developers",
  "tools": [
    {
      "name": "JSON Formatter",
      "category": "Developer Tools",
      "features": ["Format", "Validate", "Minify"]
    }
  ],
  "active": true
}`;
        }
    }

    formatJSON() {
        const input = this.inputTextarea?.value?.trim();
        if (!input) {
            this.showError('Please enter JSON data to format');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 2);
            
            if (this.outputTextarea) {
                this.outputTextarea.value = formatted;
            }
            
            this.showSuccess('JSON formatted successfully!');
            this.updateStats(formatted);
        } catch (error) {
            this.showError(`Invalid JSON: ${error.message}`);
        }
    }

    minifyJSON() {
        const input = this.inputTextarea?.value?.trim();
        if (!input) {
            this.showError('Please enter JSON data to minify');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);
            
            if (this.outputTextarea) {
                this.outputTextarea.value = minified;
            }
            
            this.showSuccess('JSON minified successfully!');
            this.updateStats(minified);
        } catch (error) {
            this.showError(`Invalid JSON: ${error.message}`);
        }
    }

    validateJSON(showMessage = true) {
        const input = this.inputTextarea?.value?.trim();
        if (!input) {
            if (showMessage) this.showError('Please enter JSON data to validate');
            return false;
        }

        try {
            JSON.parse(input);
            if (showMessage) this.showSuccess('✓ Valid JSON');
            return true;
        } catch (error) {
            if (showMessage) this.showError(`Invalid JSON: ${error.message}`);
            return false;
        }
    }

    clearAll() {
        if (this.inputTextarea) this.inputTextarea.value = '';
        if (this.outputTextarea) this.outputTextarea.value = '';
        this.clearMessages();
        this.clearStats();
    }

    copyOutput() {
        const output = this.outputTextarea?.value;
        if (!output) {
            this.showError('No output to copy');
            return;
        }

        navigator.clipboard.writeText(output).then(() => {
            this.showSuccess('Copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            this.outputTextarea.select();
            document.execCommand('copy');
            this.showSuccess('Copied to clipboard!');
        });
    }

    downloadJSON() {
        const output = this.outputTextarea?.value;
        if (!output) {
            this.showError('No JSON to download');
            return;
        }

        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('JSON file downloaded!');
    }

    handleFileUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.json')) {
            this.showError('Please select a JSON file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.inputTextarea) {
                this.inputTextarea.value = e.target?.result || '';
                this.validateJSON(false);
            }
        };
        reader.onerror = () => {
            this.showError('Error reading file');
        };
        reader.readAsText(file);
    }

    updateStats(jsonString) {
        const statsContainer = document.getElementById('json-stats');
        if (!statsContainer) return;

        try {
            const parsed = JSON.parse(jsonString);
            const stats = this.calculateJSONStats(parsed, jsonString);
            
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Size:</span>
                        <span class="stat-value">${this.formatBytes(stats.size)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Objects:</span>
                        <span class="stat-value">${stats.objects}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Arrays:</span>
                        <span class="stat-value">${stats.arrays}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Properties:</span>
                        <span class="stat-value">${stats.properties}</span>
                    </div>
                </div>
            `;
        } catch (error) {
            // Ignore stats update errors
        }
    }

    calculateJSONStats(obj, jsonString) {
        let objects = 0;
        let arrays = 0;
        let properties = 0;

        function traverse(item) {
            if (Array.isArray(item)) {
                arrays++;
                item.forEach(traverse);
            } else if (typeof item === 'object' && item !== null) {
                objects++;
                properties += Object.keys(item).length;
                Object.values(item).forEach(traverse);
            }
        }

        traverse(obj);

        return {
            size: new Blob([jsonString]).size,
            objects,
            arrays,
            properties
        };
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    clearStats() {
        const statsContainer = document.getElementById('json-stats');
        if (statsContainer) {
            statsContainer.innerHTML = '';
        }
    }

    showError(message) {
        this.clearMessages();
        if (this.errorContainer) {
            this.errorContainer.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
            this.errorContainer.style.display = 'block';
        }
    }

    showSuccess(message) {
        this.clearMessages();
        if (this.successContainer) {
            this.successContainer.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            this.successContainer.style.display = 'block';
        }
        
        // Auto-hide success messages
        setTimeout(() => {
            if (this.successContainer) {
                this.successContainer.style.display = 'none';
            }
        }, 3000);
    }

    clearMessages() {
        if (this.errorContainer) this.errorContainer.style.display = 'none';
        if (this.successContainer) this.successContainer.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JSONFormatter();
});

// Analytics tracking
if (typeof gtag === 'function') {
    gtag('event', 'tool_usage', {
        'event_category': 'Developer Tools',
        'event_label': 'JSON Formatter'
    });
}
