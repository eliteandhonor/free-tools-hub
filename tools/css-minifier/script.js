// CSS Minifier Script

class CSSMinifier {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initTabs();
        this.updateStats();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Minify tab events
        document.getElementById('minify-btn').addEventListener('click', () => this.minifyCSS());
        document.getElementById('copy-minified-btn').addEventListener('click', () => this.copyToClipboard('css-output'));
        document.getElementById('download-minified-btn').addEventListener('click', () => this.downloadFile('css-output', 'style.min.css'));
        document.getElementById('clear-minified-btn').addEventListener('click', () => this.clearFields('minify'));

        // Beautify tab events
        document.getElementById('beautify-btn').addEventListener('click', () => this.beautifyCSS());
        document.getElementById('copy-beautified-btn').addEventListener('click', () => this.copyToClipboard('css-beautify-output'));
        document.getElementById('download-beautified-btn').addEventListener('click', () => this.downloadFile('css-beautify-output', 'style.css'));
        document.getElementById('clear-beautified-btn').addEventListener('click', () => this.clearFields('beautify'));

        // File upload
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileUpload(e));

        // Real-time minification
        document.getElementById('css-input').addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this.minifyCSS(), 500);
        });

        // Real-time beautification
        document.getElementById('css-beautify-input').addEventListener('input', () => {
            clearTimeout(this.beautifyTimer);
            this.beautifyTimer = setTimeout(() => this.beautifyCSS(), 500);
        });
    }

    initTabs() {
        this.switchTab('minify');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    minifyCSS() {
        const input = document.getElementById('css-input').value;
        const minified = this.minifyCSSCode(input);
        document.getElementById('css-output').value = minified;
        this.updateStats(input, minified);
    }

    beautifyCSS() {
        const input = document.getElementById('css-beautify-input').value;
        const beautified = this.beautifyCSSCode(input);
        document.getElementById('css-beautify-output').value = beautified;
    }

    minifyCSSCode(css) {
        if (!css) return '';

        let minified = css;

        // Remove comments
        minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');

        // Remove unnecessary whitespace
        minified = minified.replace(/\s+/g, ' ');

        // Remove whitespace around specific characters
        minified = minified.replace(/\s*{\s*/g, '{');
        minified = minified.replace(/\s*}\s*/g, '}');
        minified = minified.replace(/\s*;\s*/g, ';');
        minified = minified.replace(/\s*:\s*/g, ':');
        minified = minified.replace(/\s*,\s*/g, ',');
        minified = minified.replace(/\s*>\s*/g, '>');
        minified = minified.replace(/\s*\+\s*/g, '+');
        minified = minified.replace(/\s*~\s*/g, '~');

        // Remove unnecessary semicolons
        minified = minified.replace(/;}/g, '}');

        // Remove leading/trailing whitespace
        minified = minified.trim();

        // Remove empty rules
        minified = minified.replace(/[^{}]+{\s*}/g, '');

        // Optimize hex colors
        minified = minified.replace(/#([a-fA-F0-9])\1([a-fA-F0-9])\2([a-fA-F0-9])\3/g, '#$1$2$3');

        // Remove unnecessary quotes
        minified = minified.replace(/url\("([^"]+)"\)/g, 'url($1)');
        minified = minified.replace(/url\('([^']+)'\)/g, 'url($1)');

        // Optimize zero values
        minified = minified.replace(/\b0+\.?0*(px|em|rem|ex|ch|vw|vh|vmin|vmax|cm|mm|in|pt|pc|%)/g, '0');
        minified = minified.replace(/\b0\.([0-9]+)/g, '.$1');

        return minified;
    }

    beautifyCSSCode(css) {
        if (!css) return '';

        let beautified = css;
        let indentLevel = 0;
        const indent = '  '; // 2 spaces

        // First, ensure we have proper spacing
        beautified = beautified.replace(/\s+/g, ' ');
        beautified = beautified.replace(/\s*{\s*/g, ' {\n');
        beautified = beautified.replace(/\s*}\s*/g, '\n}\n');
        beautified = beautified.replace(/\s*;\s*/g, ';\n');
        beautified = beautified.replace(/\s*,\s*/g, ',\n');

        // Split into lines and format
        const lines = beautified.split('\n');
        const formattedLines = [];

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // Decrease indent for closing braces
            if (line === '}') {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            // Add indentation
            const indentedLine = indent.repeat(indentLevel) + line;
            formattedLines.push(indentedLine);

            // Increase indent for opening braces
            if (line.endsWith('{')) {
                indentLevel++;
            }
        }

        // Join and clean up
        beautified = formattedLines.join('\n');
        
        // Clean up extra newlines
        beautified = beautified.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // Ensure selector and opening brace are on same line
        beautified = beautified.replace(/,\n(\s*)/g, ',\n$1');
        
        return beautified.trim();
    }

    updateStats(original = '', minified = '') {
        const originalSize = new Blob([original]).size;
        const minifiedSize = new Blob([minified]).size;
        const savedBytes = originalSize - minifiedSize;
        const compressionRatio = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(1) : 0;

        document.getElementById('original-size').textContent = originalSize.toLocaleString();
        document.getElementById('minified-size').textContent = minifiedSize.toLocaleString();
        document.getElementById('saved-bytes').textContent = savedBytes.toLocaleString();
        document.getElementById('compression-ratio').textContent = compressionRatio + '%';
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'text/css' && !file.name.endsWith('.css')) {
            this.showNotification('Please select a valid CSS file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('css-input').value = e.target.result;
            this.minifyCSS();
            this.showNotification('CSS file loaded successfully!', 'success');
        };
        reader.readAsText(file);
    }

    downloadFile(outputId, filename) {
        const output = document.getElementById(outputId);
        
        if (!output.value.trim()) {
            this.showNotification('No content to download!', 'warning');
            return;
        }

        const blob = new Blob([output.value], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification(`${filename} downloaded successfully!`, 'success');
    }

    clearFields(type) {
        if (type === 'minify') {
            document.getElementById('css-input').value = '';
            document.getElementById('css-output').value = '';
            this.updateStats();
        } else if (type === 'beautify') {
            document.getElementById('css-beautify-input').value = '';
            document.getElementById('css-beautify-output').value = '';
        }
        
        this.showNotification('Fields cleared!', 'success');
    }

    copyToClipboard(outputId) {
        const output = document.getElementById(outputId);
        
        if (!output.value.trim()) {
            this.showNotification('No content to copy!', 'warning');
            return;
        }

        output.select();
        output.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            this.showNotification('CSS copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for modern browsers
            navigator.clipboard.writeText(output.value).then(() => {
                this.showNotification('CSS copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy CSS', 'error');
            });
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CSSMinifier();
});
