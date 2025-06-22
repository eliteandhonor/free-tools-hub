# Speech Synthesis Libraries

This directory contains specialized libraries for enhancing text-to-speech functionality.

## Library Overview

| Library | Version | Size | Purpose | License |
|---------|---------|------|---------|---------|
| WaveSurfer.js | 7.8.6 | 28KB | Audio visualization and waveform display | BSD-3-Clause |
| RecordRTC | 5.6.2 | 77KB | Audio recording capabilities | MIT |
| noUiSlider | 15.8.1 | 32KB | Enhanced slider controls | WTFPL |
| SweetAlert2 | 11.14.5 | 71KB | Beautiful notifications and alerts | MIT |
| Clipboard.js | 2.0.11 | 9KB | Copy-to-clipboard functionality | MIT |

**Total Size**: ~217KB

## Integration Guide

### WaveSurfer.js
**Purpose**: Audio visualization, waveform display, and audio playback controls
```html
<script src="../../vendor/speechsynthesis-libs/wavesurfer.min.js"></script>
```

### RecordRTC
**Purpose**: Record audio, compare original vs synthesized speech
```html
<script src="../../vendor/speechsynthesis-libs/recordrtc.min.js"></script>
```

### noUiSlider
**Purpose**: Better slider controls for rate, pitch, and volume
```html
<link rel="stylesheet" href="../../vendor/speechsynthesis-libs/nouislider.min.css">
<script src="../../vendor/speechsynthesis-libs/nouislider.min.js"></script>
```

### SweetAlert2
**Purpose**: Beautiful notifications and confirmations
```html
<link rel="stylesheet" href="../../vendor/speechsynthesis-libs/sweetalert2.min.css">
<script src="../../vendor/speechsynthesis-libs/sweetalert2.min.js"></script>
```

### Clipboard.js
**Purpose**: Copy text and share generated audio
```html
<script src="../../vendor/speechsynthesis-libs/clipboard.min.js"></script>
```

## Features Enabled

1. **Audio Visualization**: Real-time waveform display during speech synthesis
2. **Enhanced Controls**: Better sliders with precise control
3. **Audio Recording**: Record and compare synthesized speech
4. **Beautiful Notifications**: Professional alerts and confirmations  
5. **Copy/Share**: Easy sharing of text and audio
6. **Voice Analysis**: Visualize speech patterns and quality
7. **Preset Management**: Save and load voice presets
8. **Export Options**: Download generated audio files

## File Integrity

All files are cached locally for:
- Offline functionality
- Faster loading times
- Version consistency
- Security and privacy
- Reduced external dependencies
