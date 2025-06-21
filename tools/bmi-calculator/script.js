// BMI Calculator Tool - Professional Implementation (2025 accessibility refactor)
class BMICalculator {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDefaultState();
    }

    bindEvents() {
        // Get DOM elements (updated selectors for refactored HTML)
        this.weightInput = document.getElementById('weight');
        this.heightInput = document.getElementById('height-metric-input');
        this.heightFeetInput = document.getElementById('height-feet');
        this.heightInchesInput = document.getElementById('height-inches');
        this.unitMetricBtn = document.querySelector('.unit-option[data-unit="metric"]');
        this.unitImperialBtn = document.querySelector('.unit-option[data-unit="imperial"]');
        this.calculateBtn = document.getElementById('calculate-bmi');
        this.clearBtn = document.getElementById('clear-bmi');
        this.bmiResult = document.getElementById('bmi-result');
        this.bmiValue = document.getElementById('bmi-value');
        this.bmiCategory = document.getElementById('bmi-category');
        this.bmiNeedle = document.getElementById('bmi-needle');
        this.healthTips = document.getElementById('health-tips');
        this.healthRecommendations = document.getElementById('health-recommendations');
        this.weightUnitLabel = document.getElementById('weight-unit');
        this.errorContainer = document.getElementById('error-container');
        this.successContainer = document.getElementById('success-container');

        // Bind events
        if (this.calculateBtn) {
            this.calculateBtn.addEventListener('click', () => this.calculateBMI());
        }
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearAll());
        }
        if (this.unitMetricBtn) {
            this.unitMetricBtn.addEventListener('click', () => this.setUnit('metric'));
            this.unitMetricBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.setUnit('metric');
                }
            });
        }
        if (this.unitImperialBtn) {
            this.unitImperialBtn.addEventListener('click', () => this.setUnit('imperial'));
            this.unitImperialBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.setUnit('imperial');
                }
            });
        }
        // Real-time calculation on input
        [this.weightInput, this.heightInput, this.heightFeetInput, this.heightInchesInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.handleInputChange());
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.calculateBMI();
                });
            }
        });
    }

    setupDefaultState() {
        this.setUnit('metric');
        this.clearMessages();
        this.clearResults();
    }

    setUnit(unit) {
        // Toggle active class
        if (this.unitMetricBtn && this.unitImperialBtn) {
            this.unitMetricBtn.classList.toggle('active', unit === 'metric');
            this.unitImperialBtn.classList.toggle('active', unit === 'imperial');
        }
        // Show/hide input fields
        const metricFields = document.getElementById('height-metric');
        const imperialFields = document.getElementById('height-imperial');
        if (metricFields && imperialFields) {
            metricFields.style.display = unit === 'metric' ? 'flex' : 'none';
            imperialFields.style.display = unit === 'imperial' ? 'flex' : 'none';
        }
        // Update unit label
        if (this.weightUnitLabel) {
            this.weightUnitLabel.textContent = unit === 'metric' ? 'kg' : 'lbs';
        }
        // Clear results
        this.clearResults();
    }

    handleInputChange() {
        // Auto-calculate if all required fields are filled
        const weight = parseFloat(this.weightInput?.value);
        let height = 0;
        let unit = this.unitMetricBtn?.classList.contains('active') ? 'metric' : 'imperial';
        if (unit === 'metric') {
            height = parseFloat(this.heightInput?.value);
        } else {
            const feet = parseFloat(this.heightFeetInput?.value) || 0;
            const inches = parseFloat(this.heightInchesInput?.value) || 0;
            height = feet * 30.48 + inches * 2.54;
        }
        if (weight > 0 && height > 0) {
            setTimeout(() => this.calculateBMI(), 300);
        }
    }

    calculateBMI() {
        // Get input values
        const weight = parseFloat(this.weightInput?.value);
        let heightCm = 0;
        let unit = this.unitMetricBtn?.classList.contains('active') ? 'metric' : 'imperial';
        if (unit === 'metric') {
            heightCm = parseFloat(this.heightInput?.value);
        } else {
            const feet = parseFloat(this.heightFeetInput?.value) || 0;
            const inches = parseFloat(this.heightInchesInput?.value) || 0;
            heightCm = feet * 30.48 + inches * 2.54;
        }
        // Validate inputs
        if (!this.validateInputs(weight, heightCm, unit)) {
            return;
        }
        try {
            // Calculate BMI
            const heightM = heightCm / 100;
            const bmi = weight / (heightM * heightM);
            // Get BMI category and details
            const categoryInfo = this.getBMICategory(bmi);
            // Display results
            this.displayResults({
                bmi: bmi,
                category: categoryInfo
            });
            this.showSuccess('BMI calculated successfully!');
        } catch (error) {
            this.showError('Failed to calculate BMI: ' + error.message);
        }
    }

    validateInputs(weight, heightCm, unit) {
        if (!weight || weight <= 0) {
            this.showError('Please enter a valid weight');
            return false;
        }
        if (!heightCm || heightCm <= 0) {
            this.showError('Please enter a valid height');
            return false;
        }
        // Reasonable range checks
        if (unit === 'metric') {
            if (weight < 20 || weight > 300) {
                this.showError('Weight should be between 20-300 kg');
                return false;
            }
            if (heightCm < 100 || heightCm > 250) {
                this.showError('Height should be between 100-250 cm');
                return false;
            }
        } else {
            if (weight < 44 || weight > 660) {
                this.showError('Weight should be between 44-660 lbs');
                return false;
            }
            if (heightCm < 99 || heightCm > 250) {
                this.showError("Height should be between 3'3\" and 8'2\"");
                return false;
            }
        }
        return true;
    }

    getBMICategory(bmi) {
        if (bmi < 16) {
            return {
                category: 'Severely Underweight',
                class: 'severely-underweight',
                color: '#dc2626',
                description: 'Your BMI indicates you are severely underweight. This may pose health risks.',
                advice: 'Consult with a healthcare professional immediately for proper nutrition guidance.'
            };
        } else if (bmi < 18.5) {
            return {
                category: 'Underweight',
                class: 'underweight',
                color: '#ea580c',
                description: 'Your BMI indicates you are underweight.',
                advice: 'Consider consulting a nutritionist to develop a healthy weight gain plan.'
            };
        } else if (bmi < 25) {
            return {
                category: 'Normal Weight',
                class: 'normal',
                color: '#16a34a',
                description: 'Your BMI is in the healthy weight range. Great job!',
                advice: 'Maintain your current lifestyle with balanced diet and regular exercise.'
            };
        } else if (bmi < 30) {
            return {
                category: 'Overweight',
                class: 'overweight',
                color: '#d97706',
                description: 'Your BMI indicates you are overweight.',
                advice: 'Consider adopting a healthier diet and increasing physical activity.'
            };
        } else if (bmi < 35) {
            return {
                category: 'Obesity Class I',
                class: 'obese-1',
                color: '#dc2626',
                description: 'Your BMI indicates Class I obesity.',
                advice: 'Consult with a healthcare professional for a personalized weight management plan.'
            };
        } else if (bmi < 40) {
            return {
                category: 'Obesity Class II',
                class: 'obese-2',
                color: '#991b1b',
                description: 'Your BMI indicates Class II obesity.',
                advice: 'Medical consultation is strongly recommended for comprehensive weight management.'
            };
        } else {
            return {
                category: 'Obesity Class III',
                class: 'obese-3',
                color: '#7f1d1d',
                description: 'Your BMI indicates Class III (severe) obesity.',
                advice: 'Immediate medical consultation is recommended for health assessment and treatment options.'
            };
        }
    }

    displayResults(data) {
        if (!this.bmiResult) return;
        // Show results container
        this.bmiResult.classList.add('active');
        this.bmiResult.setAttribute('aria-live', 'polite');
        this.bmiResult.setAttribute('tabindex', '-1');
        this.bmiResult.focus();
        // Update BMI value
        if (this.bmiValue) {
            this.bmiValue.textContent = data.bmi.toFixed(1);
        }
        // Update category
        if (this.bmiCategory) {
            this.bmiCategory.textContent = data.category.category;
            this.bmiCategory.className = `bmi-category ${data.category.class}`;
            this.bmiCategory.style.color = data.category.color;
        }
        // Update health tips
        if (this.healthTips) {
            this.healthTips.innerHTML = `<li>${data.category.description}</li>`;
        }
        // Update health recommendations
        if (this.healthRecommendations) {
            this.healthRecommendations.innerHTML = `<div class="recommendation-title"><i class="fas fa-lightbulb"></i> Health Recommendations</div><ul class="health-tips"><li>${data.category.advice}</li></ul>`;
        }
        // Animate needle (if present)
        if (this.bmiNeedle) {
            const percent = Math.min(100, Math.max(0, ((data.bmi - 10) / 30) * 100));
            this.bmiNeedle.style.left = `${percent}%`;
        }
        // Scroll to results
        this.bmiResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    clearResults() {
        if (this.bmiResult) {
            this.bmiResult.classList.remove('active');
        }
    }

    clearAll() {
        if (this.weightInput) this.weightInput.value = '';
        if (this.heightInput) this.heightInput.value = '';
        if (this.heightFeetInput) this.heightFeetInput.value = '';
        if (this.heightInchesInput) this.heightInchesInput.value = '';
        this.clearResults();
        this.clearMessages();
    }

    showError(message) {
        this.clearMessages();
        if (this.errorContainer) {
            this.errorContainer.innerHTML = `<i class="fas fa-exclamation-triangle" aria-hidden="true"></i> <span>${message}</span>`;
            this.errorContainer.style.display = 'block';
            this.errorContainer.setAttribute('role', 'alert');
            this.errorContainer.setAttribute('aria-live', 'assertive');
            this.errorContainer.setAttribute('tabindex', '-1');
            this.errorContainer.focus();
        }
    }

    showSuccess(message) {
        this.clearMessages();
        if (this.successContainer) {
            this.successContainer.innerHTML = `<i class="fas fa-check-circle" aria-hidden="true"></i> <span>${message}</span>`;
            this.successContainer.style.display = 'block';
            this.successContainer.setAttribute('role', 'status');
            this.successContainer.setAttribute('aria-live', 'polite');
            this.successContainer.setAttribute('tabindex', '-1');
            this.successContainer.focus();
            setTimeout(() => {
                if (this.successContainer) {
                    this.successContainer.style.display = 'none';
                }
            }, 3000);
        }
    }

    clearMessages() {
        if (this.errorContainer) this.errorContainer.style.display = 'none';
        if (this.successContainer) this.successContainer.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BMICalculator();
});

// Analytics tracking
if (typeof gtag === 'function') {
    gtag('event', 'tool_usage', {
        'event_category': 'Calculator Tools',
        'event_label': 'BMI Calculator'
    });
}
