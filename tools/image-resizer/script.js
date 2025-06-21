// Image Resizer & Compressor - Professional Implementation
class ImageResizer {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.uploadedImages = [];
        this.processedImages = [];
        this.currentImageIndex = 0;
        this.outputFormat = 'jpeg';
    }

    initializeElements() {
        // Input elements
        this.fileInput = document.getElementById('file-input');
        this.fileUploadArea = document.getElementById('file-upload-area');
        this.widthInput = document.getElementById('width-input');
        this.heightInput = document.getElementById('height-input');
        this.maintainAspect = document.getElementById('maintain-aspect');
        this.qualitySlider = document.getElementById('quality-slider');
        this.qualityValue = document.getElementById('quality-value');
        this.resizeMode = document.getElementById('resize-mode');
        
        // Format buttons
        this.formatButtons = document.querySelectorAll('.format-btn');
        
        // Action buttons
        this.processBtn = document.getElementById('process-btn');
        this.downloadAllBtn = document.getElementById('download-all-btn');
        
        // Preview elements
        this.previewContainer = document.getElementById('preview-container');
        this.imageCounter = document.getElementById('image-counter');
        this.processingSpinner = document.getElementById('processing-spinner');
        this.comparisonView = document.getElementById('comparison-view');
        this.originalPreview = document.getElementById('original-preview');
        this.processedPreview = document.getElementById('processed-preview');
        this.originalInfo = document.getElementById('original-info');
        this.processedInfo = document.getElementById('processed-info');
        
        // Results section
        this.resultsSection = document.getElementById('results-section');
        this.resultsContainer = document.getElementById('results-container');
    }

    setupEventListeners() {
        // File input
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Drag and drop
        this.fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileUploadArea.classList.add('dragover');
        });
        
        this.fileUploadArea.addEventListener('dragleave', () => {
            this.fileUploadArea.classList.remove('dragover');
        });
        
        this.fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.fileUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.processFiles(files);
        });

        // Dimension inputs
        this.widthInput.addEventListener('input', () => {
            if (this.maintainAspect.checked && this.uploadedImages.length > 0) {
                this.updateHeightFromWidth();
            }
        });
        
        this.heightInput.addEventListener('input', () => {
            if (this.maintainAspect.checked && this.uploadedImages.length > 0) {
                this.updateWidthFromHeight();
            }
        });

        // Quality slider
        this.qualitySlider.addEventListener('input', () => {
            this.qualityValue.textContent = this.qualitySlider.value + '%';
        });

        // Format buttons
        this.formatButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.formatButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.outputFormat = btn.dataset.format;
            });
        });

        // Process button
        this.processBtn.addEventListener('click', () => this.processImages());
    }

    handleFileUpload(event) {
        const files = event.target.files;
        this.processFiles(files);
    }

    processFiles(files) {
        const validFiles = [];
        
        for (let file of files) {
            if (this.isValidImageFile(file)) {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    this.showError(`File ${file.name} is too large (max 10MB)`);
                    continue;
                }
                validFiles.push(file);
            } else {
                this.showError(`File ${file.name} is not a valid image format`);
            }
        }

        if (validFiles.length === 0) {
            return;
        }

        this.loadImages(validFiles);
    }

    isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        return validTypes.includes(file.type);
    }

    async loadImages(files) {
        this.uploadedImages = [];
        this.processedImages = [];
        
        for (let file of files) {
            try {
                const imageData = await this.createImageData(file);
                this.uploadedImages.push(imageData);
            } catch (error) {
                this.showError(`Failed to load ${file.name}: ${error.message}`);
            }
        }

        if (this.uploadedImages.length > 0) {
            this.processBtn.disabled = false;
            this.updateImageCounter();
            this.showFirstImage();
            this.autoSetDimensions();
        }
    }

    createImageData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    resolve({
                        file: file,
                        name: file.name,
                        originalSize: file.size,
                        width: img.width,
                        height: img.height,
                        dataUrl: e.target.result,
                        image: img
                    });
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    updateImageCounter() {
        if (this.uploadedImages.length === 1) {
            this.imageCounter.textContent = '1 image uploaded';
        } else {
            this.imageCounter.textContent = `${this.uploadedImages.length} images uploaded`;
        }
    }

    showFirstImage() {
        if (this.uploadedImages.length === 0) return;
        
        const imageData = this.uploadedImages[0];
        this.previewContainer.innerHTML = `
            <img src="${imageData.dataUrl}" class="preview-image" alt="Preview">
            <div class="image-info">
                <h4>Image Information</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Dimensions</div>
                        <div class="info-value">${imageData.width} × ${imageData.height}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">File Size</div>
                        <div class="info-value">${this.formatFileSize(imageData.originalSize)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Format</div>
                        <div class="info-value">${this.getFileExtension(imageData.name).toUpperCase()}</div>
                    </div>
                </div>
            </div>
        `;
    }

    autoSetDimensions() {
        if (this.uploadedImages.length === 0) return;
        
        const imageData = this.uploadedImages[0];
        this.widthInput.value = imageData.width;
        this.heightInput.value = imageData.height;
    }

    updateHeightFromWidth() {
        if (this.uploadedImages.length === 0) return;
        
        const imageData = this.uploadedImages[0];
        const newWidth = parseInt(this.widthInput.value);
        if (newWidth && imageData.width > 0) {
            const aspectRatio = imageData.height / imageData.width;
            this.heightInput.value = Math.round(newWidth * aspectRatio);
        }
    }

    updateWidthFromHeight() {
        if (this.uploadedImages.length === 0) return;
        
        const imageData = this.uploadedImages[0];
        const newHeight = parseInt(this.heightInput.value);
        if (newHeight && imageData.height > 0) {
            const aspectRatio = imageData.width / imageData.height;
            this.widthInput.value = Math.round(newHeight * aspectRatio);
        }
    }

    async processImages() {
        if (this.uploadedImages.length === 0) {
            this.showError('No images to process');
            return;
        }

        const targetWidth = parseInt(this.widthInput.value);
        const targetHeight = parseInt(this.heightInput.value);
        
        if (!targetWidth || !targetHeight || targetWidth < 1 || targetHeight < 1) {
            this.showError('Please enter valid dimensions');
            return;
        }

        this.showProcessingSpinner();
        this.processedImages = [];

        try {
            for (let i = 0; i < this.uploadedImages.length; i++) {
                const imageData = this.uploadedImages[i];
                const processed = await this.resizeImage(imageData, targetWidth, targetHeight);
                this.processedImages.push(processed);
                
                // Show progress for first image
                if (i === 0) {
                    this.showComparison(imageData, processed);
                }
            }

            this.hideProcessingSpinner();
            this.showResults();
            this.downloadAllBtn.style.display = 'block';
            
        } catch (error) {
            this.hideProcessingSpinner();
            this.showError(`Processing failed: ${error.message}`);
        }
    }

    async resizeImage(imageData, targetWidth, targetHeight) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let { width: newWidth, height: newHeight } = this.calculateDimensions(
                imageData.width, 
                imageData.height, 
                targetWidth, 
                targetHeight
            );

            canvas.width = newWidth;
            canvas.height = newHeight;

            // Apply image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw the image
            ctx.drawImage(imageData.image, 0, 0, newWidth, newHeight);

            // Convert to blob
            const quality = parseInt(this.qualitySlider.value) / 100;
            const mimeType = this.getMimeType(this.outputFormat);
            
            canvas.toBlob((blob) => {
                const processedName = this.generateProcessedName(imageData.name);
                resolve({
                    original: imageData,
                    blob: blob,
                    name: processedName,
                    width: newWidth,
                    height: newHeight,
                    size: blob.size,
                    dataUrl: canvas.toDataURL(mimeType, quality),
                    canvas: canvas
                });
            }, mimeType, quality);
        });
    }

    calculateDimensions(originalWidth, originalHeight, targetWidth, targetHeight) {
        const mode = this.resizeMode.value;
        
        switch (mode) {
            case 'exact':
                return { width: targetWidth, height: targetHeight };
                
            case 'fit':
                const aspectRatio = originalWidth / originalHeight;
                const targetAspectRatio = targetWidth / targetHeight;
                
                if (aspectRatio > targetAspectRatio) {
                    return { width: targetWidth, height: Math.round(targetWidth / aspectRatio) };
                } else {
                    return { width: Math.round(targetHeight * aspectRatio), height: targetHeight };
                }
                
            case 'fill':
                const fillAspectRatio = originalWidth / originalHeight;
                const fillTargetAspectRatio = targetWidth / targetHeight;
                
                if (fillAspectRatio > fillTargetAspectRatio) {
                    return { width: Math.round(targetHeight * fillAspectRatio), height: targetHeight };
                } else {
                    return { width: targetWidth, height: Math.round(targetWidth / fillAspectRatio) };
                }
                
            case 'stretch':
                return { width: targetWidth, height: targetHeight };
                
            default:
                return { width: targetWidth, height: targetHeight };
        }
    }

    showComparison(originalData, processedData) {
        this.previewContainer.style.display = 'none';
        this.comparisonView.style.display = 'grid';
        
        this.originalPreview.src = originalData.dataUrl;
        this.processedPreview.src = processedData.dataUrl;
        
        const compressionRatio = ((originalData.originalSize - processedData.size) / originalData.originalSize * 100).toFixed(1);
        
        this.originalInfo.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Size</div>
                    <div class="info-value">${originalData.width} × ${originalData.height}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">File Size</div>
                    <div class="info-value">${this.formatFileSize(originalData.originalSize)}</div>
                </div>
            </div>
        `;
        
        this.processedInfo.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Size</div>
                    <div class="info-value">${processedData.width} × ${processedData.height}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">File Size</div>
                    <div class="info-value">${this.formatFileSize(processedData.size)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Reduction</div>
                    <div class="info-value">${compressionRatio}%</div>
                </div>
            </div>
        `;
    }

    showResults() {
        let totalOriginalSize = 0;
        let totalProcessedSize = 0;
        
        this.uploadedImages.forEach(img => totalOriginalSize += img.originalSize);
        this.processedImages.forEach(img => totalProcessedSize += img.size);
        
        const totalReduction = ((totalOriginalSize - totalProcessedSize) / totalOriginalSize * 100).toFixed(1);
        
        let resultsHTML = `
            <div class="info-grid" style="margin-bottom: 1.5rem;">
                <div class="info-item">
                    <div class="info-label">Images Processed</div>
                    <div class="info-value">${this.processedImages.length}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Original Size</div>
                    <div class="info-value">${this.formatFileSize(totalOriginalSize)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Processed Size</div>
                    <div class="info-value">${this.formatFileSize(totalProcessedSize)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Reduction</div>
                    <div class="info-value">${totalReduction}%</div>
                </div>
            </div>
        `;
        
        resultsHTML += '<div style="display: grid; gap: 1rem;">';
        this.processedImages.forEach((processed, index) => {
            const reduction = ((processed.original.originalSize - processed.size) / processed.original.originalSize * 100).toFixed(1);
            resultsHTML += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div>
                        <div style="font-weight: 600; color: #374151;">${processed.name}</div>
                        <div style="font-size: 0.875rem; color: #6b7280;">
                            ${processed.width} × ${processed.height} • ${this.formatFileSize(processed.size)} • ${reduction}% smaller
                        </div>
                    </div>
                    <button class="action-btn secondary" onclick="downloadSingle(${index})">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            `;
        });
        resultsHTML += '</div>';
        
        this.resultsContainer.innerHTML = resultsHTML;
        this.resultsSection.style.display = 'block';
    }

    downloadSingle(index) {
        if (index >= 0 && index < this.processedImages.length) {
            const processed = this.processedImages[index];
            this.downloadBlob(processed.blob, processed.name);
        }
    }

    downloadAll() {
        if (this.processedImages.length === 0) {
            this.showError('No processed images to download');
            return;
        }

        this.processedImages.forEach(processed => {
            this.downloadBlob(processed.blob, processed.name);
        });
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearImages() {
        this.uploadedImages = [];
        this.processedImages = [];
        this.fileInput.value = '';
        this.processBtn.disabled = true;
        this.downloadAllBtn.style.display = 'none';
        this.imageCounter.textContent = '';
        
        this.previewContainer.innerHTML = `
            <div style="color: #9ca3af; text-align: center;">
                <i class="fas fa-image" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>Upload images to see preview</p>
            </div>
        `;
        
        this.comparisonView.style.display = 'none';
        this.previewContainer.style.display = 'flex';
        this.resultsSection.style.display = 'none';
        
        this.widthInput.value = '';
        this.heightInput.value = '';
    }

    showProcessingSpinner() {
        this.processingSpinner.style.display = 'flex';
        this.processBtn.disabled = true;
    }

    hideProcessingSpinner() {
        this.processingSpinner.style.display = 'none';
        this.processBtn.disabled = false;
    }

    generateProcessedName(originalName) {
        const nameParts = originalName.split('.');
        const extension = this.getFileExtension(this.outputFormat);
        const baseName = nameParts.slice(0, -1).join('.');
        return `${baseName}_resized.${extension}`;
    }

    getFileExtension(format) {
        const extensions = {
            'jpeg': 'jpg',
            'png': 'png',
            'webp': 'webp'
        };
        return extensions[format] || 'jpg';
    }

    getMimeType(format) {
        const mimeTypes = {
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp'
        };
        return mimeTypes[format] || 'image/jpeg';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById('resizer-error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'resizer-error-message';
            errorDiv.style.cssText = `
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
                border-radius: 6px;
                padding: 0.75rem;
                margin-top: 1rem;
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 300px;
            `;
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Global functions for button actions
function processImages() {
    imageResizer.processImages();
}

function clearImages() {
    imageResizer.clearImages();
}

function downloadAll() {
    imageResizer.downloadAll();
}

function downloadSingle(index) {
    imageResizer.downloadSingle(index);
}

// Initialize image resizer when page loads
let imageResizer;
document.addEventListener('DOMContentLoaded', function() {
    imageResizer = new ImageResizer();
});
