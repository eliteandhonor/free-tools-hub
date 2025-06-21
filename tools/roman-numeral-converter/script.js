// Roman Numeral Converter Script

class RomanNumeralConverter {
    constructor() {
        this.romanNumerals = [
            { value: 1000, numeral: 'M' },
            { value: 900, numeral: 'CM' },
            { value: 500, numeral: 'D' },
            { value: 400, numeral: 'CD' },
            { value: 100, numeral: 'C' },
            { value: 90, numeral: 'XC' },
            { value: 50, numeral: 'L' },
            { value: 40, numeral: 'XL' },
            { value: 10, numeral: 'X' },
            { value: 9, numeral: 'IX' },
            { value: 5, numeral: 'V' },
            { value: 4, numeral: 'IV' },
            { value: 1, numeral: 'I' }
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setDefaultTab();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Arabic to Roman conversion
        const arabicInput = document.getElementById('arabic-input');
        arabicInput.addEventListener('input', (e) => this.convertArabicToRoman(e.target.value));
        arabicInput.addEventListener('keyup', (e) => this.convertArabicToRoman(e.target.value));

        // Roman to Arabic conversion
        const romanInput = document.getElementById('roman-input');
        romanInput.addEventListener('input', (e) => this.convertRomanToArabic(e.target.value));
        romanInput.addEventListener('keyup', (e) => this.convertRomanToArabic(e.target.value));

        // Example clicks
        document.querySelectorAll('.example-item').forEach(item => {
            item.addEventListener('click', () => this.useExample(item));
        });
    }

    setDefaultTab() {
        this.switchTab('arabic-to-roman');
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

        // Clear inputs and validation messages
        this.clearAll();
    }

    convertArabicToRoman(value) {
        const arabicValidation = document.getElementById('arabic-validation');
        const romanOutput = document.getElementById('roman-output');

        // Clear previous state
        arabicValidation.style.display = 'none';
        romanOutput.value = '';

        // Validate input
        if (!value || value.trim() === '') {
            return;
        }

        const number = parseInt(value);

        if (isNaN(number)) {
            this.showValidation('arabic-validation', 'Please enter a valid number.', 'error');
            return;
        }

        if (number < 1 || number > 3999) {
            this.showValidation('arabic-validation', 'Please enter a number between 1 and 3999.', 'error');
            return;
        }

        // Convert to Roman
        const roman = this.toRoman(number);
        romanOutput.value = roman;
        
        this.showValidation('arabic-validation', `${number} in Roman numerals is ${roman}`, 'success');
    }

    convertRomanToArabic(value) {
        const romanValidation = document.getElementById('roman-validation');
        const arabicOutput = document.getElementById('arabic-output');

        // Clear previous state
        romanValidation.style.display = 'none';
        arabicOutput.value = '';

        // Validate input
        if (!value || value.trim() === '') {
            return;
        }

        const roman = value.trim().toUpperCase();

        // Validate Roman numeral format
        if (!this.isValidRoman(roman)) {
            this.showValidation('roman-validation', 'Please enter a valid Roman numeral.', 'error');
            return;
        }

        // Convert to Arabic
        const number = this.fromRoman(roman);
        
        if (number === 0) {
            this.showValidation('roman-validation', 'Invalid Roman numeral format.', 'error');
            return;
        }

        arabicOutput.value = number;
        this.showValidation('roman-validation', `${roman} in Arabic numerals is ${number}`, 'success');
    }

    toRoman(num) {
        let result = '';
        
        for (let i = 0; i < this.romanNumerals.length; i++) {
            const { value, numeral } = this.romanNumerals[i];
            
            while (num >= value) {
                result += numeral;
                num -= value;
            }
        }
        
        return result;
    }

    fromRoman(roman) {
        // Create a map for easy lookup
        const romanMap = {
            'I': 1, 'V': 5, 'X': 10, 'L': 50,
            'C': 100, 'D': 500, 'M': 1000
        };

        let result = 0;
        
        for (let i = 0; i < roman.length; i++) {
            const current = romanMap[roman[i]];
            const next = romanMap[roman[i + 1]];
            
            if (current === undefined) {
                return 0; // Invalid character
            }
            
            // If current is less than next, subtract current
            if (next && current < next) {
                result += next - current;
                i++; // Skip next character as we've processed it
            } else {
                result += current;
            }
        }
        
        // Validate by converting back to Roman
        if (this.toRoman(result) !== roman) {
            return 0; // Invalid format
        }
        
        return result;
    }

    isValidRoman(roman) {
        // Basic validation pattern for Roman numerals
        const romanPattern = /^M{0,4}(CM|CD|D?C{0,3})?(XC|XL|L?X{0,3})?(IX|IV|V?I{0,3})?$/;
        return romanPattern.test(roman);
    }

    useExample(item) {
        const number = item.dataset.number;
        const roman = item.dataset.roman;
        
        // Switch to appropriate tab and fill input
        const activeTab = document.querySelector('.tab-button.active').dataset.tab;
        
        if (activeTab === 'arabic-to-roman') {
            document.getElementById('arabic-input').value = number;
            this.convertArabicToRoman(number);
        } else {
            document.getElementById('roman-input').value = roman;
            this.convertRomanToArabic(roman);
        }

        // Visual feedback
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
            item.style.transform = '';
        }, 150);
    }

    showValidation(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = `validation-message ${type}`;
        element.style.display = 'block';
    }

    clearAll() {
        // Clear all inputs
        document.getElementById('arabic-input').value = '';
        document.getElementById('roman-input').value = '';
        document.getElementById('roman-output').value = '';
        document.getElementById('arabic-output').value = '';

        // Hide all validation messages
        document.querySelectorAll('.validation-message').forEach(msg => {
            msg.style.display = 'none';
        });
    }
}

// Additional utility functions for enhanced functionality
class RomanNumeralUtilities {
    static getRandomExample() {
        const examples = [
            { number: 7, roman: 'VII' },
            { number: 14, roman: 'XIV' },
            { number: 27, roman: 'XXVII' },
            { number: 44, roman: 'XLIV' },
            { number: 69, roman: 'LXIX' },
            { number: 99, roman: 'XCIX' },
            { number: 144, roman: 'CXLIV' },
            { number: 399, roman: 'CCCXCIX' },
            { number: 444, roman: 'CDXLIV' },
            { number: 888, roman: 'DCCCLXXXVIII' },
            { number: 1776, roman: 'MDCCLXXVI' },
            { number: 1969, roman: 'MCMLXIX' },
            { number: 2000, roman: 'MM' },
            { number: 2024, roman: 'MMXXIV' }
        ];
        
        return examples[Math.floor(Math.random() * examples.length)];
    }

    static getRomanNumeralFacts() {
        return [
            "Roman numerals were used in the Roman Empire and are still used today for various purposes.",
            "The largest number that can be represented in standard Roman numerals is 3,999 (MMMCMXCIX).",
            "There is no symbol for zero in Roman numerals - the concept of zero was not known to ancient Romans.",
            "Roman numerals are still commonly used in clock faces, book chapters, and movie sequels.",
            "The subtractive notation (like IV for 4) was not consistently used until the Middle Ages.",
            "Roman numerals use additive and subtractive principles to represent numbers."
        ];
    }

    static formatRomanWithSpacing(roman) {
        // Add subtle spacing for better readability of long Roman numerals
        return roman.replace(/(.{4})/g, '$1 ').trim();
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RomanNumeralConverter();
});

// Add some interactive enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    document.querySelector('[data-tab="arabic-to-roman"]').click();
                    break;
                case '2':
                    e.preventDefault();
                    document.querySelector('[data-tab="roman-to-arabic"]').click();
                    break;
            }
        }
    });

    // Add copy functionality
    const addCopyButton = (inputId) => {
        const input = document.getElementById(inputId);
        if (input && input.readOnly) {
            const copyBtn = document.createElement('button');
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.className = 'copy-btn';
            copyBtn.style.cssText = `
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 0.5rem;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            input.parentElement.style.position = 'relative';
            input.addEventListener('focus', () => copyBtn.style.opacity = '1');
            input.addEventListener('blur', () => setTimeout(() => copyBtn.style.opacity = '0', 100));
            
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(input.value);
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i>', 1000);
                } catch (err) {
                    console.error('Failed to copy: ', err);
                }
            });
            
            input.parentElement.appendChild(copyBtn);
        }
    };

    addCopyButton('roman-output');
    addCopyButton('arabic-output');
});
