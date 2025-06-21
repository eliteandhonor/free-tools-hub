/**
 * Password Generator Tool
 * Professional password generation with security analysis
 */

class PasswordGenerator {
    constructor() {
        this.characters = {
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
            similarChars: 'il1Lo0O',
            ambiguousChars: '{}[]()/\\\'"`~,;.<>'
        };
        
        this.passwordHistory = [];
        this.maxHistorySize = 20;
        
        this.presets = {
            basic: {
                length: 12,
                lowercase: true,
                uppercase: true,
                numbers: true,
                symbols: false,
                excludeSimilar: false,
                excludeAmbiguous: false
            },
            strong: {
                length: 16,
                lowercase: true,
                uppercase: true,
                numbers: true,
                symbols: true,
                excludeSimilar: true,
                excludeAmbiguous: false
            },
            maximum: {
                length: 32,
                lowercase: true,
                uppercase: true,
                numbers: true,
                symbols: true,
                excludeSimilar: true,
                excludeAmbiguous: true
            },
            pin: {
                length: 6,
                lowercase: false,
                uppercase: false,
                numbers: true,
                symbols: false,
                excludeSimilar: false,
                excludeAmbiguous: false
            }
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromLocalStorage();
        this.updateCharacterPool();
        this.generatePassword();
    }

    bindEvents() {
        // Generation controls
        document.getElementById('generate-btn').addEventListener('click', () => this.generatePassword());
        document.getElementById('generate-multiple-btn').addEventListener('click', () => this.generateMultiplePasswords());
        
        // Copy and actions
        document.getElementById('copy-btn').addEventListener('click', () => this.copyPassword());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearPassword());
        document.getElementById('analyze-btn').addEventListener('click', () => this.analyzePassword());

        // Password options
        document.getElementById('password-length').addEventListener('input', (e) => {
            document.getElementById('length-display').textContent = e.target.value;
            this.updateCharacterPool();
            this.onSettingsChange();
        });

        // Character type checkboxes
        ['lowercase', 'uppercase', 'numbers', 'symbols'].forEach(type => {
            document.getElementById(`include-${type}`).addEventListener('change', () => {
                this.updateCharacterPool();
                this.onSettingsChange();
            });
        });

        // Exclusion options
        document.getElementById('exclude-similar').addEventListener('change', () => {
            this.updateCharacterPool();
            this.onSettingsChange();
        });
        
        document.getElementById('exclude-ambiguous').addEventListener('change', () => {
            this.updateCharacterPool();
            this.onSettingsChange();
        });

        // Advanced options
        document.getElementById('no-repeat').addEventListener('change', () => this.onSettingsChange());
        document.getElementById('readable').addEventListener('change', () => this.onSettingsChange());
        document.getElementById('pronounceable').addEventListener('change', () => this.onSettingsChange());

        // Custom pattern
        document.getElementById('custom-pattern').addEventListener('input', () => this.onSettingsChange());
        document.getElementById('use-pattern').addEventListener('change', () => this.togglePatternMode());

        // Presets
        document.getElementById('preset-select').addEventListener('change', (e) => this.loadPreset(e.target.value));

        // Batch generation
        document.getElementById('batch-count').addEventListener('input', () => this.onSettingsChange());

        // Password input for analysis
        document.getElementById('password-input').addEventListener('input', () => this.analyzeCustomPassword());

        // Export/Import
        document.getElementById('export-btn').addEventListener('click', () => this.exportPasswords());
        document.getElementById('import-btn').addEventListener('click', () => this.importPasswords());

        // History
        document.getElementById('clear-history-btn').addEventListener('click', () => this.clearHistory());

        // Auto-generate toggle
        document.getElementById('auto-generate').addEventListener('change', (e) => {
            this.autoGenerate = e.target.checked;
            if (this.autoGenerate) {
                this.generatePassword();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Auto-save functionality
        setInterval(() => this.saveToLocalStorage(), 5000);
        window.addEventListener('beforeunload', () => this.saveToLocalStorage());
    }

    updateCharacterPool() {
        let pool = '';
        
        if (document.getElementById('include-lowercase').checked) {
            pool += this.characters.lowercase;
        }
        if (document.getElementById('include-uppercase').checked) {
            pool += this.characters.uppercase;
        }
        if (document.getElementById('include-numbers').checked) {
            pool += this.characters.numbers;
        }
        if (document.getElementById('include-symbols').checked) {
            pool += this.characters.symbols;
        }

        // Remove similar characters if requested
        if (document.getElementById('exclude-similar').checked) {
            pool = pool.split('').filter(char => !this.characters.similarChars.includes(char)).join('');
        }

        // Remove ambiguous characters if requested
        if (document.getElementById('exclude-ambiguous').checked) {
            pool = pool.split('').filter(char => !this.characters.ambiguousChars.includes(char)).join('');
        }

        this.characterPool = pool;
        this.updatePoolInfo();
        
        // Auto-generate if enabled
        if (this.autoGenerate && pool.length > 0) {
            clearTimeout(this.autoGenerateTimeout);
            this.autoGenerateTimeout = setTimeout(() => this.generatePassword(), 300);
        }
    }

    updatePoolInfo() {
        const poolSize = this.characterPool.length;
        const length = parseInt(document.getElementById('password-length').value);
        const combinations = Math.pow(poolSize, length);
        
        document.getElementById('pool-size').textContent = poolSize;
        document.getElementById('combinations').textContent = this.formatLargeNumber(combinations);
        
        // Update entropy
        const entropy = length * Math.log2(poolSize);
        document.getElementById('entropy').textContent = entropy.toFixed(1);
        
        // Update crack time estimate
        const crackTime = this.estimateCrackTime(combinations);
        document.getElementById('crack-time').textContent = crackTime;
    }

    formatLargeNumber(num) {
        if (num < 1000) return num.toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
        return (num / 1000000000000).toFixed(1) + 'T';
    }

    estimateCrackTime(combinations) {
        // Assume 1 billion attempts per second
        const attemptsPerSecond = 1000000000;
        const seconds = combinations / (2 * attemptsPerSecond); // Average case
        
        if (seconds < 60) return '< 1 minute';
        if (seconds < 3600) return Math.round(seconds / 60) + ' minutes';
        if (seconds < 86400) return Math.round(seconds / 3600) + ' hours';
        if (seconds < 31536000) return Math.round(seconds / 86400) + ' days';
        if (seconds < 3153600000) return Math.round(seconds / 31536000) + ' years';
        return Math.round(seconds / 31536000000) + ' centuries';
    }

    generatePassword() {
        try {
            if (this.characterPool.length === 0) {
                this.showError('Please select at least one character type.');
                return;
            }

            const usePattern = document.getElementById('use-pattern').checked;
            let password;

            if (usePattern) {
                password = this.generateFromPattern();
            } else {
                password = this.generateRandomPassword();
            }

            if (!password) {
                this.showError('Failed to generate password with current settings.');
                return;
            }

            this.displayPassword(password);
            this.addToHistory(password);
            this.analyzePasswordStrength(password);
            this.showSuccess('Password generated successfully!');
            this.trackAction('generate_password');

        } catch (error) {
            this.showError('Error generating password: ' + error.message);
        }
    }

    generateRandomPassword() {
        const length = parseInt(document.getElementById('password-length').value);
        const noRepeat = document.getElementById('no-repeat').checked;
        const readable = document.getElementById('readable').checked;
        const pronounceable = document.getElementById('pronounceable').checked;

        if (noRepeat && length > this.characterPool.length) {
            this.showError('Password length cannot exceed character pool size when avoiding repeats.');
            return null;
        }

        let password = '';
        let availableChars = this.characterPool;

        // Ensure at least one character from each selected type
        password += this.ensureCharacterTypes();

        // Generate remaining characters
        for (let i = password.length; i < length; i++) {
            if (availableChars.length === 0) break;

            const randomIndex = this.getSecureRandomInt(0, availableChars.length);
            const char = availableChars[randomIndex];
            password += char;

            if (noRepeat) {
                availableChars = availableChars.replace(char, '');
            }
        }

        // Shuffle the password to randomize position of required characters
        password = this.shuffleString(password);

        if (pronounceable) {
            password = this.makePronounceable(password);
        }

        return password;
    }

    ensureCharacterTypes() {
        let required = '';
        
        if (document.getElementById('include-lowercase').checked) {
            const chars = this.characters.lowercase;
            required += chars[this.getSecureRandomInt(0, chars.length)];
        }
        if (document.getElementById('include-uppercase').checked) {
            const chars = this.characters.uppercase;
            required += chars[this.getSecureRandomInt(0, chars.length)];
        }
        if (document.getElementById('include-numbers').checked) {
            const chars = this.characters.numbers;
            required += chars[this.getSecureRandomInt(0, chars.length)];
        }
        if (document.getElementById('include-symbols').checked) {
            const chars = this.characters.symbols;
            required += chars[this.getSecureRandomInt(0, chars.length)];
        }

        return required;
    }

    generateFromPattern() {
        const pattern = document.getElementById('custom-pattern').value;
        if (!pattern) {
            this.showError('Please enter a custom pattern.');
            return null;
        }

        let password = '';
        const patternChars = {
            'L': this.characters.lowercase,
            'U': this.characters.uppercase,
            'N': this.characters.numbers,
            'S': this.characters.symbols,
            'C': this.characterPool // Any character
        };

        for (const char of pattern) {
            if (patternChars[char]) {
                const chars = patternChars[char];
                password += chars[this.getSecureRandomInt(0, chars.length)];
            } else {
                password += char; // Literal character
            }
        }

        return password;
    }

    makePronounceable(password) {
        // Simplified approach: alternate consonants and vowels where possible
        const vowels = 'aeiou';
        const consonants = 'bcdfghjklmnpqrstvwxyz';
        
        let result = '';
        let lastWasVowel = false;
        
        for (const char of password) {
            if (/[a-z]/i.test(char)) {
                if (lastWasVowel) {
                    // Try to use a consonant
                    const consonant = consonants[this.getSecureRandomInt(0, consonants.length)];
                    result += char.toUpperCase() === char ? consonant.toUpperCase() : consonant;
                    lastWasVowel = false;
                } else {
                    // Try to use a vowel
                    const vowel = vowels[this.getSecureRandomInt(0, vowels.length)];
                    result += char.toUpperCase() === char ? vowel.toUpperCase() : vowel;
                    lastWasVowel = true;
                }
            } else {
                result += char;
                lastWasVowel = false;
            }
        }
        
        return result;
    }

    shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = this.getSecureRandomInt(0, i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    getSecureRandomInt(min, max) {
        // Use crypto.getRandomValues for better randomness
        const range = max - min;
        const arrayLength = Math.ceil(Math.log2(range) / 8);
        const maxValidValue = Math.floor(256 ** arrayLength / range) * range - 1;
        
        let randomValue;
        do {
            const randomArray = new Uint8Array(arrayLength);
            crypto.getRandomValues(randomArray);
            randomValue = 0;
            for (let i = 0; i < arrayLength; i++) {
                randomValue = (randomValue << 8) + randomArray[i];
            }
        } while (randomValue > maxValidValue);
        
        return min + (randomValue % range);
    }

    generateMultiplePasswords() {
        const count = parseInt(document.getElementById('batch-count').value) || 5;
        const passwords = [];
        
        for (let i = 0; i < Math.min(count, 50); i++) {
            const password = this.generateRandomPassword();
            if (password) {
                passwords.push(password);
            }
        }
        
        this.displayMultiplePasswords(passwords);
        this.trackAction('generate_multiple', count.toString());
    }

    displayPassword(password) {
        document.getElementById('generated-password').value = password;
        document.getElementById('password-display').textContent = password;
        
        // Show password section
        document.getElementById('password-result').style.display = 'block';
        
        // Update visual indicators
        this.updatePasswordVisual(password);
    }

    displayMultiplePasswords(passwords) {
        const container = document.getElementById('multiple-passwords');
        container.innerHTML = '';
        
        passwords.forEach((password, index) => {
            const passwordDiv = document.createElement('div');
            passwordDiv.className = 'password-item';
            passwordDiv.innerHTML = `
                <span class="password-text">${password}</span>
                <button class="copy-individual-btn" data-password="${password}">
                    <i class="fas fa-copy"></i>
                </button>
            `;
            container.appendChild(passwordDiv);
        });
        
        // Bind copy events
        container.querySelectorAll('.copy-individual-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.copyToClipboard(e.target.closest('button').dataset.password);
                this.showSuccess('Password copied!');
            });
        });
        
        document.getElementById('multiple-passwords-section').style.display = 'block';
    }

    updatePasswordVisual(password) {
        const visual = document.getElementById('password-visual');
        visual.innerHTML = '';
        
        for (const char of password) {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = this.getCharacterClass(char);
            visual.appendChild(span);
        }
    }

    getCharacterClass(char) {
        if (/[a-z]/.test(char)) return 'char-lowercase';
        if (/[A-Z]/.test(char)) return 'char-uppercase';
        if (/[0-9]/.test(char)) return 'char-number';
        return 'char-symbol';
    }

    analyzePassword() {
        const password = document.getElementById('generated-password').value;
        if (!password) {
            this.showError('No password to analyze.');
            return;
        }
        
        this.analyzePasswordStrength(password);
        this.trackAction('analyze_password');
    }

    analyzePasswordStrength(password) {
        const analysis = this.performPasswordAnalysis(password);
        this.displayPasswordAnalysis(analysis);
    }

    performPasswordAnalysis(password) {
        const length = password.length;
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^a-zA-Z0-9]/.test(password);
        const hasRepeated = /(.)\1{2,}/.test(password);
        const hasSequential = this.hasSequentialChars(password);
        const hasCommonPatterns = this.hasCommonPatterns(password);
        
        // Calculate character set size
        let charsetSize = 0;
        if (hasLower) charsetSize += 26;
        if (hasUpper) charsetSize += 26;
        if (hasNumbers) charsetSize += 10;
        if (hasSymbols) charsetSize += 32; // Approximate
        
        // Calculate entropy
        const entropy = length * Math.log2(charsetSize);
        
        // Calculate strength score
        let score = 0;
        
        // Length scoring
        if (length >= 12) score += 25;
        else if (length >= 8) score += 15;
        else if (length >= 6) score += 5;
        
        // Character variety scoring
        if (hasLower) score += 5;
        if (hasUpper) score += 5;
        if (hasNumbers) score += 5;
        if (hasSymbols) score += 10;
        
        // Bonus for good practices
        if (length >= 16) score += 10;
        if (charsetSize >= 70) score += 10;
        if (entropy >= 60) score += 10;
        
        // Penalties
        if (hasRepeated) score -= 15;
        if (hasSequential) score -= 10;
        if (hasCommonPatterns) score -= 20;
        if (length < 8) score -= 25;
        
        score = Math.max(0, Math.min(100, score));
        
        return {
            password: password,
            length: length,
            hasLower: hasLower,
            hasUpper: hasUpper,
            hasNumbers: hasNumbers,
            hasSymbols: hasSymbols,
            hasRepeated: hasRepeated,
            hasSequential: hasSequential,
            hasCommonPatterns: hasCommonPatterns,
            charsetSize: charsetSize,
            entropy: entropy,
            score: score,
            crackTime: this.estimateCrackTime(Math.pow(charsetSize, length)),
            recommendations: this.generateRecommendations(password, score)
        };
    }

    hasSequentialChars(password) {
        const sequential = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const lowerPassword = password.toLowerCase();
        
        for (let i = 0; i < lowerPassword.length - 2; i++) {
            const substr = lowerPassword.substr(i, 3);
            if (sequential.includes(substr) || sequential.includes([...substr].reverse().join(''))) {
                return true;
            }
        }
        return false;
    }

    hasCommonPatterns(password) {
        const commonPatterns = [
            /password/i,
            /123456/,
            /qwerty/i,
            /admin/i,
            /login/i,
            /welcome/i,
            /111111/,
            /000000/,
            /abc123/i
        ];
        
        return commonPatterns.some(pattern => pattern.test(password));
    }

    generateRecommendations(password, score) {
        const recommendations = [];
        
        if (password.length < 12) {
            recommendations.push('Increase password length to at least 12 characters');
        }
        
        if (!/[a-z]/.test(password)) {
            recommendations.push('Include lowercase letters');
        }
        
        if (!/[A-Z]/.test(password)) {
            recommendations.push('Include uppercase letters');
        }
        
        if (!/[0-9]/.test(password)) {
            recommendations.push('Include numbers');
        }
        
        if (!/[^a-zA-Z0-9]/.test(password)) {
            recommendations.push('Include special characters');
        }
        
        if (/(.)\1{2,}/.test(password)) {
            recommendations.push('Avoid repeating characters');
        }
        
        if (this.hasSequentialChars(password)) {
            recommendations.push('Avoid sequential characters (abc, 123)');
        }
        
        if (this.hasCommonPatterns(password)) {
            recommendations.push('Avoid common words and patterns');
        }
        
        if (score >= 80) {
            recommendations.push('Excellent password strength!');
        }
        
        return recommendations;
    }

    displayPasswordAnalysis(analysis) {
        // Update strength meter
        const strengthMeter = document.getElementById('strength-meter');
        const strengthText = document.getElementById('strength-text');
        const strengthScore = document.getElementById('strength-score');
        
        strengthMeter.style.width = analysis.score + '%';
        strengthScore.textContent = analysis.score;
        
        let strengthLevel, strengthColor;
        if (analysis.score >= 80) {
            strengthLevel = 'Very Strong';
            strengthColor = '#10b981';
        } else if (analysis.score >= 60) {
            strengthLevel = 'Strong';
            strengthColor = '#34d399';
        } else if (analysis.score >= 40) {
            strengthLevel = 'Medium';
            strengthColor = '#fbbf24';
        } else if (analysis.score >= 20) {
            strengthLevel = 'Weak';
            strengthColor = '#f97316';
        } else {
            strengthLevel = 'Very Weak';
            strengthColor = '#ef4444';
        }
        
        strengthText.textContent = strengthLevel;
        strengthMeter.style.backgroundColor = strengthColor;
        
        // Update detailed analysis
        document.getElementById('analysis-length').textContent = analysis.length;
        document.getElementById('analysis-charset').textContent = analysis.charsetSize;
        document.getElementById('analysis-entropy').textContent = analysis.entropy.toFixed(1);
        document.getElementById('analysis-crack-time').textContent = analysis.crackTime;
        
        // Update character type indicators
        this.updateIndicator('has-lowercase', analysis.hasLower);
        this.updateIndicator('has-uppercase', analysis.hasUpper);
        this.updateIndicator('has-numbers', analysis.hasNumbers);
        this.updateIndicator('has-symbols', analysis.hasSymbols);
        
        // Update warning indicators
        this.updateWarningIndicator('has-repeated', analysis.hasRepeated);
        this.updateWarningIndicator('has-sequential', analysis.hasSequential);
        this.updateWarningIndicator('has-common', analysis.hasCommonPatterns);
        
        // Update recommendations
        const recommendationsList = document.getElementById('recommendations-list');
        recommendationsList.innerHTML = '';
        analysis.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            li.className = rec.includes('Excellent') ? 'positive' : 'recommendation';
            recommendationsList.appendChild(li);
        });
        
        // Show analysis section
        document.getElementById('password-analysis').style.display = 'block';
    }

    updateIndicator(id, hasFeature) {
        const indicator = document.getElementById(id);
        indicator.className = hasFeature ? 'indicator positive' : 'indicator negative';
        indicator.querySelector('.indicator-text').textContent = hasFeature ? 'Yes' : 'No';
    }

    updateWarningIndicator(id, hasIssue) {
        const indicator = document.getElementById(id);
        indicator.className = hasIssue ? 'indicator warning' : 'indicator positive';
        indicator.querySelector('.indicator-text').textContent = hasIssue ? 'Yes' : 'No';
    }

    analyzeCustomPassword() {
        const password = document.getElementById('password-input').value;
        if (password) {
            this.analyzePasswordStrength(password);
        }
    }

    loadPreset(presetName) {
        if (!presetName || !this.presets[presetName]) {
            return;
        }
        
        const preset = this.presets[presetName];
        
        // Apply preset settings
        document.getElementById('password-length').value = preset.length;
        document.getElementById('length-display').textContent = preset.length;
        document.getElementById('include-lowercase').checked = preset.lowercase;
        document.getElementById('include-uppercase').checked = preset.uppercase;
        document.getElementById('include-numbers').checked = preset.numbers;
        document.getElementById('include-symbols').checked = preset.symbols;
        document.getElementById('exclude-similar').checked = preset.excludeSimilar;
        document.getElementById('exclude-ambiguous').checked = preset.excludeAmbiguous;
        
        this.updateCharacterPool();
        this.generatePassword();
        
        this.showSuccess(`Applied ${presetName} preset`);
        this.trackAction('load_preset', presetName);
    }

    togglePatternMode() {
        const usePattern = document.getElementById('use-pattern').checked;
        const patternInput = document.getElementById('custom-pattern');
        const characterOptions = document.getElementById('character-options');
        
        if (usePattern) {
            patternInput.style.display = 'block';
            characterOptions.style.opacity = '0.5';
            characterOptions.style.pointerEvents = 'none';
        } else {
            patternInput.style.display = 'none';
            characterOptions.style.opacity = '1';
            characterOptions.style.pointerEvents = 'auto';
        }
    }

    // History management
    addToHistory(password) {
        const historyItem = {
            password: password,
            timestamp: Date.now(),
            analysis: this.performPasswordAnalysis(password)
        };
        
        this.passwordHistory.unshift(historyItem);
        
        // Limit history size
        if (this.passwordHistory.length > this.maxHistorySize) {
            this.passwordHistory = this.passwordHistory.slice(0, this.maxHistorySize);
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        this.passwordHistory.slice(0, 10).forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-password">${item.password}</div>
                <div class="history-strength">Strength: ${item.analysis.score}/100</div>
                <div class="history-time">${this.formatHistoryTime(item.timestamp)}</div>
                <button class="history-copy-btn" data-password="${item.password}">
                    <i class="fas fa-copy"></i>
                </button>
            `;
            historyList.appendChild(historyItem);
        });
        
        // Bind copy events
        historyList.querySelectorAll('.history-copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.copyToClipboard(e.target.closest('button').dataset.password);
                this.showSuccess('Password copied from history!');
            });
        });
        
        document.getElementById('history-section').style.display = 
            this.passwordHistory.length > 0 ? 'block' : 'none';
    }

    formatHistoryTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / 60000);
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    }

    clearHistory() {
        this.passwordHistory = [];
        this.updateHistoryDisplay();
        this.trackAction('clear_history');
    }

    // Utility methods
    clearPassword() {
        document.getElementById('generated-password').value = '';
        document.getElementById('password-display').textContent = '';
        document.getElementById('password-result').style.display = 'none';
        document.getElementById('password-analysis').style.display = 'none';
        this.trackAction('clear_password');
    }

    async copyPassword() {
        const password = document.getElementById('generated-password').value;
        if (!password) {
            this.showError('No password to copy');
            return;
        }
        
        try {
            await this.copyToClipboard(password);
            this.showSuccess('Password copied to clipboard!');
            this.trackAction('copy_password');
        } catch (error) {
            this.showError('Failed to copy password');
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

    exportPasswords() {
        if (this.passwordHistory.length === 0) {
            this.showError('No passwords to export');
            return;
        }
        
        const exportData = {
            timestamp: new Date().toISOString(),
            passwords: this.passwordHistory.map(item => ({
                password: item.password,
                strength: item.analysis.score,
                created: new Date(item.timestamp).toISOString()
            }))
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'passwords-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.trackAction('export_passwords');
    }

    importPasswords() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.passwords && Array.isArray(data.passwords)) {
                        data.passwords.forEach(item => {
                            if (item.password) {
                                this.addToHistory(item.password);
                            }
                        });
                        this.showSuccess(`Imported ${data.passwords.length} passwords`);
                        this.trackAction('import_passwords');
                    } else {
                        this.showError('Invalid file format');
                    }
                } catch (error) {
                    this.showError('Error reading file');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'g':
                case 'G':
                    e.preventDefault();
                    this.generatePassword();
                    break;
                case 'c':
                    if (e.target.closest('#password-result')) {
                        e.preventDefault();
                        this.copyPassword();
                    }
                    break;
            }
        }
        
        // Space bar to generate
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            this.generatePassword();
        }
    }

    onSettingsChange() {
        this.saveToLocalStorage();
        
        // Auto-generate if enabled
        if (this.autoGenerate) {
            clearTimeout(this.autoGenerateTimeout);
            this.autoGenerateTimeout = setTimeout(() => this.generatePassword(), 500);
        }
    }

    // Message display methods
    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
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
            const settings = {
                length: document.getElementById('password-length').value,
                includeLowercase: document.getElementById('include-lowercase').checked,
                includeUppercase: document.getElementById('include-uppercase').checked,
                includeNumbers: document.getElementById('include-numbers').checked,
                includeSymbols: document.getElementById('include-symbols').checked,
                excludeSimilar: document.getElementById('exclude-similar').checked,
                excludeAmbiguous: document.getElementById('exclude-ambiguous').checked,
                noRepeat: document.getElementById('no-repeat').checked,
                readable: document.getElementById('readable').checked,
                pronounceable: document.getElementById('pronounceable').checked,
                usePattern: document.getElementById('use-pattern').checked,
                customPattern: document.getElementById('custom-pattern').value,
                batchCount: document.getElementById('batch-count').value,
                autoGenerate: document.getElementById('auto-generate').checked
            };
            
            const data = {
                settings: settings,
                history: this.passwordHistory.slice(0, 10), // Save only recent history
                timestamp: Date.now()
            };
            
            localStorage.setItem('passwordGenerator', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('passwordGenerator');
            if (!saved) return;
            
            const data = JSON.parse(saved);
            
            // Don't load data older than 7 days
            if (Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
                localStorage.removeItem('passwordGenerator');
                return;
            }
            
            // Restore settings
            if (data.settings) {
                const settings = data.settings;
                document.getElementById('password-length').value = settings.length || 12;
                document.getElementById('length-display').textContent = settings.length || 12;
                document.getElementById('include-lowercase').checked = settings.includeLowercase !== false;
                document.getElementById('include-uppercase').checked = settings.includeUppercase !== false;
                document.getElementById('include-numbers').checked = settings.includeNumbers !== false;
                document.getElementById('include-symbols').checked = settings.includeSymbols || false;
                document.getElementById('exclude-similar').checked = settings.excludeSimilar || false;
                document.getElementById('exclude-ambiguous').checked = settings.excludeAmbiguous || false;
                document.getElementById('no-repeat').checked = settings.noRepeat || false;
                document.getElementById('readable').checked = settings.readable || false;
                document.getElementById('pronounceable').checked = settings.pronounceable || false;
                document.getElementById('use-pattern').checked = settings.usePattern || false;
                document.getElementById('custom-pattern').value = settings.customPattern || '';
                document.getElementById('batch-count').value = settings.batchCount || 5;
                document.getElementById('auto-generate').checked = settings.autoGenerate !== false;
                
                this.autoGenerate = settings.autoGenerate !== false;
                this.togglePatternMode();
            }
            
            // Restore history
            if (data.history) {
                this.passwordHistory = data.history;
                this.updateHistoryDisplay();
            }
            
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            localStorage.removeItem('passwordGenerator');
        }
    }

    // Analytics methods
    trackAction(action, label = null) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_action', {
                'event_category': 'Password Generator',
                'event_label': label || action,
                'value': 1
            });
        }
    }
}

// Initialize the tool when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PasswordGenerator;
}
