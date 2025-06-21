// Email Address Generator Tool
class EmailGenerator {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializeData();
        this.generatedEmails = [];
    }
    
    initializeElements() {
        this.form = document.getElementById('emailGeneratorForm');
        this.emailCountInput = document.getElementById('emailCount');
        this.emailFormatSelect = document.getElementById('emailFormat');
        this.domainTypeSelect = document.getElementById('domainType');
        this.customDomainInput = document.getElementById('customDomainInput');
        this.customDomainField = document.getElementById('customDomain');
        this.includeDotsCheck = document.getElementById('includeDots');
        this.includeNumbersCheck = document.getElementById('includeNumbers');
        this.includeUnderscoreCheck = document.getElementById('includeUnderscore');
        this.includePlusCheck = document.getElementById('includePlus');
        this.lowercaseCheck = document.getElementById('lowercase');
        this.noDuplicatesCheck = document.getElementById('noDuplicates');
        this.resultSection = document.getElementById('resultSection');
        this.emailsGrid = document.getElementById('emailsGrid');
        this.copyAllBtn = document.getElementById('copyAllEmails');
        this.downloadBtn = document.getElementById('downloadEmails');
        this.regenerateBtn = document.getElementById('regenerateEmails');
    }
    
    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleGenerate(e));
        this.domainTypeSelect.addEventListener('change', () => this.handleDomainTypeChange());
        this.copyAllBtn.addEventListener('click', () => this.copyAllEmails());
        this.downloadBtn.addEventListener('click', () => this.downloadEmails());
        this.regenerateBtn.addEventListener('click', () => this.regenerateEmails());
    }
    
    initializeData() {
        this.domains = {
            popular: [
                'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
                'icloud.com', 'live.com', 'msn.com', 'protonmail.com', 'yandex.com',
                'mail.com', 'zoho.com', 'fastmail.com', 'gmx.com', 'tutanota.com'
            ],
            business: [
                'company.com', 'business.org', 'enterprise.net', 'corporation.com',
                'group.com', 'solutions.com', 'services.net', 'consulting.com',
                'tech.io', 'digital.co', 'systems.org', 'networks.com',
                'cloud.co', 'data.com', 'innovation.io'
            ],
            temporary: [
                '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
                'throwaway.email', 'temp-mail.org', 'getnada.com', 'maildrop.cc',
                'disposablemail.com', 'fakemail.net', 'tempinbox.com', 'mohmal.com',
                'sharklasers.com', 'trashmail.com', 'mailnesia.com'
            ],
            educational: [
                'university.edu', 'college.edu', 'school.edu', 'academy.edu',
                'institute.edu', 'campus.edu', 'student.edu', 'alumni.edu',
                'faculty.edu', 'research.edu'
            ]
        };
        
        this.firstNames = [
            'james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'joseph',
            'thomas', 'charles', 'christopher', 'daniel', 'matthew', 'anthony', 'mark',
            'donald', 'steven', 'paul', 'andrew', 'joshua', 'mary', 'patricia', 'jennifer',
            'linda', 'elizabeth', 'barbara', 'susan', 'jessica', 'sarah', 'karen',
            'nancy', 'lisa', 'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth',
            'sharon', 'michelle', 'laura', 'emily', 'kimberly', 'deborah', 'dorothy'
        ];
        
        this.lastNames = [
            'smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller',
            'davis', 'rodriguez', 'martinez', 'hernandez', 'lopez', 'gonzalez',
            'wilson', 'anderson', 'thomas', 'taylor', 'moore', 'jackson', 'martin',
            'lee', 'perez', 'thompson', 'white', 'harris', 'sanchez', 'clark',
            'ramirez', 'lewis', 'robinson', 'walker', 'young', 'allen', 'king',
            'wright', 'scott', 'torres', 'nguyen', 'hill', 'flores', 'green',
            'adams', 'nelson', 'baker', 'hall', 'rivera', 'campbell', 'mitchell'
        ];
        
        this.usernamePrefixes = [
            'user', 'admin', 'test', 'demo', 'guest', 'member', 'account',
            'profile', 'person', 'client', 'customer', 'visitor', 'player',
            'owner', 'manager', 'leader', 'expert', 'master', 'pro', 'super'
        ];
        
        this.businessTitles = [
            'director', 'manager', 'admin', 'sales', 'support', 'info', 'contact',
            'hello', 'team', 'staff', 'office', 'hr', 'finance', 'marketing',
            'tech', 'dev', 'design', 'operations', 'customer', 'service'
        ];
        
        this.randomWords = [
            'alpha', 'beta', 'gamma', 'delta', 'echo', 'foxtrot', 'golf',
            'hotel', 'india', 'juliet', 'kilo', 'lima', 'mike', 'november',
            'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango', 'uniform',
            'victor', 'whiskey', 'xray', 'yankee', 'zulu', 'zero', 'one',
            'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'
        ];
    }
    
    handleDomainTypeChange() {
        const domainType = this.domainTypeSelect.value;
        
        if (domainType === 'custom') {
            this.customDomainInput.classList.add('show');
            this.customDomainField.required = true;
        } else {
            this.customDomainInput.classList.remove('show');
            this.customDomainField.required = false;
        }
    }
    
    handleGenerate(e) {
        e.preventDefault();
        
        const count = parseInt(this.emailCountInput.value);
        
        if (count < 1 || count > 100) {
            this.showError('Number of emails must be between 1 and 100');
            return;
        }
        
        if (this.domainTypeSelect.value === 'custom' && !this.customDomainField.value.trim()) {
            this.showError('Please enter a custom domain');
            return;
        }
        
        this.generateEmails(count);
    }
    
    generateEmails(count) {
        this.generatedEmails = [];
        const noDuplicates = this.noDuplicatesCheck.checked;
        const usedEmails = new Set();
        
        let attempts = 0;
        const maxAttempts = count * 10; // Prevent infinite loops
        
        while (this.generatedEmails.length < count && attempts < maxAttempts) {
            const email = this.generateSingleEmail();
            
            if (!noDuplicates || !usedEmails.has(email)) {
                this.generatedEmails.push(email);
                usedEmails.add(email);
            }
            
            attempts++;
        }
        
        this.displayEmails();
    }
    
    generateSingleEmail() {
        const format = this.emailFormatSelect.value;
        const domain = this.getRandomDomain();
        
        let username = '';
        
        switch (format) {
            case 'realistic':
                username = this.generateRealisticUsername();
                break;
            case 'random':
                username = this.generateRandomUsername();
                break;
            case 'username':
                username = this.generateUsernameStyle();
                break;
            case 'business':
                username = this.generateBusinessUsername();
                break;
        }
        
        username = this.applyOptions(username);
        
        return `${username}@${domain}`;
    }
    
    generateRealisticUsername() {
        const firstName = this.randomChoice(this.firstNames);
        const lastName = this.randomChoice(this.lastNames);
        
        const patterns = [
            () => `${firstName}.${lastName}`,
            () => `${firstName}${lastName}`,
            () => `${firstName}_${lastName}`,
            () => `${firstName}${lastName[0]}`,
            () => `${firstName[0]}${lastName}`,
            () => `${firstName}${this.randomNumber(10, 99)}`
        ];
        
        return this.randomChoice(patterns)();
    }
    
    generateRandomUsername() {
        const length = this.randomNumber(6, 12);
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let username = '';
        
        for (let i = 0; i < length; i++) {
            username += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return username;
    }
    
    generateUsernameStyle() {
        const prefix = this.randomChoice(this.usernamePrefixes);
        const word = this.randomChoice(this.randomWords);
        const number = this.randomNumber(1, 999);
        
        const patterns = [
            () => `${prefix}${word}`,
            () => `${prefix}${number}`,
            () => `${word}${number}`,
            () => `${prefix}${word}${number}`,
            () => `${word}_${number}`,
            () => `${prefix}_${word}`
        ];
        
        return this.randomChoice(patterns)();
    }
    
    generateBusinessUsername() {
        const title = this.randomChoice(this.businessTitles);
        const department = this.randomChoice(['sales', 'support', 'admin', 'info', 'contact']);
        const number = this.randomNumber(1, 99);
        
        const patterns = [
            () => title,
            () => `${title}${number}`,
            () => `${department}`,
            () => `${department}${number}`,
            () => `${title}.${department}`,
            () => `${title}_${department}`
        ];
        
        return this.randomChoice(patterns)();
    }
    
    getRandomDomain() {
        const domainType = this.domainTypeSelect.value;
        
        if (domainType === 'custom') {
            let domain = this.customDomainField.value.trim();
            // Remove http:// or https:// if present
            domain = domain.replace(/^https?:\/\//, '');
            // Remove www. if present
            domain = domain.replace(/^www\./, '');
            return domain;
        }
        
        const domainsArray = this.domains[domainType] || this.domains.popular;
        return this.randomChoice(domainsArray);
    }
    
    applyOptions(username) {
        // Apply dots
        if (this.includeDotsCheck.checked && !username.includes('.') && Math.random() < 0.3) {
            const insertPos = Math.floor(Math.random() * (username.length - 1)) + 1;
            username = username.slice(0, insertPos) + '.' + username.slice(insertPos);
        }
        
        // Apply numbers
        if (this.includeNumbersCheck.checked && Math.random() < 0.4) {
            const number = this.randomNumber(1, 999);
            username += number;
        }
        
        // Apply underscores
        if (this.includeUnderscoreCheck.checked && !username.includes('_') && Math.random() < 0.2) {
            const insertPos = Math.floor(Math.random() * (username.length - 1)) + 1;
            username = username.slice(0, insertPos) + '_' + username.slice(insertPos);
        }
        
        // Apply plus signs
        if (this.includePlusCheck.checked && Math.random() < 0.1) {
            const suffix = this.randomChoice(['tag', 'work', 'personal', 'test', 'temp']);
            username += `+${suffix}`;
        }
        
        // Apply lowercase
        if (this.lowercaseCheck.checked) {
            username = username.toLowerCase();
        }
        
        return username;
    }
    
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    displayEmails() {
        this.emailsGrid.innerHTML = '';
        
        this.generatedEmails.forEach((email, index) => {
            const emailItem = document.createElement('div');
            emailItem.className = 'email-item';
            emailItem.innerHTML = `
                <div class="email-text">${email}</div>
                <div class="email-actions">
                    <button class="email-btn" onclick="emailGenerator.copyEmail('${email}', this)">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            `;
            
            emailItem.addEventListener('click', (e) => {
                if (!e.target.closest('.email-actions')) {
                    this.copyEmail(email, emailItem);
                }
            });
            
            this.emailsGrid.appendChild(emailItem);
        });
        
        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    async copyEmail(email, element) {
        try {
            await navigator.clipboard.writeText(email);
            
            // Visual feedback
            if (element.classList.contains('email-item')) {
                element.classList.add('copied');
                setTimeout(() => element.classList.remove('copied'), 2000);
            } else {
                // Button feedback
                const originalText = element.innerHTML;
                element.innerHTML = '<i class="fas fa-check"></i>';
                element.classList.add('success');
                setTimeout(() => {
                    element.innerHTML = originalText;
                    element.classList.remove('success');
                }, 2000);
            }
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = email;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // Show feedback
            if (element.classList.contains('email-item')) {
                element.classList.add('copied');
                setTimeout(() => element.classList.remove('copied'), 2000);
            }
        }
    }
    
    async copyAllEmails() {
        const emailsList = this.generatedEmails.join('\n');
        
        try {
            await navigator.clipboard.writeText(emailsList);
            this.showSuccess('All email addresses copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = emailsList;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('All email addresses copied to clipboard!');
        }
    }
    
    downloadEmails() {
        const emailsList = this.generatedEmails.join('\n');
        
        const blob = new Blob([emailsList], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `generated-emails-${Date.now()}.txt`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    regenerateEmails() {
        const count = parseInt(this.emailCountInput.value);
        this.generateEmails(count);
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

// Global reference for inline event handlers
let emailGenerator;

// Initialize the email generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    emailGenerator = new EmailGenerator();
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
