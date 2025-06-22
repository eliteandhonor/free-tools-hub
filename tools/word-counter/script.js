/**
 * Word Counter Tool
 * Professional word, character, and text analysis tool
 */

class WordCounter {
    constructor() {
        this.textHistory = [];
        this.maxHistorySize = 10;
        this.settings = {
            includeSpaces: true,
            countPunctuation: true,
            realTimeCount: true,
            showReadingTime: true,
            showKeywordDensity: false
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromLocalStorage();
        this.initializeSettings();
        this.setupKeyboardShortcuts();
    }

    bindEvents() {
        // Text input events
        const textInput = document.getElementById('text-input');
        if (textInput) {
            textInput.addEventListener('input', () => this.onTextInput());
            textInput.addEventListener('paste', () => {
            // Small delay to allow paste to complete
            setTimeout(() => this.onTextInput(), 10);
        });
        }

        // Action buttons
        document.querySelector('.clear-btn').addEventListener('click', () => this.clearText());
        document.querySelector('.copy-btn').addEventListener('click', () => this.copyText());
        const copyStatsBtn = document.querySelector('.copy-stats-btn');
        if (copyStatsBtn) copyStatsBtn.addEventListener('click', () => this.copyStats());
        document.querySelector('.download-btn').addEventListener('click', () => this.downloadText());

        // File upload
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileUpload(e));
        document.querySelector('.upload-btn')?.addEventListener('click', () => document.getElementById('file-input').click());

        // Settings toggles
        const includeSpaces = document.getElementById('include-spaces');
        if (includeSpaces) {
            includeSpaces.addEventListener('change', (e) => {
                this.settings.includeSpaces = e.target.checked;
                this.updateCounts();
                this.saveSettings();
            });
        }

        const countPunctuation = document.getElementById('count-punctuation');
        if (countPunctuation) {
            countPunctuation.addEventListener('change', (e) => {
                this.settings.countPunctuation = e.target.checked;
                this.updateCounts();
                this.saveSettings();
            });
        }

        const realTimeCount = document.getElementById('real-time-count');
        if (realTimeCount) {
            realTimeCount.addEventListener('change', (e) => {
                this.settings.realTimeCount = e.target.checked;
                this.saveSettings();
            });
        }

        const showReadingTime = document.getElementById('show-reading-time');
        if (showReadingTime) {
            showReadingTime.addEventListener('change', (e) => {
                this.settings.showReadingTime = e.target.checked;
                this.updateCounts();
                this.saveSettings();
            });
        }

        const showKeywordDensity = document.getElementById('show-keyword-density');
        if (showKeywordDensity) {
            showKeywordDensity.addEventListener('change', (e) => {
                this.settings.showKeywordDensity = e.target.checked;
                this.toggleKeywordDensity(e.target.checked);
                this.saveSettings();
            });
        }

        // Analysis options
        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) analyzeBtn.addEventListener('click', () => this.performDetailedAnalysis());
        const exportAnalysisBtn = document.getElementById('export-analysis-btn');
        if (exportAnalysisBtn) exportAnalysisBtn.addEventListener('click', () => this.exportAnalysis());

        // Target goals
        const wordGoalInput = document.getElementById('word-goal');
        if (wordGoalInput) {
            wordGoalInput.addEventListener('input', () => this.updateGoalProgress());
        }
        const charGoalInput = document.getElementById('char-goal');
        if (charGoalInput) {
            charGoalInput.addEventListener('input', () => this.updateGoalProgress());
        }

        // Auto-save functionality
        setInterval(() => this.saveToLocalStorage(), 5000);
        window.addEventListener('beforeunload', () => this.saveToLocalStorage());

        // Text formatting buttons
        const uppercaseBtn = document.getElementById('uppercase-btn');
        if (uppercaseBtn) uppercaseBtn.addEventListener('click', () => this.transformText('uppercase'));
        const lowercaseBtn = document.getElementById('lowercase-btn');
        if (lowercaseBtn) lowercaseBtn.addEventListener('click', () => this.transformText('lowercase'));
        const sentenceCaseBtn = document.getElementById('sentence-case-btn');
        if (sentenceCaseBtn) sentenceCaseBtn.addEventListener('click', () => this.transformText('sentence'));
        const removeSpacesBtn = document.getElementById('remove-extra-spaces-btn');
        if (removeSpacesBtn) removeSpacesBtn.addEventListener('click', () => this.transformText('spaces'));

        // History navigation
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        const redoBtn = document.getElementById('redo-btn');
        if (redoBtn) redoBtn.addEventListener('click', () => this.redo());
    }

    onTextInput() {
        const text = document.getElementById('text-input').value;
        
        if (this.settings.realTimeCount) {
            this.updateCounts();
        }
        
        if (document.getElementById('word-goal') || document.getElementById('char-goal')) {
            this.updateGoalProgress();
        }
        this.saveToLocalStorage();
        
        // Add to history for undo/redo
        this.addToHistory(text);
        
        // Show/hide clear button based on content
        const clearBtn = document.querySelector('.clear-btn');
        clearBtn.style.display = text.length > 0 ? 'inline-block' : 'none';
        
        // Update keyword density if enabled
        if (this.settings.showKeywordDensity) {
            this.updateKeywordDensity();
        }
    }

    updateCounts() {
        const text = document.getElementById('text-input').value;
        const stats = this.analyzeText(text);
        
        // Update main counters
        document.getElementById('word-count').textContent = stats.words;
        document.getElementById('char-count').textContent = stats.characters;
        document.getElementById('char-no-spaces-count').textContent = stats.charactersNoSpaces;
        document.getElementById('paragraph-count').textContent = stats.paragraphs;
        document.getElementById('sentence-count').textContent = stats.sentences;
        document.getElementById('line-count').textContent = stats.lines;
        
        // Update additional stats
        document.getElementById('avg-words-per-sentence').textContent = stats.avgWordsPerSentence;
        document.getElementById('avg-chars-per-word').textContent = stats.avgCharsPerWord;
        document.getElementById('longest-word').textContent = stats.longestWord;
        document.getElementById('most-frequent-word').textContent = stats.mostFrequentWord;
        
        // Update reading time if enabled
        if (this.settings.showReadingTime) {
            document.getElementById('reading-time').textContent = this.calculateReadingTime(stats.words);
            document.getElementById('speaking-time').textContent = this.calculateSpeakingTime(stats.words);
        }
        
        // Update complexity metrics
        this.updateComplexityMetrics(stats);
        
        // Animate counters
        this.animateCounters();
    }

    analyzeText(text) {
        if (!text.trim()) {
            return {
                words: 0,
                characters: 0,
                charactersNoSpaces: 0,
                paragraphs: 0,
                sentences: 0,
                lines: 0,
                avgWordsPerSentence: 0,
                avgCharsPerWord: 0,
                longestWord: '',
                mostFrequentWord: '',
                wordFrequency: {},
                readabilityScore: 0
            };
        }

        const stats = {};
        
        // Character counts
        stats.characters = text.length;
        stats.charactersNoSpaces = text.replace(/\s/g, '').length;
        
        // Line count
        stats.lines = text.split('\n').length;
        
        // Paragraph count (non-empty paragraphs)
        stats.paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
        
        // Word count and analysis
        const words = this.extractWords(text);
        stats.words = words.length;
        
        // Sentence count
        stats.sentences = this.countSentences(text);
        
        // Average calculations
        stats.avgWordsPerSentence = stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : 0;
        stats.avgCharsPerWord = stats.words > 0 ? (stats.charactersNoSpaces / stats.words).toFixed(1) : 0;
        
        // Word analysis
        if (words.length > 0) {
            // Longest word
            stats.longestWord = words.reduce((longest, word) => 
                word.length > longest.length ? word : longest, '');
            
            // Word frequency
            stats.wordFrequency = this.calculateWordFrequency(words);
            
            // Most frequent word
            const frequencies = Object.entries(stats.wordFrequency);
            if (frequencies.length > 0) {
                stats.mostFrequentWord = frequencies.reduce((a, b) => a[1] > b[1] ? a : b)[0];
            } else {
                stats.mostFrequentWord = '';
            }
        } else {
            stats.longestWord = '';
            stats.mostFrequentWord = '';
            stats.wordFrequency = {};
        }
        
        // Readability score (simplified Flesch Reading Ease)
        stats.readabilityScore = this.calculateReadabilityScore(stats);
        
        return stats;
    }

    extractWords(text) {
        // Remove extra whitespace and split into words
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, this.settings.countPunctuation ? ' ' : '')
            .split(/\s+/)
            .filter(word => word.length > 0);
        
        return words;
    }

    countSentences(text) {
        // Count sentences based on punctuation
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        return sentences.length;
    }

    calculateWordFrequency(words) {
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        return frequency;
    }

    calculateReadabilityScore(stats) {
        if (stats.sentences === 0 || stats.words === 0) return 0;
        
        const avgSentenceLength = stats.words / stats.sentences;
        const avgSyllables = stats.charactersNoSpaces / stats.words; // Simplified syllable count
        
        // Simplified Flesch Reading Ease score
        const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllables);
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    calculateReadingTime(wordCount) {
        // Average reading speed: 200-250 words per minute
        const wordsPerMinute = 225;
        const minutes = wordCount / wordsPerMinute;

        // Show "0 min" when there is no text
        if (wordCount === 0) {
            return '0 min';
        } else if (minutes < 1) {
            return '< 1 min';
        } else if (minutes < 60) {
            return `${Math.round(minutes)} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = Math.round(minutes % 60);
            return `${hours}h ${remainingMinutes}m`;
        }
    }

    calculateSpeakingTime(wordCount) {
        // Average speaking speed: 150-160 words per minute
        const wordsPerMinute = 155;
        const minutes = wordCount / wordsPerMinute;

        // Show "0 min" when there is no text
        if (wordCount === 0) {
            return '0 min';
        } else if (minutes < 1) {
            return '< 1 min';
        } else if (minutes < 60) {
            return `${Math.round(minutes)} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = Math.round(minutes % 60);
            return `${hours}h ${remainingMinutes}m`;
        }
    }

    updateComplexityMetrics(stats) {
        // Readability score with interpretation
        const readabilityElement = document.getElementById('readability-score');
        readabilityElement.textContent = stats.readabilityScore;
        
        const readabilityLevel = document.getElementById('readability-level');
        let level, color;
        
        if (stats.readabilityScore >= 90) {
            level = 'Very Easy';
            color = '#10b981';
        } else if (stats.readabilityScore >= 80) {
            level = 'Easy';
            color = '#34d399';
        } else if (stats.readabilityScore >= 70) {
            level = 'Fairly Easy';
            color = '#fbbf24';
        } else if (stats.readabilityScore >= 60) {
            level = 'Standard';
            color = '#f59e0b';
        } else if (stats.readabilityScore >= 50) {
            level = 'Fairly Difficult';
            color = '#f97316';
        } else if (stats.readabilityScore >= 30) {
            level = 'Difficult';
            color = '#ef4444';
        } else {
            level = 'Very Difficult';
            color = '#dc2626';
        }
        
        readabilityLevel.textContent = level;
        readabilityLevel.style.color = color;
    }

    updateGoalProgress() {
        const text = document.getElementById('text-input').value;
        const stats = this.analyzeText(text);

        const wordGoalInput = document.getElementById('word-goal');
        const charGoalInput = document.getElementById('char-goal');

        if (!wordGoalInput && !charGoalInput) {
            return;
        }

        const wordGoal = parseInt(wordGoalInput?.value) || 0;
        const charGoal = parseInt(charGoalInput?.value) || 0;
        
        // Update word goal progress
        const wordProgressBar = document.getElementById('word-progress');
        const wordProgressText = document.getElementById('word-progress-text');
        if (wordProgressBar && wordProgressText) {
            if (wordGoal > 0) {
                const wordProgress = Math.min(100, (stats.words / wordGoal) * 100);
                wordProgressBar.style.width = wordProgress + '%';
                wordProgressText.textContent =
                    `${stats.words} / ${wordGoal} words (${Math.round(wordProgress)}%)`;

                if (stats.words >= wordGoal) {
                    wordProgressBar.style.backgroundColor = '#10b981';
                    this.showGoalAchieved('word');
                } else {
                    wordProgressBar.style.backgroundColor = '#3b82f6';
                }
            } else {
                wordProgressBar.style.width = '0%';
                wordProgressText.textContent = 'Set a word goal';
            }
        }
        
        // Update character goal progress
        const charProgressBar = document.getElementById('char-progress');
        const charProgressText = document.getElementById('char-progress-text');
        if (charProgressBar && charProgressText) {
            if (charGoal > 0) {
                const charProgress = Math.min(100, (stats.characters / charGoal) * 100);
                charProgressBar.style.width = charProgress + '%';
                charProgressText.textContent =
                    `${stats.characters} / ${charGoal} characters (${Math.round(charProgress)}%)`;

                if (stats.characters >= charGoal) {
                    charProgressBar.style.backgroundColor = '#10b981';
                    this.showGoalAchieved('character');
                } else {
                    charProgressBar.style.backgroundColor = '#3b82f6';
                }
            } else {
                charProgressBar.style.width = '0%';
                charProgressText.textContent = 'Set a character goal';
            }
        }
    }

    showGoalAchieved(type) {
        // Prevent multiple notifications
        if (this.goalNotification) return;
        
        this.goalNotification = true;
        this.showSuccess(`🎉 ${type} goal achieved!`);
        
        // Reset notification flag after 5 seconds
        setTimeout(() => {
            this.goalNotification = false;
        }, 5000);
    }

    toggleKeywordDensity(show) {
        const keywordSection = document.getElementById('keyword-density-section');
        if (!keywordSection) return;

        keywordSection.style.display = show ? 'block' : 'none';

        if (show) {
            this.updateKeywordDensity();
        }
    }

    updateKeywordDensity() {
        const text = document.getElementById('text-input').value;
        const stats = this.analyzeText(text);

        const keywordList = document.getElementById('keyword-density-list');
        if (!keywordList) return;

        if (stats.words === 0) {
            keywordList.innerHTML = '<div class="keyword-item">No text to analyze</div>';
            return;
        }
        
        // Get top 10 most frequent words (excluding common stop words)
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
        
        const filteredFrequency = Object.entries(stats.wordFrequency)
            .filter(([word, count]) => !stopWords.has(word) && word.length > 2)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        keywordList.innerHTML = '';
        
        if (filteredFrequency.length === 0) {
            keywordList.innerHTML = '<div class="keyword-item">No significant keywords found</div>';
            return;
        }
        
        filteredFrequency.forEach(([word, count]) => {
            const density = ((count / stats.words) * 100).toFixed(1);
            const item = document.createElement('div');
            item.className = 'keyword-item';
            item.innerHTML = `
                <span class="keyword-word">${word}</span>
                <span class="keyword-count">${count} times</span>
                <span class="keyword-density">${density}%</span>
            `;
            keywordList.appendChild(item);
        });
    }

    performDetailedAnalysis() {
        const text = document.getElementById('text-input').value;
        if (!text.trim()) {
            this.showError('Please enter some text to analyze.');
            return;
        }
        
        const stats = this.analyzeText(text);
        const analysis = this.generateDetailedAnalysis(stats, text);
        
        // Display analysis in modal or dedicated section
        this.displayDetailedAnalysis(analysis);
        this.trackAction('detailed_analysis');
    }

    generateDetailedAnalysis(stats, text) {
        const analysis = {
            overview: {
                totalWords: stats.words,
                totalCharacters: stats.characters,
                totalSentences: stats.sentences,
                totalParagraphs: stats.paragraphs,
                readabilityScore: stats.readabilityScore
            },
            structure: {
                avgWordsPerSentence: stats.avgWordsPerSentence,
                avgCharsPerWord: stats.avgCharsPerWord,
                longestWord: stats.longestWord,
                wordVariety: Object.keys(stats.wordFrequency).length
            },
            timing: {
                readingTime: this.calculateReadingTime(stats.words),
                speakingTime: this.calculateSpeakingTime(stats.words)
            },
            topWords: Object.entries(stats.wordFrequency)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5),
            recommendations: this.generateRecommendations(stats)
        };
        
        return analysis;
    }

    generateRecommendations(stats) {
        const recommendations = [];
        
        if (stats.avgWordsPerSentence > 20) {
            recommendations.push('Consider shorter sentences for better readability');
        }
        
        if (stats.readabilityScore < 60) {
            recommendations.push('Text may be difficult to read - consider simplifying language');
        }
        
        if (stats.paragraphs === 1 && stats.words > 100) {
            recommendations.push('Consider breaking text into multiple paragraphs');
        }
        
        if (stats.avgCharsPerWord > 6) {
            recommendations.push('Consider using shorter, more common words');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Text structure and readability look good!');
        }
        
        return recommendations;
    }

    displayDetailedAnalysis(analysis) {
        // This would typically open a modal or populate a detailed analysis section
        const analysisText = `
DETAILED TEXT ANALYSIS
=====================

OVERVIEW:
- Words: ${analysis.overview.totalWords}
- Characters: ${analysis.overview.totalCharacters}
- Sentences: ${analysis.overview.totalSentences}
- Paragraphs: ${analysis.overview.totalParagraphs}
- Readability Score: ${analysis.overview.readabilityScore}

STRUCTURE:
- Average words per sentence: ${analysis.structure.avgWordsPerSentence}
- Average characters per word: ${analysis.structure.avgCharsPerWord}
- Longest word: ${analysis.structure.longestWord}
- Unique words: ${analysis.structure.wordVariety}

TIMING:
- Reading time: ${analysis.timing.readingTime}
- Speaking time: ${analysis.timing.speakingTime}

TOP WORDS:
${analysis.topWords.map(([word, count]) => `- ${word}: ${count} times`).join('\n')}

RECOMMENDATIONS:
${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}
        `;
        
        // For now, just copy to clipboard or show in alert
        this.copyToClipboard(analysisText);
        this.showSuccess('Detailed analysis copied to clipboard!');
    }

    exportAnalysis() {
        const text = document.getElementById('text-input').value;
        if (!text.trim()) {
            this.showError('Please enter some text to export analysis.');
            return;
        }
        
        const stats = this.analyzeText(text);
        const analysis = this.generateDetailedAnalysis(stats, text);
        
        const exportData = {
            timestamp: new Date().toISOString(),
            textSample: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            analysis: analysis
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'text-analysis.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.trackAction('export_analysis');
    }

    transformText(type) {
        const textArea = document.getElementById('text-input');
        let text = textArea.value;
        
        if (!text.trim()) {
            this.showError('No text to transform.');
            return;
        }
        
        switch (type) {
            case 'uppercase':
                textArea.value = text.toUpperCase();
                break;
            case 'lowercase':
                textArea.value = text.toLowerCase();
                break;
            case 'sentence':
                textArea.value = this.toSentenceCase(text);
                break;
            case 'spaces':
                textArea.value = text.replace(/\s+/g, ' ').trim();
                break;
        }
        
        this.onTextInput();
        this.trackAction('transform_text', type);
    }

    toSentenceCase(text) {
        return text.toLowerCase().replace(/(^|\. )[a-z]/g, (letter) => letter.toUpperCase());
    }

    // File operations
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
            this.showError('Please select a text file (.txt)');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showError('File size must be less than 10MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('text-input').value = e.target.result;
            this.onTextInput();
            this.showSuccess(`File "${file.name}" loaded successfully`);
        };
        reader.onerror = () => {
            this.showError('Error reading file');
        };
        reader.readAsText(file);
        
        this.trackAction('file_upload');
    }

    downloadText() {
        const text = document.getElementById('text-input').value;
        if (!text.trim()) {
            this.showError('No text to download');
            return;
        }
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'text-content.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.trackAction('download_text');
    }

    // Utility methods
    clearText() {
        document.getElementById('text-input').value = '';
        this.onTextInput();
        this.trackAction('clear_text');
    }

    async copyText() {
        const text = document.getElementById('text-input').value;
        if (!text) {
            this.showError('No text to copy');
            return;
        }
        
        try {
            await this.copyToClipboard(text);
            this.showSuccess('Text copied to clipboard!');
            this.trackAction('copy_text');
        } catch (error) {
            this.showError('Failed to copy text');
        }
    }

    async copyStats() {
        const text = document.getElementById('text-input').value;
        const stats = this.analyzeText(text);
        
        // Improved formatting and more stats
        const statsText = `Text Statistics\n=================\n\nWords: ${stats.words}\nCharacters: ${stats.characters}\nCharacters (no spaces): ${stats.charactersNoSpaces}\nSentences: ${stats.sentences}\nParagraphs: ${stats.paragraphs}\nLines: ${stats.lines}\nAverage words per sentence: ${stats.avgWordsPerSentence}\nAverage characters per word: ${stats.avgCharsPerWord}\nLongest word: ${stats.longestWord}\nMost frequent word: ${stats.mostFrequentWord}\nReading time: ${this.calculateReadingTime(stats.words)}\nSpeaking time: ${this.calculateSpeakingTime(stats.words)}\nReadability score: ${stats.readabilityScore}\n`;
        
        try {
            await this.copyToClipboard(statsText);
            this.showSuccess('Statistics copied to clipboard!');
            this.trackAction('copy_stats');
        } catch (error) {
            this.showError('Failed to copy statistics');
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    // History management
    addToHistory(text) {
        // Don't add to history if text hasn't changed significantly
        if (this.textHistory.length > 0 && this.textHistory[this.textHistory.length - 1] === text) {
            return;
        }
        
        this.textHistory.push(text);
        
        // Limit history size
        if (this.textHistory.length > this.maxHistorySize) {
            this.textHistory.shift();
        }
    }

    undo() {
        if (this.textHistory.length <= 1) {
            this.showInfo('Nothing to undo');
            return;
        }
        
        this.textHistory.pop(); // Remove current state
        const previousText = this.textHistory[this.textHistory.length - 1];
        document.getElementById('text-input').value = previousText;
        this.onTextInput();
        
        this.trackAction('undo');
    }

    redo() {
        // Simplified redo - in a full implementation, you'd need a separate redo stack
        this.showInfo('Redo functionality would be implemented with a proper undo/redo system');
    }

    animateCounters() {
        // Add a subtle animation to counters when they update
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            counter.style.transform = 'scale(1.05)';
            setTimeout(() => {
                counter.style.transform = 'scale(1)';
            }, 150);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'l':
                        e.preventDefault();
                        this.clearText();
                        break;
                    case 'u':
                        e.preventDefault();
                        this.transformText('uppercase');
                        break;
                    case 'z':
                        if (!e.shiftKey) {
                            e.preventDefault();
                            this.undo();
                        }
                        break;
                }
            }
        });
    }

    initializeSettings() {
        // Apply saved settings to UI
        const includeSpaces = document.getElementById('include-spaces');
        if (includeSpaces) includeSpaces.checked = this.settings.includeSpaces;
        const countPunctuation = document.getElementById('count-punctuation');
        if (countPunctuation) countPunctuation.checked = this.settings.countPunctuation;
        const realTimeCount = document.getElementById('real-time-count');
        if (realTimeCount) realTimeCount.checked = this.settings.realTimeCount;
        const showReadingTime = document.getElementById('show-reading-time');
        if (showReadingTime) showReadingTime.checked = this.settings.showReadingTime;
        const showKeywordDensity = document.getElementById('show-keyword-density');
        if (showKeywordDensity) showKeywordDensity.checked = this.settings.showKeywordDensity;

        // Apply settings
        if (document.getElementById('keyword-density-section')) {
            this.toggleKeywordDensity(this.settings.showKeywordDensity);
        }
    }

    // Message display methods
    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
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
                text: document.getElementById('text-input').value,
                settings: this.settings,
                wordGoal: document.getElementById('word-goal').value,
                charGoal: document.getElementById('char-goal').value,
                timestamp: Date.now()
            };
            
            localStorage.setItem('wordCounter', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('wordCounter');
            if (!saved) return;
            
            const data = JSON.parse(saved);
            
            // Don't load data older than 24 hours
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('wordCounter');
                return;
            }
            
            // Restore text
            if (data.text) {
                document.getElementById('text-input').value = data.text;
            }
            
            // Restore settings
            if (data.settings) {
                this.settings = { ...this.settings, ...data.settings };
            }
            
            // Restore goals
            if (data.wordGoal) {
                document.getElementById('word-goal').value = data.wordGoal;
            }
            if (data.charGoal) {
                document.getElementById('char-goal').value = data.charGoal;
            }
            
            // Update everything
            this.onTextInput();
            
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            localStorage.removeItem('wordCounter');
        }
    }

    saveSettings() {
        this.saveToLocalStorage();
    }

    // Analytics methods
    trackAction(action, label = null) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_action', {
                'event_category': 'Word Counter',
                'event_label': label || action,
                'value': 1
            });
        }
    }
}

// Initialize the tool when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WordCounter();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordCounter;
}
