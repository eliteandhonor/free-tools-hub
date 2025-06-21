// Image Placeholder Generator Tool
class ImagePlaceholderGenerator {
    constructor() {
        this.canvas = document.getElementById('imageCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.init();
    }
    
    init() {
        this.generateImage();
    }
    
    setSize(width, height) {
        document.getElementById('imageWidth').value = width;
        document.getElementById('imageHeight').value = height;
        this.generateImage();
    }
    
    generateImage() {
        const width = parseInt(document.getElementById('imageWidth').value) || 300;
        const height = parseInt(document.getElementById('imageHeight').value) || 200;
        const bgColor = document.getElementById('bgColor').value;
        const textColor = document.getElementById('textColor').value;
        const customText = document.getElementById('placeholderText').value;
        const showGrid = document.getElementById('showGrid').checked;
        const showBorder = document.getElementById('showBorder').checked;
        
        // Set canvas size
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Fill background
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw grid if enabled
        if (showGrid) {
            this.drawGrid(width, height);
        }
        
        // Draw border if enabled
        if (showBorder) {
            this.ctx.strokeStyle = textColor;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(1, 1, width - 2, height - 2);
        }
        
        // Draw text
        const text = customText || `${width} × ${height}`;
        this.drawCenteredText(text, width, height, textColor);
        
        // Update info
        this.updateImageInfo(width, height);
        this.updateDataURL();
        this.updateHTMLUsage(width, height);
    }
    
    drawGrid(width, height) {
        const gridSize = 20;
        this.ctx.strokeStyle = this.adjustColor(document.getElementById('bgColor').value, -20);
        this.ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }
    
    drawCenteredText(text, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Calculate font size based on image size
        const fontSize = Math.max(12, Math.min(width, height) / 10);
        this.ctx.font = `${fontSize}px Arial, sans-serif`;
        
        // Draw text
        this.ctx.fillText(text, width / 2, height / 2);
    }
    
    adjustColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    updateImageInfo(width, height) {
        document.getElementById('imageDimensions').textContent = `${width} × ${height}`;
        
        // Estimate file size
        const pixels = width * height;
        const estimatedSize = Math.round(pixels * 0.8 / 1024); // Rough estimate
        document.getElementById('imageFileSize').textContent = `~${estimatedSize} KB`;
    }
    
    updateDataURL() {
        const format = document.getElementById('imageFormat').value;
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                        format === 'webp' ? 'image/webp' : 'image/png';
        
        const dataURL = this.canvas.toDataURL(mimeType, 0.9);
        document.getElementById('dataURL').textContent = dataURL;
    }
    
    updateHTMLUsage(width, height) {
        const format = document.getElementById('imageFormat').value;
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                        format === 'webp' ? 'image/webp' : 'image/png';
        
        const dataURL = this.canvas.toDataURL(mimeType, 0.9);
        const htmlCode = `<img src="${dataURL}" alt="Placeholder ${width}x${height}" width="${width}" height="${height}">`;
        document.getElementById('htmlUsage').textContent = htmlCode;
    }
    
    copyImageURL() {
        const dataURL = document.getElementById('dataURL').textContent;
        
        if (!dataURL || dataURL.includes('Generate an image')) {
            alert('Please generate an image first.');
            return;
        }
        
        navigator.clipboard.writeText(dataURL).then(() => {
            // Temporary feedback
            const copyBtn = document.querySelector('button[onclick="copyImageURL()"]');
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
    
    downloadImage() {
        const width = document.getElementById('imageWidth').value;
        const height = document.getElementById('imageHeight').value;
        const format = document.getElementById('imageFormat').value;
        
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                        format === 'webp' ? 'image/webp' : 'image/png';
        
        this.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `placeholder-${width}x${height}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, mimeType, 0.9);
    }
}

// Global functions for button clicks
function setSize(width, height) {
    generator.setSize(width, height);
}

function generateImage() {
    generator.generateImage();
}

function copyImageURL() {
    generator.copyImageURL();
}

function downloadImage() {
    generator.downloadImage();
}

// Initialize when page loads
let generator;
document.addEventListener('DOMContentLoaded', function() {
    generator = new ImagePlaceholderGenerator();
});
