// Hex to RGB Color Converter Script

class ColorConverter {
    constructor() {
        this.currentColor = { r: 255, g: 87, b: 51 }; // Default orange color
        this.isUpdating = false;
        this.activePaletteType = 'complementary';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setDefaultColor();
        this.updateAllFormats();
        this.generatePalette();
    }

    bindEvents() {
        // Color picker
        document.getElementById('color-picker').addEventListener('input', (e) => this.handleColorPicker(e));

        // HEX input
        document.getElementById('hex-input').addEventListener('input', (e) => this.handleHexInput(e));

        // RGB inputs
        document.getElementById('rgb-r').addEventListener('input', () => this.handleRGBInput());
        document.getElementById('rgb-g').addEventListener('input', () => this.handleRGBInput());
        document.getElementById('rgb-b').addEventListener('input', () => this.handleRGBInput());

        // HSL inputs
        document.getElementById('hsl-h').addEventListener('input', () => this.handleHSLInput());
        document.getElementById('hsl-s').addEventListener('input', () => this.handleHSLInput());
        document.getElementById('hsl-l').addEventListener('input', () => this.handleHSLInput());

        // HSV inputs
        document.getElementById('hsv-h').addEventListener('input', () => this.handleHSVInput());
        document.getElementById('hsv-s').addEventListener('input', () => this.handleHSVInput());
        document.getElementById('hsv-v').addEventListener('input', () => this.handleHSVInput());

        // Copy buttons
        document.querySelectorAll('.copy-btn, .copy-btn-small').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCopy(e));
        });

        // Palette buttons
        document.querySelectorAll('.palette-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePaletteType(e));
        });

        // Action buttons
        document.getElementById('random-color-btn').addEventListener('click', () => this.generateRandomColor());
        document.getElementById('clear-all-btn').addEventListener('click', () => this.clearAll());
    }

    setDefaultColor() {
        const defaultHex = '#FF5733';
        document.getElementById('hex-input').value = defaultHex;
        this.currentColor = this.hexToRgb(defaultHex);
    }

    handleColorPicker(event) {
        if (this.isUpdating) return;
        
        const hex = event.target.value;
        this.currentColor = this.hexToRgb(hex);
        this.updateAllFormats();
        this.generatePalette();
    }

    handleHexInput(event) {
        if (this.isUpdating) return;
        
        const hex = event.target.value.trim();
        if (this.isValidHex(hex)) {
            this.currentColor = this.hexToRgb(hex);
            this.updateAllFormats();
            this.generatePalette();
        }
    }

    handleRGBInput() {
        if (this.isUpdating) return;
        
        const r = parseInt(document.getElementById('rgb-r').value) || 0;
        const g = parseInt(document.getElementById('rgb-g').value) || 0;
        const b = parseInt(document.getElementById('rgb-b').value) || 0;
        
        if (this.isValidRGB(r, g, b)) {
            this.currentColor = { r, g, b };
            this.updateAllFormats();
            this.generatePalette();
        }
    }

    handleHSLInput() {
        if (this.isUpdating) return;
        
        const h = parseInt(document.getElementById('hsl-h').value) || 0;
        const s = parseInt(document.getElementById('hsl-s').value) || 0;
        const l = parseInt(document.getElementById('hsl-l').value) || 0;
        
        if (this.isValidHSL(h, s, l)) {
            this.currentColor = this.hslToRgb(h, s, l);
            this.updateAllFormats();
            this.generatePalette();
        }
    }

    handleHSVInput() {
        if (this.isUpdating) return;
        
        const h = parseInt(document.getElementById('hsv-h').value) || 0;
        const s = parseInt(document.getElementById('hsv-s').value) || 0;
        const v = parseInt(document.getElementById('hsv-v').value) || 0;
        
        if (this.isValidHSV(h, s, v)) {
            this.currentColor = this.hsvToRgb(h, s, v);
            this.updateAllFormats();
            this.generatePalette();
        }
    }

    updateAllFormats() {
        this.isUpdating = true;
        
        const { r, g, b } = this.currentColor;
        const hex = this.rgbToHex(r, g, b);
        const hsl = this.rgbToHsl(r, g, b);
        const hsv = this.rgbToHsv(r, g, b);
        
        // Update color picker
        document.getElementById('color-picker').value = hex;
        
        // Update HEX input
        document.getElementById('hex-input').value = hex;
        
        // Update RGB inputs
        document.getElementById('rgb-r').value = r;
        document.getElementById('rgb-g').value = g;
        document.getElementById('rgb-b').value = b;
        
        // Update HSL inputs
        document.getElementById('hsl-h').value = Math.round(hsl.h);
        document.getElementById('hsl-s').value = Math.round(hsl.s);
        document.getElementById('hsl-l').value = Math.round(hsl.l);
        
        // Update HSV inputs
        document.getElementById('hsv-h').value = Math.round(hsv.h);
        document.getElementById('hsv-s').value = Math.round(hsv.s);
        document.getElementById('hsv-v').value = Math.round(hsv.v);
        
        // Update output formats\n        document.getElementById('output-hex').value = hex;\n        document.getElementById('output-rgb').value = `${r}, ${g}, ${b}`;\n        document.getElementById('output-hsl').value = `${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%`;\n        document.getElementById('output-hsv').value = `${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%`;\n        document.getElementById('output-css-rgb').value = `rgb(${r}, ${g}, ${b})`;\n        document.getElementById('output-css-hsl').value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;\n        \n        // Update color preview\n        document.getElementById('color-preview').style.backgroundColor = hex;\n        \n        // Update color name\n        this.updateColorName(hex);\n        \n        this.isUpdating = false;\n    }\n\n    updateColorName(hex) {\n        const colorName = this.getColorName(hex);\n        document.getElementById('color-name').textContent = colorName;\n    }\n\n    getColorName(hex) {\n        const { r, g, b } = this.hexToRgb(hex);\n        const hsl = this.rgbToHsl(r, g, b);\n        \n        // Basic color naming based on hue\n        const h = hsl.h;\n        const s = hsl.s;\n        const l = hsl.l;\n        \n        if (s < 10) {\n            if (l < 20) return 'Very Dark Gray';\n            if (l < 40) return 'Dark Gray';\n            if (l < 60) return 'Gray';\n            if (l < 80) return 'Light Gray';\n            return 'Very Light Gray';\n        }\n        \n        let colorName = '';\n        \n        if (h < 15 || h >= 345) colorName = 'Red';\n        else if (h < 45) colorName = 'Orange';\n        else if (h < 75) colorName = 'Yellow';\n        else if (h < 105) colorName = 'Yellow Green';\n        else if (h < 135) colorName = 'Green';\n        else if (h < 165) colorName = 'Blue Green';\n        else if (h < 195) colorName = 'Cyan';\n        else if (h < 225) colorName = 'Blue';\n        else if (h < 255) colorName = 'Blue Violet';\n        else if (h < 285) colorName = 'Violet';\n        else if (h < 315) colorName = 'Magenta';\n        else colorName = 'Red Violet';\n        \n        // Add lightness descriptors\n        if (l < 25) colorName = 'Very Dark ' + colorName;\n        else if (l < 40) colorName = 'Dark ' + colorName;\n        else if (l > 75) colorName = 'Light ' + colorName;\n        else if (l > 90) colorName = 'Very Light ' + colorName;\n        \n        return colorName + ` (${hex.toUpperCase()})`;\n    }\n\n    generatePalette() {\n        const palettes = {\n            complementary: this.generateComplementary(),\n            triadic: this.generateTriadic(),\n            analogous: this.generateAnalogous(),\n            monochromatic: this.generateMonochromatic()\n        };\n        \n        this.displayPalette(palettes[this.activePaletteType]);\n    }\n\n    generateComplementary() {\n        const { r, g, b } = this.currentColor;\n        const hsl = this.rgbToHsl(r, g, b);\n        const complementaryHue = (hsl.h + 180) % 360;\n        \n        const original = this.rgbToHex(r, g, b);\n        const complementary = this.hslToHex(complementaryHue, hsl.s, hsl.l);\n        \n        return [original, complementary];\n    }\n\n    generateTriadic() {\n        const { r, g, b } = this.currentColor;\n        const hsl = this.rgbToHsl(r, g, b);\n        \n        const original = this.rgbToHex(r, g, b);\n        const triadic1 = this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l);\n        const triadic2 = this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l);\n        \n        return [original, triadic1, triadic2];\n    }\n\n    generateAnalogous() {\n        const { r, g, b } = this.currentColor;\n        const hsl = this.rgbToHsl(r, g, b);\n        \n        const colors = [];\n        for (let i = -2; i <= 2; i++) {\n            const hue = (hsl.h + (i * 30) + 360) % 360;\n            colors.push(this.hslToHex(hue, hsl.s, hsl.l));\n        }\n        \n        return colors;\n    }\n\n    generateMonochromatic() {\n        const { r, g, b } = this.currentColor;\n        const hsl = this.rgbToHsl(r, g, b);\n        \n        const colors = [];\n        const lightnesses = [20, 40, 60, 80, 95];\n        \n        lightnesses.forEach(l => {\n            colors.push(this.hslToHex(hsl.h, hsl.s, l));\n        });\n        \n        return colors;\n    }\n\n    displayPalette(colors) {\n        const palettePreview = document.getElementById('palette-preview');\n        palettePreview.innerHTML = '';\n        \n        colors.forEach((color, index) => {\n            const colorItem = document.createElement('div');\n            colorItem.className = 'palette-color';\n            colorItem.style.backgroundColor = color;\n            colorItem.title = `Click to copy ${color}`;\n            \n            const colorLabel = document.createElement('span');\n            colorLabel.className = 'palette-color-label';\n            colorLabel.textContent = color.toUpperCase();\n            \n            colorItem.appendChild(colorLabel);\n            colorItem.addEventListener('click', () => {\n                this.copyToClipboard(color, `Color ${color} copied!`);\n                // Also update current color if it's not the original\n                if (index !== 0 || this.activePaletteType !== 'complementary') {\n                    this.currentColor = this.hexToRgb(color);\n                    this.updateAllFormats();\n                }\n            });\n            \n            palettePreview.appendChild(colorItem);\n        });\n    }\n\n    handlePaletteType(event) {\n        document.querySelectorAll('.palette-btn').forEach(btn => btn.classList.remove('active'));\n        event.target.classList.add('active');\n        \n        this.activePaletteType = event.target.dataset.type;\n        this.generatePalette();\n    }\n\n    handleCopy(event) {\n        const target = event.target.closest('button').dataset.target;\n        const format = event.target.closest('button').dataset.format;\n        \n        let textToCopy = '';\n        \n        if (target) {\n            textToCopy = document.getElementById(target).value;\n        } else if (format) {\n            const { r, g, b } = this.currentColor;\n            const hsl = this.rgbToHsl(r, g, b);\n            const hsv = this.rgbToHsv(r, g, b);\n            \n            switch (format) {\n                case 'rgb':\n                    textToCopy = `rgb(${r}, ${g}, ${b})`;\n                    break;\n                case 'hsl':\n                    textToCopy = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;\n                    break;\n                case 'hsv':\n                    textToCopy = `${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%`;\n                    break;\n            }\n        }\n        \n        if (textToCopy) {\n            this.copyToClipboard(textToCopy, `${format ? format.toUpperCase() : 'Color'} value copied!`);\n        }\n    }\n\n    generateRandomColor() {\n        const r = Math.floor(Math.random() * 256);\n        const g = Math.floor(Math.random() * 256);\n        const b = Math.floor(Math.random() * 256);\n        \n        this.currentColor = { r, g, b };\n        this.updateAllFormats();\n        this.generatePalette();\n        \n        this.showNotification('Random color generated!', 'success');\n    }\n\n    clearAll() {\n        this.isUpdating = true;\n        \n        // Clear all inputs\n        document.getElementById('hex-input').value = '';\n        document.getElementById('rgb-r').value = '';\n        document.getElementById('rgb-g').value = '';\n        document.getElementById('rgb-b').value = '';\n        document.getElementById('hsl-h').value = '';\n        document.getElementById('hsl-s').value = '';\n        document.getElementById('hsl-l').value = '';\n        document.getElementById('hsv-h').value = '';\n        document.getElementById('hsv-s').value = '';\n        document.getElementById('hsv-v').value = '';\n        \n        // Clear outputs\n        document.querySelectorAll('.output-value input').forEach(input => {\n            input.value = '';\n        });\n        \n        // Reset color preview\n        document.getElementById('color-preview').style.backgroundColor = '#ffffff';\n        document.getElementById('color-name').textContent = 'Select or enter a color';\n        \n        // Clear palette\n        document.getElementById('palette-preview').innerHTML = '';\n        \n        this.isUpdating = false;\n        this.showNotification('All fields cleared!', 'success');\n    }\n\n    // Color conversion methods\n    hexToRgb(hex) {\n        const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);\n        return result ? {\n            r: parseInt(result[1], 16),\n            g: parseInt(result[2], 16),\n            b: parseInt(result[3], 16)\n        } : { r: 0, g: 0, b: 0 };\n    }\n\n    rgbToHex(r, g, b) {\n        return \"#\" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);\n    }\n\n    rgbToHsl(r, g, b) {\n        r /= 255;\n        g /= 255;\n        b /= 255;\n        \n        const max = Math.max(r, g, b);\n        const min = Math.min(r, g, b);\n        let h, s, l = (max + min) / 2;\n        \n        if (max === min) {\n            h = s = 0; // achromatic\n        } else {\n            const d = max - min;\n            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);\n            \n            switch (max) {\n                case r: h = (g - b) / d + (g < b ? 6 : 0); break;\n                case g: h = (b - r) / d + 2; break;\n                case b: h = (r - g) / d + 4; break;\n            }\n            h /= 6;\n        }\n        \n        return {\n            h: h * 360,\n            s: s * 100,\n            l: l * 100\n        };\n    }\n\n    hslToRgb(h, s, l) {\n        h /= 360;\n        s /= 100;\n        l /= 100;\n        \n        const hue2rgb = (p, q, t) => {\n            if (t < 0) t += 1;\n            if (t > 1) t -= 1;\n            if (t < 1/6) return p + (q - p) * 6 * t;\n            if (t < 1/2) return q;\n            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;\n            return p;\n        };\n        \n        let r, g, b;\n        \n        if (s === 0) {\n            r = g = b = l; // achromatic\n        } else {\n            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;\n            const p = 2 * l - q;\n            r = hue2rgb(p, q, h + 1/3);\n            g = hue2rgb(p, q, h);\n            b = hue2rgb(p, q, h - 1/3);\n        }\n        \n        return {\n            r: Math.round(r * 255),\n            g: Math.round(g * 255),\n            b: Math.round(b * 255)\n        };\n    }\n\n    rgbToHsv(r, g, b) {\n        r /= 255;\n        g /= 255;\n        b /= 255;\n        \n        const max = Math.max(r, g, b);\n        const min = Math.min(r, g, b);\n        let h, s, v = max;\n        \n        const d = max - min;\n        s = max === 0 ? 0 : d / max;\n        \n        if (max === min) {\n            h = 0; // achromatic\n        } else {\n            switch (max) {\n                case r: h = (g - b) / d + (g < b ? 6 : 0); break;\n                case g: h = (b - r) / d + 2; break;\n                case b: h = (r - g) / d + 4; break;\n            }\n            h /= 6;\n        }\n        \n        return {\n            h: h * 360,\n            s: s * 100,\n            v: v * 100\n        };\n    }\n\n    hsvToRgb(h, s, v) {\n        h /= 360;\n        s /= 100;\n        v /= 100;\n        \n        const i = Math.floor(h * 6);\n        const f = h * 6 - i;\n        const p = v * (1 - s);\n        const q = v * (1 - f * s);\n        const t = v * (1 - (1 - f) * s);\n        \n        let r, g, b;\n        \n        switch (i % 6) {\n            case 0: r = v, g = t, b = p; break;\n            case 1: r = q, g = v, b = p; break;\n            case 2: r = p, g = v, b = t; break;\n            case 3: r = p, g = q, b = v; break;\n            case 4: r = t, g = p, b = v; break;\n            case 5: r = v, g = p, b = q; break;\n        }\n        \n        return {\n            r: Math.round(r * 255),\n            g: Math.round(g * 255),\n            b: Math.round(b * 255)\n        };\n    }\n\n    hslToHex(h, s, l) {\n        const rgb = this.hslToRgb(h, s, l);\n        return this.rgbToHex(rgb.r, rgb.g, rgb.b);\n    }\n\n    // Validation methods\n    isValidHex(hex) {\n        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);\n    }\n\n    isValidRGB(r, g, b) {\n        return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;\n    }\n\n    isValidHSL(h, s, l) {\n        return h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100;\n    }\n\n    isValidHSV(h, s, v) {\n        return h >= 0 && h <= 360 && s >= 0 && s <= 100 && v >= 0 && v <= 100;\n    }\n\n    copyToClipboard(text, successMessage) {\n        navigator.clipboard.writeText(text).then(() => {\n            this.showNotification(successMessage, 'success');\n        }).catch(() => {\n            // Fallback\n            const textarea = document.createElement('textarea');\n            textarea.value = text;\n            document.body.appendChild(textarea);\n            textarea.select();\n            document.execCommand('copy');\n            document.body.removeChild(textarea);\n            this.showNotification(successMessage, 'success');\n        });\n    }\n\n    showNotification(message, type = 'info') {\n        const notification = document.createElement('div');\n        notification.className = `notification notification-${type}`;\n        notification.innerHTML = `\n            <i class=\"fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}\"></i>\n            <span>${message}</span>\n        `;\n        \n        notification.style.cssText = `\n            position: fixed;\n            top: 20px;\n            right: 20px;\n            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};\n            color: white;\n            padding: 1rem 1.5rem;\n            border-radius: 8px;\n            box-shadow: 0 10px 25px rgba(0,0,0,0.1);\n            z-index: 1000;\n            opacity: 0;\n            transform: translateX(100%);\n            transition: all 0.3s ease;\n            max-width: 400px;\n        `;\n        \n        document.body.appendChild(notification);\n        \n        setTimeout(() => {\n            notification.style.opacity = '1';\n            notification.style.transform = 'translateX(0)';\n        }, 100);\n        \n        setTimeout(() => {\n            notification.style.opacity = '0';\n            notification.style.transform = 'translateX(100%)';\n            setTimeout(() => {\n                if (document.body.contains(notification)) {\n                    document.body.removeChild(notification);\n                }\n            }, 300);\n        }, 3000);\n    }\n}\n\n// Initialize when DOM is loaded\ndocument.addEventListener('DOMContentLoaded', () => {\n    new ColorConverter();\n});\n"