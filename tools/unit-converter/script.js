// Conversion factors to base units
const conversionFactors = {
    length: {
        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        millimeter: 0.001,
        inch: 0.0254,
        foot: 0.3048,
        yard: 0.9144,
        mile: 1609.344,
        'nautical-mile': 1852
    },
    weight: {
        kilogram: 1,
        gram: 0.001,
        pound: 0.453592,
        ounce: 0.0283495,
        stone: 6.35029,
        ton: 1000,
        'short-ton': 907.185,
        'long-ton': 1016.05
    },
    volume: {
        liter: 1,
        milliliter: 0.001,
        'gallon-us': 3.78541,
        'gallon-uk': 4.54609,
        quart: 0.946353,
        pint: 0.473176,
        cup: 0.236588,
        'fluid-ounce': 0.0295735,
        'cubic-meter': 1000
    },
    area: {
        'square-meter': 1,
        'square-kilometer': 1000000,
        'square-centimeter': 0.0001,
        'square-foot': 0.092903,
        'square-inch': 0.00064516,
        'square-yard': 0.836127,
        acre: 4046.86,
        hectare: 10000
    },
    speed: {
        'meter-per-second': 1,
        'kilometer-per-hour': 0.277778,
        'mile-per-hour': 0.44704,
        'foot-per-second': 0.3048,
        knot: 0.514444
    },
    energy: {
        joule: 1,
        kilojoule: 1000,
        calorie: 4.184,
        kilocalorie: 4184,
        'watt-hour': 3600,
        'kilowatt-hour': 3600000,
        btu: 1055.06
    }
};

// Temperature conversion functions (special case)
const temperatureConversions = {
    celsius: {
        fahrenheit: (c) => (c * 9/5) + 32,
        kelvin: (c) => c + 273.15,
        rankine: (c) => (c + 273.15) * 9/5
    },
    fahrenheit: {
        celsius: (f) => (f - 32) * 5/9,
        kelvin: (f) => (f - 32) * 5/9 + 273.15,
        rankine: (f) => f + 459.67
    },
    kelvin: {
        celsius: (k) => k - 273.15,
        fahrenheit: (k) => (k - 273.15) * 9/5 + 32,
        rankine: (k) => k * 9/5
    },
    rankine: {
        celsius: (r) => (r - 491.67) * 5/9,
        fahrenheit: (r) => r - 459.67,
        kelvin: (r) => r * 5/9
    }
};

// Current active category
let activeCategory = 'length';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupTabSwitching();
    setupEventListeners();
    performConversion(activeCategory);
});

// Setup tab switching functionality
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.conversion-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(category).classList.add('active');
            
            activeCategory = category;
            performConversion(category);
        });
    });
}

// Setup event listeners for all categories
function setupEventListeners() {
    const categories = ['length', 'weight', 'temperature', 'volume', 'area', 'speed', 'energy'];
    
    categories.forEach(category => {
        const fromValue = document.getElementById(`${category}FromValue`);
        const fromUnit = document.getElementById(`${category}From`);
        const toUnit = document.getElementById(`${category}To`);
        
        if (fromValue) {
            fromValue.addEventListener('input', () => performConversion(category));
        }
        if (fromUnit) {
            fromUnit.addEventListener('change', () => performConversion(category));
        }
        if (toUnit) {
            toUnit.addEventListener('change', () => performConversion(category));
        }
    });
}

// Perform conversion for a specific category
function performConversion(category) {
    const fromValue = document.getElementById(`${category}FromValue`);
    const fromUnit = document.getElementById(`${category}From`);
    const toUnit = document.getElementById(`${category}To`);
    const toValue = document.getElementById(`${category}ToValue`);
    
    if (!fromValue || !fromUnit || !toUnit || !toValue) {
        return;
    }
    
    const inputValue = parseFloat(fromValue.value) || 0;
    const fromUnitValue = fromUnit.value;
    const toUnitValue = toUnit.value;
    
    let result;
    
    if (category === 'temperature') {
        result = convertTemperature(inputValue, fromUnitValue, toUnitValue);
    } else {
        result = convertStandardUnit(inputValue, fromUnitValue, toUnitValue, category);
    }
    
    // Format the result
    toValue.value = formatResult(result);
}

// Convert standard units using conversion factors
function convertStandardUnit(value, fromUnit, toUnit, category) {
    if (fromUnit === toUnit) {
        return value;
    }
    
    const factors = conversionFactors[category];
    if (!factors || !factors[fromUnit] || !factors[toUnit]) {
        return 0;
    }
    
    // Convert to base unit, then to target unit
    const baseValue = value * factors[fromUnit];
    const result = baseValue / factors[toUnit];
    
    return result;
}

// Convert temperature (special case)
function convertTemperature(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) {
        return value;
    }
    
    if (temperatureConversions[fromUnit] && temperatureConversions[fromUnit][toUnit]) {
        return temperatureConversions[fromUnit][toUnit](value);
    }
    
    // If direct conversion not available, convert via celsius
    if (fromUnit !== 'celsius') {
        value = temperatureConversions[fromUnit].celsius(value);
    }
    
    if (toUnit !== 'celsius') {
        value = temperatureConversions.celsius[toUnit](value);
    }
    
    return value;
}

// Format result with appropriate precision
function formatResult(value) {
    if (Math.abs(value) >= 1000000) {
        return value.toExponential(4);
    } else if (Math.abs(value) >= 1) {
        return parseFloat(value.toFixed(6)).toString();
    } else if (value === 0) {
        return '0';
    } else {
        return parseFloat(value.toFixed(8)).toString();
    }
}

// Swap units for a category
function swapUnits(category) {
    const fromUnit = document.getElementById(`${category}From`);
    const toUnit = document.getElementById(`${category}To`);
    const fromValue = document.getElementById(`${category}FromValue`);
    const toValue = document.getElementById(`${category}ToValue`);
    
    if (!fromUnit || !toUnit || !fromValue || !toValue) {
        return;
    }
    
    // Swap unit selections
    const tempUnit = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tempUnit;
    
    // Swap values
    const tempValue = fromValue.value;
    fromValue.value = toValue.value;
    
    // Perform conversion with new setup
    performConversion(category);
}

// Set specific unit for from/to selectors
function setUnit(elementId, unit) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = unit;
        
        // Determine category from element ID
        const category = elementId.replace('From', '').replace('To', '');
        performConversion(category);
    }
}

// Quick conversion presets
function quickConvert(category, fromUnit, toUnit) {
    const fromSelect = document.getElementById(`${category}From`);
    const toSelect = document.getElementById(`${category}To`);
    const fromValue = document.getElementById(`${category}FromValue`);
    
    if (!fromSelect || !toSelect || !fromValue) {
        return;
    }
    
    fromSelect.value = fromUnit;
    toSelect.value = toUnit;
    fromValue.value = '1';
    
    performConversion(category);
}

// Load example conversions
function loadExample(type) {
    switch (type) {
        case 'metric':
            document.querySelector('[data-category="length"]').click();
            quickConvert('length', 'meter', 'foot');
            break;
        case 'imperial':
            document.querySelector('[data-category="weight"]').click();
            quickConvert('weight', 'pound', 'kilogram');
            break;
        case 'temperature':
            document.querySelector('[data-category="temperature"]').click();
            quickConvert('temperature', 'celsius', 'fahrenheit');
            document.getElementById('temperatureFromValue').value = '25';
            performConversion('temperature');
            break;
        case 'volume':
            document.querySelector('[data-category="volume"]').click();
            quickConvert('volume', 'gallon-us', 'liter');
            break;
    }
}

// Utility functions for common conversions
const commonConversions = {
    // Length
    feetToMeters: (feet) => feet * 0.3048,
    metersToFeet: (meters) => meters / 0.3048,
    inchesToCm: (inches) => inches * 2.54,
    cmToInches: (cm) => cm / 2.54,
    milesToKm: (miles) => miles * 1.609344,
    kmToMiles: (km) => km / 1.609344,
    
    // Weight
    poundsToKg: (pounds) => pounds * 0.453592,
    kgToPounds: (kg) => kg / 0.453592,
    ouncesToGrams: (ounces) => ounces * 28.3495,
    gramsToOunces: (grams) => grams / 28.3495,
    
    // Temperature
    celsiusToFahrenheit: (celsius) => (celsius * 9/5) + 32,
    fahrenheitToCelsius: (fahrenheit) => (fahrenheit - 32) * 5/9,
    celsiusToKelvin: (celsius) => celsius + 273.15,
    kelvinToCelsius: (kelvin) => kelvin - 273.15,
    
    // Volume
    gallonsToLiters: (gallons) => gallons * 3.78541,
    litersToGallons: (liters) => liters / 3.78541,
    cupsToMl: (cups) => cups * 236.588,
    mlToCups: (ml) => ml / 236.588
};

// Get conversion info for display
function getConversionInfo(category, fromUnit, toUnit) {
    const info = {
        formula: '',
        example: '',
        accuracy: 'High precision'
    };
    
    if (category === 'temperature') {
        if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
            info.formula = '°F = (°C × 9/5) + 32';
            info.example = '25°C = 77°F';
        } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
            info.formula = '°C = (°F - 32) × 5/9';
            info.example = '77°F = 25°C';
        }
    } else if (category === 'length') {
        if (fromUnit === 'meter' && toUnit === 'foot') {
            info.formula = 'ft = m ÷ 0.3048';
            info.example = '1 m = 3.28084 ft';
        } else if (fromUnit === 'foot' && toUnit === 'meter') {
            info.formula = 'm = ft × 0.3048';
            info.example = '1 ft = 0.3048 m';
        }
    }
    
    return info;
}

// Validate input values
function validateInput(value, category) {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
        return { valid: false, message: 'Please enter a valid number' };
    }
    
    // Special validation for temperature
    if (category === 'temperature') {
        const fromUnit = document.getElementById(`${category}From`).value;
        
        if (fromUnit === 'kelvin' && numValue < 0) {
            return { valid: false, message: 'Kelvin cannot be negative' };
        }
        
        if (fromUnit === 'rankine' && numValue < 0) {
            return { valid: false, message: 'Rankine cannot be negative' };
        }
    }
    
    // General negative value check for most units
    if (['length', 'weight', 'volume', 'area', 'energy'].includes(category) && numValue < 0) {
        return { valid: false, message: 'Value cannot be negative' };
    }
    
    return { valid: true, message: '' };
}

// Enhanced conversion with validation
function performConversionWithValidation(category) {
    const fromValue = document.getElementById(`${category}FromValue`);
    const validation = validateInput(fromValue.value, category);
    
    if (!validation.valid) {
        const toValue = document.getElementById(`${category}ToValue`);
        toValue.value = validation.message;
        return;
    }
    
    performConversion(category);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        convertStandardUnit,
        convertTemperature,
        formatResult,
        conversionFactors,
        temperatureConversions,
        commonConversions
    };
}
