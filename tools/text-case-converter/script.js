/**
 * Text Case Converter Tool
 * Professional text case conversion functionality
 */

class TextCaseConverter {
    constructor() {
        this.conversionHistory = [];
        this.maxHistorySize = 10;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromLocalStorage();
        this.initializeWordListFeature();
    }

    bindEvents() {
        // Main conversion buttons
        document.getElementById('uppercase-btn').addEventListener('click', () => this.convertToUpperCase());
        document.getElementById('lowercase-btn').addEventListener('click', () => this.convertToLowerCase());
        document.getElementById('title-case-btn').addEventListener('click', () => this.convertToTitleCase());
        document.getElementById('sentence-case-btn').addEventListener('click', () => this.convertToSentenceCase());
        document.getElementById('camel-case-btn').addEventListener('click', () => this.convertToCamelCase());
        document.getElementById('pascal-case-btn').addEventListener('click', () => this.convertToPascalCase());
        document.getElementById('snake-case-btn').addEventListener('click', () => this.convertToSnakeCase());
        document.getElementById('kebab-case-btn').addEventListener('click', () => this.convertToKebabCase());
        document.getElementById('constant-case-btn').addEventListener('click', () => this.convertToConstantCase());
        document.getElementById('alternating-case-btn').addEventListener('click', () => this.convertToAlternatingCase());
        document.getElementById('inverse-case-btn').addEventListener('click', () => this.convertToInverseCase());

        // Utility buttons
        document.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearText());
        document.getElementById('swap-btn').addEventListener('click', () => this.swapInputOutput());
        document.getElementById('download-btn').addEventListener('click', () => this.downloadText());

        // Text input events
        document.getElementById('input-text').addEventListener('input', () => this.onTextInput());
        document.getElementById('input-text').addEventListener('paste', () => {
            // Small delay to allow paste to complete
            setTimeout(() => this.onTextInput(), 10);
        });

        // History navigation
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.redo());

        // Word list feature
        document.getElementById('toggle-word-list').addEventListener('change', (e) => this.toggleWordList(e.target.checked));
        document.getElementById('word-list-format').addEventListener('change', () => this.updateWordList());

        // File upload
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('upload-btn').addEventListener('click', () => document.getElementById('file-input').click());

        // Custom case options
        document.getElementById('preserve-numbers').addEventListener('change', () => this.updateCustomOptions());
        document.getElementById('preserve-special').addEventListener('change', () => this.updateCustomOptions());

        // Auto-save functionality
        setInterval(() => this.saveToLocalStorage(), 5000);
        window.addEventListener('beforeunload', () => this.saveToLocalStorage());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Core conversion methods
    convertToUpperCase() {
        const input = this.getInputText();
        if (!input) return;

        const result = input.toUpperCase();
        this.setOutputText(result);
        this.addToHistory('UPPERCASE', input, result);
        this.updateWordList();
        this.trackConversion('uppercase');
    }

    convertToLowerCase() {
        const input = this.getInputText();
        if (!input) return;

        const result = input.toLowerCase();
        this.setOutputText(result);
        this.addToHistory('lowercase', input, result);
        this.updateWordList();
        this.trackConversion('lowercase');
    }

    convertToTitleCase() {
        const input = this.getInputText();
        if (!input) return;

        const result = this.toTitleCase(input);
        this.setOutputText(result);
        this.addToHistory('Title Case', input, result);
        this.updateWordList();
        this.trackConversion('title_case');
    }

    convertToSentenceCase() {
        const input = this.getInputText();
        if (!input) return;

        const result = this.toSentenceCase(input);
        this.setOutputText(result);
        this.addToHistory('Sentence case', input, result);
        this.updateWordList();
        this.trackConversion('sentence_case');
    }

    convertToCamelCase() {
        const input = this.getInputText();
        if (!input) return;

        const result = this.toCamelCase(input);
        this.setOutputText(result);
        this.addToHistory('camelCase', input, result);
        this.updateWordList();
        this.trackConversion('camel_case');
    }

    convertToPascalCase() {
        const input = this.getInputText();
        if (!input) return;

        const result = this.toPascalCase(input);
        this.setOutputText(result);
        this.addToHistory('PascalCase', input, result);
        this.updateWordList();
        this.trackConversion('pascal_case');
    }

    convertToSnakeCase() {
        const input = this.getInputText();
        if (!input) return;

        const result = this.toSnakeCase(input);
        this.setOutputText(result);
        this.addToHistory('snake_case', input, result);
        this.updateWordList();
        this.trackConversion('snake_case');
    }

    convertToKebabCase() {
        const input = this.getInputText();
        if (!input) return;

        const result = this.toKebabCase(input);
        this.setOutputText(result);
        this.addToHistory('kebab-case', input, result);
        this.updateWordList();
        this.trackConversion('kebab_case');
    }

    convertToConstantCase() {
        const input = this.getInputText();
        if (!input) return;

        const result = this.toConstantCase(input);
        this.setOutputText(result);
        this.addToHistory('CONSTANT_CASE', input, result);
        this.updateWordList();
        this.trackConversion('constant_case');
    }

    convertToAlternatingCase() {
        const input = this.getInputText();
        if (!input) return;

        const result = this.toAlternatingCase(input);
        this.setOutputText(result);
        this.addToHistory('aLtErNaTiNg CaSe', input, result);
        this.updateWordList();
        this.trackConversion('alternating_case');
    }

    convertToInverseCase() {
        const input = this.getInputText();
        if (!input) return;

        const result = this.toInverseCase(input);
        this.setOutputText(result);
        this.addToHistory('iNVERSE cASE', input, result);
        this.updateWordList();
        this.trackConversion('inverse_case');
    }

    // Case conversion helper methods
    toTitleCase(text) {
        const articles = ['a', 'an', 'the'];
        const prepositions = ['of', 'in', 'on', 'at', 'to', 'for', 'by', 'with', 'from'];
        const conjunctions = ['and', 'or', 'but', 'nor', 'so', 'yet'];
        const smallWords = [...articles, ...prepositions, ...conjunctions];

        return text.toLowerCase().replace(/\b\w+/g, (word, index) => {
            // Always capitalize first word
            if (index === 0) {
                return this.capitalizeFirst(word);
            }
            
            // Don't capitalize small words unless they're at the beginning
            if (smallWords.includes(word.toLowerCase())) {
                return word;
            }
            
            return this.capitalizeFirst(word);
        });
    }

    toSentenceCase(text) {
        return text.toLowerCase().replace(/(^|\. )[a-z]/g, (letter) => letter.toUpperCase());
    }

    toCamelCase(text) {
        return text
            .replace(/[^a-zA-Z0-9]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .map((word, index) => {
                if (index === 0) {
                    return word.toLowerCase();
                }
                return this.capitalizeFirst(word.toLowerCase());
            })
            .join('');
    }

    toPascalCase(text) {
        return text
            .replace(/[^a-zA-Z0-9]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .map(word => this.capitalizeFirst(word.toLowerCase()))
            .join('');
    }

    toSnakeCase(text) {
        return text
            .replace(/[^a-zA-Z0-9]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .map(word => word.toLowerCase())
            .join('_');
    }

    toKebabCase(text) {
        return text
            .replace(/[^a-zA-Z0-9]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .map(word => word.toLowerCase())
            .join('-');
    }

    toConstantCase(text) {
        return this.toSnakeCase(text).toUpperCase();
    }

    toAlternatingCase(text) {
        let isUpper = false;
        return text.split('').map(char => {
            if (/[a-zA-Z]/.test(char)) {
                const result = isUpper ? char.toUpperCase() : char.toLowerCase();
                isUpper = !isUpper;
                return result;
            }
            return char;
        }).join('');
    }

    toInverseCase(text) {
        return text.split('').map(char => {
            if (char === char.toUpperCase() && char !== char.toLowerCase()) {
                return char.toLowerCase();
            } else if (char === char.toLowerCase() && char !== char.toUpperCase()) {
                return char.toUpperCase();
            }
            return char;
        }).join('');
    }

    capitalizeFirst(word) {
        if (!word) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Utility methods
    getInputText() {
        const text = document.getElementById('input-text').value;
        if (!text.trim()) {
            this.showError('Please enter some text to convert.');
            return null;
        }
        return text;
    }

    setOutputText(text) {
        document.getElementById('output-text').value = text;
        this.updateTextStats();
    }

    onTextInput() {
        this.updateTextStats();
        this.saveToLocalStorage();
        
        const text = document.getElementById('input-text').value;
        if (text.length > 10000) {
            this.showWarning('Large text detected. Performance may be slower for very long texts.');
        }
    }

    updateTextStats() {
        const inputText = document.getElementById('input-text').value;
        const outputText = document.getElementById('output-text').value;
        
        // Update input stats
        document.getElementById('input-chars').textContent = inputText.length;
        document.getElementById('input-words').textContent = this.countWords(inputText);
        document.getElementById('input-lines').textContent = this.countLines(inputText);
        
        // Update output stats
        document.getElementById('output-chars').textContent = outputText.length;
        document.getElementById('output-words').textContent = this.countWords(outputText);
        document.getElementById('output-lines').textContent = this.countLines(outputText);
    }

    countWords(text) {
        if (!text.trim()) return 0;
        return text.trim().split(/\s+/).length;
    }

    countLines(text) {
        if (!text) return 0;
        return text.split('\n').length;
    }

    // History management
    addToHistory(operation, input, output) {
        const historyItem = {
            operation,
            input,
            output,
            timestamp: Date.now()
        };
        
        this.conversionHistory.push(historyItem);
        
        // Limit history size
        if (this.conversionHistory.length > this.maxHistorySize) {
            this.conversionHistory.shift();
        }
        
        this.updateHistoryUI();
    }

    updateHistoryUI() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        this.conversionHistory.slice(-5).reverse().forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-operation">${item.operation}</div>
                <div class="history-preview">${this.truncateText(item.output, 50)}</div>
                <div class="history-time">${this.formatTime(item.timestamp)}</div>
            `;
            historyItem.addEventListener('click', () => this.restoreFromHistory(item));
            historyList.appendChild(historyItem);
        });
    }

    restoreFromHistory(historyItem) {
        document.getElementById('input-text').value = historyItem.input;
        document.getElementById('output-text').value = historyItem.output;
        this.updateTextStats();
        this.updateWordList();
        this.showSuccess(`Restored: ${historyItem.operation}`);
    }

    undo() {
        // Implementation for undo functionality
        this.showInfo('Undo functionality - restore previous conversion');
    }

    redo() {
        // Implementation for redo functionality  
        this.showInfo('Redo functionality - restore next conversion');
    }

    // Word list feature
    initializeWordListFeature() {
        this.updateWordList();
    }

    toggleWordList(enabled) {
        const wordListContainer = document.getElementById('word-list-container');
        wordListContainer.style.display = enabled ? 'block' : 'none';
        
        if (enabled) {
            this.updateWordList();
        }
    }

    updateWordList() {
        const wordListToggle = document.getElementById('toggle-word-list');
        if (!wordListToggle.checked) return;
        
        const text = document.getElementById('output-text').value || document.getElementById('input-text').value;
        const format = document.getElementById('word-list-format').value;
        const wordListOutput = document.getElementById('word-list-output');
        
        if (!text.trim()) {
            wordListOutput.value = '';
            return;
        }
        
        const words = this.extractWords(text);
        const uniqueWords = [...new Set(words)].sort();
        
        let formatted;
        switch (format) {
            case 'lines':
                formatted = uniqueWords.join('\n');
                break;
            case 'comma':
                formatted = uniqueWords.join(', ');
                break;
            case 'numbered':
                formatted = uniqueWords.map((word, index) => `${index + 1}. ${word}`).join('\n');
                break;
            case 'bullets':
                formatted = uniqueWords.map(word => `• ${word}`).join('\n');
                break;
            default:
                formatted = uniqueWords.join('\n');
        }
        
        wordListOutput.value = formatted;
    }

    extractWords(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    // File operations
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
            this.showError('Please select a text file (.txt)');
            return;
        }
        
        if (file.size > 1024 * 1024) { // 1MB limit
            this.showError('File size must be less than 1MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('input-text').value = e.target.result;
            this.onTextInput();
            this.showSuccess(`File "${file.name}" loaded successfully`);
        };
        reader.onerror = () => {
            this.showError('Error reading file');
        };
        reader.readAsText(file);
    }

    downloadText() {
        const text = document.getElementById('output-text').value;
        if (!text.trim()) {
            this.showError('No text to download');
            return;
        }
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted-text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.trackAction('download_text');
    }

    // UI actions
    async copyToClipboard() {
        const text = document.getElementById('output-text').value;
        if (!text) {
            this.showError('No text to copy');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('Copied to clipboard!');
            this.trackAction('copy_to_clipboard');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.getElementById('output-text');
            textArea.select();
            document.execCommand('copy');
            this.showSuccess('Copied to clipboard!');
        }
    }

    clearText() {
        document.getElementById('input-text').value = '';
        document.getElementById('output-text').value = '';
        document.getElementById('word-list-output').value = '';
        this.updateTextStats();
        this.trackAction('clear_text');
    }

    swapInputOutput() {
        const inputText = document.getElementById('input-text').value;
        const outputText = document.getElementById('output-text').value;
        
        document.getElementById('input-text').value = outputText;
        document.getElementById('output-text').value = inputText;
        
        this.updateTextStats();
        this.updateWordList();
        this.trackAction('swap_text');
    }

    // Custom options
    updateCustomOptions() {
        const preserveNumbers = document.getElementById('preserve-numbers').checked;
        const preserveSpecial = document.getElementById('preserve-special').checked;
        
        // This would be used in more advanced conversion logic
        this.customOptions = {
            preserveNumbers,
            preserveSpecial
        };
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'u':
                    e.preventDefault();
                    this.convertToUpperCase();
                    break;
                case 'l':
                    e.preventDefault();
                    this.convertToLowerCase();
                    break;
                case 't':
                    e.preventDefault();
                    this.convertToTitleCase();
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.swapInputOutput();
                    break;
            }
        }
    }

    // Utility helper methods
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Message display methods
    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showWarning(message) {
        this.showMessage(message, 'warning');
    }

    showInfo(message) {
        this.showMessage(message, 'info');
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

    // Storage methods
    saveToLocalStorage() {
        try {
            const data = {
                inputText: document.getElementById('input-text').value,
                outputText: document.getElementById('output-text').value,
                history: this.conversionHistory,
                customOptions: this.customOptions,
                timestamp: Date.now()
            };
            
            localStorage.setItem('textCaseConverter', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('textCaseConverter');
            if (!saved) return;
            
            const data = JSON.parse(saved);
            
            // Don't load data older than 24 hours
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('textCaseConverter');
                return;
            }
            
            // Restore values
            if (data.inputText) {
                document.getElementById('input-text').value = data.inputText;
            }
            if (data.outputText) {
                document.getElementById('output-text').value = data.outputText;
            }
            if (data.history) {
                this.conversionHistory = data.history;
                this.updateHistoryUI();
            }
            if (data.customOptions) {
                this.customOptions = data.customOptions;
            }
            
            this.updateTextStats();
            
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            localStorage.removeItem('textCaseConverter');
        }
    }

    // Analytics methods
    trackConversion(type) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'text_conversion', {
                'event_category': 'Text Case Converter',
                'event_label': type,
                'value': 1
            });
        }
    }

    trackAction(action) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_action', {
                'event_category': 'Text Case Converter',
                'event_label': action,
                'value': 1
            });
        }
    }
}

// Initialize the tool when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TextCaseConverter();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextCaseConverter;
}
