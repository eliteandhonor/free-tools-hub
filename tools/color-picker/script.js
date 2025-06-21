// Color Picker Script

class ColorPicker {
    constructor() {
        this.currentColor = '#3b82f6';
        this.palette = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateColor(this.currentColor);
        this.setupInputTabs();
    }

    bindEvents() {
        // Main color input
        document.getElementById('color-input').addEventListener('input', (e) => {
            this.updateColor(e.target.value);
        });

        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.closest('.copy-btn').dataset.target;
                this.copyToClipboard(targetId);
            });
        });

        // Manual input tabs
        document.querySelectorAll('.input-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                this.switchInputTab(format);
            });
        });

        // Manual inputs
        document.getElementById('manual-hex').addEventListener('input', (e) => {
            this.updateFromManualInput('hex', e.target.value);
        });

        ['manual-r', 'manual-g', 'manual-b'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateFromRGBInputs();
            });
        });

        ['manual-h', 'manual-s', 'manual-l'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateFromHSLInputs();
            });
        });

        // Harmony buttons
        document.querySelectorAll('.harmony-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.generateHarmony(e.target.dataset.type);
            });
        });

        // Palette controls
        document.getElementById('add-to-palette').addEventListener('click', () => {
            this.addToPalette();
        });

        document.getElementById('clear-palette').addEventListener('click', () => {
            this.clearPalette();
        });

        document.getElementById('export-palette').addEventListener('click', () => {
            this.exportPalette();
        });

        // Predefined palettes
        document.querySelectorAll('.palette-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const colors = e.currentTarget.dataset.colors.split(',');
                this.loadPredefinedPalette(colors);
            });
        });
    }

    setupInputTabs() {
        this.switchInputTab('hex');
    }

    switchInputTab(format) {
        // Update tab buttons
        document.querySelectorAll('.input-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-format="${format}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.input-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${format}-input-panel`).classList.add('active');
    }

    updateColor(color) {
        if (!this.isValidColor(color)) return;

        this.currentColor = color;
        
        // Update color display
        document.getElementById('color-display').style.backgroundColor = color;
        document.getElementById('color-input').value = color;

        // Update all color format displays
        const rgb = this.hexToRgb(color);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);

        document.getElementById('hex-value').value = color.toUpperCase();
        document.getElementById('rgb-value').value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        document.getElementById('hsl-value').value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        document.getElementById('hsv-value').value = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;

        // Update manual inputs
        this.updateManualInputs(color, rgb, hsl);
    }

    updateManualInputs(hex, rgb, hsl) {
        document.getElementById('manual-hex').value = hex;
        document.getElementById('manual-r').value = rgb.r;
        document.getElementById('manual-g').value = rgb.g;
        document.getElementById('manual-b').value = rgb.b;
        document.getElementById('manual-h').value = hsl.h;
        document.getElementById('manual-s').value = hsl.s;
        document.getElementById('manual-l').value = hsl.l;
    }

    updateFromManualInput(type, value) {
        if (type === 'hex') {
            if (this.isValidHex(value)) {
                this.updateColor(value);
            }
        }
    }

    updateFromRGBInputs() {
        const r = parseInt(document.getElementById('manual-r').value) || 0;
        const g = parseInt(document.getElementById('manual-g').value) || 0;
        const b = parseInt(document.getElementById('manual-b').value) || 0;
        
        if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
            const hex = this.rgbToHex(r, g, b);
            this.updateColor(hex);
        }
    }

    updateFromHSLInputs() {
        const h = parseInt(document.getElementById('manual-h').value) || 0;
        const s = parseInt(document.getElementById('manual-s').value) || 0;
        const l = parseInt(document.getElementById('manual-l').value) || 0;
        
        if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
            const rgb = this.hslToRgb(h, s, l);
            const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
            this.updateColor(hex);
        }
    }

    generateHarmony(type) {
        const rgb = this.hexToRgb(this.currentColor);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        let colors = [];

        switch (type) {
            case 'complementary':
                colors = this.getComplementary(hsl);
                break;
            case 'triadic':
                colors = this.getTriadic(hsl);
                break;
            case 'tetradic':
                colors = this.getTetradic(hsl);
                break;
            case 'analogous':
                colors = this.getAnalogous(hsl);
                break;
            case 'monochromatic':
                colors = this.getMonochromatic(hsl);
                break;
        }

        this.displayHarmonyColors(colors, type);
    }

    getComplementary(hsl) {
        const complementaryH = (hsl.h + 180) % 360;
        const baseRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        const compRgb = this.hslToRgb(complementaryH, hsl.s, hsl.l);
        
        return [
            this.rgbToHex(baseRgb.r, baseRgb.g, baseRgb.b),
            this.rgbToHex(compRgb.r, compRgb.g, compRgb.b)
        ];
    }

    getTriadic(hsl) {
        const colors = [];
        for (let i = 0; i < 3; i++) {
            const h = (hsl.h + (i * 120)) % 360;
            const rgb = this.hslToRgb(h, hsl.s, hsl.l);
            colors.push(this.rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        return colors;
    }

    getTetradic(hsl) {
        const colors = [];
        for (let i = 0; i < 4; i++) {
            const h = (hsl.h + (i * 90)) % 360;
            const rgb = this.hslToRgb(h, hsl.s, hsl.l);
            colors.push(this.rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        return colors;
    }

    getAnalogous(hsl) {
        const colors = [];
        for (let i = -2; i <= 2; i++) {
            const h = (hsl.h + (i * 30) + 360) % 360;
            const rgb = this.hslToRgb(h, hsl.s, hsl.l);
            colors.push(this.rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        return colors;
    }

    getMonochromatic(hsl) {
        const colors = [];
        const lightnesses = [20, 40, 60, 80, 95];
        
        lightnesses.forEach(l => {
            const rgb = this.hslToRgb(hsl.h, hsl.s, l);
            colors.push(this.rgbToHex(rgb.r, rgb.g, rgb.b));
        });
        
        return colors;
    }

    displayHarmonyColors(colors, type) {
        const container = document.getElementById('harmony-colors');
        container.innerHTML = `
            <h3>${this.capitalizeFirst(type)} Colors</h3>
            <div class="harmony-grid">
                ${colors.map(color => `
                    <div class="harmony-color" style="background-color: ${color};" data-color="${color}">
                        <div class="harmony-info">
                            <div class="harmony-hex">${color.toUpperCase()}</div>
                            <button class="harmony-copy" onclick="colorPickerInstance.copyColor('${color}')">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="harmony-use" onclick="colorPickerInstance.updateColor('${color}')">
                                <i class="fas fa-eye-dropper"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    addToPalette() {
        if (!this.palette.includes(this.currentColor)) {
            this.palette.push(this.currentColor);
            this.updatePaletteDisplay();
            this.showNotification('Color added to palette!', 'success');
        } else {
            this.showNotification('Color already in palette!', 'warning');
        }
    }

    clearPalette() {
        this.palette = [];
        this.updatePaletteDisplay();
        this.showNotification('Palette cleared!', 'success');
    }

    updatePaletteDisplay() {
        const container = document.getElementById('palette-colors');
        
        if (this.palette.length === 0) {
            container.innerHTML = `
                <div class="empty-palette">
                    <i class="fas fa-palette"></i>
                    <p>No colors in palette. Add colors to create your custom palette.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.palette.map((color, index) => `
            <div class="palette-color" style="background-color: ${color};" data-color="${color}">
                <div class="palette-info">
                    <div class="palette-hex">${color.toUpperCase()}</div>
                    <div class="palette-actions">
                        <button class="palette-copy" onclick="colorPickerInstance.copyColor('${color}')">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="palette-use" onclick="colorPickerInstance.updateColor('${color}')">
                            <i class="fas fa-eye-dropper"></i>
                        </button>
                        <button class="palette-remove" onclick="colorPickerInstance.removeFromPalette(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    removeFromPalette(index) {
        this.palette.splice(index, 1);
        this.updatePaletteDisplay();
        this.showNotification('Color removed from palette!', 'success');
    }

    loadPredefinedPalette(colors) {
        this.palette = colors;
        this.updatePaletteDisplay();
        this.showNotification('Palette loaded!', 'success');
    }

    exportPalette() {
        if (this.palette.length === 0) {
            this.showNotification('No colors in palette to export!', 'warning');
            return;
        }

        const paletteData = {
            name: 'Custom Palette',
            colors: this.palette.map(color => {
                const rgb = this.hexToRgb(color);
                const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
                return {
                    hex: color,
                    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
                };
            }),
            exported: new Date().toISOString()
        };

        // Create and download file
        const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'color-palette.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Palette exported successfully!', 'success');
    }

    copyColor(color) {
        navigator.clipboard.writeText(color).then(() => {
            this.showNotification(`${color} copied to clipboard!`, 'success');
        }).catch(() => {
            this.showNotification('Failed to copy color', 'error');
        });
    }

    copyToClipboard(targetId) {
        const input = document.getElementById(targetId);
        input.select();
        input.setSelectionRange(0, 99999);

        try {
            document.execCommand('copy');
            this.showNotification('Copied to clipboard!', 'success');
        } catch (err) {
            navigator.clipboard.writeText(input.value).then(() => {
                this.showNotification('Copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy', 'error');
            });
        }
    }

    // Color conversion utilities
    isValidColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    isValidHex(hex) {
        return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

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

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

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

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        let h = 0;
        const s = max === 0 ? 0 : diff / max;
        const v = max;

        if (diff !== 0) {
            switch (max) {
                case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
                case g: h = (b - r) / diff + 2; break;
                case b: h = (r - g) / diff + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100)
        };
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
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
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
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

// Global instance for onclick handlers
let colorPickerInstance;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    colorPickerInstance = new ColorPicker();
});
