// Gradient Generator Tool
class GradientGenerator {
    constructor() {
        this.colorStops = [
            { color: '#ff6b6b', position: 0 },
            { color: '#4ecdc4', position: 100 }
        ];
        this.init();
    }
    
    init() {
        this.renderColorStops();
        this.updateGradient();
    }
    
    renderColorStops() {
        const container = document.getElementById('colorStops');
        container.innerHTML = '';
        
        this.colorStops.forEach((stop, index) => {
            const stopDiv = document.createElement('div');
            stopDiv.className = 'color-stop';
            stopDiv.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-3">
                        <input type="color" class="color-input" value="${stop.color}" onchange="updateColorStop(${index}, 'color', this.value)">
                    </div>
                    <div class="col-6">
                        <input type="range" class="form-range" min="0" max="100" value="${stop.position}" oninput="updateColorStop(${index}, 'position', this.value)">
                        <small class="text-muted">Position: ${stop.position}%</small>
                    </div>
                    <div class="col-3">
                        ${this.colorStops.length > 2 ? `<button type="button" class="btn btn-outline-danger btn-sm" onclick="removeColorStop(${index})"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                </div>
            `;
            container.appendChild(stopDiv);
        });
    }
    
    updateColorStop(index, property, value) {
        this.colorStops[index][property] = property === 'position' ? parseInt(value) : value;
        this.renderColorStops();
        this.updateGradient();
    }
    
    addColorStop() {
        if (this.colorStops.length >= 10) {
            alert('Maximum 10 color stops allowed');
            return;
        }
        
        const newPosition = this.colorStops.length > 0 ? 
            Math.min(100, Math.max(...this.colorStops.map(s => s.position)) + 20) : 50;
        
        this.colorStops.push({
            color: '#' + Math.floor(Math.random()*16777215).toString(16),
            position: newPosition
        });
        
        this.colorStops.sort((a, b) => a.position - b.position);
        this.renderColorStops();
        this.updateGradient();
    }
    
    removeColorStop(index) {
        if (this.colorStops.length <= 2) {
            alert('Minimum 2 color stops required');
            return;
        }
        
        this.colorStops.splice(index, 1);
        this.renderColorStops();
        this.updateGradient();
    }
    
    updateDirection() {
        const preset = document.getElementById('directionPreset').value;
        if (preset !== 'custom') {
            document.getElementById('gradientAngle').style.display = 'none';
            document.getElementById('gradientAngle').nextElementSibling.style.display = 'none';
        } else {
            document.getElementById('gradientAngle').style.display = 'block';
            document.getElementById('gradientAngle').nextElementSibling.style.display = 'block';
        }
        this.updateGradient();
    }
    
    updateGradient() {
        const type = document.getElementById('gradientType').value;
        const directionPreset = document.getElementById('directionPreset').value;
        const angle = document.getElementById('gradientAngle').value;
        
        // Update angle display
        document.getElementById('angleValue').textContent = angle;
        
        // Sort color stops by position
        const sortedStops = [...this.colorStops].sort((a, b) => a.position - b.position);
        const colorString = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
        
        let gradient;
        let direction;
        
        if (type === 'linear') {
            direction = directionPreset === 'custom' ? `${angle}deg` : directionPreset;
            gradient = `linear-gradient(${direction}, ${colorString})`;
        } else if (type === 'radial') {
            gradient = `radial-gradient(circle, ${colorString})`;
        } else if (type === 'conic') {
            gradient = `conic-gradient(from ${angle}deg, ${colorString})`;
        }
        
        // Apply to preview
        const preview = document.getElementById('gradientPreview');
        preview.style.background = gradient;
        
        // Update CSS output
        const css = `background: ${gradient};`;
        document.getElementById('cssOutput').textContent = css;
        
        // Show/hide direction section based on gradient type
        const directionSection = document.getElementById('directionSection');
        if (type === 'radial') {
            directionSection.style.display = 'none';
        } else {
            directionSection.style.display = 'block';
        }
    }
    
    loadPreset(presetName) {
        const presets = {
            sunset: [
                { color: '#ff7e5f', position: 0 },
                { color: '#feb47b', position: 100 }
            ],
            ocean: [
                { color: '#667eea', position: 0 },
                { color: '#764ba2', position: 100 }
            ],
            forest: [
                { color: '#11998e', position: 0 },
                { color: '#38ef7d', position: 100 }
            ],
            purple: [
                { color: '#667eea', position: 0 },
                { color: '#764ba2', position: 50 },
                { color: '#f093fb', position: 100 }
            ]
        };
        
        if (presets[presetName]) {
            this.colorStops = presets[presetName];
            this.renderColorStops();
            this.updateGradient();
        }
    }
    
    copyCSS() {
        const cssText = document.getElementById('cssOutput').textContent;
        
        navigator.clipboard.writeText(cssText).then(() => {
            // Temporary feedback
            const copyBtn = document.querySelector('button[onclick="copyCSS()"]');
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
    
    downloadGradient() {
        const type = document.getElementById('gradientType').value;
        const directionPreset = document.getElementById('directionPreset').value;
        const angle = document.getElementById('gradientAngle').value;
        
        const gradientData = {
            type: type,
            direction: directionPreset === 'custom' ? `${angle}deg` : directionPreset,
            colorStops: this.colorStops,
            css: document.getElementById('cssOutput').textContent,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(gradientData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gradient-${type}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Global functions for button clicks
function updateColorStop(index, property, value) {
    generator.updateColorStop(index, property, value);
}

function addColorStop() {
    generator.addColorStop();
}

function removeColorStop(index) {
    generator.removeColorStop(index);
}

function updateDirection() {
    generator.updateDirection();
}

function updateGradient() {
    generator.updateGradient();
}

function loadPreset(presetName) {
    generator.loadPreset(presetName);
}

function copyCSS() {
    generator.copyCSS();
}

function downloadGradient() {
    generator.downloadGradient();
}

// Initialize when page loads
let generator;
document.addEventListener('DOMContentLoaded', function() {
    generator = new GradientGenerator();
});
