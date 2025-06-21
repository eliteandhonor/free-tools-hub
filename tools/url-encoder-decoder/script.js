/**
 * URL Encoder/Decoder Tool
 * Professional URL encoding and decoding functionality
 */

class URLEncoderDecoder {
    constructor() {
        this.currentMode = 'standard';
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeModes();
        this.loadFromLocalStorage();
    }

    bindEvents() {
        // Mode switching
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', (e) => this.switchMode(e.target.closest('.mode-card').dataset.mode));
        });

        // Standard URL panel events
        document.getElementById('standard-encode-btn').addEventListener('click', () => this.standardEncode());
        document.getElementById('standard-decode-btn').addEventListener('click', () => this.standardDecode());
        document.getElementById('standard-swap-btn').addEventListener('click', () => this.standardSwap());
        document.getElementById('standard-copy-btn').addEventListener('click', () => this.copyToClipboard('standard-output'));
        document.getElementById('standard-clear-btn').addEventListener('click', () => this.standardClear());
        document.getElementById('standard-input').addEventListener('input', () => this.onStandardInput());

        // Component URL panel events
        document.getElementById('component-encode-btn').addEventListener('click', () => this.componentEncode());
        document.getElementById('component-decode-btn').addEventListener('click', () => this.componentDecode());
        document.getElementById('component-build-btn').addEventListener('click', () => this.componentBuild());
        document.getElementById('component-parse-btn').addEventListener('click', () => this.componentParse());

        // Query parameters panel events
        document.getElementById('query-encode-btn').addEventListener('click', () => this.queryEncode());
        document.getElementById('query-decode-btn').addEventListener('click', () => this.queryDecode());
        document.getElementById('query-format-btn').addEventListener('click', () => this.queryFormat());
        document.getElementById('query-swap-btn').addEventListener('click', () => this.querySwap());
        document.getElementById('query-copy-btn').addEventListener('click', () => this.copyToClipboard('query-output'));
        document.getElementById('query-clear-btn').addEventListener('click', () => this.queryClear());
        document.getElementById('query-input').addEventListener('input', () => this.onQueryInput());

        // Component input events
        ['protocol', 'host', 'port', 'path', 'query', 'fragment'].forEach(component => {
            const element = document.getElementById(`component-${component}`);
            if (element) {
                element.addEventListener('input', () => this.onComponentInput());
            }
        });

        // Auto-save functionality
        setInterval(() => this.saveToLocalStorage(), 5000);
        window.addEventListener('beforeunload', () => this.saveToLocalStorage());
    }

    initializeModes() {
        this.switchMode('standard');
    }

    switchMode(mode) {
        if (mode === this.currentMode) return;

        // Update mode cards
        document.querySelectorAll('.mode-card').forEach(card => {
            card.classList.toggle('active', card.dataset.mode === mode);
        });

        // Update panels
        document.querySelectorAll('.tool-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${mode}-panel`);
        });

        this.currentMode = mode;
        this.trackModeSwitch(mode);
    }

    // Standard URL Methods
    standardEncode() {
        try {
            const input = document.getElementById('standard-input').value.trim();
            if (!input) {
                this.showError('Please enter a URL to encode.');
                return;
            }

            const encoded = encodeURI(input);
            document.getElementById('standard-output').value = encoded;
            this.showCharacterAnalysis('standard', input, encoded);
            this.showSuccess('URL encoded successfully!');
            this.trackAction('standard_encode');
        } catch (error) {
            this.showError('Error encoding URL: ' + error.message);
        }
    }

    standardDecode() {
        try {
            const input = document.getElementById('standard-input').value.trim();
            if (!input) {
                this.showError('Please enter a URL to decode.');
                return;
            }

            const decoded = decodeURI(input);
            document.getElementById('standard-output').value = decoded;
            this.showCharacterAnalysis('standard', input, decoded);
            this.showSuccess('URL decoded successfully!');
            this.trackAction('standard_decode');
        } catch (error) {
            this.showError('Error decoding URL: ' + error.message);
        }
    }

    standardSwap() {
        const input = document.getElementById('standard-input');
        const output = document.getElementById('standard-output');
        
        const temp = input.value;
        input.value = output.value;
        output.value = temp;
        
        this.onStandardInput();
        this.trackAction('standard_swap');
    }

    standardClear() {
        document.getElementById('standard-input').value = '';
        document.getElementById('standard-output').value = '';
        document.getElementById('standard-analysis').style.display = 'none';
        this.trackAction('standard_clear');
    }

    onStandardInput() {
        const input = document.getElementById('standard-input').value;
        this.saveToLocalStorage();
        
        if (input.length > 500) {
            this.showWarning('Large URL detected. Consider using component-wise encoding for better performance.');
        }
    }

    // Component URL Methods
    componentEncode() {
        try {
            const components = this.getComponentValues();
            const encoded = {};

            Object.keys(components).forEach(key => {
                if (components[key]) {
                    if (key === 'query') {
                        encoded[key] = this.encodeQueryString(components[key]);
                    } else if (key === 'path') {
                        encoded[key] = components[key].split('/').map(segment => 
                            segment ? encodeURIComponent(segment) : segment
                        ).join('/');
                    } else {
                        encoded[key] = encodeURIComponent(components[key]);
                    }
                }
            });

            this.setComponentValues(encoded);
            this.componentBuild();
            this.showSuccess('URL components encoded successfully!');
            this.trackAction('component_encode');
        } catch (error) {
            this.showError('Error encoding components: ' + error.message);
        }
    }

    componentDecode() {
        try {
            const components = this.getComponentValues();
            const decoded = {};

            Object.keys(components).forEach(key => {
                if (components[key]) {
                    if (key === 'query') {
                        decoded[key] = this.decodeQueryString(components[key]);
                    } else if (key === 'path') {
                        decoded[key] = components[key].split('/').map(segment => 
                            segment ? decodeURIComponent(segment) : segment
                        ).join('/');
                    } else {
                        decoded[key] = decodeURIComponent(components[key]);
                    }
                }
            });

            this.setComponentValues(decoded);
            this.componentBuild();
            this.showSuccess('URL components decoded successfully!');
            this.trackAction('component_decode');
        } catch (error) {
            this.showError('Error decoding components: ' + error.message);
        }
    }

    componentBuild() {
        try {
            const components = this.getComponentValues();
            let url = '';

            if (components.protocol) {
                url += components.protocol + (components.protocol.includes('://') ? '' : '://');
            }

            if (components.host) {
                url += components.host;
            }

            if (components.port) {
                url += ':' + components.port;
            }

            if (components.path) {
                url += components.path.startsWith('/') ? components.path : '/' + components.path;
            }

            if (components.query) {
                url += '?' + components.query;
            }

            if (components.fragment) {
                url += '#' + components.fragment;
            }

            const preview = document.getElementById('component-preview');
            const builtUrl = document.getElementById('component-built-url');
            
            builtUrl.textContent = url;
            preview.style.display = url ? 'block' : 'none';
            
            this.trackAction('component_build');
        } catch (error) {
            this.showError('Error building URL: ' + error.message);
        }
    }

    componentParse() {
        try {
            const builtUrl = document.getElementById('component-built-url').textContent;
            if (!builtUrl) {
                this.showError('No URL to parse. Please build a URL first.');
                return;
            }

            const url = new URL(builtUrl);
            
            this.setComponentValues({
                protocol: url.protocol.replace(':', ''),
                host: url.hostname,
                port: url.port,
                path: url.pathname,
                query: url.search.replace('?', ''),
                fragment: url.hash.replace('#', '')
            });

            this.showSuccess('URL parsed successfully!');
            this.trackAction('component_parse');
        } catch (error) {
            this.showError('Error parsing URL: ' + error.message);
        }
    }

    getComponentValues() {
        return {
            protocol: document.getElementById('component-protocol').value.trim(),
            host: document.getElementById('component-host').value.trim(),
            port: document.getElementById('component-port').value.trim(),
            path: document.getElementById('component-path').value.trim(),
            query: document.getElementById('component-query').value.trim(),
            fragment: document.getElementById('component-fragment').value.trim()
        };
    }

    setComponentValues(values) {
        Object.keys(values).forEach(key => {
            const element = document.getElementById(`component-${key}`);
            if (element && values[key] !== undefined) {
                element.value = values[key];
            }
        });
    }

    onComponentInput() {
        this.saveToLocalStorage();
        // Auto-build URL as user types
        clearTimeout(this.componentBuildTimeout);
        this.componentBuildTimeout = setTimeout(() => this.componentBuild(), 500);
    }

    // Query Parameters Methods
    queryEncode() {
        try {
            const input = document.getElementById('query-input').value.trim();
            if (!input) {
                this.showError('Please enter query parameters to encode.');
                return;
            }

            const encoded = this.encodeQueryString(input);
            document.getElementById('query-output').value = encoded;
            this.displayQueryTable(input, encoded);
            this.showSuccess('Query parameters encoded successfully!');
            this.trackAction('query_encode');
        } catch (error) {
            this.showError('Error encoding query parameters: ' + error.message);
        }
    }

    queryDecode() {
        try {
            const input = document.getElementById('query-input').value.trim();
            if (!input) {
                this.showError('Please enter query parameters to decode.');
                return;
            }

            const decoded = this.decodeQueryString(input);
            document.getElementById('query-output').value = decoded;
            this.displayQueryTable(decoded, input);
            this.showSuccess('Query parameters decoded successfully!');
            this.trackAction('query_decode');
        } catch (error) {
            this.showError('Error decoding query parameters: ' + error.message);
        }
    }

    queryFormat() {
        try {
            const input = document.getElementById('query-input').value.trim();
            if (!input) {
                this.showError('Please enter query parameters to format.');
                return;
            }

            const params = new URLSearchParams(input);
            const formatted = Array.from(params.entries())
                .map(([key, value]) => `${key}=${value}`)
                .join('\n');

            document.getElementById('query-output').value = formatted;
            this.displayQueryTable(input, formatted);
            this.showSuccess('Query parameters formatted successfully!');
            this.trackAction('query_format');
        } catch (error) {
            this.showError('Error formatting query parameters: ' + error.message);
        }
    }

    querySwap() {
        const input = document.getElementById('query-input');
        const output = document.getElementById('query-output');
        
        const temp = input.value;
        input.value = output.value;
        output.value = temp;
        
        this.onQueryInput();
        this.trackAction('query_swap');
    }

    queryClear() {
        document.getElementById('query-input').value = '';
        document.getElementById('query-output').value = '';
        document.getElementById('query-table').style.display = 'none';
        this.trackAction('query_clear');
    }

    onQueryInput() {
        this.saveToLocalStorage();
        
        const input = document.getElementById('query-input').value;
        if (input && input.includes('&')) {
            // Auto-display table for multi-parameter queries
            clearTimeout(this.queryTableTimeout);
            this.queryTableTimeout = setTimeout(() => {
                try {
                    this.displayQueryTable(input, input);
                } catch (error) {
                    // Ignore parsing errors during typing
                }
            }, 1000);
        }
    }

    // Utility Methods
    encodeQueryString(queryString) {
        if (!queryString) return '';
        
        const params = new URLSearchParams();
        const pairs = queryString.split('&');
        
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params.append(
                    decodeURIComponent(key || '').trim(),
                    decodeURIComponent(value || '').trim()
                );
            }
        });
        
        return params.toString();
    }

    decodeQueryString(queryString) {
        if (!queryString) return '';
        
        const params = new URLSearchParams(queryString);
        const decoded = [];
        
        for (const [key, value] of params) {
            decoded.push(`${key}=${value}`);
        }
        
        return decoded.join('&');
    }

    displayQueryTable(original, processed) {
        try {
            const table = document.getElementById('query-table');
            const tbody = document.querySelector('#query-params-table tbody');
            
            // Clear existing rows
            tbody.innerHTML = '';
            
            const originalParams = new URLSearchParams(original);
            const processedParams = new URLSearchParams(processed);
            
            const allKeys = new Set([
                ...Array.from(originalParams.keys()),
                ...Array.from(processedParams.keys())
            ]);
            
            allKeys.forEach(key => {
                const row = tbody.insertRow();
                
                const originalValue = originalParams.get(key) || '';
                const processedValue = processedParams.get(key) || '';
                
                row.insertCell(0).textContent = key;
                row.insertCell(1).textContent = originalValue;
                row.insertCell(2).textContent = encodeURIComponent(key);
                row.insertCell(3).textContent = encodeURIComponent(originalValue);
            });
            
            table.style.display = tbody.children.length > 0 ? 'block' : 'none';
        } catch (error) {
            console.warn('Error displaying query table:', error);
        }
    }

    showCharacterAnalysis(type, original, processed) {
        const analysis = document.getElementById(`${type}-analysis`);
        const grid = document.getElementById(`${type}-character-grid`);
        
        if (!analysis || !grid) return;
        
        const stats = {
            'Original Length': original.length,
            'Processed Length': processed.length,
            'Size Change': `${processed.length - original.length > 0 ? '+' : ''}${processed.length - original.length}`,
            'Encoded Chars': (processed.match(/%[0-9A-F]{2}/gi) || []).length
        };
        
        grid.innerHTML = '';
        Object.entries(stats).forEach(([label, value]) => {
            const item = document.createElement('div');
            item.className = 'character-item';
            item.innerHTML = `<span>${label}:</span><strong>${value}</strong>`;
            grid.appendChild(item);
        });
        
        analysis.style.display = 'block';
    }

    // UI Helper Methods
    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showWarning(message) {
        this.showMessage(message, 'warning');
    }

    showMessage(message, type) {
        const container = document.getElementById(`${type === 'error' ? 'error' : 'success'}-container`);
        if (container) {
            container.textContent = message;
            container.style.display = 'block';
            
            setTimeout(() => {
                container.style.display = 'none';
            }, 5000);
        }
    }

    async copyToClipboard(elementId) {
        try {
            const element = document.getElementById(elementId);
            const text = element.value;
            
            if (!text) {
                this.showError('No content to copy.');
                return;
            }

            await navigator.clipboard.writeText(text);
            this.showSuccess('Copied to clipboard!');
            this.trackAction('copy_to_clipboard');
        } catch (error) {
            // Fallback for older browsers
            const element = document.getElementById(elementId);
            element.select();
            document.execCommand('copy');
            this.showSuccess('Copied to clipboard!');
        }
    }

    // Storage Methods
    saveToLocalStorage() {
        try {
            const data = {
                standardInput: document.getElementById('standard-input').value,
                standardOutput: document.getElementById('standard-output').value,
                components: this.getComponentValues(),
                queryInput: document.getElementById('query-input').value,
                queryOutput: document.getElementById('query-output').value,
                currentMode: this.currentMode,
                timestamp: Date.now()
            };
            
            localStorage.setItem('urlEncoderDecoder', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('urlEncoderDecoder');
            if (!saved) return;
            
            const data = JSON.parse(saved);
            
            // Don't load data older than 24 hours
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('urlEncoderDecoder');
                return;
            }
            
            // Restore values
            if (data.standardInput) {
                document.getElementById('standard-input').value = data.standardInput;
            }
            if (data.standardOutput) {
                document.getElementById('standard-output').value = data.standardOutput;
            }
            if (data.components) {
                this.setComponentValues(data.components);
            }
            if (data.queryInput) {
                document.getElementById('query-input').value = data.queryInput;
            }
            if (data.queryOutput) {
                document.getElementById('query-output').value = data.queryOutput;
            }
            if (data.currentMode) {
                this.switchMode(data.currentMode);
            }
            
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            localStorage.removeItem('urlEncoderDecoder');
        }
    }

    // Analytics Methods
    trackAction(action) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_action', {
                'event_category': 'URL Encoder Decoder',
                'event_label': action,
                'value': 1
            });
        }
    }

    trackModeSwitch(mode) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'mode_switch', {
                'event_category': 'URL Encoder Decoder',
                'event_label': mode,
                'value': 1
            });
        }
    }
}

// Initialize the tool when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new URLEncoderDecoder();
});

// Add some example URLs for testing
window.URLEncoderDecoderExamples = {
    urls: [
        'https://example.com/search?q=hello world&category=web development',
        'https://api.example.com/users/123?fields=name,email&format=json',
        'https://example.com/path with spaces/file.html?param=value with spaces',
        'https://example.com/unicode/测试?name=张三&city=北京',
        'https://example.com/special-chars?symbols=!@#$%^&*()_+-=[]{}|;:,.<>?'
    ],
    
    showExample: (index) => {
        const tool = window.urlEncoderDecoder;
        if (tool && window.URLEncoderDecoderExamples.urls[index]) {
            document.getElementById('standard-input').value = window.URLEncoderDecoderExamples.urls[index];
            tool.onStandardInput();
        }
    }
};
