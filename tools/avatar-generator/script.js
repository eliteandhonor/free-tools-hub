// Avatar Generator Tool
class AvatarGenerator {
    constructor() {
        this.canvas = document.getElementById('avatarCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentStyle = 'initials';
        this.currentGradient = 'linear-gradient(135deg, #667eea, #764ba2)';
        this.init();
    }
    
    init() {
        this.generateAvatar();
    }
    
    selectStyle(style) {
        // Remove active class from all style options
        document.querySelectorAll('.style-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Add active class to selected style
        document.getElementById(`style-${style}`).classList.add('active');
        
        this.currentStyle = style;
        this.generateAvatar();
    }
    
    selectColor(gradient) {
        // Remove active class from all color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.classList.remove('active');
        });
        
        // Add active class to clicked preset
        event.target.classList.add('active');
        
        this.currentGradient = gradient;
        this.generateAvatar();
    }
    
    updateCustomColor() {
        const color1 = document.getElementById('color1').value;
        const color2 = document.getElementById('color2').value;
        this.currentGradient = `linear-gradient(135deg, ${color1}, ${color2})`;
        
        // Remove active class from color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.classList.remove('active');
        });
        
        this.generateAvatar();
    }
    
    generateAvatar() {
        const name = document.getElementById('avatarName').value || 'JD';
        const size = parseInt(document.getElementById('avatarSize').value) || 256;
        
        // Set canvas size
        this.canvas.width = size;
        this.canvas.height = size;
        
        // Create gradient
        const gradient = this.createGradient(size);
        
        // Draw background
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, size, size);
        
        // Draw content based on style
        if (this.currentStyle === 'initials') {
            this.drawInitials(name, size);
        } else {
            this.drawIcon(size);
        }
        
        // Update size previews
        this.updateSizePreviews();
    }
    
    createGradient(size) {
        // Parse gradient colors from currentGradient
        const gradientMatch = this.currentGradient.match(/linear-gradient\(.*?,\s*(#[a-fA-F0-9]{6}),\s*(#[a-fA-F0-9]{6})\)/);
        
        if (gradientMatch) {
            const color1 = gradientMatch[1];
            const color2 = gradientMatch[2];
            
            const gradient = this.ctx.createLinearGradient(0, 0, size, size);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            
            return gradient;
        }
        
        // Fallback to solid color
        return '#667eea';
    }
    
    drawInitials(name, size) {
        const initials = this.getInitials(name);
        
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `bold ${size * 0.4}px Arial, sans-serif`;
        
        this.ctx.fillText(initials, size / 2, size / 2);
    }
    
    drawIcon(size) {
        // Draw a simple user icon
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `${size * 0.5}px FontAwesome`;
        
        // Use a simple circle for head and body shape
        // Head
        this.ctx.beginPath();
        this.ctx.arc(size / 2, size * 0.35, size * 0.15, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Body
        this.ctx.beginPath();
        this.ctx.arc(size / 2, size * 0.8, size * 0.25, 0, Math.PI, true);
        this.ctx.fill();
    }
    
    getInitials(name) {
        const words = name.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        } else {
            return name.substring(0, 2).toUpperCase();
        }
    }
    
    updateSizePreviews() {
        const sizes = [64, 128, 256];
        
        sizes.forEach(size => {
            const canvas = document.getElementById(`preview${size}`);
            const ctx = canvas.getContext('2d');
            
            // Draw scaled version
            ctx.drawImage(this.canvas, 0, 0, size, size);
        });
    }
    
    randomizeAvatar() {
        // Random name combinations
        const names = ['AB', 'CD', 'EF', 'GH', 'IJ', 'KL', 'MN', 'OP', 'QR', 'ST', 'UV', 'WX', 'YZ'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        
        document.getElementById('avatarName').value = randomName;
        
        // Random color
        const gradients = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)',
            'linear-gradient(135deg, #a8edea, #fed6e3)',
            'linear-gradient(135deg, #ff9a9e, #fecfef)',
            'linear-gradient(135deg, #ffecd2, #fcb69f)'
        ];
        
        this.currentGradient = gradients[Math.floor(Math.random() * gradients.length)];
        
        // Remove active from all color presets and add to random one
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.classList.remove('active');
        });
        
        this.generateAvatar();
    }
    
    copyImage() {
        this.canvas.toBlob((blob) => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(() => {
                // Temporary feedback
                const copyBtn = document.querySelector('button[onclick="copyImage()"]');
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
                alert('Failed to copy image. Please try the download option.');
            });
        });
    }
    
    downloadAvatar() {
        const name = document.getElementById('avatarName').value || 'avatar';
        const size = document.getElementById('avatarSize').value;
        
        this.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `avatar-${name}-${size}x${size}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
}

// Global functions for button clicks
function selectStyle(style) {
    generator.selectStyle(style);
}

function selectColor(gradient) {
    generator.selectColor(gradient);
}

function updateCustomColor() {
    generator.updateCustomColor();
}

function generateAvatar() {
    generator.generateAvatar();
}

function randomizeAvatar() {
    generator.randomizeAvatar();
}

function copyImage() {
    generator.copyImage();
}

function downloadAvatar() {
    generator.downloadAvatar();
}

// Initialize when page loads
let generator;
document.addEventListener('DOMContentLoaded', function() {
    generator = new AvatarGenerator();
});
