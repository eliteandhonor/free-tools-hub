// Month names for formatting
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const monthNamesShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const dayNamesShort = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDateTime();
    setupTabSwitching();
    setupAutoConversion();
    
    // Update current time every second
    setInterval(updateCurrentDateTime, 1000);
});

// Update current date time display
function updateCurrentDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    document.getElementById('currentDateTime').textContent = dateTimeString;
}

// Setup tab switching functionality
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.conversion-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Setup auto-conversion on input change
function setupAutoConversion() {
    document.getElementById('inputDate').addEventListener('input', convertDateFormat);
    document.getElementById('outputFormat').addEventListener('change', convertDateFormat);
    document.getElementById('timestampInput').addEventListener('input', convertTimestamp);
    document.getElementById('dateInput').addEventListener('change', convertToTimestamp);
    document.getElementById('customInputDate').addEventListener('input', convertCustomFormat);
    document.getElementById('customFormat').addEventListener('input', convertCustomFormat);
}

// Parse date from various formats
function parseDate(dateString) {
    if (!dateString) return null;
    
    // Remove extra whitespace
    dateString = dateString.trim();
    
    // Try different parsing strategies
    let date = null;
    
    // Try ISO format first
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        date = new Date(dateString);
    }
    // Try US format MM/DD/YYYY
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateString)) {
        const parts = dateString.split(/[\/\s]/);
        date = new Date(parts[2], parts[0] - 1, parts[1]);
    }
    // Try European format DD/MM/YYYY
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateString)) {
        // This is ambiguous with US format, we'll assume context
        date = new Date(dateString);
    }
    // Try with dashes DD-MM-YYYY
    else if (/^\d{1,2}-\d{1,2}-\d{4}/.test(dateString)) {
        const parts = dateString.split('-');
        date = new Date(parts[2], parts[1] - 1, parts[0]);
    }
    // Try natural language parsing
    else {
        date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return null;
    }
    
    return date;
}

// Format date according to pattern
function formatDate(date, pattern) {
    if (!date || isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const dayOfWeek = date.getDay();
    
    // Replace format tokens
    let formatted = pattern;
    
    // Year
    formatted = formatted.replace(/YYYY/g, year.toString());
    formatted = formatted.replace(/YY/g, year.toString().slice(-2));
    
    // Month
    formatted = formatted.replace(/MMMM/g, monthNames[month]);
    formatted = formatted.replace(/MMM/g, monthNamesShort[month]);
    formatted = formatted.replace(/MM/g, (month + 1).toString().padStart(2, '0'));
    formatted = formatted.replace(/M/g, (month + 1).toString());
    
    // Day
    formatted = formatted.replace(/DD/g, day.toString().padStart(2, '0'));
    formatted = formatted.replace(/D/g, day.toString());
    
    // Day of week
    formatted = formatted.replace(/dddd/g, dayNames[dayOfWeek]);
    formatted = formatted.replace(/ddd/g, dayNamesShort[dayOfWeek]);
    
    // Hours
    formatted = formatted.replace(/HH/g, hours.toString().padStart(2, '0'));
    formatted = formatted.replace(/H/g, hours.toString());
    formatted = formatted.replace(/hh/g, (hours % 12 || 12).toString().padStart(2, '0'));
    formatted = formatted.replace(/h/g, (hours % 12 || 12).toString());
    
    // Minutes
    formatted = formatted.replace(/mm/g, minutes.toString().padStart(2, '0'));
    formatted = formatted.replace(/m/g, minutes.toString());
    
    // Seconds
    formatted = formatted.replace(/ss/g, seconds.toString().padStart(2, '0'));
    formatted = formatted.replace(/s/g, seconds.toString());
    
    // AM/PM
    formatted = formatted.replace(/A/g, hours >= 12 ? 'PM' : 'AM');
    formatted = formatted.replace(/a/g, hours >= 12 ? 'pm' : 'am');
    
    return formatted;
}

// Convert date format
function convertDateFormat() {
    const inputDate = document.getElementById('inputDate').value;
    const outputFormat = document.getElementById('outputFormat').value;
    const resultElement = document.getElementById('dateFormatResult');
    
    if (!inputDate) {
        resultElement.textContent = 'Results will appear here...';
        return;
    }
    
    try {
        const parsedDate = parseDate(inputDate);
        if (!parsedDate) {
            resultElement.textContent = 'Invalid date format';
            return;
        }
        
        const formatted = formatDate(parsedDate, outputFormat);
        resultElement.textContent = formatted;
        
    } catch (error) {
        resultElement.textContent = 'Error: ' + error.message;
    }
}

// Convert Unix timestamp to date
function convertTimestamp() {
    const timestampInput = document.getElementById('timestampInput').value;
    const resultElement = document.getElementById('timestampResult');
    
    if (!timestampInput) {
        resultElement.textContent = 'Results will appear here...';
        return;
    }
    
    try {
        let timestamp = parseInt(timestampInput);
        
        // Check if timestamp is in seconds or milliseconds
        if (timestamp < 10000000000) {
            timestamp *= 1000; // Convert seconds to milliseconds
        }
        
        const date = new Date(timestamp);
        
        if (isNaN(date.getTime())) {
            resultElement.textContent = 'Invalid timestamp';
            return;
        }
        
        const formatted = date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });
        
        resultElement.textContent = formatted;
        
    } catch (error) {
        resultElement.textContent = 'Error: ' + error.message;
    }
}

// Convert date to Unix timestamp
function convertToTimestamp() {
    const dateInput = document.getElementById('dateInput').value;
    const resultElement = document.getElementById('generatedTimestamp');
    
    if (!dateInput) {
        resultElement.textContent = 'Results will appear here...';
        return;
    }
    
    try {
        const date = new Date(dateInput);
        
        if (isNaN(date.getTime())) {
            resultElement.textContent = 'Invalid date';
            return;
        }
        
        const timestamp = Math.floor(date.getTime() / 1000);
        resultElement.textContent = timestamp.toString();
        
    } catch (error) {
        resultElement.textContent = 'Error: ' + error.message;
    }
}

// Convert with custom format
function convertCustomFormat() {
    const inputDate = document.getElementById('customInputDate').value;
    const customFormat = document.getElementById('customFormat').value;
    const resultElement = document.getElementById('customFormatResult');
    
    if (!inputDate || !customFormat) {
        resultElement.textContent = 'Results will appear here...';
        return;
    }
    
    try {
        const parsedDate = parseDate(inputDate);
        if (!parsedDate) {
            resultElement.textContent = 'Invalid date format';
            return;
        }
        
        const formatted = formatDate(parsedDate, customFormat);
        resultElement.textContent = formatted;
        
    } catch (error) {
        resultElement.textContent = 'Error: ' + error.message;
    }
}

// Set current date
function setCurrentDate() {
    const now = new Date();
    const isoString = now.toISOString().split('T')[0];
    document.getElementById('inputDate').value = isoString;
    convertDateFormat();
}

// Set current timestamp
function setCurrentTimestamp() {
    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);
    document.getElementById('timestampInput').value = timestamp.toString();
    convertTimestamp();
}

// Set preset format
function setPresetFormat(format) {
    document.getElementById('outputFormat').value = format;
    convertDateFormat();
}

// Copy result to clipboard
function copyResult(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent.trim();
    
    if (text && text !== 'Results will appear here...' && !text.startsWith('Error:') && text !== 'Invalid date format' && text !== 'Invalid timestamp' && text !== 'Invalid date') {
        navigator.clipboard.writeText(text).then(() => {
            // Show success feedback
            const button = element.parentElement.querySelector('.copy-button');
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = 'var(--primary-color)';
            }, 1000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard');
        });
    }
}

// Load example dates
function loadExample(type) {
    const now = new Date();
    
    switch (type) {
        case 'iso':
            document.getElementById('inputDate').value = now.toISOString().split('T')[0];
            document.getElementById('outputFormat').value = 'MM/DD/YYYY';
            document.querySelector('[data-tab="format-converter"]').click();
            convertDateFormat();
            break;
        case 'us':
            document.getElementById('inputDate').value = '12/25/2023';
            document.getElementById('outputFormat').value = 'YYYY-MM-DD';
            document.querySelector('[data-tab="format-converter"]').click();
            convertDateFormat();
            break;
        case 'timestamp':
            document.getElementById('timestampInput').value = '1703529600';
            document.querySelector('[data-tab="timestamp-converter"]').click();
            convertTimestamp();
            break;
        case 'custom':
            document.getElementById('customInputDate').value = now.toISOString().split('T')[0];
            document.getElementById('customFormat').value = 'dddd, MMMM DD, YYYY';
            document.querySelector('[data-tab="custom-format"]').click();
            convertCustomFormat();
            break;
    }
}

// Utility function to get ordinal suffix
function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// Enhanced format function with ordinals
function formatDateWithOrdinals(date, pattern) {
    let formatted = formatDate(date, pattern);
    
    // Handle ordinal day formatting (Do)
    if (pattern.includes('Do')) {
        const day = date.getDate();
        const ordinal = day + getOrdinalSuffix(day);
        formatted = formatted.replace(/Do/g, ordinal);
    }
    
    return formatted;
}

// Auto-detect date format
function detectDateFormat(dateString) {
    const formats = [
        { pattern: /^\d{4}-\d{2}-\d{2}/, name: 'ISO 8601 (YYYY-MM-DD)' },
        { pattern: /^\d{1,2}\/\d{1,2}\/\d{4}/, name: 'US Format (MM/DD/YYYY)' },
        { pattern: /^\d{1,2}-\d{1,2}-\d{4}/, name: 'European (DD-MM-YYYY)' },
        { pattern: /^\d{4}\/\d{2}\/\d{2}/, name: 'Japanese (YYYY/MM/DD)' },
        { pattern: /^\d{1,2}\.\d{1,2}\.\d{4}/, name: 'Dot Format (DD.MM.YYYY)' }
    ];
    
    for (const format of formats) {
        if (format.pattern.test(dateString)) {
            return format.name;
        }
    }
    
    return 'Unknown format';
}

// Validate date range
function isValidDateRange(date) {
    const minDate = new Date('1970-01-01');
    const maxDate = new Date('2100-12-31');
    return date >= minDate && date <= maxDate;
}

// Format relative time
function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 1) return `${diffDays} days ago`;
    if (diffDays < -1) return `In ${Math.abs(diffDays)} days`;
    
    return '';
}
