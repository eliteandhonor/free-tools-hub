// Random Number Generator Tool - Professional Implementation
class RandomNumberGenerator {
    constructor() {
        this.currentMode = 'single';
        this.history = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDefaultState();
        this.loadHistory();
    }

    bindEvents() {
        // Get DOM elements
        this.modeCards = document.querySelectorAll('.mode-card');
        this.minNumberInput = document.getElementById('min-number');
        this.maxNumberInput = document.getElementById('max-number');
        this.numberCountInput = document.getElementById('number-count');
        this.numberStepInput = document.getElementById('number-step');
        this.noDuplicatesCheckbox = document.getElementById('no-duplicates');
        this.sortResultsCheckbox = document.getElementById('sort-results');
        this.generateBtn = document.getElementById('generate-btn');
        this.copyBtn = document.getElementById('copy-btn');
        this.exportBtn = document.getElementById('export-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.clearHistoryBtn = document.getElementById('clear-history-btn');
        this.exportHistoryBtn = document.getElementById('export-history-btn');
        this.presetButtons = document.querySelectorAll('.preset-btn');
        
        // Result elements
        this.resultsDisplay = document.getElementById('results-display');
        this.singleResult = document.getElementById('single-result');
        this.multipleResults = document.getElementById('multiple-results');
        this.resultNumber = document.getElementById('result-number');
        this.resultRange = document.getElementById('result-range');
        this.resultList = document.getElementById('result-list');
        this.resultsStats = document.getElementById('results-stats');
        this.statsContainer = document.getElementById('stats-container');
        this.historySection = document.getElementById('history-section');
        this.historyList = document.getElementById('history-list');
        
        // Groups
        this.countGroup = document.getElementById('count-group');
        this.stepGroup = document.getElementById('step-group');

        // Bind events
        this.modeCards.forEach(card => {
            card.addEventListener('click', () => this.switchMode(card.dataset.mode));
        });

        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', () => this.applyPreset(btn));
        });

        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generateNumbers());
        }

        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => this.copyResults());
        }

        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.exportResults());
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearResults());
        }

        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }

        if (this.exportHistoryBtn) {
            this.exportHistoryBtn.addEventListener('click', () => this.exportHistory());
        }

        // Input validation events
        [this.minNumberInput, this.maxNumberInput, this.numberCountInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.validateInputs());
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.generateNumbers();
                });
            }
        });
    }

    setupDefaultState() {
        this.clearMessages();
        this.switchMode('single');
        this.validateInputs();
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        // Update mode cards
        this.modeCards.forEach(card => {
            card.classList.toggle('active', card.dataset.mode === mode);
        });

        // Update UI based on mode
        switch (mode) {
            case 'single':
                this.countGroup.style.display = 'none';
                this.stepGroup.style.display = 'none';
                this.generateBtn.innerHTML = '<i class="fas fa-play"></i> Generate Number';
                break;
            case 'multiple':
                this.countGroup.style.display = 'block';
                this.stepGroup.style.display = 'none';
                this.generateBtn.innerHTML = '<i class="fas fa-play"></i> Generate Numbers';
                break;
            case 'sequence':
                this.countGroup.style.display = 'block';
                this.stepGroup.style.display = 'block';
                this.generateBtn.innerHTML = '<i class="fas fa-play"></i> Generate Sequence';
                break;
        }

        this.validateInputs();
    }

    applyPreset(button) {
        const min = parseInt(button.dataset.min);
        const max = parseInt(button.dataset.max);
        
        if (this.minNumberInput) this.minNumberInput.value = min;
        if (this.maxNumberInput) this.maxNumberInput.value = max;
        
        this.validateInputs();
        this.showSuccess(`Preset applied: ${min}-${max}`);
    }

    validateInputs() {
        const min = parseInt(this.minNumberInput?.value);
        const max = parseInt(this.maxNumberInput?.value);
        const count = parseInt(this.numberCountInput?.value);

        let isValid = true;
        let errorMessage = '';

        if (isNaN(min) || isNaN(max)) {
            isValid = false;
            errorMessage = 'Please enter valid minimum and maximum numbers';
        } else if (min >= max) {
            isValid = false;
            errorMessage = 'Maximum number must be greater than minimum number';
        } else if (this.currentMode !== 'single' && (isNaN(count) || count < 1)) {
            isValid = false;
            errorMessage = 'Please enter a valid count (at least 1)';
        } else if (this.currentMode !== 'single' && count > 10000) {
            isValid = false;
            errorMessage = 'Maximum count is 10,000 numbers';
        } else if (this.noDuplicatesCheckbox?.checked && count > (max - min + 1)) {
            isValid = false;
            errorMessage = 'Cannot generate more unique numbers than available in range';
        }

        if (this.generateBtn) {
            this.generateBtn.disabled = !isValid;
        }

        if (!isValid && errorMessage) {
            this.showError(errorMessage);
        } else {
            this.clearMessages();
        }

        return isValid;
    }

    generateNumbers() {
        if (!this.validateInputs()) return;

        const min = parseInt(this.minNumberInput?.value);
        const max = parseInt(this.maxNumberInput?.value);
        const count = parseInt(this.numberCountInput?.value) || 1;
        const step = parseInt(this.numberStepInput?.value) || 1;
        const noDuplicates = this.noDuplicatesCheckbox?.checked || false;
        const sortResults = this.sortResultsCheckbox?.checked || false;

        let results = [];

        try {
            switch (this.currentMode) {
                case 'single':
                    results = [this.generateSecureRandom(min, max)];
                    break;
                case 'multiple':
                    results = this.generateMultipleNumbers(min, max, count, noDuplicates);
                    break;
                case 'sequence':
                    results = this.generateSequence(min, max, count, step);
                    break;
            }

            if (sortResults && results.length > 1) {
                results.sort((a, b) => a - b);
            }

            this.displayResults(results, min, max);
            this.addToHistory(results, min, max, this.currentMode);
            this.showSuccess(`Generated ${results.length} number${results.length > 1 ? 's' : ''} successfully!`);

        } catch (error) {
            this.showError('Failed to generate numbers: ' + error.message);
        }
    }

    generateSecureRandom(min, max) {
        // Use crypto.getRandomValues for cryptographically secure random numbers
        const range = max - min + 1;
        const maxValidValue = Math.floor(0xFFFFFFFF / range) * range - 1;
        
        let randomValue;
        do {
            const array = new Uint32Array(1);
            crypto.getRandomValues(array);
            randomValue = array[0];
        } while (randomValue > maxValidValue);
        
        return min + (randomValue % range);
    }

    generateMultipleNumbers(min, max, count, noDuplicates) {
        if (noDuplicates) {
            return this.generateUniqueNumbers(min, max, count);
        }

        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.generateSecureRandom(min, max));
        }
        return results;
    }

    generateUniqueNumbers(min, max, count) {
        const availableNumbers = [];
        for (let i = min; i <= max; i++) {
            availableNumbers.push(i);
        }

        // Fisher-Yates shuffle
        for (let i = availableNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * (i + 1));
            [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
        }

        return availableNumbers.slice(0, count);
    }

    generateSequence(min, max, count, step) {
        const results = [];
        let current = min;
        
        for (let i = 0; i < count && current <= max; i++) {
            results.push(current);
            current += step;
        }
        
        return results;
    }

    displayResults(results, min, max) {
        if (!this.resultsDisplay) return;

        this.resultsDisplay.style.display = 'block';

        if (this.currentMode === 'single') {
            // Single number display
            this.singleResult.style.display = 'block';
            this.multipleResults.style.display = 'none';
            
            if (this.resultNumber) {
                this.resultNumber.textContent = results[0];
            }
            if (this.resultRange) {
                this.resultRange.textContent = `${min}-${max}`;
            }
        } else {
            // Multiple numbers display
            this.singleResult.style.display = 'none';
            this.multipleResults.style.display = 'block';
            
            this.displayResultsList(results);
            this.displayResultsStats(results, min, max);
        }

        // Show action buttons
        if (this.copyBtn) this.copyBtn.style.display = 'inline-block';
        if (this.exportBtn) this.exportBtn.style.display = 'inline-block';
    }

    displayResultsList(results) {
        if (!this.resultList) return;

        this.resultList.innerHTML = '';
        results.forEach(number => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.textContent = number;
            this.resultList.appendChild(item);
        });
    }

    displayResultsStats(results, min, max) {
        if (!this.resultsStats) return;

        const stats = this.calculateStats(results);
        
        this.resultsStats.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <strong>Count:</strong> ${results.length}
                </div>
                <div class="stat-item">
                    <strong>Range:</strong> ${min}-${max}
                </div>
                <div class="stat-item">
                    <strong>Sum:</strong> ${stats.sum}
                </div>
                <div class="stat-item">
                    <strong>Average:</strong> ${stats.average}
                </div>
                <div class="stat-item">
                    <strong>Min Generated:</strong> ${stats.min}
                </div>
                <div class="stat-item">
                    <strong>Max Generated:</strong> ${stats.max}
                </div>
            </div>
        `;
    }

    calculateStats(results) {
        const sum = results.reduce((a, b) => a + b, 0);
        const average = (sum / results.length).toFixed(2);
        const min = Math.min(...results);
        const max = Math.max(...results);
        
        return { sum, average, min, max };
    }

    async copyResults() {
        const results = this.getCurrentResults();
        if (!results.length) {
            this.showError('No results to copy');
            return;
        }

        const text = results.join('\n');
        
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('Results copied to clipboard!');
        } catch (error) {
            this.fallbackCopyToClipboard(text);
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
            this.showSuccess('Results copied to clipboard!');
        } catch (error) {
            this.showError('Failed to copy to clipboard');
        }
        
        document.body.removeChild(textArea);
    }

    exportResults() {
        const results = this.getCurrentResults();
        if (!results.length) {
            this.showError('No results to export');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `random-numbers-${timestamp}.txt`;
        const content = results.join('\n');

        this.downloadFile(content, filename);
        this.showSuccess('Results exported successfully!');
    }

    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    getCurrentResults() {
        if (this.currentMode === 'single') {
            const number = this.resultNumber?.textContent;
            return number ? [parseInt(number)] : [];
        } else {
            const items = this.resultList?.querySelectorAll('.result-item');
            return items ? Array.from(items).map(item => parseInt(item.textContent)) : [];
        }
    }

    addToHistory(results, min, max, mode) {
        const entry = {
            timestamp: new Date().toISOString(),
            results: results,
            range: `${min}-${max}`,
            mode: mode,
            count: results.length
        };

        this.history.unshift(entry);
        
        // Keep only last 50 entries
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        this.saveHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (!this.historyList) return;

        if (this.history.length === 0) {
            this.historySection.style.display = 'none';
            return;
        }

        this.historySection.style.display = 'block';
        this.historyList.innerHTML = '';

        this.history.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            const resultsText = entry.results.length === 1 ? 
                entry.results[0].toString() : 
                `${entry.count} numbers: ${entry.results.slice(0, 5).join(', ')}${entry.results.length > 5 ? '...' : ''}`;
            
            item.innerHTML = `
                <div>
                    <strong>${resultsText}</strong><br>
                    <small>Range: ${entry.range} | Mode: ${entry.mode} | ${new Date(entry.timestamp).toLocaleString()}</small>
                </div>
                <button class="btn btn-sm" onclick="randomGenerator.useHistoryEntry(${index})">
                    <i class="fas fa-redo"></i> Use
                </button>
            `;
            
            this.historyList.appendChild(item);
        });
    }

    useHistoryEntry(index) {
        const entry = this.history[index];
        if (!entry) return;

        // Parse range
        const [min, max] = entry.range.split('-').map(Number);
        
        // Set inputs
        if (this.minNumberInput) this.minNumberInput.value = min;
        if (this.maxNumberInput) this.maxNumberInput.value = max;
        if (this.numberCountInput) this.numberCountInput.value = entry.count;
        
        // Switch mode
        this.switchMode(entry.mode);
        
        this.showSuccess('History entry loaded!');
    }

    clearResults() {
        if (this.resultsDisplay) {
            this.resultsDisplay.style.display = 'none';
        }
        
        if (this.copyBtn) this.copyBtn.style.display = 'none';
        if (this.exportBtn) this.exportBtn.style.display = 'none';
        
        this.clearMessages();
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.updateHistoryDisplay();
        this.showSuccess('History cleared!');
    }

    exportHistory() {
        if (this.history.length === 0) {
            this.showError('No history to export');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `random-numbers-history-${timestamp}.json`;
        const content = JSON.stringify(this.history, null, 2);

        this.downloadFile(content, filename);
        this.showSuccess('History exported successfully!');
    }

    saveHistory() {
        try {
            localStorage.setItem('randomNumberHistory', JSON.stringify(this.history));
        } catch (error) {
            console.warn('Failed to save history to localStorage:', error);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('randomNumberHistory');
            if (saved) {
                this.history = JSON.parse(saved);
                this.updateHistoryDisplay();
            }
        } catch (error) {
            console.warn('Failed to load history from localStorage:', error);
            this.history = [];
        }
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
let randomGenerator;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    randomGenerator = new RandomNumberGenerator();
});

// Analytics tracking
if (typeof gtag === 'function') {
    gtag('event', 'tool_usage', {
        'event_category': 'Generator Tools',
        'event_label': 'Random Number Generator'
    });
}
