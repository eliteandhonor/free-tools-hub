// JSON Generator Tool
class JSONGenerator {
    constructor() {
        this.presets = {
            user: {
                name: "{{firstName}} {{lastName}}",
                email: "{{email}}",
                age: "{{number(18,80)}}",
                phone: "{{phone}}",
                address: {
                    street: "{{streetAddress}}",
                    city: "{{city}}",
                    country: "{{country}}",
                    zipCode: "{{zipCode}}"
                },
                isActive: "{{boolean}}"
            },
            product: {
                id: "{{uuid}}",
                name: "{{productName}}",
                description: "{{sentence(10,20)}}",
                price: "{{number(10,1000,2)}}",
                category: "{{category}}",
                inStock: "{{boolean}}",
                rating: "{{number(1,5,1)}}",
                tags: ["{{word}}", "{{word}}", "{{word}}"]
            },
            blog: {
                id: "{{uuid}}",
                title: "{{sentence(5,10)}}",
                content: "{{paragraph(3,5)}}",
                author: "{{firstName}} {{lastName}}",
                publishDate: "{{date}}",
                tags: ["{{word}}", "{{word}}"],
                views: "{{number(100,10000)}}",
                likes: "{{number(10,500)}}"
            },
            company: {
                name: "{{companyName}}",
                industry: "{{industry}}",
                employees: "{{number(10,10000)}}",
                founded: "{{number(1950,2023)}}",
                website: "{{url}}",
                headquarters: {
                    city: "{{city}}",
                    country: "{{country}}"
                },
                revenue: "{{number(1000000,1000000000)}}"
            },
            address: {
                street: "{{streetAddress}}",
                city: "{{city}}",
                state: "{{state}}",
                country: "{{country}}",
                zipCode: "{{zipCode}}",
                coordinates: {
                    lat: "{{number(-90,90,6)}}",
                    lng: "{{number(-180,180,6)}}"
                }
            }
        };
        
        this.init();
    }
    
    init() {
        // Load default preset
        this.loadPreset('user');
    }
    
    loadPreset(type) {
        const schema = JSON.stringify(this.presets[type], null, 2);
        document.getElementById('jsonSchema').value = schema;
    }
    
    generateJSON() {
        try {
            const schemaText = document.getElementById('jsonSchema').value;
            const recordCount = parseInt(document.getElementById('recordCount').value) || 1;
            
            if (!schemaText.trim()) {
                alert('Please enter a JSON schema first.');
                return;
            }
            
            const schema = JSON.parse(schemaText);
            const generatedData = [];
            
            for (let i = 0; i < recordCount; i++) {
                generatedData.push(this.generateRecord(schema));
            }
            
            const result = recordCount === 1 ? generatedData[0] : generatedData;
            const formattedJSON = JSON.stringify(result, null, 2);
            
            document.getElementById('generatedJSON').textContent = formattedJSON;
            
        } catch (error) {
            alert('Error generating JSON: ' + error.message);
        }
    }
    
    generateRecord(schema) {
        if (Array.isArray(schema)) {
            return schema.map(item => this.generateRecord(item));
        }
        
        if (typeof schema === 'object' && schema !== null) {
            const result = {};
            for (const [key, value] of Object.entries(schema)) {
                result[key] = this.generateRecord(value);
            }
            return result;
        }
        
        if (typeof schema === 'string' && schema.includes('{{')) {
            return this.generateValue(schema);
        }
        
        return schema;
    }
    
    generateValue(template) {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, placeholder) => {
            const parts = placeholder.split('(');
            const type = parts[0].trim();
            const params = parts[1] ? parts[1].replace(')', '').split(',').map(p => p.trim()) : [];
            
            switch (type) {
                case 'firstName':
                    return this.getRandomItem(['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Emily', 'Robert', 'Ashley']);
                case 'lastName':
                    return this.getRandomItem(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']);
                case 'email':
                    return `user${Math.floor(Math.random() * 1000)}@example.com`;
                case 'phone':
                    return `+1-${this.randomNumber(100, 999)}-${this.randomNumber(100, 999)}-${this.randomNumber(1000, 9999)}`;
                case 'streetAddress':
                    return `${this.randomNumber(1, 9999)} ${this.getRandomItem(['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Park'])} ${this.getRandomItem(['St', 'Ave', 'Rd', 'Blvd', 'Dr'])}`;
                case 'city':
                    return this.getRandomItem(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose']);
                case 'state':
                    return this.getRandomItem(['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI']);
                case 'country':
                    return this.getRandomItem(['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'Mexico', 'India']);
                case 'zipCode':
                    return String(this.randomNumber(10000, 99999));
                case 'uuid':
                    return this.generateUUID();
                case 'boolean':
                    return Math.random() < 0.5;
                case 'date':
                    const start = new Date(2020, 0, 1);
                    const end = new Date();
                    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
                case 'word':
                    return this.getRandomItem(['technology', 'innovation', 'digital', 'creative', 'modern', 'professional', 'premium', 'quality', 'advanced', 'smart']);
                case 'sentence':
                    const minWords = parseInt(params[0]) || 5;
                    const maxWords = parseInt(params[1]) || 10;
                    const wordCount = this.randomNumber(minWords, maxWords);
                    const words = [];
                    for (let i = 0; i < wordCount; i++) {
                        words.push(this.getRandomItem(['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor']));
                    }
                    return words.join(' ') + '.';
                case 'paragraph':
                    const minSentences = parseInt(params[0]) || 3;
                    const maxSentences = parseInt(params[1]) || 5;
                    const sentenceCount = this.randomNumber(minSentences, maxSentences);
                    const sentences = [];
                    for (let i = 0; i < sentenceCount; i++) {
                        sentences.push(this.generateValue('{{sentence(5,10)}}'));
                    }
                    return sentences.join(' ');
                case 'number':
                    const min = parseFloat(params[0]) || 0;
                    const max = parseFloat(params[1]) || 100;
                    const decimals = parseInt(params[2]) || 0;
                    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
                case 'productName':
                    return this.getRandomItem(['Smart Watch', 'Wireless Headphones', 'Gaming Mouse', 'Smartphone', 'Laptop', 'Tablet', 'Camera', 'Keyboard', 'Monitor', 'Speaker']);
                case 'category':
                    return this.getRandomItem(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Automotive', 'Food', 'Health']);
                case 'companyName':
                    return this.getRandomItem(['TechCorp', 'InnovateLTD', 'GlobalSolutions', 'FutureTech', 'SmartSystems', 'NextGen Inc', 'ProTech', 'AdvancedLab', 'DigitalPro', 'MegaCorp']);
                case 'industry':
                    return this.getRandomItem(['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Construction', 'Transportation', 'Entertainment', 'Agriculture']);
                case 'url':
                    return `https://www.${this.getRandomItem(['example', 'sample', 'demo', 'test'])}.com`;
                default:
                    return placeholder;
            }
        });
    }
    
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    copyJSON() {
        const jsonText = document.getElementById('generatedJSON').textContent;
        
        if (!jsonText || jsonText.includes('Click "Generate JSON Data"')) {
            alert('Please generate JSON data first.');
            return;
        }
        
        navigator.clipboard.writeText(jsonText).then(() => {
            // Temporary feedback
            const copyBtn = document.querySelector('button[onclick="copyJSON()"]');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
            copyBtn.classList.remove('btn-outline-primary');
            copyBtn.classList.add('btn-success');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('btn-success');
                copyBtn.classList.add('btn-outline-primary');
            }, 2000);
        }).catch(() => {
            alert('Failed to copy to clipboard. Please select and copy manually.');
        });
    }
    
    downloadJSON() {
        const jsonText = document.getElementById('generatedJSON').textContent;
        
        if (!jsonText || jsonText.includes('Click "Generate JSON Data"')) {
            alert('Please generate JSON data first.');
            return;
        }
        
        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Global functions for button clicks
function loadPreset(type) {
    generator.loadPreset(type);
}

function generateJSON() {
    generator.generateJSON();
}

function copyJSON() {
    generator.copyJSON();
}

function downloadJSON() {
    generator.downloadJSON();
}

// Initialize when page loads
let generator;
document.addEventListener('DOMContentLoaded', function() {
    generator = new JSONGenerator();
});
