// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.conversion-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // Auto-convert on input change
    document.getElementById('textInput').addEventListener('input', debounce(convertTextToUnicode, 500));
    document.getElementById('unicodeInput').addEventListener('input', debounce(convertUnicodeToText, 500));
    document.getElementById('charInput').addEventListener('input', debounce(getCharacterInfo, 300));
    
    // Format option change triggers reconversion
    document.querySelectorAll('input[name="unicode-format"]').forEach(radio => {
        radio.addEventListener('change', convertTextToUnicode);
    });
});

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Convert text to Unicode
function convertTextToUnicode() {
    const textInput = document.getElementById('textInput');
    const result = document.getElementById('unicodeResult');
    const text = textInput.value;
    
    if (!text) {
        result.innerHTML = '<button class="copy-button" onclick="copyResult(\'unicodeResult\')"><i class="fas fa-copy"></i></button>Results will appear here...';
        return;
    }
    
    try {
        const format = document.querySelector('input[name="unicode-format"]:checked').value;
        let converted = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const codePoint = char.codePointAt(0);
            
            switch (format) {
                case 'escape':
                    if (codePoint > 0xFFFF) {
                        // Handle surrogate pairs for characters > U+FFFF
                        const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
                        const low = (codePoint - 0x10000) % 0x400 + 0xDC00;
                        converted += `\\u${high.toString(16).toUpperCase().padStart(4, '0')}\\u${low.toString(16).toUpperCase().padStart(4, '0')}`;
                    } else {
                        converted += `\\u${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
                    }
                    break;
                case 'hex':
                    converted += `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')} `;
                    break;
                case 'decimal':
                    converted += `${codePoint} `;
                    break;
            }
        }
        
        result.innerHTML = `<button class="copy-button" onclick="copyResult('unicodeResult')"><i class="fas fa-copy"></i></button>${converted.trim()}`;
    } catch (error) {
        result.innerHTML = `<button class="copy-button" onclick="copyResult('unicodeResult')"><i class="fas fa-copy"></i></button>Error: ${error.message}`;
    }
}

// Convert Unicode to text
function convertUnicodeToText() {
    const unicodeInput = document.getElementById('unicodeInput');
    const result = document.getElementById('textResult');
    const unicode = unicodeInput.value.trim();
    
    if (!unicode) {
        result.innerHTML = '<button class="copy-button" onclick="copyResult(\'textResult\')"><i class="fas fa-copy"></i></button>Results will appear here...';
        return;
    }
    
    try {
        let text = '';
        
        // Handle different Unicode formats
        if (unicode.includes('\\u')) {
            // Handle Unicode escape sequences
            text = unicode.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
                return String.fromCharCode(parseInt(hex, 16));
            });
        } else if (unicode.includes('U+')) {
            // Handle U+ format
            const codes = unicode.match(/U\+([0-9a-fA-F]+)/g);
            if (codes) {
                codes.forEach(code => {
                    const hex = code.replace('U+', '');
                    const codePoint = parseInt(hex, 16);
                    text += String.fromCodePoint(codePoint);
                });
            }
        } else if (/^\d+(\s+\d+)*$/.test(unicode)) {
            // Handle decimal format
            const codes = unicode.split(/\s+/);
            codes.forEach(code => {
                const codePoint = parseInt(code, 10);
                if (!isNaN(codePoint)) {
                    text += String.fromCodePoint(codePoint);
                }
            });
        } else if (/^[0-9a-fA-F\s]+$/.test(unicode)) {
            // Handle hex format without U+
            const codes = unicode.split(/\s+/);
            codes.forEach(code => {
                if (code.trim()) {
                    const codePoint = parseInt(code, 16);
                    if (!isNaN(codePoint)) {
                        text += String.fromCodePoint(codePoint);
                    }
                }
            });
        } else {
            throw new Error('Unsupported Unicode format. Use \\uXXXX, U+XXXX, or decimal/hex codes.');
        }
        
        result.innerHTML = `<button class="copy-button" onclick="copyResult('textResult')"><i class="fas fa-copy"></i></button>${text || 'No valid Unicode codes found'}`;
    } catch (error) {
        result.innerHTML = `<button class="copy-button" onclick="copyResult('textResult')"><i class="fas fa-copy"></i></button>Error: ${error.message}`;
    }
}

// Get character information
function getCharacterInfo() {
    const charInput = document.getElementById('charInput');
    const resultDiv = document.getElementById('charInfoResult');
    const char = charInput.value;
    
    if (!char || char.length === 0) {
        resultDiv.style.display = 'none';
        return;
    }
    
    // Take only the first character if multiple are entered
    const firstChar = char[0];
    const codePoint = firstChar.codePointAt(0);
    
    try {
        // Display character
        document.getElementById('charDisplay').textContent = firstChar;
        
        // Unicode escape
        if (codePoint > 0xFFFF) {
            const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
            const low = (codePoint - 0x10000) % 0x400 + 0xDC00;
            document.getElementById('charUnicode').textContent = `\\u${high.toString(16).toUpperCase().padStart(4, '0')}\\u${low.toString(16).toUpperCase().padStart(4, '0')}`;
        } else {
            document.getElementById('charUnicode').textContent = `\\u${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
        }
        
        // Hex code
        document.getElementById('charHex').textContent = `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
        
        // Decimal
        document.getElementById('charDecimal').textContent = codePoint.toString();
        
        // HTML entity
        document.getElementById('charHtml').textContent = `&#${codePoint};`;
        
        // Character category (basic categorization)
        const category = getCharacterCategory(codePoint);
        document.getElementById('charCategory').textContent = category;
        
        resultDiv.style.display = 'block';
    } catch (error) {
        console.error('Error getting character info:', error);
        resultDiv.style.display = 'none';
    }
}

// Get basic character category
function getCharacterCategory(codePoint) {
    if (codePoint >= 0x0000 && codePoint <= 0x001F) return 'Control Character';
    if (codePoint >= 0x0020 && codePoint <= 0x007F) return 'Basic Latin';
    if (codePoint >= 0x0080 && codePoint <= 0x00FF) return 'Latin-1 Supplement';
    if (codePoint >= 0x0100 && codePoint <= 0x017F) return 'Latin Extended-A';
    if (codePoint >= 0x0180 && codePoint <= 0x024F) return 'Latin Extended-B';
    if (codePoint >= 0x0370 && codePoint <= 0x03FF) return 'Greek and Coptic';
    if (codePoint >= 0x0400 && codePoint <= 0x04FF) return 'Cyrillic';
    if (codePoint >= 0x0590 && codePoint <= 0x05FF) return 'Hebrew';
    if (codePoint >= 0x0600 && codePoint <= 0x06FF) return 'Arabic';
    if (codePoint >= 0x4E00 && codePoint <= 0x9FFF) return 'CJK Unified Ideographs';
    if (codePoint >= 0x1F600 && codePoint <= 0x1F64F) return 'Emoticons';
    if (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) return 'Miscellaneous Symbols';
    if (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) return 'Transport Symbols';
    if (codePoint >= 0x2600 && codePoint <= 0x26FF) return 'Miscellaneous Symbols';
    if (codePoint >= 0x2700 && codePoint <= 0x27BF) return 'Dingbats';
    if (codePoint >= 0x30 && codePoint <= 0x39) return 'Digit';
    if ((codePoint >= 0x41 && codePoint <= 0x5A) || (codePoint >= 0x61 && codePoint <= 0x7A)) return 'Letter';
    
    return 'Other';
}

// Copy result to clipboard
function copyResult(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent.replace('', '').trim(); // Remove copy button text
    
    if (text && text !== 'Results will appear here...') {
        navigator.clipboard.writeText(text).then(() => {
            // Show success feedback
            const button = element.querySelector('.copy-button');
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = 'var(--primary-color)';
            }, 1000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard');
        });
    }
}

// Character input validation
document.getElementById('charInput').addEventListener('input', function() {
    if (this.value.length > 1) {
        this.value = this.value.charAt(0);
    }
});

// Example demonstrations
function loadExample(type) {
    switch (type) {
        case 'text':
            document.getElementById('textInput').value = 'Hello World! 🌍';
            document.querySelector('[data-tab="text-to-unicode"]').click();
            convertTextToUnicode();
            break;
        case 'unicode':
            document.getElementById('unicodeInput').value = '\\u0048\\u0065\\u006C\\u006C\\u006F \\u0057\\u006F\\u0072\\u006C\\u0064\\u0021';
            document.querySelector('[data-tab="unicode-to-text"]').click();
            convertUnicodeToText();
            break;
        case 'char':
            document.getElementById('charInput').value = '🎉';
            document.querySelector('[data-tab="char-info"]').click();
            getCharacterInfo();
            break;
    }
}
