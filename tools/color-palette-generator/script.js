// Color Palette Generator Tool
class ColorPaletteGenerator {
    constructor() {
        this.currentHarmony = 'monochromatic';
        this.currentPalette = [];
        this.init();
    }
    
    init() {
        this.generatePalette();
    }
    
    selectHarmony(harmonyType) {
        // Remove active class from all harmony types
        document.querySelectorAll('.harmony-type').forEach(type => {
            type.classList.remove('active');
        });
        
        // Add active class to selected harmony type
        document.getElementById(harmonyType === 'monochromatic' ? 'mono' : 
                               harmonyType === 'analogous' ? 'analog' :
                               harmonyType === 'complementary' ? 'comp' :
                               harmonyType === 'triadic' ? 'triad' : 'tetrad').classList.add('active');
        
        this.currentHarmony = harmonyType;
        this.generatePalette();
        
        // Update ARIA attributes for accessibility
        const harmonyButtons = document.querySelectorAll('[role="radio"]');
        harmonyButtons.forEach(button => {
            const isActive = button.id === 
                (harmonyType === 'monochromatic' ? 'mono' : 
                 harmonyType === 'analogous' ? 'analog' :
                 harmonyType === 'complementary' ? 'comp' :
                 harmonyType === 'triadic' ? 'triad' : 'tetrad');
            
            button.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
    }
    
    generatePalette() {
        const baseColor = document.getElementById('baseColor').value;
        const hsl = this.hexToHsl(baseColor);
        
        let colors = [];
        
        switch (this.currentHarmony) {
            case 'monochromatic':
                colors = this.generateMonochromatic(hsl);
                break;
            case 'analogous':
                colors = this.generateAnalogous(hsl);
                break;
            case 'complementary':
                colors = this.generateComplementary(hsl);
                break;
            case 'triadic':
                colors = this.generateTriadic(hsl);
                break;
            case 'tetradic':
                colors = this.generateTetradic(hsl);
                break;
        }
        
        this.currentPalette = colors;
        this.displayPalette(colors);
        this.updateExportFormats(colors);
    }
    
    generateMonochromatic(hsl) {
        const [h, s, l] = hsl;
        return [
            this.hslToHex([h, s, Math.max(10, l - 30)]),
            this.hslToHex([h, s, Math.max(10, l - 15)]),
            this.hslToHex([h, s, l]),
            this.hslToHex([h, s, Math.min(90, l + 15)]),
            this.hslToHex([h, s, Math.min(90, l + 30)])
        ];
    }
    
    generateAnalogous(hsl) {
        const [h, s, l] = hsl;
        return [
            this.hslToHex([(h - 60 + 360) % 360, s, l]),
            this.hslToHex([(h - 30 + 360) % 360, s, l]),
            this.hslToHex([h, s, l]),
            this.hslToHex([(h + 30) % 360, s, l]),
            this.hslToHex([(h + 60) % 360, s, l])
        ];
    }
    
    generateComplementary(hsl) {
        const [h, s, l] = hsl;
        const complementary = (h + 180) % 360;
        return [
            this.hslToHex([h, s, Math.max(10, l - 20)]),
            this.hslToHex([h, s, l]),
            this.hslToHex([h, s, Math.min(90, l + 20)]),
            this.hslToHex([complementary, s, l]),
            this.hslToHex([complementary, s, Math.min(90, l + 20)])
        ];
    }
    
    generateTriadic(hsl) {
        const [h, s, l] = hsl;
        return [
            this.hslToHex([h, s, l]),
            this.hslToHex([(h + 120) % 360, s, l]),
            this.hslToHex([(h + 240) % 360, s, l]),
            this.hslToHex([h, s, Math.min(90, l + 20)]),
            this.hslToHex([(h + 120) % 360, s, Math.min(90, l + 20)])
        ];
    }
    
    generateTetradic(hsl) {
        const [h, s, l] = hsl;
        return [
            this.hslToHex([h, s, l]),
            this.hslToHex([(h + 90) % 360, s, l]),
            this.hslToHex([(h + 180) % 360, s, l]),
            this.hslToHex([(h + 270) % 360, s, l]),
            this.hslToHex([h, s, Math.min(90, l + 15)])
        ];
    }
    
    displayPalette(colors) {
        const container = document.getElementById('paletteContainer');
        container.innerHTML = '';
        
        colors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            
            // Improve accessibility of swatches
            swatch.setAttribute('role', 'button');
            swatch.setAttribute('tabindex', '0');
            swatch.setAttribute('aria-label', `Color ${index + 1}: ${color}. Click to copy to clipboard`);
            
            // Support keyboard interaction
            swatch.addEventListener('click', () => this.copyColorToClipboard(color));
            swatch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.copyColorToClipboard(color);
                }
            });
            
            // Check if color is light or dark for better contrast
            const [h, s, l] = this.hexToHsl(color);
            if (l > 70) {
                swatch.classList.add('light-color');
            }
            
            const info = document.createElement('div');
            info.className = 'color-info';
            info.textContent = color.toUpperCase();
            info.setAttribute('aria-hidden', 'true'); // Already announced in the parent's aria-label
            
            swatch.appendChild(info);
            container.appendChild(swatch);
        });
        
        document.getElementById('exportSection').style.display = 'block';
    }
    
    updateExportFormats(colors) {
        // CSS Variables
        const cssVars = colors.map((color, index) => `  --color-${index + 1}: ${color};`).join('\n');
        document.getElementById('cssFormat').textContent = `:root {\n${cssVars}\n}`;
        
        // JSON
        const jsonColors = colors.reduce((obj, color, index) => {
            obj[`color${index + 1}`] = color;
            return obj;
        }, {});
        document.getElementById('jsonFormat').textContent = JSON.stringify(jsonColors, null, 2);
        
        // SCSS Variables
        const scssVars = colors.map((color, index) => `$color-${index + 1}: ${color};`).join('\n');
        document.getElementById('scssFormat').textContent = scssVars;
        
        // Array
        document.getElementById('arrayFormat').textContent = `[${colors.map(c => `"${c}"`).join(', ')}]`;
    }
    
    randomizeBase() {
        const randomHue = Math.floor(Math.random() * 360);
        const randomSat = Math.floor(Math.random() * 40) + 60; // 60-100%
        const randomLight = Math.floor(Math.random() * 40) + 30; // 30-70%
        
        const randomColor = this.hslToHex([randomHue, randomSat, randomLight]);
        document.getElementById('baseColor').value = randomColor;
        this.generatePalette();
    }
    
    copyColorToClipboard(color) {
        navigator.clipboard.writeText(color).then(() => {
            // Use the unified notification system
            if (window.showNotification) {
                window.showNotification(`Copied ${color} to clipboard!`, 'success');
            } else {
                // Fallback for older browsers or if the unified notification isn't available
                const toast = document.createElement('div');
                toast.className = 'notification notification-success';
                toast.innerHTML = `<i class="fas fa-check-circle" aria-hidden="true"></i> <span>Copied ${color} to clipboard!</span>`;
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.classList.add('show');
                }, 10);
                
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        if (toast.parentNode) {
                            document.body.removeChild(toast);
                        }
                    }, 300);
                }, 2000);
            }
        }).catch(() => {
            if (window.showNotification) {
                window.showNotification(`Color code: ${color}. Please copy manually.`, 'error');
            } else {
                alert(`Color code: ${color}`);
            }
        });
    }
    
    copyPalette() {
        const paletteText = this.currentPalette.join(', ');
        navigator.clipboard.writeText(paletteText).then(() => {
            if (window.showNotification) {
                window.showNotification('All palette colors copied to clipboard!', 'success');
            } else {
                // Temporary feedback
                const copyBtn = document.querySelector('button[onclick="copyPalette()"]');
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
                copyBtn.classList.remove('btn-outline-primary');
                copyBtn.classList.add('btn-success');
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.classList.remove('btn-success');
                    copyBtn.classList.add('btn-outline-primary');
                }, 2000);
            }
        }).catch(() => {
            if (window.showNotification) {
                window.showNotification('Failed to copy palette. Please copy manually.', 'error');
            } else {
                alert('Failed to copy palette. Please copy manually.');
            }
        });
    }
    
    downloadPalette() {
        const paletteData = {
            harmony: this.currentHarmony,
            baseColor: document.getElementById('baseColor').value,
            colors: this.currentPalette,
            exportFormats: {
                css: document.getElementById('cssFormat').textContent,
                scss: document.getElementById('scssFormat').textContent,
                json: JSON.parse(document.getElementById('jsonFormat').textContent),
                array: this.currentPalette
            }
        };
        
        const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `color-palette-${this.currentHarmony}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Color conversion utilities
    hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }
    
    hslToHex(hsl) {
        const [h, s, l] = [hsl[0] / 360, hsl[1] / 100, hsl[2] / 100];
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
}

// Global functions for button clicks
function selectHarmony(harmonyType) {
    // Update the class-based generator functionality
    generator.selectHarmony(harmonyType);
    
    // Update ARIA attributes for accessibility
    const harmonyButtons = document.querySelectorAll('[role="radio"]');
    harmonyButtons.forEach(button => {
        const isActive = button.id === 
            (harmonyType === 'monochromatic' ? 'mono' : 
             harmonyType === 'analogous' ? 'analog' :
             harmonyType === 'complementary' ? 'comp' :
             harmonyType === 'triadic' ? 'triad' : 'tetrad');
        
        button.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
}

function generatePalette() {
    generator.generatePalette();
}

function randomizeBase() {
    generator.randomizeBase();
}

function copyPalette() {
    generator.copyPalette();
}

function downloadPalette() {
    generator.downloadPalette();
}

// Initialize when page loads
let generator;
document.addEventListener('DOMContentLoaded', function() {
    generator = new ColorPaletteGenerator();
    
    // Add keyboard accessibility to harmony type buttons
    const harmonyButtons = document.querySelectorAll('.harmony-type');
    harmonyButtons.forEach(button => {
        // Make harmony buttons accessible via keyboard
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        
        // Add keyboard event listener
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Extract the harmony type from the button ID
                const harmonyType = button.id === 'mono' ? 'monochromatic' :
                                    button.id === 'analog' ? 'analogous' :
                                    button.id === 'comp' ? 'complementary' :
                                    button.id === 'triad' ? 'triadic' : 'tetradic';
                selectHarmony(harmonyType);
            }
        });
        
        // Set appropriate ARIA labels
        const harmonyName = button.querySelector('strong').textContent;
        const harmonyDesc = button.querySelector('small').textContent;
        button.setAttribute('aria-label', `${harmonyName}: ${harmonyDesc}`);
    });
});
