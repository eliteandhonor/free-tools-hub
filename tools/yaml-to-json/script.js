// YAML to JSON Converter - Professional Implementation
class YAMLToJSONConverter {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.examples = this.getExamples();
    }

    initializeElements() {
        this.yamlInput = document.getElementById('yaml-input');
        this.jsonOutput = document.getElementById('json-output');
        this.fileInput = document.getElementById('file-input');
        this.fileUploadArea = document.getElementById('file-upload-area');
        this.errorMessage = document.getElementById('error-message');
        this.successMessage = document.getElementById('success-message');
        this.statsPanel = document.getElementById('stats-panel');
        this.copyBtn = document.getElementById('copy-btn');
        
        // Options
        this.compactOutput = document.getElementById('compact-output');
        this.sortKeys = document.getElementById('sort-keys');
        this.strictMode = document.getElementById('strict-mode');
        this.preserveQuotes = document.getElementById('preserve-quotes');
        
        // Stats elements
        this.keysCount = document.getElementById('keys-count');
        this.linesCount = document.getElementById('lines-count');
        this.sizeInfo = document.getElementById('size-info');
    }

    setupEventListeners() {
        // Auto-convert on input
        this.yamlInput.addEventListener('input', () => {
            this.debounce(() => this.convertToJSON(), 500);
        });

        // File upload
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Drag and drop
        this.fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileUploadArea.classList.add('dragover');
        });
        
        this.fileUploadArea.addEventListener('dragleave', () => {
            this.fileUploadArea.classList.remove('dragover');
        });
        
        this.fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.fileUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processFile(files[0]);
            }
        });

        // Options change
        [this.compactOutput, this.sortKeys, this.strictMode, this.preserveQuotes].forEach(option => {
            option.addEventListener('change', () => {
                if (this.yamlInput.value.trim()) {
                    this.convertToJSON();
                }
            });
        });
    }

    // Simple YAML parser (supports basic YAML features)
    parseYAML(yamlText) {
        try {
            // Remove comments and empty lines
            const lines = yamlText.split('\n').map(line => {
                const commentIndex = line.indexOf('#');
                if (commentIndex !== -1) {
                    // Only remove comment if it's not inside quotes
                    const beforeComment = line.substring(0, commentIndex);
                    const quoteCount = (beforeComment.match(/"/g) || []).length;
                    if (quoteCount % 2 === 0) {
                        line = beforeComment;
                    }
                }
                return line.trim();
            }).filter(line => line.length > 0);

            return this.parseYAMLLines(lines);
        } catch (error) {
            throw new Error(`YAML parsing error: ${error.message}`);
        }
    }

    parseYAMLLines(lines) {
        const result = {};
        const stack = [{ obj: result, indent: -1 }];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const originalLine = line;
            const indent = originalLine.length - originalLine.trimLeft().length;
            
            // Pop stack to correct level
            while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                stack.pop();
            }
            
            const current = stack[stack.length - 1].obj;
            
            if (line.includes(':')) {
                const colonIndex = line.indexOf(':');
                let key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                // Remove quotes from key if present
                if ((key.startsWith('"') && key.endsWith('"')) || 
                    (key.startsWith("'") && key.endsWith("'"))) {
                    key = key.slice(1, -1);
                }
                
                if (value === '') {
                    // Empty value - could be object or null
                    if (i + 1 < lines.length) {
                        const nextLine = lines[i + 1];
                        const nextIndent = nextLine.length - nextLine.trimLeft().length;
                        if (nextIndent > indent) {
                            // It's an object
                            current[key] = {};
                            stack.push({ obj: current[key], indent: indent });
                        } else {
                            current[key] = null;
                        }
                    } else {
                        current[key] = null;
                    }
                } else if (value.startsWith('[') && value.endsWith(']')) {
                    // Inline array
                    current[key] = this.parseInlineArray(value);
                } else if (value.startsWith('{') && value.endsWith('}')) {
                    // Inline object
                    current[key] = this.parseInlineObject(value);
                } else {
                    // Regular value
                    current[key] = this.parseValue(value);
                }
            } else if (line.startsWith('-')) {
                // Array item
                const value = line.substring(1).trim();
                
                if (!Array.isArray(current)) {
                    throw new Error('Invalid YAML structure: array item without array context');
                }
                
                if (value === '') {
                    // Empty array item - could be object
                    if (i + 1 < lines.length) {
                        const nextLine = lines[i + 1];
                        const nextIndent = nextLine.length - nextLine.trimLeft().length;
                        if (nextIndent > indent) {
                            const obj = {};
                            current.push(obj);
                            stack.push({ obj: obj, indent: indent });
                        } else {
                            current.push(null);
                        }
                    } else {
                        current.push(null);
                    }
                } else {
                    current.push(this.parseValue(value));
                }
            }
        }
        
        return result;
    }

    parseInlineArray(str) {
        const content = str.slice(1, -1).trim();
        if (!content) return [];
        
        const items = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let depth = 0;
        
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            
            if (!inQuotes && (char === '"' || char === "'")) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (inQuotes && char === quoteChar) {
                inQuotes = false;
                current += char;
            } else if (!inQuotes && (char === '[' || char === '{')) {
                depth++;
                current += char;
            } else if (!inQuotes && (char === ']' || char === '}')) {
                depth--;
                current += char;
            } else if (!inQuotes && char === ',' && depth === 0) {
                items.push(this.parseValue(current.trim()));
                current = '';
            } else {
                current += char;
            }
        }
        
        if (current.trim()) {
            items.push(this.parseValue(current.trim()));
        }
        
        return items;
    }

    parseInlineObject(str) {
        const content = str.slice(1, -1).trim();
        if (!content) return {};
        
        const obj = {};
        const pairs = this.splitObjectPairs(content);
        
        pairs.forEach(pair => {
            const colonIndex = pair.indexOf(':');
            if (colonIndex !== -1) {
                let key = pair.substring(0, colonIndex).trim();
                let value = pair.substring(colonIndex + 1).trim();
                
                // Remove quotes from key
                if ((key.startsWith('"') && key.endsWith('"')) || 
                    (key.startsWith("'") && key.endsWith("'"))) {
                    key = key.slice(1, -1);
                }
                
                obj[key] = this.parseValue(value);
            }
        });
        
        return obj;
    }

    splitObjectPairs(str) {
        const pairs = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let depth = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            
            if (!inQuotes && (char === '"' || char === "'")) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (inQuotes && char === quoteChar) {
                inQuotes = false;
                current += char;
            } else if (!inQuotes && (char === '[' || char === '{')) {
                depth++;
                current += char;
            } else if (!inQuotes && (char === ']' || char === '}')) {
                depth--;
                current += char;
            } else if (!inQuotes && char === ',' && depth === 0) {
                pairs.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        if (current.trim()) {
            pairs.push(current.trim());
        }
        
        return pairs;
    }

    parseValue(value) {
        if (!value || value === 'null' || value === '~') {
            return null;
        }
        
        if (value === 'true') return true;
        if (value === 'false') return false;
        
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
        
        // Try to parse as number
        if (/^-?\d+$/.test(value)) {
            return parseInt(value, 10);
        }
        
        if (/^-?\d+\.\d+$/.test(value)) {
            return parseFloat(value);
        }
        
        return value;
    }

    convertToJSON() {
        const yamlText = this.yamlInput.value.trim();
        
        if (!yamlText) {
            this.jsonOutput.value = '';
            this.hideMessages();
            this.statsPanel.style.display = 'none';
            return;
        }
        
        try {
            const parsed = this.parseYAML(yamlText);
            
            let jsonString;
            if (this.compactOutput.checked) {
                jsonString = JSON.stringify(parsed);
            } else {
                jsonString = JSON.stringify(parsed, null, 2);
            }
            
            if (this.sortKeys.checked) {
                const sortedParsed = this.sortObjectKeys(parsed);
                if (this.compactOutput.checked) {
                    jsonString = JSON.stringify(sortedParsed);
                } else {
                    jsonString = JSON.stringify(sortedParsed, null, 2);
                }
            }
            
            this.jsonOutput.value = jsonString;
            this.showSuccess('YAML converted to JSON successfully!');
            this.updateStats(yamlText, jsonString, parsed);
            this.statsPanel.style.display = 'block';
            
        } catch (error) {
            this.showError(`Conversion failed: ${error.message}`);
            this.jsonOutput.value = '';
            this.statsPanel.style.display = 'none';
        }
    }

    sortObjectKeys(obj) {
        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObjectKeys(item));
        } else if (obj !== null && typeof obj === 'object') {
            const sorted = {};
            Object.keys(obj).sort().forEach(key => {
                sorted[key] = this.sortObjectKeys(obj[key]);
            });
            return sorted;
        }
        return obj;
    }

    updateStats(yamlText, jsonText, parsedData) {
        const keyCount = this.countKeys(parsedData);
        const lineCount = jsonText.split('\n').length;
        const sizeBytes = new Blob([jsonText]).size;
        const sizeKB = (sizeBytes / 1024).toFixed(2);
        
        this.keysCount.textContent = keyCount;
        this.linesCount.textContent = lineCount;
        this.sizeInfo.textContent = `${sizeKB} KB`;
    }

    countKeys(obj) {
        let count = 0;
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                count += this.countKeys(item);
            });
        } else if (obj !== null && typeof obj === 'object') {
            count += Object.keys(obj).length;
            Object.values(obj).forEach(value => {
                count += this.countKeys(value);
            });
        }
        return count;
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (!file.name.match(/\.(yaml|yml|txt)$/i)) {
            this.showError('Please select a YAML file (.yaml, .yml, or .txt)');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.yamlInput.value = e.target.result;
            this.convertToJSON();
        };
        reader.onerror = () => {
            this.showError('Error reading file');
        };
        reader.readAsText(file);
    }

    validateYAML() {
        const yamlText = this.yamlInput.value.trim();
        
        if (!yamlText) {
            this.showError('Please enter YAML data to validate');
            return;
        }
        
        try {
            this.parseYAML(yamlText);
            this.showSuccess('YAML is valid!');
        } catch (error) {
            this.showError(`YAML validation failed: ${error.message}`);
        }
    }

    formatJSON() {
        const jsonText = this.jsonOutput.value.trim();
        
        if (!jsonText) {
            this.showError('No JSON to format');
            return;
        }
        
        try {
            const parsed = JSON.parse(jsonText);
            this.jsonOutput.value = JSON.stringify(parsed, null, 2);
            this.showSuccess('JSON formatted successfully!');
        } catch (error) {
            this.showError('Invalid JSON format');
        }
    }

    validateJSON() {
        const jsonText = this.jsonOutput.value.trim();
        
        if (!jsonText) {
            this.showError('No JSON to validate');
            return;
        }
        
        try {
            JSON.parse(jsonText);
            this.showSuccess('JSON is valid!');
        } catch (error) {
            this.showError('Invalid JSON format');
        }
    }

    copyJSON() {
        const jsonText = this.jsonOutput.value;
        
        if (!jsonText) {
            this.showError('No JSON to copy');
            return;
        }
        
        navigator.clipboard.writeText(jsonText).then(() => {
            this.showSuccess('JSON copied to clipboard!');
            this.copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                this.copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy JSON';
            }, 2000);
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = jsonText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('JSON copied to clipboard!');
        });
    }

    downloadJSON() {
        const jsonText = this.jsonOutput.value;
        
        if (!jsonText) {
            this.showError('No JSON to download');
            return;
        }
        
        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('JSON file downloaded!');
    }

    clearInput() {
        this.yamlInput.value = '';
        this.jsonOutput.value = '';
        this.hideMessages();
        this.statsPanel.style.display = 'none';
        this.fileInput.value = '';
    }

    loadExample() {
        const example = this.examples.nested;
        this.yamlInput.value = example;
        this.convertToJSON();
    }

    loadExampleData(type) {
        if (this.examples[type]) {
            this.yamlInput.value = this.examples[type];
            this.convertToJSON();
        }
    }

    getExamples() {
        return {
            simple: `name: My Application
version: 1.0.0
port: 3000
debug: true
author: John Doe`,

            nested: `database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret123
  settings:
    timeout: 30
    retry_attempts: 3
    ssl_enabled: true`,

            arrays: `fruits:
  - apple
  - banana
  - orange
colors:
  - red
  - green
  - blue
numbers:
  - 1
  - 2
  - 3.14`,

            docker: `version: '3.8'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    environment:
      - ENV=production
    volumes:
      - ./html:/usr/share/nginx/html
  database:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - db_data:/var/lib/postgresql/data
volumes:
  db_data:`
        };
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.successMessage.style.display = 'none';
        
        setTimeout(() => {
            this.errorMessage.style.display = 'none';
        }, 5000);
    }

    showSuccess(message) {
        this.successMessage.textContent = message;
        this.successMessage.style.display = 'block';
        this.errorMessage.style.display = 'none';
        
        setTimeout(() => {
            this.successMessage.style.display = 'none';
        }, 3000);
    }

    hideMessages() {
        this.errorMessage.style.display = 'none';
        this.successMessage.style.display = 'none';
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }
}

// Global functions for button actions
function convertToJSON() {
    converter.convertToJSON();
}

function clearInput() {
    converter.clearInput();
}

function loadExample() {
    converter.loadExample();
}

function validateYAML() {
    converter.validateYAML();
}

function copyJSON() {
    converter.copyJSON();
}

function downloadJSON() {
    converter.downloadJSON();
}

function formatJSON() {
    converter.formatJSON();
}

function validateJSON() {
    converter.validateJSON();
}

function loadExampleData(type) {
    converter.loadExampleData(type);
}

// Initialize converter when page loads
let converter;
document.addEventListener('DOMContentLoaded', function() {
    converter = new YAMLToJSONConverter();
});
