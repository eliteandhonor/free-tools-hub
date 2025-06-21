// Common timezones with display names
const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET) - New York' },
    { value: 'America/Chicago', label: 'Central Time (CT) - Chicago' },
    { value: 'America/Denver', label: 'Mountain Time (MT) - Denver' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles' },
    { value: 'America/Anchorage', label: 'Alaska Time - Anchorage' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time - Honolulu' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT) - London' },
    { value: 'Europe/Paris', label: 'Central European Time (CET) - Paris' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET) - Berlin' },
    { value: 'Europe/Rome', label: 'Central European Time (CET) - Rome' },
    { value: 'Europe/Madrid', label: 'Central European Time (CET) - Madrid' },
    { value: 'Europe/Amsterdam', label: 'Central European Time (CET) - Amsterdam' },
    { value: 'Europe/Stockholm', label: 'Central European Time (CET) - Stockholm' },
    { value: 'Europe/Moscow', label: 'Moscow Time (MSK) - Moscow' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST) - Tokyo' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST) - Shanghai' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (HKT) - Hong Kong' },
    { value: 'Asia/Singapore', label: 'Singapore Time (SGT) - Singapore' },
    { value: 'Asia/Seoul', label: 'Korea Standard Time (KST) - Seoul' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST) - Mumbai' },
    { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST) - Dubai' },
    { value: 'Asia/Bangkok', label: 'Indochina Time (ICT) - Bangkok' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET) - Sydney' },
    { value: 'Australia/Melbourne', label: 'Australian Eastern Time (AET) - Melbourne' },
    { value: 'Australia/Perth', label: 'Australian Western Time (AWT) - Perth' },
    { value: 'Pacific/Auckland', label: 'New Zealand Time (NZST) - Auckland' },
    { value: 'America/Toronto', label: 'Eastern Time (ET) - Toronto' },
    { value: 'America/Vancouver', label: 'Pacific Time (PT) - Vancouver' },
    { value: 'America/Mexico_City', label: 'Central Time (CT) - Mexico City' },
    { value: 'America/Sao_Paulo', label: 'Brazil Time (BRT) - São Paulo' },
    { value: 'America/Buenos_Aires', label: 'Argentina Time (ART) - Buenos Aires' },
    { value: 'Africa/Cairo', label: 'Eastern European Time (EET) - Cairo' },
    { value: 'Africa/Johannesburg', label: 'South Africa Time (SAST) - Johannesburg' },
    { value: 'Africa/Lagos', label: 'West Africa Time (WAT) - Lagos' }
];

// World clock cities
const worldClockCities = [
    { timezone: 'America/New_York', city: 'New York', country: 'USA' },
    { timezone: 'Europe/London', city: 'London', country: 'UK' },
    { timezone: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan' },
    { timezone: 'Australia/Sydney', city: 'Sydney', country: 'Australia' },
    { timezone: 'Europe/Paris', city: 'Paris', country: 'France' },
    { timezone: 'Asia/Shanghai', city: 'Shanghai', country: 'China' },
    { timezone: 'America/Los_Angeles', city: 'Los Angeles', country: 'USA' },
    { timezone: 'Asia/Dubai', city: 'Dubai', country: 'UAE' }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    populateTimezoneSelects();
    setDefaultTimezones();
    setCurrentTime();
    updateCurrentTimeDisplay();
    updateWorldClock();
    
    // Set up event listeners
    document.getElementById('fromDateTime').addEventListener('change', convertTime);
    document.getElementById('fromTimezone').addEventListener('change', convertTime);
    document.getElementById('toTimezone').addEventListener('change', convertTime);
    
    // Update clocks every second
    setInterval(() => {
        updateCurrentTimeDisplay();
        updateWorldClock();
    }, 1000);
});

// Populate timezone select elements
function populateTimezoneSelects() {
    const fromSelect = document.getElementById('fromTimezone');
    const toSelect = document.getElementById('toTimezone');
    
    timezones.forEach(tz => {
        const option1 = new Option(tz.label, tz.value);
        const option2 = new Option(tz.label, tz.value);
        fromSelect.appendChild(option1);
        toSelect.appendChild(option2);
    });
}

// Set default timezones based on user's location
function setDefaultTimezones() {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fromSelect = document.getElementById('fromTimezone');
    const toSelect = document.getElementById('toTimezone');
    
    // Set from timezone to user's timezone if available
    if (timezones.find(tz => tz.value === userTimezone)) {
        fromSelect.value = userTimezone;
    } else {
        fromSelect.value = 'UTC';
    }
    
    // Set to timezone to UTC by default
    toSelect.value = 'UTC';
}

// Set current time in the datetime input
function setCurrentTime() {
    const now = new Date();
    const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('fromDateTime').value = localISOTime;
    convertTime();
}

// Update current time display
function updateCurrentTimeDisplay() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('currentTime').textContent = timeString;
    document.getElementById('currentDate').textContent = dateString;
}

// Convert time between timezones
function convertTime() {
    const fromTimezone = document.getElementById('fromTimezone').value;
    const toTimezone = document.getElementById('toTimezone').value;
    const dateTimeInput = document.getElementById('fromDateTime').value;
    
    if (!dateTimeInput || !fromTimezone || !toTimezone) {
        document.getElementById('resultTime').textContent = '--:--:--';
        document.getElementById('resultInfo').textContent = 'Select timezones and time';
        return;
    }
    
    try {
        // Parse the input datetime
        const inputDate = new Date(dateTimeInput);
        
        // Convert to target timezone
        const result = convertToTimezone(inputDate, fromTimezone, toTimezone);
        
        // Format the result
        const timeString = result.toLocaleTimeString('en-US', {
            timeZone: toTimezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const dateString = result.toLocaleDateString('en-US', {
            timeZone: toTimezone,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        document.getElementById('resultTime').textContent = timeString;
        document.getElementById('resultInfo').textContent = dateString + ' (' + getTimezoneAbbr(toTimezone) + ')';
        
    } catch (error) {
        document.getElementById('resultTime').textContent = 'Error';
        document.getElementById('resultInfo').textContent = 'Invalid date/time';
    }
}

// Convert date to target timezone
function convertToTimezone(date, fromTimezone, toTimezone) {
    // Create a date object interpreted in the source timezone
    const sourceDate = new Date(date.toLocaleString('en-US', { timeZone: fromTimezone }));
    const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    const sourceOffset = sourceDate.getTimezoneOffset();
    const correctedDate = new Date(utcDate.getTime() - (sourceOffset * 60000));
    
    return correctedDate;
}

// Get timezone abbreviation
function getTimezoneAbbr(timezone) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(now);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    return timeZonePart ? timeZonePart.value : timezone;
}

// Swap timezones
function swapTimezones() {
    const fromSelect = document.getElementById('fromTimezone');
    const toSelect = document.getElementById('toTimezone');
    
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    
    convertTime();
}

// Quick convert to specific timezone
function quickConvert(targetTimezone) {
    document.getElementById('toTimezone').value = targetTimezone;
    convertTime();
}

// Update world clock
function updateWorldClock() {
    const worldClockContainer = document.getElementById('worldClock');
    worldClockContainer.innerHTML = '';
    
    worldClockCities.forEach(city => {
        const now = new Date();
        
        const timeString = now.toLocaleTimeString('en-US', {
            timeZone: city.timezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const dateString = now.toLocaleDateString('en-US', {
            timeZone: city.timezone,
            month: 'short',
            day: 'numeric'
        });
        
        const clockCard = document.createElement('div');
        clockCard.className = 'clock-card';
        clockCard.innerHTML = `
            <div class="clock-city">${city.city}, ${city.country}</div>
            <div class="clock-time">${timeString}</div>
            <div class="clock-date">${dateString} (${getTimezoneAbbr(city.timezone)})</div>
        `;
        
        // Add click functionality to set as target timezone
        clockCard.style.cursor = 'pointer';
        clockCard.addEventListener('click', () => {
            document.getElementById('toTimezone').value = city.timezone;
            convertTime();
        });
        
        worldClockContainer.appendChild(clockCard);
    });
}

// Format time difference
function getTimeDifference(fromTimezone, toTimezone) {
    const now = new Date();
    const fromDate = new Date(now.toLocaleString('en-US', { timeZone: fromTimezone }));
    const toDate = new Date(now.toLocaleString('en-US', { timeZone: toTimezone }));
    
    const diffMs = toDate.getTime() - fromDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0 && diffMinutes === 0) {
        return 'Same time';
    }
    
    const sign = diffMs >= 0 ? '+' : '';
    return `${sign}${diffHours}h ${Math.abs(diffMinutes)}m`;
}

// Load example conversions
function loadExample(type) {
    const fromSelect = document.getElementById('fromTimezone');
    const toSelect = document.getElementById('toTimezone');
    
    switch (type) {
        case 'business':
            fromSelect.value = 'America/New_York';
            toSelect.value = 'Asia/Tokyo';
            setCurrentTime();
            break;
        case 'meeting':
            fromSelect.value = 'Europe/London';
            toSelect.value = 'America/Los_Angeles';
            setCurrentTime();
            break;
        case 'travel':
            fromSelect.value = 'Australia/Sydney';
            toSelect.value = 'Europe/Paris';
            setCurrentTime();
            break;
    }
}

// Auto-detect user's timezone
function detectUserTimezone() {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fromSelect = document.getElementById('fromTimezone');
    
    if (timezones.find(tz => tz.value === userTimezone)) {
        fromSelect.value = userTimezone;
        convertTime();
    }
}

// Utility function to get current time in specific timezone
function getCurrentTimeInTimezone(timezone) {
    const now = new Date();
    return now.toLocaleString('en-US', {
        timeZone: timezone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Calculate time zone offset
function getTimezoneOffset(timezone) {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (target.getTime() - utc.getTime()) / (1000 * 60 * 60);
    
    const sign = offset >= 0 ? '+' : '';
    return `UTC${sign}${offset}`;
}
