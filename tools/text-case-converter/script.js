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
        this.ensureElementsExist();
        this.updateTextStats();
    }

    // Added to ensure all required elements exist
    ensureElementsExist() {
        // Create error & success message containers if needed
        if (!document.getElementById('error-container')) {
            const errorContainer = document.createElement('div');
            errorContainer.id = 'error-container';
            errorContainer.className = 'message error-message';
            errorContainer.style.display = 'none';
            document.querySelector('.form-group')?.parentNode?.appendChild(errorContainer);
        }
        
        if (!document.getElementById('success-container')) {
            const successContainer = document.createElement('div');
            successContainer.id = 'success-container';
            successContainer.className = 'message success-message';
            successContainer.style.display = 'none';
            document.querySelector('.form-group')?.parentNode?.appendChild(successContainer);
        }

        // Check if text-stats is hidden, show it if it has content
        const textStats = document.getElementById('text-stats');
        if (textStats && textStats.classList.contains('d-none') && this.getInputText()) {
            textStats.classList.remove('d-none');
        }

        // Create history UI if it doesn't exist
        if (!document.getElementById('history-list')) {
            const historySection = document.createElement('div');
            historySection.id = 'history-section';
            historySection.className = 'history-section';
            historySection.innerHTML = `
                <h3><i class="fas fa-history"></i> Conversion History</h3>
                <div id="history-list" class="history-list"></div>
            `;
            const toolInterface = document.querySelector('.tool-interface');
            if (toolInterface) {
                toolInterface.appendChild(historySection);
            }
        }

        // Create word list container if it doesn't exist
        if (!document.getElementById('word-list-container')) {
            const wordListSection = document.createElement('div');
            wordListSection.id = 'word-list-container';
            wordListSection.className = 'word-list-container';
            wordListSection.style.display = 'none';
            wordListSection.innerHTML = `
                <h3><i class="fas fa-list"></i> Word List</h3>
                <div class="form-group">
                    <label for="word-list-format">Display Format:</label>
                    <select id="word-list-format" class="form-select">
                        <option value="lines">One Per Line</option>
                        <option value="comma">Comma Separated</option>
                        <option value="numbered">Numbered List</option>
                        <option value="bullets">Bullet Points</option>
                    </select>
                </div>
                <textarea id="word-list-output" class="form-textarea" rows="5" readonly></textarea>
                <div class="text-center mt-1-5">
                    <button id="copy-word-list" class="btn btn-secondary">
                        <i class="fas fa-copy"></i> Copy Word List
                    </button>
                </div>
            `;
            const toolInterface = document.querySelector('.tool-interface');
            if (toolInterface) {
                toolInterface.appendChild(wordListSection);
            }
        }

        // Add event listener for copy word list button if it exists
        const copyWordListBtn = document.getElementById('copy-word-list');
        if (copyWordListBtn) {
            copyWordListBtn.addEventListener('click', () => {
                const wordListOutput = document.getElementById('word-list-output');
                if (wordListOutput && wordListOutput.value) {
                    navigator.clipboard.writeText(wordListOutput.value).then(() => {
                        this.showSuccess('Word list copied to clipboard!');
                    }).catch(err => {
                        this.showError('Failed to copy word list');
                    });
                }
            });
        }
    }

    bindEvents() {
        // Support data-case attributes for case cards
        document.querySelectorAll('.case-option').forEach(card => {
            card.addEventListener('click', () => {
                const caseType = card.getAttribute('data-case');
                if (caseType) {
                    this.convertByType(caseType);
                }
            });
        });

        // Utility buttons
        document.querySelectorAll('.copy-btn, .copy-output-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetSelector = btn.getAttribute('data-target');
                if (targetSelector) {
                    const targetElement = document.querySelector(targetSelector);
                    if (targetElement && targetElement.value) {
                        navigator.clipboard.writeText(targetElement.value).then(() => {
                            const isCopyInput = btn.classList.contains('copy-btn');
                            this.showSuccess(`${isCopyInput ? 'Input' : 'Output'} copied to clipboard!`);
                        }).catch(err => {
                            this.showError('Failed to copy text');
                        });
                    } else if (targetElement && !targetElement.value.trim()) {
                        this.showWarning(`No ${btn.classList.contains('copy-btn') ? 'input' : 'output'} text to copy`);
                    }
                }
            });
        });

        document.querySelector('.clear-btn')?.addEventListener('click', () => this.clearText());
        document.getElementById('paste-btn')?.addEventListener('click', () => this.handlePaste());

        // Download output button
        document.getElementById('download-results')?.addEventListener('click', () => this.downloadOutput());

        // Copy all results button
        document.getElementById('copy-all-results')?.addEventListener('click', () => this.copyAllResults());

        // Text input events
        document.getElementById('text-input')?.addEventListener('input', () => this.onTextInput());
        document.getElementById('text-input')?.addEventListener('paste', () => {
            // Small delay to allow paste to complete
            setTimeout(() => this.onTextInput(), 10);
        });

        // File upload handler
        document.getElementById('file-upload')?.addEventListener('change', (e) => this.handleFileUpload(e));

        // Bulk processing
        document.getElementById('process-bulk')?.addEventListener('click', () => this.processBulkText());
    }
    
    // Add method to handle conversion based on data-case attributes
    convertByType(caseType) {
        switch (caseType) {
            case 'uppercase': this.convertToUpperCase(); break;
            case 'lowercase': this.convertToLowerCase(); break;
            case 'title': this.convertToTitleCase(); break;
            case 'sentence': this.convertToSentenceCase(); break;
            case 'camel': this.convertToCamelCase(); break;
            case 'pascal': this.convertToPascalCase(); break;
            case 'snake': this.convertToSnakeCase(); break;
            case 'kebab': this.convertToKebabCase(); break;
            case 'constant': this.convertToConstantCase(); break;
            case 'alternating': this.convertToAlternatingCase(); break;
            case 'inverse': this.convertToInverseCase(); break;
            case 'random': this.convertToRandomCase(); break;
        }
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

    // Random Case conversion
    convertToRandomCase() {
        const input = this.getInputText();
        if (!input) return;

        const result = input.split('').map(char => {
            return Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
        }).join('');
        
        this.setOutputText(result);
        this.addToHistory('Random Case', input, result);
        this.updateWordList();
        this.trackConversion('random_case');
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
        const inputElem = document.getElementById('text-input');
        if (!inputElem) {
            this.showError('Input text element not found.');
            return null;
        }
        
        const text = inputElem.value;
        if (!text || !text.trim()) {
            this.showError('Please enter some text to convert.');
            return null;
        }
        return text;
    }

    setOutputText(text) {
        const outputElem = document.getElementById('output-text');
        if (outputElem) {
            outputElem.value = text;
            
            // If conversion-results is hidden, show it
            const resultsSection = document.getElementById('conversion-results');
            if (resultsSection && resultsSection.classList.contains('d-none')) {
                resultsSection.classList.remove('d-none');
            }
            
            // Make sure text-stats is visible
            const statsSection = document.getElementById('text-stats');
            if (statsSection && statsSection.classList.contains('d-none')) {
                statsSection.classList.remove('d-none');
            }
            
            // Add text to the results container as well for reference
            const resultsContainer = document.getElementById('results-container');
            if (resultsContainer) {
                const truncatedText = text.length > 250 ? `${text.substring(0, 250)}...` : text;
                resultsContainer.innerHTML = `<div class="result-preview">${truncatedText}</div>`;
            }
            
            this.updateTextStats();
        } else {
            console.error('Output text element not found');
        }
    }

    handlePaste() {
        navigator.clipboard.readText().then(text => {
            const inputElem = document.getElementById('text-input');
            if (inputElem) {
                inputElem.value = text;
                this.onTextInput();
                this.showSuccess('Text pasted successfully');
            }
        }).catch(err => {
            this.showError('Failed to read from clipboard. Please paste manually.');
        });
    }

    onTextInput() {
        this.updateTextStats();
        this.saveToLocalStorage();
        
        const inputElem = document.getElementById('text-input');
        if (!inputElem) return;
        
        const text = inputElem.value;
        if (text && text.length > 10000) {
            this.showWarning('Large text detected. Performance may be slower for very long texts.');
        }
    }

    updateTextStats() {
        const inputText = document.getElementById('text-input')?.value || '';
        const outputText = document.getElementById('output-text')?.value || '';
        
        // Update simple stats in stat-items
        const updateStat = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };
        
        // Update the stats display
        updateStat('stat-characters', inputText.length);
        updateStat('stat-words', this.countWords(inputText));
        updateStat('stat-sentences', this.countSentences(inputText));
        updateStat('stat-uppercase', this.countUppercase(inputText));
        updateStat('stat-lowercase', this.countLowercase(inputText));
    }

    countWords(text) {
        if (!text || !text.trim()) return 0;
        return text.trim().split(/\s+/).length;
    }

    countSentences(text) {
        if (!text || !text.trim()) return 0;
        // Count sentences by looking for periods followed by spaces or end of text
        return (text.match(/[.!?]+(?:\s|$)/g) || []).length;
    }
    
    countUppercase(text) {
        if (!text) return 0;
        return (text.match(/[A-Z]/g) || []).length;
    }
    
    countLowercase(text) {
        if (!text) return 0;
        return (text.match(/[a-z]/g) || []).length;
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
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        // Take the most recent items, up to 5, and display them in reverse order (newest first)
        this.conversionHistory.slice(-5).reverse().forEach((item) => {
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
        const inputElem = document.getElementById('text-input');
        const outputElem = document.getElementById('output-text');
        
        if (inputElem && outputElem) {
            inputElem.value = historyItem.input;
            outputElem.value = historyItem.output;
            this.updateTextStats();
            this.updateWordList();
            this.showSuccess(`Restored: ${historyItem.operation}`);
        }
    }

    // Word list feature
    initializeWordListFeature() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'toggle-word-list-btn';
        toggleBtn.className = 'btn btn-secondary mt-1-5';
        toggleBtn.innerHTML = '<i class="fas fa-list"></i> Show Word List';
        
        // Insert the toggle button before the bulk processing section
        const bulkProcessing = document.querySelector('.bulk-processing');
        if (bulkProcessing && !document.getElementById('toggle-word-list-btn')) {
            bulkProcessing.parentNode.insertBefore(toggleBtn, bulkProcessing);
            
            toggleBtn.addEventListener('click', () => {
                const wordListContainer = document.getElementById('word-list-container');
                if (wordListContainer) {
                    const isCurrentlyVisible = wordListContainer.style.display !== 'none';
                    wordListContainer.style.display = isCurrentlyVisible ? 'none' : 'block';
                    toggleBtn.innerHTML = isCurrentlyVisible ? 
                        '<i class="fas fa-list"></i> Show Word List' : 
                        '<i class="fas fa-times"></i> Hide Word List';
                    
                    if (!isCurrentlyVisible) {
                        this.updateWordList();
                    }
                }
            });
        }
        
        // Add event listener for the format dropdown
        document.getElementById('word-list-format')?.addEventListener('change', () => this.updateWordList());
    }

    updateWordList() {
        const wordListContainer = document.getElementById('word-list-container');
        const wordListOutput = document.getElementById('word-list-output');
        
        if (!wordListContainer || !wordListOutput || wordListContainer.style.display === 'none') return;
        
        const text = document.getElementById('output-text')?.value || document.getElementById('text-input')?.value || '';
        const formatSelect = document.getElementById('word-list-format');
        const format = formatSelect ? formatSelect.value : 'lines';
        
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
        const fileInput = event.target;
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            this.showError('No file selected');
            return;
        }
        
        const file = fileInput.files[0];
        if (!file) return;
        
        if (file.type !== 'text/plain' && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
            this.showError('Please select a text file (.txt, .md)');
            fileInput.value = ''; // Clear the input
            return;
        }
        
        if (file.size > 1024 * 1024 * 5) { // 5MB limit
            this.showError('File size must be less than 5MB');
            fileInput.value = ''; // Clear the input
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const textInput = document.getElementById('text-input');
            if (textInput) {
                textInput.value = e.target.result;
                this.onTextInput();
                this.showSuccess(`File "${file.name}" loaded successfully`);
            }
        };
        reader.onerror = () => {
            this.showError('Error reading file');
        };
        reader.readAsText(file);
    }

    downloadOutput() {
        const outputText = document.getElementById('output-text')?.value;
        if (!outputText || !outputText.trim()) {
            this.showError('No converted text to download');
            return;
        }
        
        const blob = new Blob([outputText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted-text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Text downloaded successfully');
        this.trackAction('download_text');
    }

    copyAllResults() {
        const outputText = document.getElementById('output-text')?.value;
        if (!outputText || !outputText.trim()) {
            this.showError('No converted text to copy');
            return;
        }
        
        navigator.clipboard.writeText(outputText).then(() => {
            this.showSuccess('All results copied to clipboard');
            this.trackAction('copy_all_results');
        }).catch(err => {
            this.showError('Failed to copy results');
        });
    }

    // Added: Bulk processing feature implementation
    processBulkText() {
        const bulkInput = document.getElementById('bulk-input');
        if (!bulkInput || !bulkInput.value.trim()) {
            this.showError('Please enter text in the bulk processing area');
            return;
        }
        
        // Get options
        const removeEmptyLines = document.getElementById('remove-empty-lines')?.checked ?? true;
        const trimWhitespace = document.getElementById('trim-whitespace')?.checked ?? true;
        const removeDuplicates = document.getElementById('remove-duplicates')?.checked ?? false;
        
        // Get the input lines
        let lines = bulkInput.value.split('\n');
        
        // Apply options
        if (trimWhitespace) {
            lines = lines.map(line => line.trim());
        }
        
        if (removeEmptyLines) {
            lines = lines.filter(line => line.length > 0);
        }
        
        if (removeDuplicates) {
            lines = [...new Set(lines)];
        }
        
        // Determine which case conversion to apply from the most recently used
        // Default to lowercase if no history
        const mostRecentOperation = this.conversionHistory.length > 0 ? 
            this.conversionHistory[this.conversionHistory.length - 1].operation : 'lowercase';
        
        // Convert each line based on the operation
        let convertedLines = [];
        for (const line of lines) {
            let convertedLine;
            
            // Determine conversion method based on most recent operation
            switch (mostRecentOperation.toLowerCase()) {
                case 'uppercase':
                    convertedLine = line.toUpperCase();
                    break;
                case 'lowercase':
                    convertedLine = line.toLowerCase();
                    break;
                case 'title case':
                    convertedLine = this.toTitleCase(line);
                    break;
                case 'sentence case':
                    convertedLine = this.toSentenceCase(line);
                    break;
                case 'camelcase':
                    convertedLine = this.toCamelCase(line);
                    break;
                case 'pascalcase':
                    convertedLine = this.toPascalCase(line);
                    break;
                case 'snake_case':
                    convertedLine = this.toSnakeCase(line);
                    break;
                case 'kebab-case':
                    convertedLine = this.toKebabCase(line);
                    break;
                case 'constant_case':
                    convertedLine = this.toConstantCase(line);
                    break;
                case 'alternating case':
                    convertedLine = this.toAlternatingCase(line);
                    break;
                case 'inverse case':
                    convertedLine = this.toInverseCase(line);
                    break;
                case 'random case':
                    convertedLine = line.split('').map(char => 
                        Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
                    ).join('');
                    break;
                default:
                    convertedLine = line.toLowerCase();
            }
            
            convertedLines.push(convertedLine);
        }
        
        // Update the input and output text areas
        document.getElementById('text-input').value = lines.join('\n');
        document.getElementById('output-text').value = convertedLines.join('\n');
        
        // Show success message
        this.showSuccess(`Processed ${convertedLines.length} lines of text`);
        
        // Update stats and show results
        this.updateTextStats();
        
        // Show the results section
        const resultsSection = document.getElementById('conversion-results');
        if (resultsSection) {
            resultsSection.classList.remove('d-none');
        }
        
        // Add to history
        this.addToHistory(`Bulk ${mostRecentOperation}`, lines.join('\n'), convertedLines.join('\n'));
        this.trackAction('bulk_processing');
    }

    // UI actions
    clearText() {
        const textInput = document.getElementById('text-input');
        const outputText = document.getElementById('output-text');
        
        if (textInput) textInput.value = '';
        if (outputText) outputText.value = '';
        
        // Clear results container
        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        
        // Hide the conversion-results section
        const resultsSection = document.getElementById('conversion-results');
        if (resultsSection) {
            resultsSection.classList.add('d-none');
        }
        
        this.updateTextStats();
        this.updateWordList();
        this.trackAction('clear_text');
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

    showMessage(message, type = 'info') {
        // Use the global notification system if available
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type === 'error' ? 'error' : 'success');
            return;
        }
        
        // Fall back to our own implementation
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
            const textInput = document.getElementById('text-input');
            const outputText = document.getElementById('output-text');
            
            if (!textInput || !outputText) return;
            
            const data = {
                inputText: textInput.value,
                outputText: outputText.value,
                history: this.conversionHistory,
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
            const textInput = document.getElementById('text-input');
            const outputText = document.getElementById('output-text');
            
            if (textInput && data.inputText) {
                textInput.value = data.inputText;
            }
            
            if (outputText && data.outputText) {
                outputText.value = data.outputText;
            }
            
            if (data.history) {
                this.conversionHistory = data.history;
                this.updateHistoryUI();
            }
            
            this.updateTextStats();
            
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            localStorage.removeItem('textCaseConverter');
        }
    }

    // Utility helper methods
    truncateText(text, maxLength) {
        if (!text || !text.length) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
