// Percentage Calculator Tool - Professional Implementation
class PercentageCalculator {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDefaultState();
    }

    bindEvents() {
        // Calculator type tabs
        this.calculatorTabs = document.querySelectorAll('.calculator-tab');
        this.calculatorPanels = document.querySelectorAll('.calculator-panel');
        
        // Bind tab events
        this.calculatorTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchCalculator(tab));
        });

        // Bind all calculator events
        this.setupBasicPercentageCalculator();
        this.setupPercentageOfCalculator();
        this.setupPercentageChangeCalculator();
        this.setupPercentageDiscountCalculator();
        this.setupPercentageTipCalculator();
        this.setupPercentageIncrease();
        
        // Global clear button
        const globalClearBtn = document.getElementById('global-clear-btn');
        if (globalClearBtn) {
            globalClearBtn.addEventListener('click', () => this.clearAll());
        }
    }

    setupDefaultState() {
        this.clearMessages();
        this.switchCalculator(this.calculatorTabs[0]); // Activate first tab
    }

    switchCalculator(activeTab) {
        // Update tabs
        this.calculatorTabs.forEach(tab => tab.classList.remove('active'));
        activeTab.classList.add('active');

        // Update panels
        const targetPanel = activeTab.dataset.calculator;
        this.calculatorPanels.forEach(panel => {
            panel.style.display = panel.id === targetPanel ? 'block' : 'none';
        });

        // Clear previous results
        this.clearMessages();
    }

    // Basic Percentage Calculator (X% of Y)
    setupBasicPercentageCalculator() {
        const percentageInput = document.getElementById('basic-percentage');
        const numberInput = document.getElementById('basic-number');
        const calculateBtn = document.getElementById('basic-calculate-btn');
        const clearBtn = document.getElementById('basic-clear-btn');
        const resultElement = document.getElementById('basic-result');

        const calculate = () => {
            const percentage = parseFloat(percentageInput?.value);
            const number = parseFloat(numberInput?.value);

            if (!this.validateInputs([percentage, number], 'percentage and number')) return;

            const result = (percentage / 100) * number;
            const formatted = this.formatNumber(result);
            
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="result-main">${formatted}</div>
                    <div class="result-formula">${percentage}% of ${this.formatNumber(number)} = ${formatted}</div>
                `;
                resultElement.style.display = 'block';
            }

            this.showSuccess('Percentage calculated successfully!');
        };

        // Auto-calculate on input
        [percentageInput, numberInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    if (percentageInput?.value && numberInput?.value) {
                        calculate();
                    }
                });
            }
        });

        if (calculateBtn) calculateBtn.addEventListener('click', calculate);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (percentageInput) percentageInput.value = '';
                if (numberInput) numberInput.value = '';
                if (resultElement) resultElement.style.display = 'none';
                this.clearMessages();
            });
        }
    }

    // Percentage Of Calculator (X is what % of Y)
    setupPercentageOfCalculator() {
        const numberInput = document.getElementById('of-number');
        const totalInput = document.getElementById('of-total');
        const calculateBtn = document.getElementById('of-calculate-btn');
        const clearBtn = document.getElementById('of-clear-btn');
        const resultElement = document.getElementById('of-result');

        const calculate = () => {
            const number = parseFloat(numberInput?.value);
            const total = parseFloat(totalInput?.value);

            if (!this.validateInputs([number, total], 'both numbers')) return;
            if (total === 0) {
                this.showError('Total cannot be zero');
                return;
            }

            const percentage = (number / total) * 100;
            const formatted = this.formatNumber(percentage, 2);
            
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="result-main">${formatted}%</div>
                    <div class="result-formula">${this.formatNumber(number)} is ${formatted}% of ${this.formatNumber(total)}</div>
                `;
                resultElement.style.display = 'block';
            }

            this.showSuccess('Percentage calculated successfully!');
        };

        // Auto-calculate on input
        [numberInput, totalInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    if (numberInput?.value && totalInput?.value) {
                        calculate();
                    }
                });
            }
        });

        if (calculateBtn) calculateBtn.addEventListener('click', calculate);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (numberInput) numberInput.value = '';
                if (totalInput) totalInput.value = '';
                if (resultElement) resultElement.style.display = 'none';
                this.clearMessages();
            });
        }
    }

    // Percentage Change Calculator
    setupPercentageChangeCalculator() {
        const oldValueInput = document.getElementById('change-old-value');
        const newValueInput = document.getElementById('change-new-value');
        const calculateBtn = document.getElementById('change-calculate-btn');
        const clearBtn = document.getElementById('change-clear-btn');
        const resultElement = document.getElementById('change-result');

        const calculate = () => {
            const oldValue = parseFloat(oldValueInput?.value);
            const newValue = parseFloat(newValueInput?.value);

            if (!this.validateInputs([oldValue, newValue], 'both values')) return;
            if (oldValue === 0) {
                this.showError('Original value cannot be zero');
                return;
            }

            const change = newValue - oldValue;
            const percentageChange = (change / Math.abs(oldValue)) * 100;
            const isIncrease = percentageChange > 0;
            const changeType = isIncrease ? 'increase' : 'decrease';
            const formattedChange = this.formatNumber(Math.abs(percentageChange), 2);
            
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="result-main ${isIncrease ? 'positive' : 'negative'}">
                        ${formattedChange}% ${changeType}
                    </div>
                    <div class="result-formula">
                        From ${this.formatNumber(oldValue)} to ${this.formatNumber(newValue)}
                        <br>Change: ${isIncrease ? '+' : ''}${this.formatNumber(change)}
                    </div>
                `;
                resultElement.style.display = 'block';
            }

            this.showSuccess('Percentage change calculated successfully!');
        };

        // Auto-calculate on input
        [oldValueInput, newValueInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    if (oldValueInput?.value && newValueInput?.value) {
                        calculate();
                    }
                });
            }
        });

        if (calculateBtn) calculateBtn.addEventListener('click', calculate);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (oldValueInput) oldValueInput.value = '';
                if (newValueInput) newValueInput.value = '';
                if (resultElement) resultElement.style.display = 'none';
                this.clearMessages();
            });
        }
    }

    // Discount Calculator
    setupPercentageDiscountCalculator() {
        const originalPriceInput = document.getElementById('discount-original-price');
        const discountPercentInput = document.getElementById('discount-percent');
        const calculateBtn = document.getElementById('discount-calculate-btn');
        const clearBtn = document.getElementById('discount-clear-btn');
        const resultElement = document.getElementById('discount-result');

        const calculate = () => {
            const originalPrice = parseFloat(originalPriceInput?.value);
            const discountPercent = parseFloat(discountPercentInput?.value);

            if (!this.validateInputs([originalPrice, discountPercent], 'original price and discount percentage')) return;

            const discountAmount = (discountPercent / 100) * originalPrice;
            const finalPrice = originalPrice - discountAmount;
            
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="discount-breakdown">
                        <div class="result-row">
                            <span>Original Price:</span>
                            <span class="amount">$${this.formatNumber(originalPrice, 2)}</span>
                        </div>
                        <div class="result-row discount">
                            <span>Discount (${discountPercent}%):</span>
                            <span class="amount">-$${this.formatNumber(discountAmount, 2)}</span>
                        </div>
                        <div class="result-row final">
                            <span>Final Price:</span>
                            <span class="amount">$${this.formatNumber(finalPrice, 2)}</span>
                        </div>
                        <div class="savings-info">
                            You save $${this.formatNumber(discountAmount, 2)}!
                        </div>
                    </div>
                `;
                resultElement.style.display = 'block';
            }

            this.showSuccess('Discount calculated successfully!');
        };

        // Auto-calculate on input
        [originalPriceInput, discountPercentInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    if (originalPriceInput?.value && discountPercentInput?.value) {
                        calculate();
                    }
                });
            }
        });

        if (calculateBtn) calculateBtn.addEventListener('click', calculate);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (originalPriceInput) originalPriceInput.value = '';
                if (discountPercentInput) discountPercentInput.value = '';
                if (resultElement) resultElement.style.display = 'none';
                this.clearMessages();
            });
        }
    }

    // Tip Calculator
    setupPercentageTipCalculator() {
        const billAmountInput = document.getElementById('tip-bill-amount');
        const tipPercentInput = document.getElementById('tip-percent');
        const peopleCountInput = document.getElementById('tip-people-count');
        const calculateBtn = document.getElementById('tip-calculate-btn');
        const clearBtn = document.getElementById('tip-clear-btn');
        const resultElement = document.getElementById('tip-result');

        const calculate = () => {
            const billAmount = parseFloat(billAmountInput?.value);
            const tipPercent = parseFloat(tipPercentInput?.value);
            const peopleCount = parseInt(peopleCountInput?.value) || 1;

            if (!this.validateInputs([billAmount, tipPercent], 'bill amount and tip percentage')) return;
            if (peopleCount < 1) {
                this.showError('Number of people must be at least 1');
                return;
            }

            const tipAmount = (tipPercent / 100) * billAmount;
            const totalAmount = billAmount + tipAmount;
            const perPersonBill = billAmount / peopleCount;
            const perPersonTip = tipAmount / peopleCount;
            const perPersonTotal = totalAmount / peopleCount;
            
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="tip-breakdown">
                        <div class="result-section">
                            <h4>Total Bill</h4>
                            <div class="result-row">
                                <span>Subtotal:</span>
                                <span class="amount">$${this.formatNumber(billAmount, 2)}</span>
                            </div>
                            <div class="result-row">
                                <span>Tip (${tipPercent}%):</span>
                                <span class="amount">$${this.formatNumber(tipAmount, 2)}</span>
                            </div>
                            <div class="result-row final">
                                <span>Total:</span>
                                <span class="amount">$${this.formatNumber(totalAmount, 2)}</span>
                            </div>
                        </div>
                        ${peopleCount > 1 ? `
                        <div class="result-section">
                            <h4>Per Person (${peopleCount} people)</h4>
                            <div class="result-row">
                                <span>Bill per person:</span>
                                <span class="amount">$${this.formatNumber(perPersonBill, 2)}</span>
                            </div>
                            <div class="result-row">
                                <span>Tip per person:</span>
                                <span class="amount">$${this.formatNumber(perPersonTip, 2)}</span>
                            </div>
                            <div class="result-row final">
                                <span>Total per person:</span>
                                <span class="amount">$${this.formatNumber(perPersonTotal, 2)}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                `;
                resultElement.style.display = 'block';
            }

            this.showSuccess('Tip calculated successfully!');
        };

        // Auto-calculate on input
        [billAmountInput, tipPercentInput, peopleCountInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    if (billAmountInput?.value && tipPercentInput?.value) {
                        calculate();
                    }
                });
            }
        });

        if (calculateBtn) calculateBtn.addEventListener('click', calculate);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (billAmountInput) billAmountInput.value = '';
                if (tipPercentInput) tipPercentInput.value = '';
                if (peopleCountInput) peopleCountInput.value = '1';
                if (resultElement) resultElement.style.display = 'none';
                this.clearMessages();
            });
        }
    }

    // Percentage Increase Calculator
    setupPercentageIncrease() {
        const originalValueInput = document.getElementById('increase-original-value');
        const increasePercentInput = document.getElementById('increase-percent');
        const calculateBtn = document.getElementById('increase-calculate-btn');
        const clearBtn = document.getElementById('increase-clear-btn');
        const resultElement = document.getElementById('increase-result');

        const calculate = () => {
            const originalValue = parseFloat(originalValueInput?.value);
            const increasePercent = parseFloat(increasePercentInput?.value);

            if (!this.validateInputs([originalValue, increasePercent], 'original value and increase percentage')) return;

            const increaseAmount = (increasePercent / 100) * originalValue;
            const newValue = originalValue + increaseAmount;
            
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="result-main">${this.formatNumber(newValue)}</div>
                    <div class="result-formula">
                        ${this.formatNumber(originalValue)} + ${increasePercent}% = ${this.formatNumber(newValue)}
                        <br>Increase amount: +${this.formatNumber(increaseAmount)}
                    </div>
                `;
                resultElement.style.display = 'block';
            }

            this.showSuccess('Percentage increase calculated successfully!');
        };

        // Auto-calculate on input
        [originalValueInput, increasePercentInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    if (originalValueInput?.value && increasePercentInput?.value) {
                        calculate();
                    }
                });
            }
        });

        if (calculateBtn) calculateBtn.addEventListener('click', calculate);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (originalValueInput) originalValueInput.value = '';
                if (increasePercentInput) increasePercentInput.value = '';
                if (resultElement) resultElement.style.display = 'none';
                this.clearMessages();
            });
        }
    }

    validateInputs(values, fieldNames) {
        for (let value of values) {
            if (isNaN(value) || value === null || value === undefined) {
                this.showError(`Please enter valid ${fieldNames}`);
                return false;
            }
        }
        return true;
    }

    formatNumber(number, decimals = null) {
        if (decimals !== null) {
            return number.toFixed(decimals);
        }
        
        // Auto-format: show decimals only if needed
        if (number % 1 === 0) {
            return number.toLocaleString();
        } else {
            return number.toFixed(2);
        }
    }

    clearAll() {
        // Clear all inputs in all panels
        const allInputs = document.querySelectorAll('.calculator-panel input');
        allInputs.forEach(input => {
            if (input.type === 'number' || input.type === 'text') {
                input.value = input.id === 'tip-people-count' ? '1' : '';
            }
        });

        // Hide all results
        const allResults = document.querySelectorAll('[id$="-result"]');
        allResults.forEach(result => {
            result.style.display = 'none';
        });

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
    new PercentageCalculator();
});

// Analytics tracking
if (typeof gtag === 'function') {
    gtag('event', 'tool_usage', {
        'event_category': 'Calculator Tools',
        'event_label': 'Percentage Calculator'
    });
}
