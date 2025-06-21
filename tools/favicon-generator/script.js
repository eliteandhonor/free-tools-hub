// Favicon Generator Tool
class FaviconGenerator {
    constructor() {
        this.generatedFavicons = new Map();
        this.init();
    }
    
    init() {
        this.generateFromText();
        this.setupDragAndDrop();
    }
    
    setupDragAndDrop() {
        const uploadArea = document.querySelector('.upload-area');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageFile(files[0]);
            }
        });
    }
    
    switchMethod(method) {
        if (method === 'text') {
            document.getElementById('textSettings').style.display = 'block';
            document.getElementById('imageSettings').style.display = 'none';
            this.generateFromText();
        } else {
            document.getElementById('textSettings').style.display = 'none';
            document.getElementById('imageSettings').style.display = 'block';
        }
    }
    
    generateFromText() {
        const text = document.getElementById('faviconText').value || 'FT';
        const bgColor = document.getElementById('bgColor').value;
        const textColor = document.getElementById('textColor').value;
        const fontStyle = document.getElementById('fontStyle').value;
        
        // Update main preview
        const mainPreview = document.getElementById('mainPreview');
        mainPreview.textContent = text.toUpperCase();
        mainPreview.style.backgroundColor = bgColor;
        mainPreview.style.color = textColor;
        mainPreview.style.fontFamily = fontStyle;
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleImageFile(file);
        }
    }
    
    handleImageFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.displayImagePreview(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    displayImagePreview(img) {
        const mainPreview = document.getElementById('mainPreview');
        
        // Create canvas for preview
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Draw image centered and scaled
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        
        ctx.drawImage(img, x, y, size, size, 0, 0, 128, 128);
        
        // Update preview
        mainPreview.innerHTML = '';
        mainPreview.style.backgroundColor = 'transparent';
        mainPreview.appendChild(canvas);
        
        // Store original image for generation
        this.sourceImage = img;
    }
    
    generateFavicons() {
        const sizes = [16, 32, 48, 64, 128];
        const method = document.querySelector('input[name="method"]:checked').id;
        
        this.generatedFavicons.clear();
        
        sizes.forEach(size => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            if (method === 'textMethod') {
                this.generateTextFavicon(ctx, size);
            } else {
                this.generateImageFavicon(ctx, size);
            }
            
            // Store the canvas
            this.generatedFavicons.set(size, canvas);
        });
        
        this.displayGeneratedSizes();
        this.generateHTMLCode();
        
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('htmlCode').style.display = 'block';
    }
    
    generateTextFavicon(ctx, size) {
        const text = document.getElementById('faviconText').value || 'FT';
        const bgColor = document.getElementById('bgColor').value;
        const textColor = document.getElementById('textColor').value;
        const fontStyle = document.getElementById('fontStyle').value;
        
        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        
        // Draw text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${size * 0.6}px ${fontStyle}`;
        ctx.fillText(text.toUpperCase(), size / 2, size / 2);
    }
    
    generateImageFavicon(ctx, size) {
        if (!this.sourceImage) {
            // Fallback to text if no image
            this.generateTextFavicon(ctx, size);
            return;
        }
        
        // Draw image scaled to fit
        const imgSize = Math.min(this.sourceImage.width, this.sourceImage.height);
        const x = (this.sourceImage.width - imgSize) / 2;
        const y = (this.sourceImage.height - imgSize) / 2;
        
        ctx.drawImage(this.sourceImage, x, y, imgSize, imgSize, 0, 0, size, size);
    }
    
    displayGeneratedSizes() {
        const container = document.getElementById('sizePreview');
        container.innerHTML = '';
        
        this.generatedFavicons.forEach((canvas, size) => {
            const sizeDiv = document.createElement('div');
            sizeDiv.className = 'size-preview';
            
            const clonedCanvas = document.createElement('canvas');
            clonedCanvas.width = size;
            clonedCanvas.height = size;
            const clonedCtx = clonedCanvas.getContext('2d');
            clonedCtx.drawImage(canvas, 0, 0);
            
            sizeDiv.appendChild(clonedCanvas);
            
            const label = document.createElement('div');
            label.textContent = `${size}x${size}`;
            label.className = 'small text-muted';
            sizeDiv.appendChild(label);
            
            container.appendChild(sizeDiv);
        });
    }
    
    generateHTMLCode() {
        const htmlCode = `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`;
        
        document.getElementById('htmlCodeContent').textContent = htmlCode;
    }
    
    downloadAll() {
        if (this.generatedFavicons.size === 0) {
            alert('Please generate favicons first.');
            return;
        }
        
        // Create a zip-like download by downloading each file
        this.generatedFavicons.forEach((canvas, size) => {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                
                if (size === 16) {
                    a.download = 'favicon.ico';
                } else if (size === 128) {
                    a.download = 'apple-touch-icon.png';
                } else {
                    a.download = `favicon-${size}x${size}.png`;
                }
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/png');
        });
        
        // Also download HTML code
        setTimeout(() => {
            const htmlBlob = new Blob([document.getElementById('htmlCodeContent').textContent], { type: 'text/html' });
            const url = URL.createObjectURL(htmlBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'favicon-html-code.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1000);
    }
}

// Global functions for button clicks
function switchMethod(method) {
    generator.switchMethod(method);
}

function generateFromText() {
    generator.generateFromText();
}

function handleImageUpload(event) {
    generator.handleImageUpload(event);
}

function generateFavicons() {
    generator.generateFavicons();
}

function downloadAll() {
    generator.downloadAll();
}

// Initialize when page loads
let generator;
document.addEventListener('DOMContentLoaded', function() {
    generator = new FaviconGenerator();
});
