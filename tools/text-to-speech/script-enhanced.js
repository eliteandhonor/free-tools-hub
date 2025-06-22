// Enhanced Text to Speech Converter with External Libraries

class EnhancedTextToSpeechConverter {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentUtterance = null;
        this.isPaused = false;
        this.isSupported = 'speechSynthesis' in window;
        this.wavesurfer = null;
        this.recorder = null;
        this.isRecording = false;
        this.recordedBlob = null;
        this.presets = JSON.parse(localStorage.getItem('tts-presets') || '{}');
        
        // Enhanced sliders
        this.rateSlider = null;
        this.pitchSlider = null;
        this.volumeSlider = null;
        
        this.examples = {
            greeting: "Hello! Welcome to our enhanced text-to-speech converter. This tool now features audio visualization, voice recording, and advanced controls.",
            announcement: "Attention passengers, the train to New York City will be departing from platform 3 in approximately 10 minutes. Please have your tickets ready.",
            story: "Once upon a time, in a land far away, there lived a wise old owl who could speak to all the animals in the forest. Every evening, creatures would gather to hear his stories.",
            numbers: "Today is December 25th, 2024. The temperature is 72 degrees Fahrenheit. Your order number is 12345, and your total is $99.99.",
            punctuation: "This sentence has a comma, and this one has a period. This is a question? This is an exclamation! Here are some... ellipses.",
            multilingual: "Hello. Hola. Bonjour. Guten Tag. Ciao. Konnichiwa. Namaste. These are greetings in different languages."
        };
        
        this.init();
    }

    async init() {
        if (!this.isSupported) {
            Swal.fire({
                icon: 'error',
                title: 'Not Supported',
                text: 'Speech synthesis is not supported in your browser. Please try a modern browser like Chrome, Edge, or Safari.'
            });
            return;
        }

        this.bindEvents();
        this.loadVoices();
        await this.setupEnhancedSliders();
        this.setupWaveform();
        this.setupRecording();
        this.loadPresets();
        
        // Load voices when they change (some browsers load async)
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }

        // Welcome message
        Swal.fire({
            icon: 'success',
            title: 'Enhanced TTS Ready!',
            text: 'Your text-to-speech converter is now loaded with advanced features.',
            timer: 3000,
            showConfirmButton: false
        });
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

        // Recording events
        document.getElementById('record-btn').addEventListener('click', () => this.startRecording());
        document.getElementById('stop-record-btn').addEventListener('click', () => this.stopRecording());
        document.getElementById('play-recording-btn').addEventListener('click', () => this.playRecording());
        document.getElementById('download-recording-btn').addEventListener('click', () => this.downloadRecording());

        // Example items
        document.querySelectorAll('.example-item').forEach(item => {
            item.addEventListener('click', () => {
                const exampleType = item.getAttribute('data-example');
                this.loadExample(exampleType);
            });
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

    async setupEnhancedSliders() {
        // Rate slider
        this.rateSlider = noUiSlider.create(document.getElementById('rate-slider-enhanced'), {
            start: [1],
            range: {
                'min': 0.1,
                'max': 3
            },
            step: 0.1,
            tooltips: true,
            format: {
                to: function (value) {
                    return value.toFixed(1) + 'x';
                },
                from: function (value) {
                    return Number(value.replace('x', ''));
                }
            }
        });

        this.rateSlider.on('update', (values) => {
            document.getElementById('rate-value').textContent = values[0];
        });

        // Pitch slider
        this.pitchSlider = noUiSlider.create(document.getElementById('pitch-slider-enhanced'), {
            start: [1],
            range: {
                'min': 0,
                'max': 2
            },
            step: 0.1,
            tooltips: true,
            format: {
                to: function (value) {
                    return value.toFixed(1);
                },
                from: function (value) {
                    return Number(value);
                }
            }
        });

        this.pitchSlider.on('update', (values) => {
            document.getElementById('pitch-value').textContent = values[0];
        });

        // Volume slider
        this.volumeSlider = noUiSlider.create(document.getElementById('volume-slider-enhanced'), {
            start: [1],
            range: {
                'min': 0,
                'max': 1
            },
            step: 0.1,
            tooltips: true,
            format: {
                to: function (value) {
                    return Math.round(value * 100) + '%';
                },
                from: function (value) {
                    return Number(value.replace('%', '')) / 100;
                }
            }
        });

        this.volumeSlider.on('update', (values) => {
            document.getElementById('volume-value').textContent = values[0];
        });
    }

    setupWaveform() {
        this.wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#007bff',
            progressColor: '#0056b3',
            cursorColor: '#dc3545',
            barWidth: 2,
            barRadius: 3,
            responsive: true,
            height: 80,
            normalize: true,
            backend: 'WebAudio'
        });
    }

    async setupRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.recorder = new RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/wav',
                recorderType: RecordRTC.StereoAudioRecorder,
                desiredSampRate: 16000
            });
        } catch (error) {
            console.log('Microphone access not available:', error);
        }
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
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese',
            'ko': 'Korean', 'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi',
            'tr': 'Turkish', 'pl': 'Polish', 'nl': 'Dutch', 'sv': 'Swedish',
            'da': 'Danish', 'no': 'Norwegian', 'fi': 'Finnish', 'he': 'Hebrew',
            'th': 'Thai', 'vi': 'Vietnamese', 'cs': 'Czech', 'hu': 'Hungarian',
            'ro': 'Romanian', 'bg': 'Bulgarian', 'hr': 'Croatian', 'sk': 'Slovak'
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
            charCount.style.color = '#dc2626';
        } else if (currentLength > 25000) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#6b7280';
        }
    }

    async speakText() {
        const text = document.getElementById('text-input').value.trim();
        
        if (!text) {
            Swal.fire({
                icon: 'warning',
                title: 'No Text',
                text: 'Please enter some text to convert to speech.'
            });
            return;
        }

        if (text.length > 32000) {
            Swal.fire({
                icon: 'error',
                title: 'Text Too Long',
                text: 'Text is too long. Please limit to 32,000 characters.'
            });
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

        // Set parameters from enhanced sliders
        this.currentUtterance.rate = this.rateSlider.get()[0];
        this.currentUtterance.pitch = this.pitchSlider.get()[0];
        this.currentUtterance.volume = this.volumeSlider.get()[0];

        // Set language if specified
        const languageSelect = document.getElementById('language-select');
        if (languageSelect.value) {
            this.currentUtterance.lang = languageSelect.value;
        }

        // Event handlers
        this.currentUtterance.onstart = () => {
            this.updateButtonStates('speaking');
            this.animateWaveform();
        };

        this.currentUtterance.onend = () => {
            this.updateButtonStates('stopped');
            this.stopWaveformAnimation();
        };

        this.currentUtterance.onerror = (event) => {
            this.updateButtonStates('stopped');
            this.stopWaveformAnimation();
            Swal.fire({
                icon: 'error',
                title: 'Speech Error',
                text: 'Error occurred during speech synthesis: ' + event.error
            });
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
        this.stopWaveformAnimation();
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

    animateWaveform() {
        // Create fake waveform animation during speech
        const canvas = this.wavesurfer.drawer.canvas;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        const animate = () => {
            if (!this.synth.speaking) return;
            
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#007bff';
            
            for (let i = 0; i < width; i += 4) {
                const barHeight = Math.random() * height * 0.8;
                ctx.fillRect(i, (height - barHeight) / 2, 2, barHeight);
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    stopWaveformAnimation() {
        const canvas = this.wavesurfer.drawer.canvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Recording methods
    startRecording() {
        if (!this.recorder) {
            Swal.fire({
                icon: 'error',
                title: 'Microphone Not Available',
                text: 'Please allow microphone access to use recording features.'
            });
            return;
        }

        this.recorder.startRecording();
        this.isRecording = true;
        
        document.getElementById('record-btn').disabled = true;
        document.getElementById('stop-record-btn').disabled = false;
        
        Swal.fire({
            icon: 'info',
            title: 'Recording Started',
            text: 'Speak into your microphone...',
            timer: 2000,
            showConfirmButton: false
        });
    }

    stopRecording() {
        if (!this.isRecording) return;

        this.recorder.stopRecording(() => {
            this.recordedBlob = this.recorder.getBlob();
            this.isRecording = false;
            
            document.getElementById('record-btn').disabled = false;
            document.getElementById('stop-record-btn').disabled = true;
            document.getElementById('play-recording-btn').disabled = false;
            document.getElementById('download-recording-btn').disabled = false;
            
            Swal.fire({
                icon: 'success',
                title: 'Recording Complete',
                text: 'Your recording is ready to play or download.',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    playRecording() {
        if (!this.recordedBlob) return;

        const audio = new Audio();
        audio.src = URL.createObjectURL(this.recordedBlob);
        audio.play();
    }

    downloadRecording() {
        if (!this.recordedBlob) return;

        const fileName = `recording-${Date.now()}.wav`;
        invokeSaveAsDialog(this.recordedBlob, fileName);
    }

    // Preset management
    savePreset() {
        Swal.fire({
            title: 'Save Voice Preset',
            input: 'text',
            inputPlaceholder: 'Enter preset name...',
            showCancelButton: true,
            confirmButtonText: 'Save',
            preConfirm: (name) => {
                if (!name) {
                    Swal.showValidationMessage('Please enter a preset name');
                    return false;
                }
                return name;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const preset = {
                    voice: document.getElementById('voice-select').value,
                    rate: this.rateSlider.get()[0],
                    pitch: this.pitchSlider.get()[0],
                    volume: this.volumeSlider.get()[0],
                    language: document.getElementById('language-select').value
                };
                
                this.presets[result.value] = preset;
                localStorage.setItem('tts-presets', JSON.stringify(this.presets));
                this.loadPresets();
                
                Swal.fire('Saved!', 'Your voice preset has been saved.', 'success');
            }
        });
    }

    loadPresets() {
        const select = document.getElementById('preset-select');
        select.innerHTML = '<option value="">Select Preset...</option>';
        
        Object.keys(this.presets).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    }

    loadExample(type) {
        if (this.examples[type]) {
            document.getElementById('text-input').value = this.examples[type];
            this.updateCharCounter();
            
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

// Global functions for HTML onclick events
function savePreset() {
    if (window.enhancedTTSConverter) {
        window.enhancedTTSConverter.savePreset();
    }
}

function loadPreset() {
    const select = document.getElementById('preset-select');
    const presetName = select.value;
    
    if (presetName && window.enhancedTTSConverter) {
        const preset = window.enhancedTTSConverter.presets[presetName];
        if (preset) {
            document.getElementById('voice-select').value = preset.voice;
            window.enhancedTTSConverter.rateSlider.set([preset.rate]);
            window.enhancedTTSConverter.pitchSlider.set([preset.pitch]);
            window.enhancedTTSConverter.volumeSlider.set([preset.volume]);
            document.getElementById('language-select').value = preset.language;
            
            Swal.fire('Loaded!', 'Voice preset has been applied.', 'success');
        }
    }
}

function deletePreset() {
    const select = document.getElementById('preset-select');
    const presetName = select.value;
    
    if (presetName && window.enhancedTTSConverter) {
        Swal.fire({
            title: 'Delete Preset?',
            text: `Are you sure you want to delete "${presetName}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                delete window.enhancedTTSConverter.presets[presetName];
                localStorage.setItem('tts-presets', JSON.stringify(window.enhancedTTSConverter.presets));
                window.enhancedTTSConverter.loadPresets();
                
                Swal.fire('Deleted!', 'Your preset has been deleted.', 'success');
            }
        });
    }
}

function copyTextToClipboard() {
    const text = document.getElementById('text-input').value;
    if (text) {
        new ClipboardJS('.copy-btn', {
            text: () => text
        });
        
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Text copied to clipboard.',
            timer: 1500,
            showConfirmButton: false
        });
    }
}

function downloadAudio() {
    Swal.fire({
        icon: 'info',
        title: 'Audio Download',
        text: 'This feature will be available in a future update.',
        timer: 2000,
        showConfirmButton: false
    });
}

function shareText() {
    const text = document.getElementById('text-input').value;
    if (navigator.share && text) {
        navigator.share({
            title: 'Text to Speech',
            text: text
        });
    } else {
        copyTextToClipboard();
    }
}

function openFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
}

// Initialize the enhanced converter when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedTTSConverter = new EnhancedTextToSpeechConverter();
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
});
