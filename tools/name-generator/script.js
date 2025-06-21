// Random Name Generator Tool
class NameGenerator {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializeNameData();
        this.generatedNames = [];
        this.currentType = 'person';
    }
    
    initializeElements() {
        this.form = document.getElementById('nameGeneratorForm');
        this.nameTypes = document.getElementById('nameTypes');
        this.nameCountInput = document.getElementById('nameCount');
        this.resultSection = document.getElementById('resultSection');
        this.namesGrid = document.getElementById('namesGrid');
        this.copyAllBtn = document.getElementById('copyAllNames');
        this.downloadBtn = document.getElementById('downloadNames');
        this.regenerateBtn = document.getElementById('regenerateNames');
        
        // Option containers
        this.personOptions = document.getElementById('personOptions');
        this.businessOptions = document.getElementById('businessOptions');
        this.fantasyOptions = document.getElementById('fantasyOptions');
        this.usernameOptions = document.getElementById('usernameOptions');
        
        // Form controls
        this.genderSelect = document.getElementById('gender');
        this.cultureSelect = document.getElementById('culture');
        this.businessTypeSelect = document.getElementById('businessType');
        this.fantasyTypeSelect = document.getElementById('fantasyType');
        this.fantasyGenderSelect = document.getElementById('fantasyGender');
        this.usernameStyleSelect = document.getElementById('usernameStyle');
        this.includeNumbersSelect = document.getElementById('includeNumbers');
    }
    
    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleGenerate(e));
        this.nameTypes.addEventListener('click', (e) => this.handleTypeChange(e));
        this.copyAllBtn.addEventListener('click', () => this.copyAllNames());
        this.downloadBtn.addEventListener('click', () => this.downloadNames());
        this.regenerateBtn.addEventListener('click', () => this.regenerateNames());
    }
    
    initializeNameData() {
        this.nameData = {
            american: {
                male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan'],
                female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura', 'Sarah', 'Kimberly', 'Deborah', 'Dorothy', 'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen'],
                last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson']
            },
            british: {
                male: ['Oliver', 'George', 'Harry', 'Jack', 'Jacob', 'Noah', 'Charlie', 'Muhammad', 'Thomas', 'Oscar', 'William', 'James', 'Henry', 'Leo', 'Alfie', 'Joshua', 'Freddie', 'Ethan', 'Archie', 'Isaac'],
                female: ['Olivia', 'Amelia', 'Isla', 'Ava', 'Mia', 'Isabella', 'Sophia', 'Grace', 'Lily', 'Freya', 'Emily', 'Ivy', 'Ella', 'Rosie', 'Evie', 'Florence', 'Poppy', 'Charlotte', 'Willow', 'Evelyn'],
                last: ['Smith', 'Jones', 'Taylor', 'Williams', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts', 'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson', 'White', 'Watson', 'Jackson', 'Wright']
            },
            spanish: {
                male: ['Alejandro', 'Diego', 'Carlos', 'Miguel', 'Antonio', 'José', 'Manuel', 'Francisco', 'Rafael', 'Fernando', 'Luis', 'Pablo', 'Jorge', 'Andrés', 'Ricardo', 'Gabriel', 'Eduardo', 'Sergio', 'Javier', 'Roberto'],
                female: ['María', 'Carmen', 'Josefa', 'Isabel', 'Ana', 'Dolores', 'Pilar', 'Teresa', 'Rosa', 'Francisca', 'Antonia', 'Cristina', 'Marta', 'Elena', 'Laura', 'Lucía', 'Paula', 'Sara', 'Andrea', 'Claudia'],
                last: ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez']
            },
            japanese: {
                male: ['Hiroshi', 'Takeshi', 'Satoshi', 'Kenji', 'Yuki', 'Taro', 'Akira', 'Makoto', 'Kazuki', 'Ryota', 'Daiki', 'Shota', 'Kento', 'Yuta', 'Haruto', 'Ren', 'Sota', 'Kaito', 'Riku', 'Yamato'],
                female: ['Yuki', 'Akiko', 'Keiko', 'Yoko', 'Hiroko', 'Tomoko', 'Sachiko', 'Mayumi', 'Naoko', 'Yukiko', 'Sakura', 'Yui', 'Hana', 'Emi', 'Rina', 'Miyu', 'Mio', 'Riko', 'Mei', 'Aoi'],
                last: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato', 'Yoshida', 'Yamada', 'Sasaki', 'Yamaguchi', 'Matsumoto', 'Inoue', 'Kimura', 'Hayashi', 'Shimizu', 'Yamazaki']
            }
        };
        
        this.businessPrefixes = {
            tech: ['Tech', 'Digital', 'Cyber', 'Data', 'Cloud', 'Smart', 'Quantum', 'Neural', 'AI', 'Byte'],
            consulting: ['Prime', 'Elite', 'Strategic', 'Global', 'Summit', 'Apex', 'Core', 'Vision', 'Expert', 'Pro'],
            creative: ['Studio', 'Design', 'Creative', 'Pixel', 'Ink', 'Canvas', 'Brush', 'Color', 'Art', 'Visual'],
            retail: ['Metro', 'Urban', 'Style', 'Trend', 'Fashion', 'Chic', 'Modern', 'Classic', 'Luxe', 'Elite'],
            restaurant: ['Tasty', 'Fresh', 'Golden', 'Garden', 'Spice', 'Flavor', 'Kitchen', 'Grill', 'Bistro', 'Cafe']
        };
        
        this.businessSuffixes = {
            tech: ['Systems', 'Solutions', 'Labs', 'Works', 'Tech', 'Soft', 'Dynamics', 'Innovations', 'Technologies', 'Digital'],
            consulting: ['Consulting', 'Advisory', 'Partners', 'Group', 'Associates', 'Solutions', 'Strategies', 'Services', 'Advisors', 'Firm'],
            creative: ['Studios', 'Designs', 'Creative', 'Agency', 'Arts', 'Works', 'Media', 'Graphics', 'Productions', 'House'],
            retail: ['Store', 'Shop', 'Boutique', 'Market', 'Emporium', 'Gallery', 'Collection', 'Fashion', 'Style', 'Trends'],
            restaurant: ['Kitchen', 'Grill', 'Bistro', 'Cafe', 'House', 'Table', 'Corner', 'Place', 'Restaurant', 'Eatery']
        };
        
        this.fantasyNames = {
            medieval: {
                male: ['Aldric', 'Gareth', 'Theron', 'Cedric', 'Edmund', 'Roderick', 'Percival', 'Tristan', 'Baldwin', 'Godwin'],
                female: ['Isolde', 'Gweneth', 'Morgana', 'Rowena', 'Evangeline', 'Cordelia', 'Guinevere', 'Rosamund', 'Beatrice', 'Vivienne']
            },
            elven: {
                male: ['Aelindra', 'Thranduil', 'Legolas', 'Elrond', 'Celeborn', 'Gil-galad', 'Glorfindel', 'Erestor', 'Lindir', 'Elladan'],
                female: ['Arwen', 'Galadriel', 'Tauriel', 'Nimrodel', 'Elaria', 'Celebrian', 'Idril', 'Luthien', 'Elenwë', 'Aredhel']
            },
            dwarven: {
                male: ['Thorin', 'Gimli', 'Balin', 'Dwalin', 'Gloin', 'Oin', 'Bombur', 'Bofur', 'Bifur', 'Dain'],
                female: ['Disa', 'Nala', 'Vera', 'Hilda', 'Magna', 'Freya', 'Sigrid', 'Astrid', 'Thora', 'Brenna']
            }
        };
        
        this.usernameWords = {
            casual: ['cool', 'awesome', 'super', 'mega', 'ultra', 'best', 'top', 'star', 'pro', 'max'],
            gamer: ['shadow', 'dark', 'fire', 'ice', 'storm', 'ninja', 'dragon', 'wolf', 'phoenix', 'blade'],
            professional: ['admin', 'expert', 'master', 'chief', 'lead', 'senior', 'prime', 'elite', 'ace', 'guru'],
            creative: ['artist', 'maker', 'creator', 'designer', 'builder', 'crafter', 'dreamer', 'vision', 'spark', 'muse']
        };
    }
    
    handleTypeChange(e) {
        const typeCard = e.target.closest('.name-type-card');
        if (!typeCard) return;
        
        // Update active state
        document.querySelectorAll('.name-type-card').forEach(card => card.classList.remove('active'));
        typeCard.classList.add('active');
        
        // Update current type
        this.currentType = typeCard.dataset.type;
        
        // Show/hide options
        this.showOptionsForType(this.currentType);
    }
    
    showOptionsForType(type) {
        // Hide all options
        this.personOptions.style.display = 'none';
        this.businessOptions.style.display = 'none';
        this.fantasyOptions.style.display = 'none';
        this.usernameOptions.style.display = 'none';
        
        // Show relevant options
        switch (type) {
            case 'person':
                this.personOptions.style.display = 'block';
                break;
            case 'business':
                this.businessOptions.style.display = 'block';
                break;
            case 'fantasy':
                this.fantasyOptions.style.display = 'block';
                break;
            case 'username':
                this.usernameOptions.style.display = 'block';
                break;
        }
    }
    
    handleGenerate(e) {
        e.preventDefault();
        
        const count = parseInt(this.nameCountInput.value);
        
        if (count < 1 || count > 50) {
            this.showError('Number of names must be between 1 and 50');
            return;
        }
        
        this.generateNames(count);
    }
    
    generateNames(count) {
        this.generatedNames = [];
        
        for (let i = 0; i < count; i++) {
            let name = '';
            let meta = '';
            
            switch (this.currentType) {
                case 'person':
                    const personResult = this.generatePersonName();
                    name = personResult.name;
                    meta = personResult.meta;
                    break;
                case 'business':
                    name = this.generateBusinessName();
                    meta = 'Business Name';
                    break;
                case 'fantasy':
                    const fantasyResult = this.generateFantasyName();
                    name = fantasyResult.name;
                    meta = fantasyResult.meta;
                    break;
                case 'username':
                    name = this.generateUsername();
                    meta = 'Username';
                    break;
            }
            
            this.generatedNames.push({ name, meta });
        }
        
        this.displayNames();
    }
    
    generatePersonName() {
        const culture = this.cultureSelect.value;
        const gender = this.genderSelect.value;
        
        const cultureData = this.nameData[culture] || this.nameData.american;
        
        let firstName = '';
        let selectedGender = gender;
        
        if (gender === 'any') {
            selectedGender = Math.random() > 0.5 ? 'male' : 'female';
        }
        
        firstName = this.randomChoice(cultureData[selectedGender]);
        const lastName = this.randomChoice(cultureData.last);
        
        return {
            name: `${firstName} ${lastName}`,
            meta: `${selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)} • ${culture.charAt(0).toUpperCase() + culture.slice(1)}`
        };
    }
    
    generateBusinessName() {
        const businessType = this.businessTypeSelect.value;
        const prefixes = this.businessPrefixes[businessType] || this.businessPrefixes.tech;
        const suffixes = this.businessSuffixes[businessType] || this.businessSuffixes.tech;
        
        const prefix = this.randomChoice(prefixes);
        const suffix = this.randomChoice(suffixes);
        
        return `${prefix} ${suffix}`;
    }
    
    generateFantasyName() {
        const fantasyType = this.fantasyTypeSelect.value;
        const gender = this.fantasyGenderSelect.value;
        
        if (fantasyType === 'place') {
            const prefixes = ['Eld', 'Mor', 'Val', 'Riv', 'Glen', 'Stone', 'Iron', 'Gold', 'Silver', 'Moon'];
            const suffixes = ['hold', 'heim', 'burg', 'gate', 'haven', 'ford', 'wood', 'mere', 'fell', 'ridge'];
            
            return {
                name: `${this.randomChoice(prefixes)}${this.randomChoice(suffixes)}`,
                meta: 'Fantasy Place'
            };
        }
        
        const typeData = this.fantasyNames[fantasyType] || this.fantasyNames.medieval;
        let selectedGender = gender;
        
        if (gender === 'any') {
            selectedGender = Math.random() > 0.5 ? 'male' : 'female';
        }
        
        const firstName = this.randomChoice(typeData[selectedGender]);
        
        return {
            name: firstName,
            meta: `${selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)} • ${fantasyType.charAt(0).toUpperCase() + fantasyType.slice(1)}`
        };
    }
    
    generateUsername() {
        const style = this.usernameStyleSelect.value;
        const includeNumbers = this.includeNumbersSelect.value === 'yes';
        
        const words = this.usernameWords[style] || this.usernameWords.casual;
        const adjectives = ['quick', 'swift', 'bright', 'smart', 'cool', 'wild', 'bold', 'epic', 'pure', 'zen'];
        const nouns = ['cat', 'wolf', 'bear', 'eagle', 'tiger', 'lion', 'shark', 'falcon', 'raven', 'fox'];
        
        let username = '';
        
        const patterns = [
            () => this.randomChoice(words) + this.randomChoice(nouns),
            () => this.randomChoice(adjectives) + this.randomChoice(nouns),
            () => this.randomChoice(nouns) + this.randomChoice(words),
            () => this.randomChoice(adjectives) + this.randomChoice(words)
        ];
        
        username = this.randomChoice(patterns)();
        
        if (includeNumbers) {
            const number = Math.floor(Math.random() * 999) + 1;
            username += number;
        }
        
        return username;
    }
    
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    displayNames() {
        this.namesGrid.innerHTML = '';
        
        this.generatedNames.forEach((nameObj, index) => {
            const nameCard = document.createElement('div');
            nameCard.className = 'name-card';
            nameCard.innerHTML = `
                <div class="copy-indicator">
                    <i class="fas fa-check"></i>
                </div>
                <div class="name-text">${nameObj.name}</div>
                <div class="name-meta">${nameObj.meta}</div>
            `;
            
            nameCard.addEventListener('click', () => this.copyName(nameObj.name, nameCard));
            this.namesGrid.appendChild(nameCard);
        });
        
        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    async copyName(name, cardElement) {
        try {
            await navigator.clipboard.writeText(name);
            cardElement.classList.add('copied');
            setTimeout(() => cardElement.classList.remove('copied'), 2000);
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = name;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            cardElement.classList.add('copied');
            setTimeout(() => cardElement.classList.remove('copied'), 2000);
        }
    }
    
    async copyAllNames() {
        const namesList = this.generatedNames.map(nameObj => nameObj.name).join('\n');
        
        try {
            await navigator.clipboard.writeText(namesList);
            this.showSuccess('All names copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = namesList;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('All names copied to clipboard!');
        }
    }
    
    downloadNames() {
        const namesList = this.generatedNames.map(nameObj => `${nameObj.name} (${nameObj.meta})`).join('\n');
        
        const blob = new Blob([namesList], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `generated-names-${Date.now()}.txt`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    regenerateNames() {
        const count = parseInt(this.nameCountInput.value);
        this.generateNames(count);
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

// Initialize the name generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NameGenerator();
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
