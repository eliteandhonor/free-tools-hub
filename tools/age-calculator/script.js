/**
 * Age Calculator Tool
 * Professional age calculation with comprehensive features
 */

class AgeCalculator {
    constructor() {
        this.calculationHistory = [];
        this.maxHistorySize = 20;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromLocalStorage();
        this.setCurrentDate();
        this.initializeQuickDateButtons();
    }

    bindEvents() {
        // Main calculation button
        document.getElementById('calculate-btn').addEventListener('click', () => this.calculateAge());

        // Clear and reset buttons
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetToDefaults());

        // Date input events
        document.getElementById('birth-date').addEventListener('change', () => this.onDateChange());
        document.getElementById('target-date').addEventListener('change', () => this.onDateChange());

        // Quick date buttons
        document.getElementById('today-btn').addEventListener('click', () => this.setTargetToToday());
        document.getElementById('birthday-btn').addEventListener('click', () => this.setToNextBirthday());

        // Calculator mode toggle
        document.getElementById('precise-mode').addEventListener('change', (e) => this.togglePreciseMode(e.target.checked));
        document.getElementById('include-time').addEventListener('change', (e) => this.toggleTimeMode(e.target.checked));

        // Time inputs (for precise calculations)
        ['birth-hour', 'birth-minute', 'target-hour', 'target-minute'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.onTimeChange());
            }
        });

        // Export and share buttons
        document.getElementById('export-btn').addEventListener('click', () => this.exportResults());
        document.getElementById('share-btn').addEventListener('click', () => this.shareResults());

        // History management
        document.getElementById('clear-history-btn').addEventListener('click', () => this.clearHistory());

        // Auto-calculation toggle
        document.getElementById('auto-calculate').addEventListener('change', (e) => {
            this.autoCalculate = e.target.checked;
            if (this.autoCalculate) {
                this.calculateAge();
            }
        });

        // Auto-save functionality
        setInterval(() => this.saveToLocalStorage(), 5000);
        window.addEventListener('beforeunload', () => this.saveToLocalStorage());

        // Enter key support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.ctrlKey && !e.altKey) {
                this.calculateAge();
            }
        });
    }

    setCurrentDate() {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        document.getElementById('target-date').value = todayString;
    }

    initializeQuickDateButtons() {
        // Set current time for precise mode
        const now = new Date();
        document.getElementById('target-hour').value = now.getHours().toString().padStart(2, '0');
        document.getElementById('target-minute').value = now.getMinutes().toString().padStart(2, '0');
    }

    onDateChange() {
        if (this.autoCalculate) {
            clearTimeout(this.autoCalcTimeout);
            this.autoCalcTimeout = setTimeout(() => this.calculateAge(), 500);
        }
        this.saveToLocalStorage();
    }

    onTimeChange() {
        if (this.autoCalculate && document.getElementById('include-time').checked) {
            clearTimeout(this.autoCalcTimeout);
            this.autoCalcTimeout = setTimeout(() => this.calculateAge(), 500);
        }
        this.saveToLocalStorage();
    }

    calculateAge() {
        try {
            const birthDate = this.getBirthDate();
            const targetDate = this.getTargetDate();

            if (!birthDate || !targetDate) {
                this.showError('Please select both birth date and target date.');
                return;
            }

            if (birthDate > targetDate) {
                this.showError('Birth date cannot be after the target date.');
                return;
            }

            const ageData = this.computeAge(birthDate, targetDate);
            this.displayResults(ageData);
            this.addToHistory(birthDate, targetDate, ageData);
            this.generateInsights(ageData);
            this.updateUpcomingEvents(ageData);
            
            this.showSuccess('Age calculated successfully!');
            this.trackCalculation();

        } catch (error) {
            this.showError('Error calculating age: ' + error.message);
        }
    }

    getBirthDate() {
        const dateValue = document.getElementById('birth-date').value;
        if (!dateValue) return null;

        const date = new Date(dateValue);
        
        if (document.getElementById('include-time').checked) {
            const hour = parseInt(document.getElementById('birth-hour').value) || 0;
            const minute = parseInt(document.getElementById('birth-minute').value) || 0;
            date.setHours(hour, minute, 0, 0);
        } else {
            date.setHours(0, 0, 0, 0);
        }

        return date;
    }

    getTargetDate() {
        const dateValue = document.getElementById('target-date').value;
        if (!dateValue) return null;

        const date = new Date(dateValue);
        
        if (document.getElementById('include-time').checked) {
            const hour = parseInt(document.getElementById('target-hour').value) || 0;
            const minute = parseInt(document.getElementById('target-minute').value) || 0;
            date.setHours(hour, minute, 0, 0);
        } else {
            date.setHours(23, 59, 59, 999); // End of day for date-only calculations
        }

        return date;
    }

    computeAge(birthDate, targetDate) {
        const preciseMode = document.getElementById('precise-mode').checked;
        const includeTime = document.getElementById('include-time').checked;

        // Basic age calculation
        const ageData = {
            birthDate: new Date(birthDate),
            targetDate: new Date(targetDate),
            includeTime: includeTime
        };

        // Calculate years, months, days
        let years = targetDate.getFullYear() - birthDate.getFullYear();
        let months = targetDate.getMonth() - birthDate.getMonth();
        let days = targetDate.getDate() - birthDate.getDate();

        // Adjust for negative days
        if (days < 0) {
            months--;
            const lastMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
            days += lastMonth.getDate();
        }

        // Adjust for negative months
        if (months < 0) {
            years--;
            months += 12;
        }

        ageData.years = years;
        ageData.months = months;
        ageData.days = days;

        // Total calculations
        const totalMilliseconds = targetDate.getTime() - birthDate.getTime();
        ageData.totalDays = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
        ageData.totalWeeks = Math.floor(ageData.totalDays / 7);
        ageData.totalMonths = years * 12 + months + (days / 30.44); // Average month length
        ageData.totalYears = totalMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

        if (includeTime) {
            ageData.totalHours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
            ageData.totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
            ageData.totalSeconds = Math.floor(totalMilliseconds / 1000);
            
            // Calculate remaining time in the current day
            const remainingMs = totalMilliseconds % (1000 * 60 * 60 * 24);
            ageData.hours = Math.floor(remainingMs / (1000 * 60 * 60));
            ageData.minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        }

        // Additional calculations
        ageData.birthDayOfYear = this.getDayOfYear(birthDate);
        ageData.targetDayOfYear = this.getDayOfYear(targetDate);
        ageData.birthDayOfWeek = birthDate.toLocaleDateString('en-US', { weekday: 'long' });
        ageData.targetDayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

        // Calculate next birthday
        ageData.nextBirthday = this.calculateNextBirthday(birthDate, targetDate);
        
        // Zodiac sign
        ageData.zodiacSign = this.getZodiacSign(birthDate);
        ageData.chineseZodiac = this.getChineseZodiac(birthDate.getFullYear());

        // Life stage
        ageData.lifeStage = this.getLifeStage(years);

        return ageData;
    }

    displayResults(ageData) {
        // Main age display
        const mainResult = document.getElementById('main-result');
        if (ageData.includeTime && ageData.hours !== undefined) {
            mainResult.innerHTML = `
                <div class="age-display">
                    <span class="age-number">${ageData.years}</span>
                    <span class="age-label">years</span>
                    <span class="age-number">${ageData.months}</span>
                    <span class="age-label">months</span>
                    <span class="age-number">${ageData.days}</span>
                    <span class="age-label">days</span>
                    <span class="age-number">${ageData.hours}</span>
                    <span class="age-label">hours</span>
                    <span class="age-number">${ageData.minutes}</span>
                    <span class="age-label">minutes</span>
                </div>
            `;
        } else {
            mainResult.innerHTML = `
                <div class="age-display">
                    <span class="age-number">${ageData.years}</span>
                    <span class="age-label">years</span>
                    <span class="age-number">${ageData.months}</span>
                    <span class="age-label">months</span>
                    <span class="age-number">${ageData.days}</span>
                    <span class="age-label">days</span>
                </div>
            `;
        }

        // Detailed breakdown
        document.getElementById('breakdown-years').textContent = ageData.years;
        document.getElementById('breakdown-months').textContent = ageData.months;
        document.getElementById('breakdown-days').textContent = ageData.days;
        document.getElementById('breakdown-total-days').textContent = ageData.totalDays.toLocaleString();
        document.getElementById('breakdown-total-weeks').textContent = ageData.totalWeeks.toLocaleString();
        document.getElementById('breakdown-total-months').textContent = Math.round(ageData.totalMonths).toLocaleString();

        if (ageData.includeTime) {
            document.getElementById('breakdown-hours').textContent = ageData.hours || 0;
            document.getElementById('breakdown-minutes').textContent = ageData.minutes || 0;
            document.getElementById('breakdown-total-hours').textContent = ageData.totalHours.toLocaleString();
            document.getElementById('breakdown-total-minutes').textContent = ageData.totalMinutes.toLocaleString();
            document.getElementById('breakdown-total-seconds').textContent = ageData.totalSeconds.toLocaleString();
            
            // Show time-specific elements
            document.querySelectorAll('.time-only').forEach(el => el.style.display = 'block');
        } else {
            // Hide time-specific elements
            document.querySelectorAll('.time-only').forEach(el => el.style.display = 'none');
        }

        // Birth information
        document.getElementById('birth-day-of-week').textContent = ageData.birthDayOfWeek;
        document.getElementById('birth-day-of-year').textContent = ageData.birthDayOfYear;
        document.getElementById('zodiac-sign').textContent = ageData.zodiacSign;
        document.getElementById('chinese-zodiac').textContent = ageData.chineseZodiac;
        document.getElementById('life-stage').textContent = ageData.lifeStage;

        // Show results section
        document.getElementById('results-section').style.display = 'block';
    }

    generateInsights(ageData) {
        const insights = [];

        // Age milestones
        if (ageData.years === 18) {
            insights.push("🎉 Legal adult age in many countries!");
        } else if (ageData.years === 21) {
            insights.push("🍾 Legal drinking age in the United States!");
        } else if (ageData.years === 65) {
            insights.push("🎂 Traditional retirement age milestone!");
        } else if (ageData.years === 100) {
            insights.push("🎊 Centenarian - what an incredible milestone!");
        }

        // Time-based insights
        if (ageData.totalDays >= 10000) {
            insights.push(`⏰ You've lived for over ${ageData.totalDays.toLocaleString()} days!`);
        }

        if (ageData.totalWeeks >= 1000) {
            insights.push(`📅 You've experienced over ${ageData.totalWeeks.toLocaleString()} weeks of life!`);
        }

        // Birthday insights
        const daysToNextBirthday = ageData.nextBirthday.daysUntil;
        if (daysToNextBirthday === 0) {
            insights.push("🎂 Happy Birthday! Today is your special day!");
        } else if (daysToNextBirthday <= 7) {
            insights.push(`🎈 Your birthday is coming up in ${daysToNextBirthday} days!`);
        } else if (daysToNextBirthday <= 30) {
            insights.push(`🎁 Your birthday is this month - ${daysToNextBirthday} days to go!`);
        }

        // Life stage insights
        if (ageData.years >= 13 && ageData.years <= 19) {
            insights.push("🌟 Teenage years - a time of growth and discovery!");
        } else if (ageData.years >= 20 && ageData.years <= 29) {
            insights.push("💪 Twenties - building your future and exploring possibilities!");
        } else if (ageData.years >= 30 && ageData.years <= 39) {
            insights.push("🏗️ Thirties - establishing yourself and pursuing goals!");
        }

        // Display insights
        const insightsContainer = document.getElementById('insights-list');
        insightsContainer.innerHTML = '';
        
        insights.forEach(insight => {
            const item = document.createElement('div');
            item.className = 'insight-item';
            item.textContent = insight;
            insightsContainer.appendChild(item);
        });

        document.getElementById('insights-section').style.display = insights.length > 0 ? 'block' : 'none';
    }

    updateUpcomingEvents(ageData) {
        const events = [];
        const currentYear = ageData.targetDate.getFullYear();

        // Calculate upcoming age milestones
        const upcomingMilestones = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
        
        upcomingMilestones.forEach(milestone => {
            if (milestone > ageData.years) {
                const yearsUntil = milestone - ageData.years;
                const milestoneDate = new Date(ageData.birthDate);
                milestoneDate.setFullYear(ageData.birthDate.getFullYear() + milestone);
                
                events.push({
                    type: 'milestone',
                    age: milestone,
                    date: milestoneDate,
                    yearsUntil: yearsUntil,
                    description: `${milestone}th birthday`
                });
                
                // Only show next few milestones
                if (events.length >= 3) return;
            }
        });

        // Next birthday
        events.unshift({
            type: 'birthday',
            age: ageData.years + 1,
            date: ageData.nextBirthday.date,
            daysUntil: ageData.nextBirthday.daysUntil,
            description: `${ageData.years + 1}${this.getOrdinalSuffix(ageData.years + 1)} birthday`
        });

        // Display events
        const eventsContainer = document.getElementById('upcoming-events-list');
        eventsContainer.innerHTML = '';
        
        events.slice(0, 5).forEach(event => {
            const item = document.createElement('div');
            item.className = 'event-item';
            
            const timeUntil = event.daysUntil !== undefined 
                ? `${event.daysUntil} days`
                : `${event.yearsUntil} years`;
                
            item.innerHTML = `
                <div class="event-icon">${event.type === 'birthday' ? '🎂' : '🎉'}</div>
                <div class="event-details">
                    <div class="event-title">${event.description}</div>
                    <div class="event-date">${event.date.toLocaleDateString()} (in ${timeUntil})</div>
                </div>
            `;
            eventsContainer.appendChild(item);
        });

        document.getElementById('upcoming-events-section').style.display = 'block';
    }

    calculateNextBirthday(birthDate, targetDate) {
        const nextBirthday = new Date(birthDate);
        nextBirthday.setFullYear(targetDate.getFullYear());
        
        // If birthday has passed this year, set to next year
        if (nextBirthday < targetDate) {
            nextBirthday.setFullYear(targetDate.getFullYear() + 1);
        }
        
        const daysUntil = Math.ceil((nextBirthday - targetDate) / (1000 * 60 * 60 * 24));
        
        return {
            date: nextBirthday,
            daysUntil: daysUntil
        };
    }

    // Utility methods
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    getZodiacSign(birthDate) {
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        
        const zodiacSigns = [
            { name: 'Capricorn', start: [12, 22], end: [1, 19] },
            { name: 'Aquarius', start: [1, 20], end: [2, 18] },
            { name: 'Pisces', start: [2, 19], end: [3, 20] },
            { name: 'Aries', start: [3, 21], end: [4, 19] },
            { name: 'Taurus', start: [4, 20], end: [5, 20] },
            { name: 'Gemini', start: [5, 21], end: [6, 20] },
            { name: 'Cancer', start: [6, 21], end: [7, 22] },
            { name: 'Leo', start: [7, 23], end: [8, 22] },
            { name: 'Virgo', start: [8, 23], end: [9, 22] },
            { name: 'Libra', start: [9, 23], end: [10, 22] },
            { name: 'Scorpio', start: [10, 23], end: [11, 21] },
            { name: 'Sagittarius', start: [11, 22], end: [12, 21] }
        ];
        
        for (const sign of zodiacSigns) {
            if (sign.name === 'Capricorn') {
                if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
                    return sign.name;
                }
            } else {
                const [startMonth, startDay] = sign.start;
                const [endMonth, endDay] = sign.end;
                
                if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
                    return sign.name;
                }
            }
        }
        
        return 'Unknown';
    }

    getChineseZodiac(year) {
        const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
        return animals[(year - 1900) % 12];
    }

    getLifeStage(years) {
        if (years < 2) return 'Infant';
        if (years < 6) return 'Toddler';
        if (years < 13) return 'Child';
        if (years < 20) return 'Teenager';
        if (years < 30) return 'Young Adult';
        if (years < 50) return 'Adult';
        if (years < 65) return 'Middle-aged';
        if (years < 80) return 'Senior';
        return 'Elder';
    }

    getOrdinalSuffix(num) {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return "st";
        if (j === 2 && k !== 12) return "nd";
        if (j === 3 && k !== 13) return "rd";
        return "th";
    }

    // UI Control methods
    setTargetToToday() {
        const today = new Date();
        document.getElementById('target-date').value = today.toISOString().split('T')[0];
        
        if (document.getElementById('include-time').checked) {
            document.getElementById('target-hour').value = today.getHours().toString().padStart(2, '0');
            document.getElementById('target-minute').value = today.getMinutes().toString().padStart(2, '0');
        }
        
        this.onDateChange();
    }

    setToNextBirthday() {
        const birthDate = this.getBirthDate();
        if (!birthDate) {
            this.showError('Please set birth date first.');
            return;
        }
        
        const today = new Date();
        const nextBirthday = new Date(birthDate);
        nextBirthday.setFullYear(today.getFullYear());
        
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        document.getElementById('target-date').value = nextBirthday.toISOString().split('T')[0];
        this.onDateChange();
    }

    togglePreciseMode(enabled) {
        const preciseElements = document.querySelectorAll('.precise-mode-only');
        preciseElements.forEach(el => {
            el.style.display = enabled ? 'block' : 'none';
        });
        
        if (this.autoCalculate) {
            this.calculateAge();
        }
    }

    toggleTimeMode(enabled) {
        const timeElements = document.querySelectorAll('.time-input-group');
        timeElements.forEach(el => {
            el.style.display = enabled ? 'block' : 'none';
        });
        
        if (this.autoCalculate) {
            this.calculateAge();
        }
    }

    clearAll() {
        document.getElementById('birth-date').value = '';
        document.getElementById('target-date').value = '';
        document.getElementById('birth-hour').value = '00';
        document.getElementById('birth-minute').value = '00';
        document.getElementById('target-hour').value = '00';
        document.getElementById('target-minute').value = '00';
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('insights-section').style.display = 'none';
        document.getElementById('upcoming-events-section').style.display = 'none';
        
        this.trackAction('clear_all');
    }

    resetToDefaults() {
        this.clearAll();
        this.setCurrentDate();
        document.getElementById('precise-mode').checked = false;
        document.getElementById('include-time').checked = false;
        document.getElementById('auto-calculate').checked = true;
        this.togglePreciseMode(false);
        this.toggleTimeMode(false);
        
        this.trackAction('reset_defaults');
    }

    // History management
    addToHistory(birthDate, targetDate, ageData) {
        const historyItem = {
            birthDate: birthDate.toISOString(),
            targetDate: targetDate.toISOString(),
            result: {
                years: ageData.years,
                months: ageData.months,
                days: ageData.days,
                totalDays: ageData.totalDays
            },
            timestamp: Date.now()
        };
        
        this.calculationHistory.unshift(historyItem);
        
        // Limit history size
        if (this.calculationHistory.length > this.maxHistorySize) {
            this.calculationHistory = this.calculationHistory.slice(0, this.maxHistorySize);
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        this.calculationHistory.slice(0, 5).forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const birthDate = new Date(item.birthDate);
            const targetDate = new Date(item.targetDate);
            
            historyItem.innerHTML = `
                <div class="history-details">
                    <div class="history-result">${item.result.years}y ${item.result.months}m ${item.result.days}d</div>
                    <div class="history-dates">
                        ${birthDate.toLocaleDateString()} → ${targetDate.toLocaleDateString()}
                    </div>
                    <div class="history-time">${this.formatHistoryTime(item.timestamp)}</div>
                </div>
            `;
            
            historyItem.addEventListener('click', () => this.restoreFromHistory(item));
            historyList.appendChild(historyItem);
        });
        
        document.getElementById('history-section').style.display = 
            this.calculationHistory.length > 0 ? 'block' : 'none';
    }

    restoreFromHistory(historyItem) {
        const birthDate = new Date(historyItem.birthDate);
        const targetDate = new Date(historyItem.targetDate);
        
        document.getElementById('birth-date').value = birthDate.toISOString().split('T')[0];
        document.getElementById('target-date').value = targetDate.toISOString().split('T')[0];
        
        this.calculateAge();
        this.showSuccess('Calculation restored from history');
    }

    clearHistory() {
        this.calculationHistory = [];
        this.updateHistoryDisplay();
        this.trackAction('clear_history');
    }

    formatHistoryTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }

    // Export and sharing
    exportResults() {
        const results = document.getElementById('main-result').textContent;
        if (!results) {
            this.showError('No results to export. Please calculate age first.');
            return;
        }
        
        const birthDate = document.getElementById('birth-date').value;
        const targetDate = document.getElementById('target-date').value;
        
        const exportData = `Age Calculation Results
========================
Birth Date: ${birthDate}
Target Date: ${targetDate}
Age: ${results}
Calculated on: ${new Date().toLocaleDateString()}

Generated by Free Tools Hub - Age Calculator
`;
        
        const blob = new Blob([exportData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'age-calculation.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.trackAction('export_results');
    }

    async shareResults() {
        const results = document.getElementById('main-result').textContent;
        if (!results) {
            this.showError('No results to share. Please calculate age first.');
            return;
        }
        
        const shareText = `Check out this age calculation: ${results}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Age Calculation Results',
                    text: shareText,
                    url: window.location.href
                });
                this.trackAction('share_results');
            } catch (error) {
                this.copyToClipboard(shareText);
            }
        } else {
            this.copyToClipboard(shareText);
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('Copied to clipboard!');
        } catch (error) {
            this.showError('Failed to copy to clipboard');
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
            const data = {
                birthDate: document.getElementById('birth-date').value,
                targetDate: document.getElementById('target-date').value,
                birthHour: document.getElementById('birth-hour').value,
                birthMinute: document.getElementById('birth-minute').value,
                targetHour: document.getElementById('target-hour').value,
                targetMinute: document.getElementById('target-minute').value,
                preciseMode: document.getElementById('precise-mode').checked,
                includeTime: document.getElementById('include-time').checked,
                autoCalculate: document.getElementById('auto-calculate').checked,
                history: this.calculationHistory,
                timestamp: Date.now()
            };
            
            localStorage.setItem('ageCalculator', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('ageCalculator');
            if (!saved) return;
            
            const data = JSON.parse(saved);
            
            // Don't load data older than 7 days
            if (Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
                localStorage.removeItem('ageCalculator');
                return;
            }
            
            // Restore form values
            if (data.birthDate) document.getElementById('birth-date').value = data.birthDate;
            if (data.targetDate) document.getElementById('target-date').value = data.targetDate;
            if (data.birthHour) document.getElementById('birth-hour').value = data.birthHour;
            if (data.birthMinute) document.getElementById('birth-minute').value = data.birthMinute;
            if (data.targetHour) document.getElementById('target-hour').value = data.targetHour;
            if (data.targetMinute) document.getElementById('target-minute').value = data.targetMinute;
            
            // Restore settings
            if (data.preciseMode !== undefined) {
                document.getElementById('precise-mode').checked = data.preciseMode;
                this.togglePreciseMode(data.preciseMode);
            }
            if (data.includeTime !== undefined) {
                document.getElementById('include-time').checked = data.includeTime;
                this.toggleTimeMode(data.includeTime);
            }
            if (data.autoCalculate !== undefined) {
                document.getElementById('auto-calculate').checked = data.autoCalculate;
                this.autoCalculate = data.autoCalculate;
            }
            
            // Restore history
            if (data.history) {
                this.calculationHistory = data.history;
                this.updateHistoryDisplay();
            }
            
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            localStorage.removeItem('ageCalculator');
        }
    }

    // Analytics methods
    trackCalculation() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'age_calculation', {
                'event_category': 'Age Calculator',
                'event_label': 'calculate',
                'value': 1
            });
        }
    }

    trackAction(action) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_action', {
                'event_category': 'Age Calculator',
                'event_label': action,
                'value': 1
            });
        }
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AgeCalculator();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgeCalculator;
}
