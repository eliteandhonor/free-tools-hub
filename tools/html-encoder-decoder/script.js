// HTML Encoder/Decoder Script

class HTMLEncoderDecoder {
    constructor() {
        this.htmlEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.initTabs();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Encode tab events
        document.getElementById('encode-btn').addEventListener('click', () => this.encodeHTML());
        document.getElementById('encode-copy-btn').addEventListener('click', () => this.copyToClipboard('encode-output'));
        document.getElementById('encode-clear-btn').addEventListener('click', () => this.clearFields('encode'));
        document.getElementById('encode-swap-btn').addEventListener('click', () => this.swapFields('encode'));

        // Decode tab events
        document.getElementById('decode-btn').addEventListener('click', () => this.decodeHTML());
        document.getElementById('decode-copy-btn').addEventListener('click', () => this.copyToClipboard('decode-output'));
        document.getElementById('decode-clear-btn').addEventListener('click', () => this.clearFields('decode'));
        document.getElementById('decode-swap-btn').addEventListener('click', () => this.swapFields('decode'));

        // Real-time encoding/decoding
        document.getElementById('encode-input').addEventListener('input', () => this.encodeHTML());
        document.getElementById('decode-input').addEventListener('input', () => this.decodeHTML());

        // Entity reference clicks
        document.querySelectorAll('.entity-item').forEach(item => {
            item.addEventListener('click', () => {
                const char = item.querySelector('.entity-char').textContent;
                const code = item.querySelector('.entity-code').textContent;
                
                // Insert into current tab's input
                const activeTab = document.querySelector('.tab-button.active').dataset.tab;
                const input = document.getElementById(`${activeTab}-input`);
                
                if (activeTab === 'encode') {
                    this.insertAtCursor(input, char);
                } else {
                    this.insertAtCursor(input, code);
                }
                
                // Trigger processing
                if (activeTab === 'encode') {
                    this.encodeHTML();
                } else {
                    this.decodeHTML();
                }
            });
        });
    }

    initTabs() {
        this.switchTab('encode');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    encodeHTML() {
        const input = document.getElementById('encode-input').value;
        const encoded = this.htmlEncode(input);
        document.getElementById('encode-output').value = encoded;
    }

    decodeHTML() {
        const input = document.getElementById('decode-input').value;
        const decoded = this.htmlDecode(input);
        document.getElementById('decode-output').value = decoded;
    }

    htmlEncode(text) {
        if (!text) return '';

        // Replace HTML entities
        let encoded = text.replace(/[&<>"'`=\/]/g, (char) => {
            return this.htmlEntities[char] || char;
        });

        // Also encode other special characters as numeric entities
        encoded = encoded.replace(/[\u00A0-\u9999]/g, (char) => {
            return '&#' + char.charCodeAt(0) + ';';
        });

        return encoded;
    }

    htmlDecode(text) {
        if (!text) return '';

        // Create a temporary element to decode HTML entities
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        let decoded = textarea.value;

        // Handle additional numeric entities that might not be covered
        decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
            return String.fromCharCode(dec);
        });

        decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
        });

        return decoded;
    }

    insertAtCursor(input, text) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const value = input.value;
        
        input.value = value.substring(0, start) + text + value.substring(end);
        input.setSelectionRange(start + text.length, start + text.length);
        input.focus();
    }

    swapFields(type) {
        const input = document.getElementById(`${type}-input`);
        const output = document.getElementById(`${type}-output`);
        
        const inputValue = input.value;
        const outputValue = output.value;
        
        input.value = outputValue;
        output.value = inputValue;
        
        // Trigger processing
        if (type === 'encode') {
            this.encodeHTML();
        } else {
            this.decodeHTML();
        }
        
        this.showNotification('Input and output swapped!', 'success');
    }

    clearFields(type) {
        document.getElementById(`${type}-input`).value = '';
        document.getElementById(`${type}-output`).value = '';
        this.showNotification('Fields cleared!', 'success');
    }

    copyToClipboard(outputId) {
        const output = document.getElementById(outputId);
        
        if (!output.value.trim()) {
            this.showNotification('No content to copy!', 'warning');
            return;
        }

        output.select();
        output.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            this.showNotification('Copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for modern browsers
            navigator.clipboard.writeText(output.value).then(() => {
                this.showNotification('Copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy', 'error');
            });
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
    new HTMLEncoderDecoder();
});
