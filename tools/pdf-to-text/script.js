// Global variables
let currentPDF = null;
let extractedPages = [];
let currentPageIndex = 0;

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupDragAndDrop();
    setupFileInput();
});

// Setup drag and drop functionality
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    uploadArea.addEventListener('drop', handleDrop, false);
    uploadArea.addEventListener('click', () => document.getElementById('fileInput').click());
}

// Setup file input
function setupFileInput() {
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
}

// Prevent default drag behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area
function highlight(e) {
    document.getElementById('uploadArea').classList.add('dragover');
}

// Unhighlight drop area
function unhighlight(e) {
    document.getElementById('uploadArea').classList.remove('dragover');
}

// Handle file drop
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle file selection
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// Handle files
function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (file.type !== 'application/pdf') {
        showError('Please select a PDF file.');
        return;
    }
    
    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        showError('File size exceeds 50MB limit. Please select a smaller file.');
        return;
    }
    
    loadPDF(file);
}

// Load PDF file
async function loadPDF(file) {
    try {
        showProcessing(true);
        hideError();
        
        // Display file info
        displayFileInfo(file);
        
        // Read file as array buffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Load PDF with PDF.js
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        currentPDF = pdf;
        
        // Update file info with page count
        document.getElementById('pageCount').textContent = pdf.numPages;
        document.getElementById('fileStatus').textContent = 'Loaded';
        
        // Show extraction options
        document.getElementById('extractionOptions').style.display = 'block';
        
        showProcessing(false);
        
    } catch (error) {
        console.error('Error loading PDF:', error);
        showError('Failed to load PDF file. The file may be corrupted or password protected.');
        showProcessing(false);
    }
}

// Display file information
function displayFileInfo(file) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').style.display = 'block';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Extract text from PDF
async function extractText() {
    if (!currentPDF) {
        showError('No PDF file loaded.');
        return;
    }
    
    try {
        showProcessing(true);
        hideError();
        
        const extractAllPages = document.getElementById('extractAllPages').checked;
        const preserveFormatting = document.getElementById('preserveFormatting').checked;
        const includeLineBreaks = document.getElementById('includeLineBreaks').checked;
        const removeExtraSpaces = document.getElementById('removeExtraSpaces').checked;
        
        extractedPages = [];
        
        const totalPages = currentPDF.numPages;
        const pagesToExtract = extractAllPages ? totalPages : 1;
        
        for (let pageNum = 1; pageNum <= pagesToExtract; pageNum++) {
            const page = await currentPDF.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            let pageText = '';
            let lastY = null;
            let lastX = null;
            
            textContent.items.forEach((item, index) => {
                const text = item.str;
                const transform = item.transform;
                const x = transform[4];
                const y = transform[5];
                
                if (preserveFormatting) {
                    // Check for line breaks based on Y position
                    if (lastY !== null && Math.abs(y - lastY) > 5) {
                        if (includeLineBreaks) {
                            pageText += '\n';
                        }
                    }
                    // Check for spacing based on X position
                    else if (lastX !== null && (x - lastX) > 20) {
                        pageText += ' ';
                    }
                }
                
                pageText += text;
                
                // Add space between items if not preserving formatting
                if (!preserveFormatting && index < textContent.items.length - 1) {
                    pageText += ' ';
                }
                
                lastY = y;
                lastX = x + item.width;
            });
            
            // Post-process text
            if (removeExtraSpaces) {
                pageText = pageText.replace(/\s+/g, ' ').trim();
            }
            
            if (!preserveFormatting && includeLineBreaks) {
                // Add line breaks at sentence endings
                pageText = pageText.replace(/\. /g, '.\n');
            }
            
            extractedPages.push({
                pageNum: pageNum,
                text: pageText
            });
            
            // Update progress
            document.getElementById('fileStatus').textContent = `Processing page ${pageNum}/${pagesToExtract}`;
        }
        
        displayResults();
        showProcessing(false);
        
    } catch (error) {
        console.error('Error extracting text:', error);
        showError('Failed to extract text from PDF. The file may contain images or be password protected.');
        showProcessing(false);
    }
}

// Display extraction results
function displayResults() {
    if (extractedPages.length === 0) return;
    
    // Calculate statistics
    const allText = extractedPages.map(page => page.text).join('\n\n');
    const stats = calculateTextStats(allText);
    
    // Display statistics
    document.getElementById('totalCharacters').textContent = stats.characters.toLocaleString();
    document.getElementById('totalWords').textContent = stats.words.toLocaleString();
    document.getElementById('totalLines').textContent = stats.lines.toLocaleString();
    document.getElementById('totalParagraphs').textContent = stats.paragraphs.toLocaleString();
    
    // Setup page navigation if multiple pages
    if (extractedPages.length > 1) {
        document.getElementById('totalPages').textContent = extractedPages.length;
        document.getElementById('pageNavigation').style.display = 'flex';
        currentPageIndex = 0;
        updatePageNavigation();
    } else {
        document.getElementById('pageNavigation').style.display = 'none';
    }
    
    // Display first page or all text
    displayPageText();
    
    // Show result container
    document.getElementById('resultContainer').style.display = 'block';
    document.getElementById('fileStatus').textContent = 'Completed';
}

// Display text for current page
function displayPageText() {
    const textOutput = document.getElementById('textOutput');
    
    if (extractedPages.length === 1 || document.getElementById('extractAllPages').checked) {
        // Show all text if single page or extract all pages is checked
        const allText = extractedPages.map((page, index) => {
            if (extractedPages.length > 1) {
                return `--- Page ${page.pageNum} ---\n\n${page.text}`;
            }
            return page.text;
        }).join('\n\n');
        
        textOutput.textContent = allText;
    } else {
        // Show current page only
        const currentPage = extractedPages[currentPageIndex];
        textOutput.textContent = currentPage.text;
    }
}

// Calculate text statistics
function calculateTextStats(text) {
    const characters = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    
    return { characters, words, lines, paragraphs };
}

// Page navigation functions
function showPreviousPage() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        updatePageNavigation();
        displayPageText();
    }
}

function showNextPage() {
    if (currentPageIndex < extractedPages.length - 1) {
        currentPageIndex++;
        updatePageNavigation();
        displayPageText();
    }
}

function updatePageNavigation() {
    document.getElementById('currentPageNum').textContent = currentPageIndex + 1;
    document.getElementById('prevPageBtn').disabled = currentPageIndex === 0;
    document.getElementById('nextPageBtn').disabled = currentPageIndex === extractedPages.length - 1;
}

// Copy text to clipboard
function copyText() {
    const textOutput = document.getElementById('textOutput');
    const text = textOutput.textContent;
    
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            // Show success feedback
            const button = event.target.closest('.action-button');
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = 'var(--primary-color)';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showError('Failed to copy text to clipboard.');
        });
    }
}

// Download text as file
function downloadText() {
    const textOutput = document.getElementById('textOutput');
    const text = textOutput.textContent;
    
    if (text) {
        const fileName = document.getElementById('fileName').textContent.replace('.pdf', '.txt');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Clear results and reset
function clearResults() {
    // Reset global variables
    currentPDF = null;
    extractedPages = [];
    currentPageIndex = 0;
    
    // Hide UI elements
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('extractionOptions').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'none';
    
    // Reset file input
    document.getElementById('fileInput').value = '';
    
    // Reset file status
    document.getElementById('fileStatus').textContent = 'Ready';
    
    hideError();
}

// Show/hide processing indicator
function showProcessing(show) {
    document.getElementById('processingIndicator').style.display = show ? 'block' : 'none';
    document.getElementById('uploadArea').style.display = show ? 'none' : 'block';
}

// Show error message
function showError(message) {
    document.getElementById('errorText').textContent = message;
    document.getElementById('errorMessage').style.display = 'block';
}

// Hide error message
function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

// Handle extraction option changes
document.addEventListener('change', function(e) {
    if (e.target.id === 'extractAllPages') {
        const pageNav = document.getElementById('pageNavigation');
        if (extractedPages.length > 0) {
            if (e.target.checked) {
                pageNav.style.display = 'none';
                displayPageText(); // Show all pages
            } else {
                pageNav.style.display = 'flex';
                currentPageIndex = 0;
                updatePageNavigation();
                displayPageText(); // Show current page only
            }
        }
    }
});

// Utility function to detect if PDF is text-based or image-based
async function isPDFTextBased(pdf) {
    try {
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        
        // If first page has very little text, it might be image-based
        const textLength = textContent.items.reduce((total, item) => total + item.str.length, 0);
        return textLength > 50; // Arbitrary threshold
    } catch (error) {
        return false;
    }
}

// Handle special PDF types
function handleSpecialPDF(error) {
    if (error.message.includes('password')) {
        return 'This PDF is password protected. Please unlock it first.';
    } else if (error.message.includes('encrypted')) {
        return 'This PDF is encrypted and cannot be processed.';
    } else if (error.message.includes('corrupt')) {
        return 'This PDF file appears to be corrupted.';
    } else {
        return 'Failed to process PDF file. It may contain only images or be in an unsupported format.';
    }
}

// Format extracted text for better readability
function formatExtractedText(text, options = {}) {
    let formatted = text;
    
    if (options.removeExtraSpaces) {
        formatted = formatted.replace(/\s+/g, ' ');
    }
    
    if (options.fixLineBreaks) {
        // Fix common line break issues
        formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');
        formatted = formatted.replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2');
    }
    
    if (options.addParagraphs) {
        // Add paragraph breaks at double spaces
        formatted = formatted.replace(/  +/g, '\n\n');
    }
    
    return formatted.trim();
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatFileSize,
        calculateTextStats,
        formatExtractedText
    };
}
