// Text to Speech Converter Script

class TextToSpeechConverter {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentUtterance = null;
        this.isPaused = false;
        this.isSupported = 'speechSynthesis' in window;
        
        this.examples = {
            greeting: "Hello! Welcome to our text-to-speech converter. This tool can help you convert any text into natural-sounding speech.",
            announcement: "Attention passengers, the train to New York City will be departing from platform 3 in approximately 10 minutes. Please have your tickets ready.",
            story: "Once upon a time, in a land far away, there lived a wise old owl who could speak to all the animals in the forest. Every evening, creatures would gather to hear his stories.",
            numbers: "Today is December 25th, 2024. The temperature is 72 degrees Fahrenheit. Your order number is 12345, and your total is $99.99.",
            punctuation: "This sentence has a comma, and this one has a period. This is a question? This is an exclamation! Here are some... ellipses.",
            multilingual: "Hello. Hola. Bonjour. Guten Tag. Ciao. Konnichiwa. Namaste. These are greetings in different languages."
        };
        
        this.init();
    }

    init() {
        if (!this.isSupported) {
            alert('Speech synthesis is not supported in your browser. Please try a modern browser like Chrome, Edge, or Safari.');
            return;
        }

        this.bindEvents();
        this.loadVoices();
        this.setupSliders();
        
        // Load voices when they change (some browsers load async)
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
    }

    bindEvents() {
        // Text input character counter
        const textInput = document.getElementById('text-input');
        textInput.addEventListener('input', () => this.updateCharCounter());

        // Button events
        document.getElementById('play-btn').addEventListener('click', () => this.speakText());
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseSpeech());
        document.getElementById('stop-btn').addEventListener('click', () => this.stopSpeech());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearText());

        // Example items
        document.querySelectorAll('.example-item').forEach(item => {
            item.addEventListener('click', () => {
                const exampleType = item.getAttribute('data-example');
                this.loadExample(exampleType);
            });
        });

        // Slider updates
        document.getElementById('rate-slider').addEventListener('input', (e) => {
            document.getElementById('rate-value').textContent = parseFloat(e.target.value).toFixed(1) + 'x';
        });

        document.getElementById('pitch-slider').addEventListener('input', (e) => {
            document.getElementById('pitch-value').textContent = parseFloat(e.target.value).toFixed(1);
        });

        document.getElementById('volume-slider').addEventListener('input', (e) => {
            const percentage = Math.round(parseFloat(e.target.value) * 100);
            document.getElementById('volume-value').textContent = percentage + '%';
        });

        // Voice selection
        document.getElementById('voice-select').addEventListener('change', () => {
            this.updateLanguageSelect();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.speakText();
                        break;
                    case ' ':
                        e.preventDefault();
                        if (this.synth.speaking) {
                            this.pauseSpeech();
                        }
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.stopSpeech();
                        break;
                }
            }
        });
    }

    setupSliders() {
        // Initialize slider values
        document.getElementById('rate-value').textContent = '1.0x';
        document.getElementById('pitch-value').textContent = '1.0';
        document.getElementById('volume-value').textContent = '100%';
    }

    loadVoices() {
        this.voices = this.synth.getVoices();
        this.populateVoiceSelect();
        this.populateLanguageSelect();
    }

    populateVoiceSelect() {
        const voiceSelect = document.getElementById('voice-select');
        voiceSelect.innerHTML = '';

        if (this.voices.length === 0) {
            voiceSelect.innerHTML = '<option value="">No voices available</option>';
            return;
        }

        // Group voices by language
        const voicesByLang = {};
        this.voices.forEach((voice, index) => {
            const lang = voice.lang.split('-')[0];
            if (!voicesByLang[lang]) {
                voicesByLang[lang] = [];
            }
            voicesByLang[lang].push({ voice, index });
        });

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Default Voice';
        voiceSelect.appendChild(defaultOption);

        // Add voices grouped by language
        Object.keys(voicesByLang).sort().forEach(lang => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = this.getLanguageName(lang);
            
            voicesByLang[lang].forEach(({ voice, index }) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${voice.name} (${voice.lang})`;
                if (voice.default) {
                    option.textContent += ' - Default';
                }
                optgroup.appendChild(option);
            });
            
            voiceSelect.appendChild(optgroup);
        });
    }

    populateLanguageSelect() {
        const languageSelect = document.getElementById('language-select');
        languageSelect.innerHTML = '<option value="">All Languages</option>';

        const languages = new Set();
        this.voices.forEach(voice => {
            const lang = voice.lang.split('-')[0];
            languages.add(lang);
        });

        Array.from(languages).sort().forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = this.getLanguageName(lang);
            languageSelect.appendChild(option);
        });
    }

    updateLanguageSelect() {
        const voiceSelect = document.getElementById('voice-select');
        const languageSelect = document.getElementById('language-select');
        
        if (voiceSelect.value) {
            const selectedVoice = this.voices[voiceSelect.value];
            if (selectedVoice) {
                const lang = selectedVoice.lang.split('-')[0];
                languageSelect.value = lang;
            }
        }
    }

    getLanguageName(code) {
        const languages = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'tr': 'Turkish',
            'pl': 'Polish',
            'nl': 'Dutch',
            'sv': 'Swedish',
            'da': 'Danish',
            'no': 'Norwegian',
            'fi': 'Finnish',
            'he': 'Hebrew',
            'th': 'Thai',
            'vi': 'Vietnamese',
            'cs': 'Czech',
            'hu': 'Hungarian',
            'ro': 'Romanian',
            'bg': 'Bulgarian',
            'hr': 'Croatian',
            'sk': 'Slovak',
            'sl': 'Slovenian',
            'et': 'Estonian',
            'lv': 'Latvian',
            'lt': 'Lithuanian',
            'mt': 'Maltese',
            'ga': 'Irish',
            'cy': 'Welsh'
        };
        
        return languages[code] || code.toUpperCase();
    }

    updateCharCounter() {
        const textInput = document.getElementById('text-input');
        const charCount = document.getElementById('char-count');
        const currentLength = textInput.value.length;
        
        charCount.textContent = currentLength.toLocaleString();
        
        // Change color based on usage
        if (currentLength > 30000) {
            charCount.style.color = '#dc2626'; // Red
        } else if (currentLength > 25000) {
            charCount.style.color = '#f59e0b'; // Orange
        } else {
            charCount.style.color = '#6b7280'; // Gray
        }
    }

    speakText() {
        const text = document.getElementById('text-input').value.trim();
        
        if (!text) {
            alert('Please enter some text to convert to speech.');
            return;
        }

        if (text.length > 32000) {
            alert('Text is too long. Please limit to 32,000 characters.');
            return;
        }

        // Stop any current speech
        this.stopSpeech();

        // Create new utterance
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Set voice
        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect.value) {
            this.currentUtterance.voice = this.voices[voiceSelect.value];
        }

        // Set parameters
        this.currentUtterance.rate = parseFloat(document.getElementById('rate-slider').value);
        this.currentUtterance.pitch = parseFloat(document.getElementById('pitch-slider').value);
        this.currentUtterance.volume = parseFloat(document.getElementById('volume-slider').value);

        // Set language if specified
        const languageSelect = document.getElementById('language-select');
        if (languageSelect.value) {
            this.currentUtterance.lang = languageSelect.value;
        }

        // Event handlers
        this.currentUtterance.onstart = () => {
            this.updateButtonStates('speaking');
        };

        this.currentUtterance.onend = () => {
            this.updateButtonStates('stopped');
        };

        this.currentUtterance.onerror = (event) => {
            this.updateButtonStates('stopped');
            console.error('Speech error:', event.error);
        };

        this.currentUtterance.onpause = () => {
            this.updateButtonStates('paused');
            this.isPaused = true;
        };

        this.currentUtterance.onresume = () => {
            this.updateButtonStates('speaking');
            this.isPaused = false;
        };

        // Start speech
        this.synth.speak(this.currentUtterance);
    }

    pauseSpeech() {
        if (this.synth.speaking && !this.isPaused) {
            this.synth.pause();
        } else if (this.isPaused) {
            this.synth.resume();
        }
    }

    stopSpeech() {
        if (this.synth.speaking || this.isPaused) {
            this.synth.cancel();
        }
        this.updateButtonStates('stopped');
        this.isPaused = false;
    }

    updateButtonStates(state) {
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const stopBtn = document.getElementById('stop-btn');
        const statusIndicator = document.getElementById('status-indicator');

        switch (state) {
            case 'speaking':
                playBtn.disabled = true;
                pauseBtn.disabled = false;
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                stopBtn.disabled = false;
                statusIndicator.textContent = 'Speaking';
                statusIndicator.className = 'status-indicator status-speaking';
                break;
            case 'paused':
                playBtn.disabled = true;
                pauseBtn.disabled = false;
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
                stopBtn.disabled = false;
                statusIndicator.textContent = 'Paused';
                statusIndicator.className = 'status-indicator status-paused';
                break;
            case 'stopped':
            default:
                playBtn.disabled = false;
                pauseBtn.disabled = true;
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                stopBtn.disabled = true;
                statusIndicator.textContent = 'Ready';
                statusIndicator.className = 'status-indicator status-stopped';
                break;
        }
    }

    loadExample(type) {
        if (this.examples[type]) {
            document.getElementById('text-input').value = this.examples[type];
            this.updateCharCounter();
            
            // Scroll to text input
            document.getElementById('text-input').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }

    clearText() {
        document.getElementById('text-input').value = '';
        this.updateCharCounter();
        this.stopSpeech();
    }
}

// Global functions
function speakText() {
    if (window.ttsConverter) {
        window.ttsConverter.speakText();
    }
}

function pauseSpeech() {
    if (window.ttsConverter) {
        window.ttsConverter.pauseSpeech();
    }
}

function stopSpeech() {
    if (window.ttsConverter) {
        window.ttsConverter.stopSpeech();
    }
}

function clearText() {
    if (window.ttsConverter) {
        window.ttsConverter.clearText();
    }
}

function loadExample(type) {
    if (window.ttsConverter) {
        window.ttsConverter.loadExample(type);
    }
}

// Utility class for advanced speech features
class SpeechUtilities {
    static estimateReadingTime(text, wordsPerMinute = 150) {
        const words = text.trim().split(/\s+/).length;
        const minutes = words / wordsPerMinute;
        return Math.ceil(minutes * 60); // Return seconds
    }

    static preprocessText(text) {
        // Replace common abbreviations with full words for better pronunciation
        const replacements = {
            'Dr.': 'Doctor',
            'Mr.': 'Mister',
            'Mrs.': 'Missus',
            'Ms.': 'Miss',
            'Prof.': 'Professor',
            'vs.': 'versus',
            'etc.': 'et cetera',
            'e.g.': 'for example',
            'i.e.': 'that is',
            'LLC': 'Limited Liability Company',
            'Inc.': 'Incorporated',
            'Corp.': 'Corporation',
            'Ltd.': 'Limited',
            '&': 'and',
            '%': 'percent',
            '$': 'dollars',
            '@': 'at'
        };

        let processedText = text;
        Object.keys(replacements).forEach(abbr => {
            const regex = new RegExp('\\b' + abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
            processedText = processedText.replace(regex, replacements[abbr]);
        });

        return processedText;
    }

    static splitLongText(text, maxLength = 200) {
        // Split long text into chunks at sentence boundaries
        const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
        const chunks = [];
        let currentChunk = '';

        sentences.forEach(sentence => {
            if ((currentChunk + sentence).length <= maxLength) {
                currentChunk += sentence;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence;
            }
        });

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    static getVoicesByLanguage(voices, languageCode) {
        return voices.filter(voice => voice.lang.startsWith(languageCode));
    }

    static getBestVoiceForLanguage(voices, languageCode, preferFemale = false) {
        const languageVoices = this.getVoicesByLanguage(voices, languageCode);
        
        if (languageVoices.length === 0) {
            return null;
        }

        // Prefer default voice
        const defaultVoice = languageVoices.find(voice => voice.default);
        if (defaultVoice) {
            return defaultVoice;
        }

        // Filter by gender preference if specified
        if (preferFemale) {
            const femaleVoices = languageVoices.filter(voice => 
                voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('woman') ||
                voice.name.toLowerCase().includes('sara') ||
                voice.name.toLowerCase().includes('alice')
            );
            if (femaleVoices.length > 0) {
                return femaleVoices[0];
            }
        }

        // Return first available voice
        return languageVoices[0];
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.ttsConverter = new TextToSpeechConverter();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
});
