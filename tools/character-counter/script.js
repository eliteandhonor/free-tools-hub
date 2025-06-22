// Character Counter Tool - Professional Implementation
class CharacterCounter {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDefaultState();
    }

    bindEvents() {
        // Get DOM elements
        this.textInput = document.getElementById('text-input');
        this.clearBtn = document.querySelector('.clear-btn');
        this.copyBtn = document.querySelector('.copy-btn');
        this.pasteBtn = document.getElementById('paste-btn');
        this.fileInput = document.getElementById('file-upload');
        
        // Result elements
        this.charactersTotal = document.getElementById('char-count');
        this.charactersNoSpaces = document.getElementById('char-no-spaces');
        this.wordsCount = document.getElementById('word-count');
        this.sentencesCount = document.getElementById('sentence-count');
        this.paragraphsCount = document.getElementById('paragraph-count');
        this.linesCount = document.getElementById('line-count');
        this.readingTime = document.getElementById('reading-time');
        this.speakingTime = document.getElementById('speaking-time');
        
        // Options
        this.countSpacesCheckbox = document.getElementById('count-spaces');
        this.countNewlinesCheckbox = document.getElementById('count-newlines');

        // Bind events
        if (this.textInput) {
            this.textInput.addEventListener('input', () => this.updateCounts());
            this.textInput.addEventListener('paste', () => {
                // Delay to allow paste to complete
                setTimeout(() => this.updateCounts(), 10);
            });
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearAll());
        }

        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => this.copyText());
        }

        if (this.pasteBtn) {
            this.pasteBtn.addEventListener('click', () => this.pasteText());
        }

        if (this.fileUploadBtn) {
            this.fileUploadBtn.addEventListener('click', () => this.fileInput?.click());
        }

        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Options
        [this.countSpacesCheckbox, this.countNewlinesCheckbox].forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', () => this.updateCounts());
            }
        });
    }

    setupDefaultState() {
        this.clearMessages();
        this.updateCounts();
    }

    updateCounts() {
        const text = this.textInput?.value || '';
        
        // Calculate all metrics
        const counts = this.calculateCounts(text);
        
        // Update display
        this.displayCounts(counts);
        
        // Update detailed statistics if available
        this.updateDetailedStats(text, counts);
    }

    calculateCounts(text) {
        const counts = {
            charactersTotal: 0,
            charactersNoSpaces: 0,
            charactersNoSpacesNoNewlines: 0,
            words: 0,
            sentences: 0,
            paragraphs: 0,
            lines: 0,
            readingTime: 0,
            speakingTime: 0,
            uniqueWords: 0,
            averageWordsPerSentence: 0,
            longestWord: '',
            mostCommonWord: ''
        };

        if (!text) {
            return counts;
        }

        // Character counts
        counts.charactersTotal = text.length;
        counts.charactersNoSpaces = text.replace(/\s/g, '').length;
        counts.charactersNoSpacesNoNewlines = text.replace(/[\s\n\r]/g, '').length;

        // Word count
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        counts.words = words.length;

        // Unique words
        const uniqueWords = new Set(words.map(word => word.toLowerCase().replace(/[^\w]/g, '')));
        counts.uniqueWords = uniqueWords.size;

        // Sentences count (split by .!? followed by space or end of string)
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        counts.sentences = sentences.length;

        // Paragraphs count (split by double newlines or more)
        const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
        counts.paragraphs = Math.max(paragraphs.length, text.trim() ? 1 : 0);

        // Lines count
        counts.lines = text.split('\n').length;

        // Reading time (average 200-250 words per minute)
        counts.readingTime = counts.words / 225; // minutes

        // Speaking time (average 150-160 words per minute)
        counts.speakingTime = counts.words / 155; // minutes

        // Average words per sentence
        counts.averageWordsPerSentence = counts.sentences > 0 ? counts.words / counts.sentences : 0;

        // Longest word
        if (words.length > 0) {
            counts.longestWord = words.reduce((longest, current) => 
                current.length > longest.length ? current : longest
            );
        }

        // Most common word
        if (words.length > 0) {
            const wordFrequency = {};
            words.forEach(word => {
                const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
                if (cleanWord.length > 2) { // Ignore very short words
                    wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
                }
            });
            
            const mostCommon = Object.entries(wordFrequency)
                .sort(([,a], [,b]) => b - a)[0];
            
            if (mostCommon) {
                counts.mostCommonWord = `${mostCommon[0]} (${mostCommon[1]}×)`;
            }
        }

        return counts;
    }

    displayCounts(counts) {
        // Update main counter displays
        if (this.charactersTotal) {
            this.charactersTotal.textContent = counts.charactersTotal.toLocaleString();
        }
        if (this.charactersNoSpaces) {
            this.charactersNoSpaces.textContent = counts.charactersNoSpaces.toLocaleString();
        }
        if (this.wordsCount) {
            this.wordsCount.textContent = counts.words.toLocaleString();
        }
        if (this.sentencesCount) {
            this.sentencesCount.textContent = counts.sentences.toLocaleString();
        }
        if (this.paragraphsCount) {
            this.paragraphsCount.textContent = counts.paragraphs.toLocaleString();
        }
        if (this.linesCount) {
            this.linesCount.textContent = counts.lines.toLocaleString();
        }
        // Social Media Limits
        this.updateSocialMediaLimits(counts.charactersTotal);
        // Reading Time Estimation
        this.updateReadingTimes(counts.words);
        // Text Analysis
        this.updateTextAnalysis(counts);
    }

    updateSocialMediaLimits(charCount) {
        const limits = [
            { id: 'twitter', max: 280 },
            { id: 'instagram', max: 2200 },
            { id: 'facebook', max: 63206 },
            { id: 'linkedin', max: 3000 },
            { id: 'youtube', max: 5000 },
            { id: 'tiktok', max: 2200 }
        ];
        limits.forEach(({ id, max }) => {
            const countEl = document.getElementById(`${id}-count`);
            const remainingEl = document.getElementById(`${id}-remaining`);
            if (countEl) countEl.textContent = charCount.toLocaleString();
            if (remainingEl) remainingEl.textContent = `${(max - charCount).toLocaleString()} remaining`;
        });
    }

    updateReadingTimes(wordCount) {
        const speeds = [
            { id: 'reading-slow', wpm: 200 },
            { id: 'reading-average', wpm: 250 },
            { id: 'reading-fast', wpm: 300 }
        ];
        speeds.forEach(({ id, wpm }) => {
            const el = document.getElementById(id);
            if (el) {
                const min = wordCount / wpm;
                el.textContent = min < 1 ? '0 min' : `${Math.round(min)} min`;
            }
        });
    }

    updateTextAnalysis(counts) {
        const avgWordsSentence = document.getElementById('avg-words-sentence');
        const avgCharsWord = document.getElementById('avg-chars-word');
        const longestWord = document.getElementById('longest-word');
        const readability = document.getElementById('readability-score');
        if (avgWordsSentence) avgWordsSentence.textContent = counts.averageWordsPerSentence.toFixed(1);
        if (avgCharsWord) avgCharsWord.textContent = this.getAverageWordLength(this.textInput.value).toFixed(1);
        if (longestWord) longestWord.textContent = counts.longestWord || '-';
        if (readability) readability.textContent = this.getReadabilityLevel(counts);
    }

    updateDetailedStats(text, counts) {
        const detailedStatsContainer = document.getElementById('detailed-stats');
        if (!detailedStatsContainer) return;

        const stats = `
            <div class="stats-grid">
                <div class="stat-group">
                    <h4>Character Analysis</h4>
                    <div class="stat-item">
                        <span class="stat-label">Total Characters:</span>
                        <span class="stat-value">${counts.charactersTotal.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Without Spaces:</span>
                        <span class="stat-value">${counts.charactersNoSpaces.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Letters Only:</span>
                        <span class="stat-value">${this.countLetters(text).toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Numbers:</span>
                        <span class="stat-value">${this.countNumbers(text).toLocaleString()}</span>
                    </div>
                </div>

                <div class="stat-group">
                    <h4>Word Analysis</h4>
                    <div class="stat-item">
                        <span class="stat-label">Total Words:</span>
                        <span class="stat-value">${counts.words.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Unique Words:</span>
                        <span class="stat-value">${counts.uniqueWords.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Average Word Length:</span>
                        <span class="stat-value">${this.getAverageWordLength(text).toFixed(1)} chars</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Longest Word:</span>
                        <span class="stat-value">${counts.longestWord} (${counts.longestWord.length} chars)</span>
                    </div>
                </div>

                <div class="stat-group">
                    <h4>Structure Analysis</h4>
                    <div class="stat-item">
                        <span class="stat-label">Sentences:</span>
                        <span class="stat-value">${counts.sentences.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Paragraphs:</span>
                        <span class="stat-value">${counts.paragraphs.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Lines:</span>
                        <span class="stat-value">${counts.lines.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Avg Words/Sentence:</span>
                        <span class="stat-value">${counts.averageWordsPerSentence.toFixed(1)}</span>
                    </div>
                </div>

                <div class="stat-group">
                    <h4>Reading Metrics</h4>
                    <div class="stat-item">
                        <span class="stat-label">Reading Time:</span>
                        <span class="stat-value">${this.formatTime(counts.readingTime)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Speaking Time:</span>
                        <span class="stat-value">${this.formatTime(counts.speakingTime)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Most Common:</span>
                        <span class="stat-value">${counts.mostCommonWord || 'N/A'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Readability:</span>
                        <span class="stat-value">${this.getReadabilityLevel(counts)}</span>
                    </div>
                </div>
            </div>
        `;

        detailedStatsContainer.innerHTML = stats;
    }

    countLetters(text) {
        return (text.match(/[a-zA-Z]/g) || []).length;
    }

    countNumbers(text) {
        return (text.match(/[0-9]/g) || []).length;
    }

    getAverageWordLength(text) {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length === 0) return 0;
        
        const totalLength = words.reduce((sum, word) => sum + word.replace(/[^\w]/g, '').length, 0);
        return totalLength / words.length;
    }

    getReadabilityLevel(counts) {
        if (counts.words === 0) return 'N/A';
        
        const avgWordsPerSentence = counts.averageWordsPerSentence;
        
        if (avgWordsPerSentence < 10) return 'Very Easy';
        if (avgWordsPerSentence < 15) return 'Easy';
        if (avgWordsPerSentence < 20) return 'Moderate';
        if (avgWordsPerSentence < 25) return 'Difficult';
        return 'Very Difficult';
    }

    formatTime(minutes) {
        if (minutes < 1) {
            const seconds = Math.round(minutes * 60);
            return `${seconds} sec`;
        } else if (minutes < 60) {
            const mins = Math.floor(minutes);
            const secs = Math.round((minutes - mins) * 60);
            return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
    }

    async copyText() {
        const text = this.textInput?.value;
        
        if (!text) {
            this.showError('No text to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('Text copied to clipboard!');
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
            this.showSuccess('Text copied to clipboard!');
        } catch (error) {
            this.showError('Failed to copy to clipboard');
        }
        
        document.body.removeChild(textArea);
    }

    async pasteText() {
        try {
            const text = await navigator.clipboard.readText();
            if (this.textInput) {
                this.textInput.value = text;
                this.updateCounts();
                this.showSuccess('Text pasted from clipboard!');
            }
        } catch (error) {
            this.showError('Failed to paste from clipboard. Please paste manually.');
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showError('File too large. Maximum size is 10MB.');
            return;
        }

        // Check if it's a text file
        if (!file.type.startsWith('text/') && !this.isTextFile(file.name)) {
            this.showError('Please select a text file (.txt, .md, .csv, etc.)');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                if (this.textInput) {
                    this.textInput.value = text;
                    this.updateCounts();
                    this.showSuccess(`File "${file.name}" loaded successfully!`);
                }
            } catch (error) {
                this.showError('Failed to read file: ' + error.message);
            }
        };

        reader.onerror = () => {
            this.showError('Failed to read file');
        };

        reader.readAsText(file);
    }

    isTextFile(filename) {
        const textExtensions = ['.txt', '.md', '.csv', '.json', '.xml', '.html', '.css', '.js', '.py', '.java', '.cpp', '.c', '.h', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.ts', '.jsx', '.vue', '.scss', '.less', '.yaml', '.yml', '.ini', '.cfg', '.log'];
        return textExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    }

    clearAll() {
        if (this.textInput) {
            this.textInput.value = '';
        }
        if (this.fileInput) {
            this.fileInput.value = '';
        }
        
        this.updateCounts();
        this.clearMessages();
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CharacterCounter();
});

// Analytics tracking
if (typeof gtag === 'function') {
    gtag('event', 'tool_usage', {
        'event_category': 'Text Tools',
        'event_label': 'Character Counter'
    });
}
