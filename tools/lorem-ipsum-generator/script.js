// Lorem Ipsum Generator Script

class LoremIpsumGenerator {
    constructor() {
        // Standard Lorem Ipsum words
        this.loremWords = [
            'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
            'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
            'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
            'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
            'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
            'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
            'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
            'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
            'accusamus', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
            'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis',
            'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'sunt', 'explicabo',
            'nemo', 'ipsam', 'voluptatem', 'quia', 'voluptas', 'aspernatur', 'aut',
            'odit', 'fugit', 'sed', 'quia', 'consequuntur', 'magni', 'dolores', 'eos',
            'qui', 'ratione', 'sequi', 'nesciunt', 'neque', 'porro', 'quisquam',
            'dolorem', 'adipisci', 'numquam', 'eius', 'modi', 'tempora', 'incidunt',
            'ut', 'labore', 'et', 'dolore', 'magnam', 'aliquam', 'quaerat', 'voluptatem',
            'ut', 'enim', 'ad', 'minima', 'veniam', 'quis', 'nostrum', 'exercitationem',
            'ullam', 'corporis', 'suscipit', 'laboriosam', 'nisi', 'ut', 'aliquid',
            'ex', 'ea', 'commodi', 'consequatur', 'quis', 'autem', 'vel', 'eum',
            'iure', 'reprehenderit', 'qui', 'in', 'ea', 'voluptate', 'velit', 'esse',
            'quam', 'nihil', 'molestiae', 'et', 'iusto', 'odio', 'dignissimos', 'ducimus',
            'qui', 'blanditiis', 'praesentium', 'voluptatum', 'deleniti', 'atque',
            'corrupti', 'quos', 'dolores', 'et', 'quas', 'molestias', 'excepturi',
            'sint', 'occaecati', 'cupiditate', 'non', 'provident', 'similique', 'sunt',
            'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollitia', 'animi', 'id',
            'est', 'laborum', 'et', 'dolorum', 'fuga', 'et', 'harum', 'quidem',
            'rerum', 'facilis', 'est', 'et', 'expedita', 'distinctio', 'nam', 'libero',
            'tempore', 'cum', 'soluta', 'nobis', 'est', 'eligendi', 'optio', 'cumque',
            'nihil', 'impedit', 'quo', 'minus', 'id', 'quod', 'maxime', 'placeat',
            'facere', 'possimus', 'omnis', 'voluptas', 'assumenda', 'est', 'omnis',
            'dolor', 'repellendus', 'temporibus', 'autem', 'quibusdam', 'et', 'aut',
            'officiis', 'debitis', 'aut', 'rerum', 'necessitatibus', 'saepe', 'eveniet',
            'ut', 'et', 'voluptates', 'repudiandae', 'sint', 'et', 'molestiae', 'non',
            'recusandae', 'itaque', 'earum', 'rerum', 'hic', 'tenetur', 'a', 'sapiente',
            'delectus', 'ut', 'aut', 'reiciendis', 'voluptatibus', 'maiores', 'alias',
            'consequatur', 'aut', 'perferendis', 'doloribus', 'asperiores', 'repellat'
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.generateInitial();
    }

    bindEvents() {
        document.getElementById('generate-btn').addEventListener('click', () => this.generate());
        document.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('clear-btn').addEventListener('click', () => this.clear());
        
        // Show/hide list items control
        document.getElementById('generation-type').addEventListener('change', (e) => {
            const listControl = document.getElementById('list-items-control');
            if (e.target.value === 'lists') {
                listControl.style.display = 'block';
            } else {
                listControl.style.display = 'none';
            }
        });

        // Auto-generate on input change
        document.getElementById('amount').addEventListener('input', () => this.generate());
        document.getElementById('list-items').addEventListener('input', () => this.generate());
        document.getElementById('start-with-lorem').addEventListener('change', () => this.generate());
    }

    generateInitial() {
        this.generate();
    }

    generate() {
        const type = document.getElementById('generation-type').value;
        const amount = parseInt(document.getElementById('amount').value);
        const startWithLorem = document.getElementById('start-with-lorem').checked;
        const listItems = parseInt(document.getElementById('list-items').value);

        let text = '';

        switch (type) {
            case 'paragraphs':
                text = this.generateParagraphs(amount, startWithLorem);
                break;
            case 'words':
                text = this.generateWords(amount, startWithLorem);
                break;
            case 'bytes':
                text = this.generateBytes(amount, startWithLorem);
                break;
            case 'lists':
                text = this.generateLists(amount, listItems, startWithLorem);
                break;
        }

        document.getElementById('output').value = text;
        this.updateStats(text);
    }

    generateParagraphs(count, startWithLorem = false) {
        const paragraphs = [];
        
        for (let i = 0; i < count; i++) {
            let paragraph;
            if (i === 0 && startWithLorem) {
                paragraph = this.generateLoremParagraph();
            } else {
                paragraph = this.generateRandomParagraph();
            }
            paragraphs.push(paragraph);
        }
        
        return paragraphs.join('\n\n');
    }

    generateWords(count, startWithLorem = false) {
        const words = [];
        
        if (startWithLorem) {
            const loremStart = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
            words.push(...loremStart);
            count -= loremStart.length;
        }
        
        for (let i = 0; i < count; i++) {
            words.push(this.getRandomWord());
        }
        
        return this.formatText(words.join(' '));
    }

    generateBytes(count, startWithLorem = false) {
        let text = '';
        
        if (startWithLorem) {
            text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';
        }
        
        while (text.length < count) {
            const word = this.getRandomWord();
            if (text.length + word.length + 1 <= count) {
                text += word + ' ';
            } else {
                break;
            }
        }
        
        return text.trim().substring(0, count);
    }

    generateLists(listCount, itemsPerList, startWithLorem = false) {
        const lists = [];
        
        for (let i = 0; i < listCount; i++) {
            const items = [];
            for (let j = 0; j < itemsPerList; j++) {
                let sentence;
                if (i === 0 && j === 0 && startWithLorem) {
                    sentence = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
                } else {
                    sentence = this.generateRandomSentence();
                }
                items.push(`• ${sentence}`);
            }
            lists.push(items.join('\n'));
        }
        
        return lists.join('\n\n');
    }

    generateLoremParagraph() {
        return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    }

    generateRandomParagraph() {
        const sentenceCount = this.getRandomInt(3, 7);
        const sentences = [];
        
        for (let i = 0; i < sentenceCount; i++) {
            sentences.push(this.generateRandomSentence());
        }
        
        return sentences.join(' ');
    }

    generateRandomSentence() {
        const wordCount = this.getRandomInt(8, 20);
        const words = [];
        
        for (let i = 0; i < wordCount; i++) {
            words.push(this.getRandomWord());
        }
        
        let sentence = words.join(' ');
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        
        // Add punctuation
        const endings = ['.', '.', '.', '.', '!', '?'];
        sentence += endings[Math.floor(Math.random() * endings.length)];
        
        return sentence;
    }

    getRandomWord() {
        return this.loremWords[Math.floor(Math.random() * this.loremWords.length)];
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    formatText(text) {
        // Capitalize first letter and add periods at reasonable intervals
        if (!text) return '';
        
        let formatted = text.charAt(0).toUpperCase() + text.slice(1);
        
        // Add periods every 15-25 words
        const words = formatted.split(' ');
        let result = [];
        let wordCount = 0;
        
        for (let word of words) {
            result.push(word);
            wordCount++;
            
            if (wordCount >= this.getRandomInt(15, 25) && wordCount < words.length - 1) {
                result[result.length - 1] += '.';
                wordCount = 0;
                if (result.length < words.length - 1) {
                    result.push('\n\n');
                    // Capitalize next word
                    if (words[result.length]) {
                        words[result.length] = words[result.length].charAt(0).toUpperCase() + words[result.length].slice(1);
                    }
                }
            }
        }
        
        return result.join(' ').replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n');
    }

    updateStats(text) {
        const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0).length;
        const words = text.split(/\s+/).filter(w => w.length > 0).length;
        const characters = text.length;
        const bytes = new Blob([text]).size;

        document.getElementById('stat-paragraphs').textContent = paragraphs.toLocaleString();
        document.getElementById('stat-words').textContent = words.toLocaleString();
        document.getElementById('stat-characters').textContent = characters.toLocaleString();
        document.getElementById('stat-bytes').textContent = bytes.toLocaleString();
    }

    copyToClipboard() {
        const output = document.getElementById('output');
        
        if (!output.value.trim()) {
            this.showNotification('No text to copy!', 'warning');
            return;
        }

        output.select();
        output.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            this.showNotification('Lorem Ipsum copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for modern browsers
            navigator.clipboard.writeText(output.value).then(() => {
                this.showNotification('Lorem Ipsum copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy text', 'error');
            });
        }
    }

    clear() {
        document.getElementById('output').value = '';
        document.getElementById('amount').value = '5';
        document.getElementById('start-with-lorem').checked = false;
        document.getElementById('generation-type').value = 'paragraphs';
        document.getElementById('list-items-control').style.display = 'none';
        this.updateStats('');
        this.showNotification('Cleared!', 'success');
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
    new LoremIpsumGenerator();
});
