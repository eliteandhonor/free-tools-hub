// Number Base Converter Script

class NumberBaseConverter {
    constructor() {
        this.activeInput = null;
        this.isConverting = false;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Base input fields
        const baseInputs = document.querySelectorAll('.base-input');
        baseInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleBaseInput(e));
            input.addEventListener('focus', (e) => this.activeInput = e.target);
        });

        // Copy buttons
        document.querySelectorAll('.copy-base-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.copyBaseValue(e));
        });

        // Custom converter
        document.getElementById('custom-convert-btn').addEventListener('click', () => this.convertCustom());
        document.getElementById('copy-custom-result-btn').addEventListener('click', () => this.copyCustomResult());

        // Actions
        document.getElementById('clear-all-btn').addEventListener('click', () => this.clearAll());
        document.getElementById('swap-endian-btn').addEventListener('click', () => this.swapEndianness());

        // Custom base inputs
        document.getElementById('custom-from-base').addEventListener('change', () => this.validateCustomBase());
        document.getElementById('custom-to-base').addEventListener('change', () => this.validateCustomBase());
        document.getElementById('custom-number').addEventListener('input', () => this.convertCustom());

        // Enter key handling
        document.getElementById('custom-number').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.convertCustom();
            }
        });
    }

    handleBaseInput(event) {
        if (this.isConverting) return;
        
        const input = event.target;
        const base = parseInt(input.dataset.base);
        const value = input.value.trim().toUpperCase();

        // Validate input
        if (!this.isValidNumber(value, base)) {
            this.clearOtherBases(input.id);
            this.clearNumberInfo();
            this.clearConversionSteps();
            return;
        }

        try {
            // Convert to decimal first
            const decimalValue = this.toDecimal(value, base);
            
            // Update all other bases
            this.updateAllBases(decimalValue, input.id);
            
            // Update number information
            this.updateNumberInfo(decimalValue);
            
            // Show conversion steps
            this.showConversionSteps(value, base, decimalValue);
            
        } catch (error) {
            this.showNotification('Invalid number format', 'error');
            this.clearOtherBases(input.id);
        }
    }

    isValidNumber(value, base) {
        if (!value) return false;
        
        const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base);
        
        for (let char of value) {
            if (!validChars.includes(char)) {
                return false;
            }
        }
        
        return true;
    }

    toDecimal(value, base) {
        if (!value) return 0;
        
        let decimal = 0;
        const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let i = 0; i < value.length; i++) {
            const digit = digits.indexOf(value[i]);
            const power = value.length - 1 - i;
            decimal += digit * Math.pow(base, power);
        }
        
        return decimal;
    }

    fromDecimal(decimal, base) {
        if (decimal === 0) return '0';
        
        let result = '';
        const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        while (decimal > 0) {
            const remainder = decimal % base;
            result = digits[remainder] + result;
            decimal = Math.floor(decimal / base);
        }
        
        return result;
    }

    updateAllBases(decimalValue, excludeId) {
        this.isConverting = true;
        
        const bases = {
            'binary-input': 2,
            'octal-input': 8,
            'decimal-input': 10,
            'hexadecimal-input': 16
        };

        Object.keys(bases).forEach(inputId => {
            if (inputId !== excludeId) {
                const base = bases[inputId];
                const value = this.fromDecimal(decimalValue, base);
                document.getElementById(inputId).value = value;
            }
        });

        this.isConverting = false;
    }

    clearOtherBases(excludeId) {
        const inputs = ['binary-input', 'octal-input', 'decimal-input', 'hexadecimal-input'];
        
        inputs.forEach(inputId => {
            if (inputId !== excludeId) {
                document.getElementById(inputId).value = '';
            }
        });
    }

    updateNumberInfo(decimalValue) {
        document.getElementById('info-decimal').textContent = decimalValue.toLocaleString();
        document.getElementById('info-bit-length').textContent = decimalValue.toString(2).length;
        
        // 32-bit signed and unsigned representations
        const signed32 = decimalValue > 2147483647 ? decimalValue - 4294967296 : decimalValue;
        const unsigned32 = decimalValue < 0 ? decimalValue + 4294967296 : decimalValue;
        
        document.getElementById('info-signed').textContent = signed32.toLocaleString();
        document.getElementById('info-unsigned').textContent = unsigned32.toLocaleString();
    }

    clearNumberInfo() {
        document.getElementById('info-decimal').textContent = '-';
        document.getElementById('info-bit-length').textContent = '-';
        document.getElementById('info-signed').textContent = '-';
        document.getElementById('info-unsigned').textContent = '-';
    }

    showConversionSteps(originalValue, fromBase, decimalValue) {
        const stepsContainer = document.getElementById('conversion-steps');
        
        let stepsHTML = '<div class="conversion-step">';
        stepsHTML += `<h4>Converting ${originalValue} (base ${fromBase}) to decimal:</h4>`;
        
        // Show step-by-step calculation
        const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let calculation = '';
        let total = 0;
        
        for (let i = 0; i < originalValue.length; i++) {
            const digit = originalValue[i];
            const digitValue = digits.indexOf(digit);
            const power = originalValue.length - 1 - i;
            const termValue = digitValue * Math.pow(fromBase, power);
            
            if (i > 0) calculation += ' + ';
            calculation += `${digit}×${fromBase}^${power}`;
            
            if (i === originalValue.length - 1) {
                calculation += ' = ';
                for (let j = 0; j < originalValue.length; j++) {
                    const d = originalValue[j];
                    const dv = digits.indexOf(d);
                    const p = originalValue.length - 1 - j;
                    const tv = dv * Math.pow(fromBase, p);
                    
                    if (j > 0) calculation += ' + ';
                    calculation += tv;
                    total += tv;
                }
                calculation += ` = ${total}`;
            }
        }
        
        stepsHTML += `<div class="calculation">${calculation}</div>`;
        stepsHTML += '</div>';
        
        // Show conversions to other bases
        const targetBases = [
            { name: 'Binary', base: 2 },
            { name: 'Octal', base: 8 },
            { name: 'Hexadecimal', base: 16 }
        ].filter(b => b.base !== fromBase);

        targetBases.forEach(target => {
            stepsHTML += '<div class="conversion-step">';
            stepsHTML += `<h4>Converting ${decimalValue} (decimal) to ${target.name.toLowerCase()}:</h4>`;
            stepsHTML += this.getConversionSteps(decimalValue, target.base);
            stepsHTML += '</div>';
        });

        stepsContainer.innerHTML = stepsHTML;
    }

    getConversionSteps(decimal, targetBase) {
        if (decimal === 0) return '<div class="calculation">0 ÷ ' + targetBase + ' = 0 remainder 0</div>';
        
        let steps = '';
        let tempDecimal = decimal;
        const remainders = [];
        
        while (tempDecimal > 0) {
            const quotient = Math.floor(tempDecimal / targetBase);
            const remainder = tempDecimal % targetBase;
            remainders.unshift(remainder);
            
            steps += `<div class="calculation">${tempDecimal} ÷ ${targetBase} = ${quotient} remainder ${remainder}</div>`;
            tempDecimal = quotient;
        }
        
        const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const result = remainders.map(r => digits[r]).join('');
        steps += `<div class="calculation result">Reading remainders from bottom to top: ${result}</div>`;
        
        return steps;
    }

    clearConversionSteps() {
        document.getElementById('conversion-steps').innerHTML = '<p class="no-steps">Enter a number in any base to see conversion steps.</p>';
    }

    convertCustom() {
        const fromBase = parseInt(document.getElementById('custom-from-base').value);
        const toBase = parseInt(document.getElementById('custom-to-base').value);
        const number = document.getElementById('custom-number').value.trim().toUpperCase();
        
        if (!number) {
            document.getElementById('custom-result-input').value = '';
            return;
        }

        if (!this.isValidNumber(number, fromBase)) {
            this.showNotification(`Invalid number for base ${fromBase}`, 'error');
            document.getElementById('custom-result-input').value = 'Invalid input';
            return;
        }

        try {
            const decimal = this.toDecimal(number, fromBase);
            const result = this.fromDecimal(decimal, toBase);
            document.getElementById('custom-result-input').value = result;
        } catch (error) {
            this.showNotification('Conversion error: ' + error.message, 'error');
            document.getElementById('custom-result-input').value = 'Error';
        }
    }

    validateCustomBase() {
        const fromBase = parseInt(document.getElementById('custom-from-base').value);
        const toBase = parseInt(document.getElementById('custom-to-base').value);
        
        if (fromBase < 2 || fromBase > 36) {
            document.getElementById('custom-from-base').value = Math.max(2, Math.min(36, fromBase));
        }
        
        if (toBase < 2 || toBase > 36) {
            document.getElementById('custom-to-base').value = Math.max(2, Math.min(36, toBase));
        }
        
        this.convertCustom();
    }

    copyBaseValue(event) {
        const base = event.target.closest('.copy-base-btn').dataset.base;
        const inputId = `${base}-input`;
        const value = document.getElementById(inputId).value;
        
        if (!value) {
            this.showNotification('No value to copy!', 'warning');
            return;
        }

        this.copyToClipboard(value, `${base.charAt(0).toUpperCase() + base.slice(1)} value copied!`);
    }

    copyCustomResult() {
        const result = document.getElementById('custom-result-input').value;
        
        if (!result || result === 'Invalid input' || result === 'Error') {
            this.showNotification('No valid result to copy!', 'warning');
            return;
        }

        this.copyToClipboard(result, 'Custom conversion result copied!');
    }

    copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification(successMessage, 'success');
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification(successMessage, 'success');
        });
    }

    clearAll() {
        // Clear all base inputs
        document.querySelectorAll('.base-input').forEach(input => {
            input.value = '';
        });

        // Clear custom converter
        document.getElementById('custom-number').value = '';
        document.getElementById('custom-result-input').value = '';

        // Clear information
        this.clearNumberInfo();
        this.clearConversionSteps();

        this.showNotification('All fields cleared!', 'success');
    }

    swapEndianness() {
        if (!this.activeInput || !this.activeInput.value) {
            this.showNotification('Select an input field with a value first!', 'warning');
            return;
        }

        const value = this.activeInput.value;
        const base = parseInt(this.activeInput.dataset.base);

        try {
            let swapped;
            
            if (base === 16) {
                // For hex, swap byte order
                if (value.length % 2 !== 0) {
                    this.showNotification('Hex value must have even number of digits for byte swapping', 'warning');
                    return;
                }
                
                swapped = '';
                for (let i = value.length - 2; i >= 0; i -= 2) {
                    swapped += value.substr(i, 2);
                }
            } else if (base === 2) {
                // For binary, swap bit order in bytes
                if (value.length % 8 !== 0) {
                    // Pad to byte boundary
                    const padded = value.padStart(Math.ceil(value.length / 8) * 8, '0');
                    swapped = '';
                    for (let i = padded.length - 8; i >= 0; i -= 8) {
                        swapped += padded.substr(i, 8);
                    }
                } else {
                    swapped = '';
                    for (let i = value.length - 8; i >= 0; i -= 8) {
                        swapped += value.substr(i, 8);
                    }
                }
            } else {
                this.showNotification('Endianness swap only supported for binary and hexadecimal', 'warning');
                return;
            }

            this.activeInput.value = swapped;
            this.handleBaseInput({ target: this.activeInput });
            this.showNotification('Endianness swapped!', 'success');

        } catch (error) {
            this.showNotification('Error swapping endianness: ' + error.message, 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NumberBaseConverter();
});
