// HTML Minifier Script

class HTMLMinifier {
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
        document.getElementById('minify-btn').addEventListener('click', () => this.minifyHTML());
        document.getElementById('copy-minified-btn').addEventListener('click', () => this.copyToClipboard('html-output'));
        document.getElementById('download-minified-btn').addEventListener('click', () => this.downloadFile('html-output', 'index.min.html'));
        document.getElementById('clear-minified-btn').addEventListener('click', () => this.clearFields('minify'));

        // Beautify tab events
        document.getElementById('beautify-btn').addEventListener('click', () => this.beautifyHTML());
        document.getElementById('copy-beautified-btn').addEventListener('click', () => this.copyToClipboard('html-beautify-output'));
        document.getElementById('download-beautified-btn').addEventListener('click', () => this.downloadFile('html-beautify-output', 'index.html'));
        document.getElementById('clear-beautified-btn').addEventListener('click', () => this.clearFields('beautify'));

        // File upload
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileUpload(e));

        // Real-time minification
        document.getElementById('html-input').addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this.minifyHTML(), 500);
        });

        // Real-time beautification
        document.getElementById('html-beautify-input').addEventListener('input', () => {
            clearTimeout(this.beautifyTimer);
            this.beautifyTimer = setTimeout(() => this.beautifyHTML(), 500);
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

    minifyHTML() {
        const input = document.getElementById('html-input').value;
        const minified = this.minifyHTMLCode(input);
        document.getElementById('html-output').value = minified;
        this.updateStats(input, minified);
    }

    beautifyHTML() {
        const input = document.getElementById('html-beautify-input').value;
        const beautified = this.beautifyHTMLCode(input);
        document.getElementById('html-beautify-output').value = beautified;
    }

    minifyHTMLCode(html) {
        if (!html) return '';

        let minified = html;

        // Remove HTML comments (but preserve conditional comments)
        minified = minified.replace(/<!--(?!\s*(?:\[if\s|\]|>))[\s\S]*?-->/g, '');

        // Remove unnecessary whitespace between tags
        minified = minified.replace(/>\s+</g, '><');

        // Remove leading and trailing whitespace
        minified = minified.replace(/^\s+|\s+$/gm, '');

        // Remove empty lines
        minified = minified.replace(/\n\s*\n/g, '\n');

        // Remove whitespace at the beginning and end of lines
        minified = minified.replace(/^\s+|\s+$/gm, '');

        // Compress multiple spaces into single spaces (but preserve spaces in content)
        minified = minified.replace(/\s+/g, ' ');

        // Remove spaces around equals signs in attributes
        minified = minified.replace(/\s*=\s*/g, '=');

        // Remove quotes around attribute values that don't need them
        minified = minified.replace(/=["']([a-zA-Z0-9\-_]+)["']/g, '=$1');

        // Remove optional closing tags (be careful with this)
        // Only remove safe ones
        minified = minified.replace(/<\/(?:li|dt|dd|option|thead|tbody|tfoot|tr|td|th)>\s*(?=<\/|\s*<(?:li|dt|dd|option|thead|tbody|tfoot|tr|td|th|ul|ol|dl|select|table))/gi, '');

        // Remove empty attributes
        minified = minified.replace(/\s+[a-zA-Z-]+=""/g, '');

        // Trim the result
        minified = minified.trim();

        return minified;
    }

    beautifyHTMLCode(html) {
        if (!html) return '';

        // Self-closing tags that don't need closing tags
        const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        
        // Inline tags that shouldn't cause line breaks
        const inlineTags = ['a', 'abbr', 'acronym', 'b', 'bdi', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'dfn', 'em', 'i', 'kbd', 'label', 'map', 'mark', 'meter', 'noscript', 'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'u', 'var', 'wbr'];

        let beautified = html;
        let indentLevel = 0;
        const indent = '  '; // 2 spaces

        // First, normalize the HTML
        beautified = beautified.replace(/>\s*</g, '><');
        
        // Split by tags
        const tokens = beautified.split(/(<[^>]*>)/);
        const result = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            if (!token) continue;

            if (token.startsWith('<')) {
                // This is a tag
                const tagName = this.getTagName(token);
                const isClosingTag = token.startsWith('</');
                const isSelfClosing = selfClosingTags.includes(tagName) || token.endsWith('/>');
                const isInline = inlineTags.includes(tagName);

                if (isClosingTag) {
                    indentLevel = Math.max(0, indentLevel - 1);
                }

                if (!isInline || result.length === 0 || result[result.length - 1].trim().endsWith('>')) {
                    result.push('\n' + indent.repeat(indentLevel) + token);
                } else {
                    result.push(token);
                }

                if (!isClosingTag && !isSelfClosing && !isInline) {
                    indentLevel++;
                }
            } else {
                // This is text content
                const trimmedToken = token.trim();
                if (trimmedToken) {
                    if (result.length > 0 && !result[result.length - 1].trim().endsWith('>')) {
                        result.push(token);
                    } else {
                        result.push('\n' + indent.repeat(indentLevel) + trimmedToken);
                    }
                }
            }
        }

        beautified = result.join('');
        
        // Clean up extra newlines
        beautified = beautified.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // Ensure DOCTYPE and html tag are not indented
        beautified = beautified.replace(/^\s*<!DOCTYPE/i, '<!DOCTYPE');
        beautified = beautified.replace(/^\s*<html/im, '<html');
        
        return beautified.trim();
    }

    getTagName(tag) {
        const match = tag.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/);
        return match ? match[1].toLowerCase() : '';
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

        if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
            this.showNotification('Please select a valid HTML file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('html-input').value = e.target.result;
            this.minifyHTML();
            this.showNotification('HTML file loaded successfully!', 'success');
        };
        reader.readAsText(file);
    }

    downloadFile(outputId, filename) {
        const output = document.getElementById(outputId);
        
        if (!output.value.trim()) {
            this.showNotification('No content to download!', 'warning');
            return;
        }

        const blob = new Blob([output.value], { type: 'text/html' });
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
            document.getElementById('html-input').value = '';
            document.getElementById('html-output').value = '';
            this.updateStats();
        } else if (type === 'beautify') {
            document.getElementById('html-beautify-input').value = '';
            document.getElementById('html-beautify-output').value = '';
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
            this.showNotification('HTML copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for modern browsers
            navigator.clipboard.writeText(output.value).then(() => {
                this.showNotification('HTML copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy HTML', 'error');
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
    new HTMLMinifier();
});
