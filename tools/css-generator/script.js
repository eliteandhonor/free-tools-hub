// CSS Generator Tool
class CSSGenerator {
    constructor() {
        this.init();
    }
    
    init() {
        // Initialize all generators
        this.updateBoxShadow();
        this.updateGradient();
        this.updateBorderRadius();
        this.updateFlexbox();
        this.updateGrid();
    }
    
    switchTab(tabName) {
        // Hide all tool contents
        document.querySelectorAll('.tool-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.tool-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tool content
        document.getElementById(tabName).classList.add('active');
        
        // Add active class to clicked tab
        event.target.classList.add('active');
    }
    
    updateBoxShadow() {
        const x = document.getElementById('shadowX').value;
        const y = document.getElementById('shadowY').value;
        const blur = document.getElementById('shadowBlur').value;
        const spread = document.getElementById('shadowSpread').value;
        const color = document.getElementById('shadowColor').value;
        const opacity = document.getElementById('shadowOpacity').value;
        const inset = document.getElementById('shadowInset').checked;
        
        // Update value displays
        document.getElementById('shadowXValue').textContent = x;
        document.getElementById('shadowYValue').textContent = y;
        document.getElementById('shadowBlurValue').textContent = blur;
        document.getElementById('shadowSpreadValue').textContent = spread;
        document.getElementById('shadowOpacityValue').textContent = opacity;
        
        // Convert hex color to rgba
        const rgba = this.hexToRgba(color, opacity);
        
        // Create box shadow CSS
        const insetText = inset ? 'inset ' : '';
        const boxShadow = `${insetText}${x}px ${y}px ${blur}px ${spread}px ${rgba}`;
        
        // Apply to preview
        const preview = document.getElementById('shadowPreview');
        preview.style.boxShadow = boxShadow;
        
        // Generate CSS code
        const css = `.element {
    box-shadow: ${boxShadow};
}`;
        
        document.getElementById('boxShadowCSS').textContent = css;
    }
    
    updateGradient() {
        const type = document.getElementById('gradientType').value;
        const angle = document.getElementById('gradientAngle').value;
        const color1 = document.getElementById('gradientColor1').value;
        const color2 = document.getElementById('gradientColor2').value;
        
        // Update value display
        document.getElementById('gradientAngleValue').textContent = angle;
        
        // Create gradient CSS
        let gradient;
        if (type === 'linear') {
            gradient = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
        } else {
            gradient = `radial-gradient(circle, ${color1}, ${color2})`;
        }
        
        // Apply to preview
        const preview = document.getElementById('gradientPreview');
        preview.style.background = gradient;
        
        // Generate CSS code
        const css = `.element {
    background: ${gradient};
}`;
        
        document.getElementById('gradientCSS').textContent = css;
    }
    
    updateBorderRadius() {
        const tl = document.getElementById('borderTL').value;
        const tr = document.getElementById('borderTR').value;
        const bl = document.getElementById('borderBL').value;
        const br = document.getElementById('borderBR').value;
        
        // Update value displays
        document.getElementById('borderTLValue').textContent = tl;
        document.getElementById('borderTRValue').textContent = tr;
        document.getElementById('borderBLValue').textContent = bl;
        document.getElementById('borderBRValue').textContent = br;
        
        // Create border radius CSS
        const borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
        
        // Apply to preview
        const preview = document.getElementById('borderPreview');
        preview.style.borderRadius = borderRadius;
        
        // Generate CSS code
        const css = `.element {
    border-radius: ${borderRadius};
}`;
        
        document.getElementById('borderRadiusCSS').textContent = css;
    }
    
    updateFlexbox() {
        const direction = document.getElementById('flexDirection').value;
        const justify = document.getElementById('justifyContent').value;
        const align = document.getElementById('alignItems').value;
        const wrap = document.getElementById('flexWrap').checked;
        
        // Apply to preview
        const preview = document.getElementById('flexboxPreview');
        preview.style.display = 'flex';
        preview.style.flexDirection = direction;
        preview.style.justifyContent = justify;
        preview.style.alignItems = align;
        preview.style.flexWrap = wrap ? 'wrap' : 'nowrap';
        
        // Generate CSS code
        const css = `.container {
    display: flex;
    flex-direction: ${direction};
    justify-content: ${justify};
    align-items: ${align};${wrap ? '\n    flex-wrap: wrap;' : ''}
}`;
        
        document.getElementById('flexboxCSS').textContent = css;
    }
    
    updateGrid() {
        const columns = document.getElementById('gridColumns').value;
        const rows = document.getElementById('gridRows').value;
        const columnGap = document.getElementById('gridColumnGap').value;
        const rowGap = document.getElementById('gridRowGap').value;
        
        // Update value displays
        document.getElementById('gridColumnGapValue').textContent = columnGap;
        document.getElementById('gridRowGapValue').textContent = rowGap;
        
        // Apply to preview
        const preview = document.getElementById('gridPreview');
        preview.style.display = 'grid';
        preview.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        preview.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        preview.style.columnGap = `${columnGap}px`;
        preview.style.rowGap = `${rowGap}px`;
        
        // Clear and regenerate grid items
        preview.innerHTML = '';
        const totalItems = columns * rows;
        for (let i = 1; i <= totalItems; i++) {
            const item = document.createElement('div');
            item.style.background = '#007bff';
            item.style.color = 'white';
            item.style.padding = '10px';
            item.style.textAlign = 'center';
            item.style.borderRadius = '4px';
            item.textContent = i;
            preview.appendChild(item);
        }
        
        // Generate CSS code
        const css = `.grid-container {
    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    grid-template-rows: repeat(${rows}, 1fr);
    column-gap: ${columnGap}px;
    row-gap: ${rowGap}px;
}`;
        
        document.getElementById('gridCSS').textContent = css;
    }
    
    setUniformRadius() {
        const value = document.getElementById('borderTL').value;
        document.getElementById('borderTR').value = value;
        document.getElementById('borderBL').value = value;
        document.getElementById('borderBR').value = value;
        this.updateBorderRadius();
    }
    
    addGradientColor() {
        alert('Additional gradient colors coming in future update!');
    }
    
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    copyCSS(elementId) {
        const cssText = document.getElementById(elementId).textContent;
        
        navigator.clipboard.writeText(cssText).then(() => {
            // Temporary feedback
            const copyBtn = event.target.closest('button');
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
}

// Global functions for button clicks
function switchTab(tabName) {
    generator.switchTab(tabName);
}

function updateBoxShadow() {
    generator.updateBoxShadow();
}

function updateGradient() {
    generator.updateGradient();
}

function updateBorderRadius() {
    generator.updateBorderRadius();
}

function updateFlexbox() {
    generator.updateFlexbox();
}

function updateGrid() {
    generator.updateGrid();
}

function setUniformRadius() {
    generator.setUniformRadius();
}

function addGradientColor() {
    generator.addGradientColor();
}

function copyCSS(elementId) {
    generator.copyCSS(elementId);
}

// Initialize when page loads
let generator;
document.addEventListener('DOMContentLoaded', function() {
    generator = new CSSGenerator();
});
