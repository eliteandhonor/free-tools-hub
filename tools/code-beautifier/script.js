// Code Beautifier Script

class CodeBeautifier {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStats();
    }

    bindEvents() {
        // Main action buttons
        document.getElementById('beautify-btn').addEventListener('click', () => this.beautifyCode());
        document.getElementById('minify-btn').addEventListener('click', () => this.minifyCode());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());

        // File operations
        document.getElementById('paste-btn').addEventListener('click', () => this.pasteFromClipboard());
        document.getElementById('upload-btn').addEventListener('click', () => this.triggerFileUpload());
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('download-btn').addEventListener('click', () => this.downloadCode());

        // Real-time updates
        document.getElementById('code-input').addEventListener('input', () => this.updateStats());
        document.getElementById('language-select').addEventListener('change', () => this.updateStats());
        document.getElementById('indent-size').addEventListener('change', () => this.updateStats());
        document.getElementById('max-line-length').addEventListener('change', () => this.updateStats());
    }

    beautifyCode() {
        const input = document.getElementById('code-input').value;
        const language = document.getElementById('language-select').value;
        const indentSize = document.getElementById('indent-size').value;
        const maxLineLength = parseInt(document.getElementById('max-line-length').value);

        if (!input.trim()) {
            this.showNotification('Please enter some code to beautify', 'warning');
            return;
        }

        try {
            let beautified = '';
            const options = {
                indent_size: indentSize === 'tab' ? 1 : parseInt(indentSize),
                indent_char: indentSize === 'tab' ? '\t' : ' ',
                max_preserve_newlines: 2,
                preserve_newlines: true,
                keep_array_indentation: false,
                break_chained_methods: false,
                indent_scripts: 'normal',
                brace_style: 'collapse',
                space_before_conditional: true,
                unescape_strings: false,
                jslint_happy: false,
                end_with_newline: true,
                wrap_line_length: maxLineLength,
                indent_inner_html: false,
                comma_first: false,
                e4x: false,
                indent_empty_lines: false
            };

            switch (language) {
                case 'html':
                    beautified = html_beautify(input, options);
                    break;
                case 'css':
                    beautified = css_beautify(input, options);
                    break;
                case 'js':
                    beautified = js_beautify(input, options);
                    break;
                case 'json':
                    try {
                        const parsed = JSON.parse(input);
                        beautified = JSON.stringify(parsed, null, indentSize === 'tab' ? '\t' : parseInt(indentSize));
                    } catch (e) {
                        throw new Error('Invalid JSON format');
                    }
                    break;
                default:
                    throw new Error('Unsupported language');
            }

            document.getElementById('code-output').value = beautified;
            this.updateStats();
            this.showNotification('Code beautified successfully!', 'success');

        } catch (error) {
            this.showNotification('Error beautifying code: ' + error.message, 'error');
            console.error('Beautification error:', error);
        }
    }

    minifyCode() {
        const input = document.getElementById('code-input').value;
        const language = document.getElementById('language-select').value;

        if (!input.trim()) {
            this.showNotification('Please enter some code to minify', 'warning');
            return;
        }

        try {
            let minified = '';

            switch (language) {
                case 'html':
                    // Basic HTML minification
                    minified = input
                        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
                        .replace(/>\s+</g, '><') // Remove whitespace between tags
                        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                        .trim();
                    break;
                case 'css':
                    // Basic CSS minification
                    minified = input
                        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
                        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                        .replace(/;\s+/g, ';') // Remove spaces after semicolons
                        .replace(/:\s+/g, ':') // Remove spaces after colons
                        .replace(/,\s+/g, ',') // Remove spaces after commas
                        .replace(/{\s+/g, '{') // Remove spaces after opening braces
                        .replace(/\s+}/g, '}') // Remove spaces before closing braces
                        .trim();
                    break;
                case 'js':
                    // Basic JavaScript minification (simple approach)
                    minified = input
                        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
                        .replace(/\/\/.*$/gm, '') // Remove line comments
                        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                        .replace(/;\s+/g, ';') // Remove spaces after semicolons
                        .replace(/,\s+/g, ',') // Remove spaces after commas
                        .replace(/{\s+/g, '{') // Remove spaces after opening braces
                        .replace(/\s+}/g, '}') // Remove spaces before closing braces
                        .trim();
                    break;
                case 'json':
                    try {
                        const parsed = JSON.parse(input);
                        minified = JSON.stringify(parsed);
                    } catch (e) {
                        throw new Error('Invalid JSON format');
                    }
                    break;
                default:
                    throw new Error('Unsupported language');
            }

            document.getElementById('code-output').value = minified;
            this.updateStats();
            this.showNotification('Code minified successfully!', 'success');

        } catch (error) {
            this.showNotification('Error minifying code: ' + error.message, 'error');
            console.error('Minification error:', error);
        }
    }

    clearAll() {
        document.getElementById('code-input').value = '';
        document.getElementById('code-output').value = '';
        this.updateStats();
        this.showNotification('All fields cleared!', 'success');
    }

    async pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('code-input').value = text;
            this.updateStats();
            this.showNotification('Code pasted from clipboard!', 'success');
        } catch (error) {
            this.showNotification('Could not paste from clipboard', 'error');
        }
    }

    triggerFileUpload() {
        document.getElementById('file-input').click();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['.html', '.css', '.js', '.json', '.htm', '.txt'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validTypes.includes(fileExtension)) {
            this.showNotification('Please select a valid code file (HTML, CSS, JS, JSON)', 'error');
            return;
        }

        // Auto-detect language from file extension
        const languageMap = {
            '.html': 'html',
            '.htm': 'html',
            '.css': 'css',
            '.js': 'js',
            '.json': 'json'
        };

        if (languageMap[fileExtension]) {
            document.getElementById('language-select').value = languageMap[fileExtension];
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('code-input').value = e.target.result;
            this.updateStats();
            this.showNotification(`File "${file.name}" loaded successfully!`, 'success');
        };
        reader.onerror = () => {
            this.showNotification('Error reading file', 'error');
        };
        reader.readAsText(file);
    }

    copyToClipboard() {
        const output = document.getElementById('code-output');
        
        if (!output.value.trim()) {
            this.showNotification('No code to copy!', 'warning');
            return;
        }

        output.select();
        output.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            this.showNotification('Code copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for modern browsers
            navigator.clipboard.writeText(output.value).then(() => {
                this.showNotification('Code copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy code', 'error');
            });
        }
    }

    downloadCode() {
        const output = document.getElementById('code-output');
        const language = document.getElementById('language-select').value;
        
        if (!output.value.trim()) {
            this.showNotification('No code to download!', 'warning');
            return;
        }

        // Determine file extension
        const extensions = {
            'html': 'html',
            'css': 'css',
            'js': 'js',
            'json': 'json'
        };

        const extension = extensions[language] || 'txt';
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `formatted-code-${timestamp}.${extension}`;

        // Create download
        const blob = new Blob([output.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification(`Code downloaded as ${filename}`, 'success');
    }

    updateStats() {
        const input = document.getElementById('code-input').value;
        const output = document.getElementById('code-output').value;

        // Count lines
        const inputLines = input ? input.split('\n').length : 0;
        const outputLines = output ? output.split('\n').length : 0;

        // Calculate sizes
        const inputSize = new Blob([input]).size;
        const outputSize = new Blob([output]).size;

        // Update display
        document.getElementById('input-lines').textContent = inputLines.toLocaleString();
        document.getElementById('output-lines').textContent = outputLines.toLocaleString();
        document.getElementById('input-size').textContent = inputSize.toLocaleString();
        document.getElementById('output-size').textContent = outputSize.toLocaleString();
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
    new CodeBeautifier();
});
