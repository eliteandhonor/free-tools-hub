// Fake Data Generator Tool
class FakeDataGenerator {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializeData();
        this.generatedData = [];
        this.selectedFields = [];
    }
    
    initializeElements() {
        this.form = document.getElementById('fakeDataForm');
        this.recordCountInput = document.getElementById('recordCount');
        this.outputFormatSelect = document.getElementById('outputFormat');
        this.localeSelect = document.getElementById('locale');
        this.fieldsCheckboxes = document.getElementById('fieldsCheckboxes');
        this.resultSection = document.getElementById('resultSection');
        this.dataOutput = document.getElementById('dataOutput');
        this.copyDataBtn = document.getElementById('copyData');
        this.downloadDataBtn = document.getElementById('downloadData');
        this.regenerateDataBtn = document.getElementById('regenerateData');
    }
    
    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleGenerate(e));
        this.copyDataBtn.addEventListener('click', () => this.copyData());
        this.downloadDataBtn.addEventListener('click', () => this.downloadData());
        this.regenerateDataBtn.addEventListener('click', () => this.regenerateData());
        this.outputFormatSelect.addEventListener('change', () => this.updateOutput());
    }
    
    initializeData() {
        this.data = {
            firstNames: {
                male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'],
                female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle']
            },
            lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'],
            companies: ['TechCorp', 'GlobalSoft', 'InnovateLab', 'DataSystems', 'CloudWorks', 'NextGen Solutions', 'SmartTech', 'DigitalFlow', 'FutureSoft', 'MetaTech', 'CyberCore', 'TechNova', 'InfoTech', 'SystemPro', 'WebTech'],
            jobTitles: ['Software Engineer', 'Product Manager', 'Data Analyst', 'UX Designer', 'Marketing Manager', 'Sales Representative', 'Operations Manager', 'HR Specialist', 'Financial Analyst', 'Project Manager', 'Business Analyst', 'Quality Assurance', 'DevOps Engineer', 'Content Manager', 'Customer Success Manager'],
            domains: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com', 'test.com', 'company.com', 'business.org', 'enterprise.net', 'corporation.com'],
            streets: ['Main St', 'Oak Ave', 'Elm St', 'Park Ave', 'First St', 'Second St', 'Third St', 'Fourth St', 'Fifth St', 'Broadway', 'Washington St', 'Lincoln Ave', 'Madison St', 'Jefferson St', 'Adams St'],
            cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte'],
            states: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
            countries: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Australia', 'Japan', 'Brazil'],
            genders: ['Male', 'Female', 'Other', 'Prefer not to say']
        };
    }
    
    handleGenerate(e) {
        e.preventDefault();
        
        const recordCount = parseInt(this.recordCountInput.value);
        
        if (recordCount < 1 || recordCount > 1000) {
            this.showError('Number of records must be between 1 and 1000');
            return;
        }
        
        this.selectedFields = this.getSelectedFields();
        
        if (this.selectedFields.length === 0) {
            this.showError('Please select at least one data field');
            return;
        }
        
        this.generateData(recordCount);
    }
    
    getSelectedFields() {
        const checkboxes = this.fieldsCheckboxes.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.id);
    }
    
    generateData(count) {
        this.generatedData = [];
        
        for (let i = 0; i < count; i++) {
            const record = {};
            
            this.selectedFields.forEach(field => {
                record[field] = this.generateFieldValue(field, record);
            });
            
            this.generatedData.push(record);
        }
        
        this.displayResults();
    }
    
    generateFieldValue(field, record) {
        switch (field) {
            case 'firstName':
                const gender = Math.random() > 0.5 ? 'male' : 'female';
                return this.randomChoice(this.data.firstNames[gender]);
            
            case 'lastName':
                return this.randomChoice(this.data.lastNames);
            
            case 'fullName':
                const firstNames = [...this.data.firstNames.male, ...this.data.firstNames.female];
                return `${this.randomChoice(firstNames)} ${this.randomChoice(this.data.lastNames)}`;
            
            case 'email':
                const firstName = record.firstName || this.randomChoice([...this.data.firstNames.male, ...this.data.firstNames.female]);
                const lastName = record.lastName || this.randomChoice(this.data.lastNames);
                const domain = this.randomChoice(this.data.domains);
                return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
            
            case 'phone':
                return this.generatePhoneNumber();
            
            case 'address':
                const streetNum = Math.floor(Math.random() * 9999) + 1;
                const street = this.randomChoice(this.data.streets);
                return `${streetNum} ${street}`;
            
            case 'city':
                return this.randomChoice(this.data.cities);
            
            case 'state':
                return this.randomChoice(this.data.states);
            
            case 'zipCode':
                return this.generateZipCode();
            
            case 'country':
                return this.randomChoice(this.data.countries);
            
            case 'company':
                return this.randomChoice(this.data.companies);
            
            case 'jobTitle':
                return this.randomChoice(this.data.jobTitles);
            
            case 'dateOfBirth':
                return this.generateDateOfBirth();
            
            case 'age':
                const birthDate = new Date(this.generateDateOfBirth());
                const age = new Date().getFullYear() - birthDate.getFullYear();
                return age;
            
            case 'gender':
                return this.randomChoice(this.data.genders);
            
            case 'username':
                const user = record.firstName || this.randomChoice([...this.data.firstNames.male, ...this.data.firstNames.female]);
                const num = Math.floor(Math.random() * 999) + 1;
                return `${user.toLowerCase()}${num}`;
            
            case 'website':
                const companyName = (record.company || this.randomChoice(this.data.companies)).toLowerCase().replace(/\s+/g, '');
                const tld = this.randomChoice(['.com', '.org', '.net', '.co', '.io']);
                return `https://www.${companyName}${tld}`;
            
            case 'creditCard':
                return this.generateCreditCard();
            
            case 'uuid':
                return this.generateUUID();
            
            case 'ipAddress':
                return this.generateIPAddress();
            
            default:
                return '';
        }
    }
    
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    generatePhoneNumber() {
        const area = Math.floor(Math.random() * 900) + 100;
        const exchange = Math.floor(Math.random() * 900) + 100;
        const number = Math.floor(Math.random() * 9000) + 1000;
        return `(${area}) ${exchange}-${number}`;
    }
    
    generateZipCode() {
        return String(Math.floor(Math.random() * 90000) + 10000);
    }
    
    generateDateOfBirth() {
        const start = new Date(1950, 0, 1);
        const end = new Date(2005, 11, 31);
        const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return date.toISOString().split('T')[0];
    }
    
    generateCreditCard() {
        // Generate a fake credit card number (Luhn algorithm compliant but not real)
        const prefix = this.randomChoice(['4', '5', '3']);
        let number = prefix;
        
        for (let i = 1; i < 15; i++) {
            number += Math.floor(Math.random() * 10);
        }
        
        // Add Luhn check digit
        let sum = 0;
        for (let i = 0; i < 15; i++) {
            let digit = parseInt(number[i]);
            if (i % 2 === 0) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
        }
        
        const checkDigit = (10 - (sum % 10)) % 10;
        number += checkDigit;
        
        // Format as XXXX-XXXX-XXXX-XXXX
        return number.replace(/(.{4})/g, '$1-').slice(0, -1);
    }
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    generateIPAddress() {
        return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    }
    
    displayResults() {
        this.updateOutput();
        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    updateOutput() {
        const format = this.outputFormatSelect.value;
        
        switch (format) {
            case 'table':
                this.displayAsTable();
                break;
            case 'json':
                this.displayAsJSON();
                break;
            case 'csv':
                this.displayAsCSV();
                break;
        }
    }
    
    displayAsTable() {
        if (this.generatedData.length === 0) return;
        
        const headers = this.selectedFields.map(field => 
            field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
        );
        
        let html = '<table class="data-table"><thead><tr>';
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        this.generatedData.forEach(record => {
            html += '<tr>';
            this.selectedFields.forEach(field => {
                html += `<td>${record[field] || ''}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        this.dataOutput.innerHTML = html;
    }
    
    displayAsJSON() {
        const jsonData = JSON.stringify(this.generatedData, null, 2);
        this.dataOutput.innerHTML = `<div class="json-output">${jsonData}</div>`;
    }
    
    displayAsCSV() {
        if (this.generatedData.length === 0) return;
        
        const headers = this.selectedFields.map(field => 
            field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
        );
        
        let csv = headers.join(',') + '\n';
        
        this.generatedData.forEach(record => {
            const row = this.selectedFields.map(field => {
                const value = record[field] || '';
                // Escape commas and quotes in CSV
                return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                    ? `"${value.replace(/"/g, '""')}"` 
                    : value;
            });
            csv += row.join(',') + '\n';
        });
        
        this.dataOutput.innerHTML = `<div class="csv-output">${csv}</div>`;
    }
    
    async copyData() {
        let textToCopy = '';
        const format = this.outputFormatSelect.value;
        
        switch (format) {
            case 'json':
                textToCopy = JSON.stringify(this.generatedData, null, 2);
                break;
            case 'csv':
                textToCopy = this.generateCSVString();
                break;
            case 'table':
                textToCopy = this.generateCSVString(); // Fallback to CSV for table
                break;
        }
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            this.showSuccess('Data copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('Data copied to clipboard!');
        }
    }
    
    downloadData() {
        const format = this.outputFormatSelect.value;
        let content = '';
        let filename = '';
        let mimeType = '';
        
        switch (format) {
            case 'json':
                content = JSON.stringify(this.generatedData, null, 2);
                filename = `fake-data-${Date.now()}.json`;
                mimeType = 'application/json';
                break;
            case 'csv':
                content = this.generateCSVString();
                filename = `fake-data-${Date.now()}.csv`;
                mimeType = 'text/csv';
                break;
            case 'table':
                content = this.generateCSVString();
                filename = `fake-data-${Date.now()}.csv`;
                mimeType = 'text/csv';
                break;
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    generateCSVString() {
        if (this.generatedData.length === 0) return '';
        
        const headers = this.selectedFields.map(field => 
            field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
        );
        
        let csv = headers.join(',') + '\n';
        
        this.generatedData.forEach(record => {
            const row = this.selectedFields.map(field => {
                const value = record[field] || '';
                return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                    ? `"${value.replace(/"/g, '""')}"` 
                    : value;
            });
            csv += row.join(',') + '\n';
        });
        
        return csv;
    }
    
    regenerateData() {
        const recordCount = parseInt(this.recordCountInput.value);
        this.generateData(recordCount);
    }
    
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    showSuccess(message) {
        this.showMessage(message, 'success');
    }
    
    showMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const colors = {
            error: {
                bg: '#fef2f2',
                border: '#fecaca',
                text: '#dc2626',
                icon: 'fa-exclamation-triangle'
            },
            success: {
                bg: '#f0fdf4',
                border: '#bbf7d0',
                text: '#15803d',
                icon: 'fa-check-circle'
            }
        };
        
        const color = colors[type];
        
        // Create message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.style.cssText = `
            background: ${color.bg};
            border: 1px solid ${color.border};
            color: ${color.text};
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        messageDiv.innerHTML = `
            <i class="fas ${color.icon}"></i>
            <span>${message}</span>
        `;
        
        this.form.appendChild(messageDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
}

// Initialize the fake data generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FakeDataGenerator();
});

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarNav = document.querySelector('.navbar-nav');
    
    if (navbarToggle && navbarNav) {
        navbarToggle.addEventListener('click', function() {
            navbarNav.classList.toggle('active');
        });
    }
});
