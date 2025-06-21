// Unix Timestamp Converter Script

class TimestampConverter {
    constructor() {
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.startCurrentTimeUpdates();
        this.setDefaultTab();
        this.setLocalTimezone();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Timestamp to date conversion
        const timestampInput = document.getElementById('timestamp-input');
        timestampInput.addEventListener('input', () => this.convertTimestampToDate());
        timestampInput.addEventListener('keyup', () => this.convertTimestampToDate());

        // Date to timestamp conversion
        const dateInput = document.getElementById('date-input');
        dateInput.addEventListener('input', () => this.convertDateToTimestamp());
        dateInput.addEventListener('change', () => this.convertDateToTimestamp());

        // Timezone changes
        document.getElementById('timezone-select').addEventListener('change', () => this.convertTimestampToDate());
        document.getElementById('timezone-select-2').addEventListener('change', () => this.convertDateToTimestamp());
    }

    setDefaultTab() {
        this.switchTab('timestamp-to-date');
    }

    setLocalTimezone() {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const selects = ['timezone-select', 'timezone-select-2'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            const option = Array.from(select.options).find(opt => opt.value === userTimezone);
            if (option) {
                select.value = userTimezone;
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.converter-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        document.getElementById(tabName).style.display = 'block';

        // Clear validation messages
        this.clearValidationMessages();
        
        // Update formats display
        this.updateFormatsDisplay();
    }

    startCurrentTimeUpdates() {
        this.updateCurrentTime();
        this.updateInterval = setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }

    updateCurrentTime() {
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);

        document.getElementById('current-timestamp').textContent = timestamp;
        document.getElementById('current-utc').textContent = now.toUTCString();
        document.getElementById('current-local').textContent = now.toLocaleString();
        document.getElementById('current-iso').textContent = now.toISOString();
    }

    convertTimestampToDate() {
        const timestampInput = document.getElementById('timestamp-input');
        const timezone = document.getElementById('timezone-select').value;
        const validation = document.getElementById('timestamp-validation');

        // Clear previous validation
        validation.style.display = 'none';

        const input = timestampInput.value.trim();
        if (!input) {
            this.updateFormatsDisplay();
            return;
        }

        // Parse timestamp (handle both seconds and milliseconds)
        let timestamp = parseFloat(input);
        
        if (isNaN(timestamp)) {
            this.showValidation('timestamp-validation', 'Please enter a valid timestamp.', 'error');
            return;
        }

        // Auto-detect if timestamp is in milliseconds or seconds
        if (timestamp > 0 && timestamp < 100000000000) {
            // Likely seconds, convert to milliseconds
            timestamp = timestamp * 1000;
        }

        // Validate reasonable timestamp range
        const minTimestamp = -2147483648000; // 1901
        const maxTimestamp = 2147483647000;  // 2038
        
        if (timestamp < minTimestamp || timestamp > maxTimestamp) {
            this.showValidation('timestamp-validation', 'Timestamp is outside valid range (1901-2038).', 'error');
            return;
        }

        try {
            const date = new Date(timestamp);
            
            if (isNaN(date.getTime())) {
                this.showValidation('timestamp-validation', 'Invalid timestamp format.', 'error');
                return;
            }

            this.showValidation('timestamp-validation', `Converted successfully for timezone: ${timezone}`, 'success');
            this.updateFormatsDisplay(date, timezone);
            
        } catch (error) {
            this.showValidation('timestamp-validation', 'Error converting timestamp.', 'error');
        }
    }

    convertDateToTimestamp() {
        const dateInput = document.getElementById('date-input');
        const timezone = document.getElementById('timezone-select-2').value;
        const validation = document.getElementById('date-validation');

        // Clear previous validation
        validation.style.display = 'none';

        const input = dateInput.value;
        if (!input) {
            this.updateFormatsDisplay();
            return;
        }

        try {
            // Parse the datetime-local input
            const date = new Date(input);
            
            if (isNaN(date.getTime())) {
                this.showValidation('date-validation', 'Please enter a valid date and time.', 'error');
                return;
            }

            // Adjust for timezone if not UTC
            let adjustedDate = date;
            if (timezone !== 'UTC') {
                // Note: This is a simplified timezone handling
                // For production, consider using a library like moment.js or date-fns-tz
                const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (timezone !== userTimezone) {
                    // Basic timezone offset calculation
                    const localOffset = date.getTimezoneOffset() * 60000;
                    adjustedDate = new Date(date.getTime() + localOffset);
                }
            }

            const timestamp = Math.floor(adjustedDate.getTime() / 1000);
            
            this.showValidation('date-validation', `Converted to timestamp: ${timestamp}`, 'success');
            this.updateFormatsDisplay(adjustedDate, timezone, timestamp);
            
        } catch (error) {
            this.showValidation('date-validation', 'Error converting date.', 'error');
        }
    }

    updateFormatsDisplay(date = null, timezone = 'UTC', timestamp = null) {
        const formatsDisplay = document.getElementById('formats-display');
        
        if (!date) {
            formatsDisplay.innerHTML = '<p style="text-align: center; color: #6b7280;">Enter a timestamp or date to see multiple formats</p>';
            return;
        }

        const formats = this.getDateFormats(date, timezone, timestamp);
        
        formatsDisplay.innerHTML = formats.map(format => `
            <div class="format-item">
                <div class="format-label">${format.label}</div>
                <div class="format-value" onclick="copyToClipboard('${format.value}')" style="cursor: pointer;" title="Click to copy">
                    ${format.value}
                </div>
            </div>
        `).join('');
    }

    getDateFormats(date, timezone, timestamp = null) {
        const ts = timestamp || Math.floor(date.getTime() / 1000);
        
        // Create a formatter for the specified timezone
        const createFormatter = (options) => {
            return new Intl.DateTimeFormat('en-US', {
                ...options,
                timeZone: timezone
            });
        };

        const formats = [
            {
                label: 'Unix Timestamp (seconds)',
                value: ts.toString()
            },
            {
                label: 'Unix Timestamp (milliseconds)',
                value: date.getTime().toString()
            },
            {
                label: 'ISO 8601',
                value: date.toISOString()
            },
            {
                label: 'RFC 2822',
                value: date.toString()
            },
            {
                label: 'UTC String',
                value: date.toUTCString()
            },
            {
                label: 'Local String',
                value: date.toLocaleString('en-US', { timeZone: timezone })
            },
            {
                label: 'Date Only',
                value: createFormatter({ year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
            },
            {
                label: 'Time Only',
                value: createFormatter({ hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(date)
            },
            {
                label: 'Full Date Time',
                value: createFormatter({ 
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                    timeZoneName: 'short'
                }).format(date)
            },
            {
                label: 'Y-m-d H:i:s',
                value: this.formatCustom(date, timezone, 'YYYY-MM-DD HH:mm:ss')
            },
            {
                label: 'SQL DateTime',
                value: this.formatCustom(date, timezone, 'YYYY-MM-DD HH:mm:ss')
            },
            {
                label: 'Excel Serial Date',
                value: this.toExcelDate(date).toString()
            }
        ];

        return formats;
    }

    formatCustom(date, timezone, format) {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: timezone
        });

        const parts = formatter.formatToParts(date);
        const partsObj = {};
        parts.forEach(part => partsObj[part.type] = part.value);

        return `${partsObj.year}-${partsObj.month}-${partsObj.day} ${partsObj.hour}:${partsObj.minute}:${partsObj.second}`;
    }

    toExcelDate(date) {
        // Excel uses January 1, 1900 as day 1 (with a leap year bug)
        const excelEpoch = new Date(1900, 0, 1);
        const diffTime = date.getTime() - excelEpoch.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 2; // +1 for Excel's 1-based indexing, +1 for leap year bug
    }

    showValidation(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = `validation-message ${type}`;
        element.style.display = 'block';
    }

    clearValidationMessages() {
        document.querySelectorAll('.validation-message').forEach(msg => {
            msg.style.display = 'none';
        });
    }
}

// Global utility functions
function useCurrentTimestamp() {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    document.getElementById('timestamp-input').value = currentTimestamp;
    
    // Trigger conversion
    const event = new Event('input');
    document.getElementById('timestamp-input').dispatchEvent(event);
}

function useExample(timestamp) {
    document.getElementById('timestamp-input').value = timestamp;
    
    // Trigger conversion
    const event = new Event('input');
    document.getElementById('timestamp-input').dispatchEvent(event);
}

function useCurrentDate() {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    
    document.getElementById('date-input').value = localDateTime;
    
    // Trigger conversion
    const event = new Event('input');
    document.getElementById('date-input').dispatchEvent(event);
}

function useToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const localDateTime = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    
    document.getElementById('date-input').value = localDateTime;
    
    // Trigger conversion
    const event = new Event('input');
    document.getElementById('date-input').dispatchEvent(event);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const notification = document.createElement('div');
        notification.textContent = 'Copied to clipboard!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Copied to clipboard!');
    });
}

// Additional utility class for timestamp operations
class TimestampUtilities {
    static getRelativeTime(timestamp) {
        const now = Date.now() / 1000;
        const diff = now - timestamp;
        
        if (Math.abs(diff) < 60) return 'Just now';
        if (Math.abs(diff) < 3600) return `${Math.floor(Math.abs(diff) / 60)} minutes ${diff > 0 ? 'ago' : 'from now'}`;
        if (Math.abs(diff) < 86400) return `${Math.floor(Math.abs(diff) / 3600)} hours ${diff > 0 ? 'ago' : 'from now'}`;
        return `${Math.floor(Math.abs(diff) / 86400)} days ${diff > 0 ? 'ago' : 'from now'}`;
    }

    static validateTimestamp(timestamp) {
        // Check if timestamp is reasonable (between 1970 and ~2050)
        const minTimestamp = 0;
        const maxTimestamp = 2556057600; // ~2051
        
        return timestamp >= minTimestamp && timestamp <= maxTimestamp;
    }

    static detectTimestampFormat(input) {
        const num = parseFloat(input);
        if (isNaN(num)) return null;
        
        if (num < 100000000000) {
            return 'seconds';
        } else if (num < 100000000000000) {
            return 'milliseconds';
        } else {
            return 'microseconds';
        }
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TimestampConverter();
});

// Cleanup interval when page unloads
window.addEventListener('beforeunload', () => {
    if (window.timestampConverter && window.timestampConverter.updateInterval) {
        clearInterval(window.timestampConverter.updateInterval);
    }
});
