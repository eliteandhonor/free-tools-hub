// CSV to JSON Converter Script

class CSVToJSONConverter {
    constructor() {
        this.examples = {
            users: `Name,Age,Email,City,Country
John Doe,25,john@example.com,New York,USA
Jane Smith,30,jane@example.com,London,UK
Bob Johnson,22,bob@example.com,Paris,France
Alice Wilson,28,alice@example.com,Tokyo,Japan
Charlie Brown,35,charlie@example.com,Sydney,Australia`,
            
            products: `ID,Product,Price,Category,In Stock
1,Laptop,999.99,Electronics,true
2,Smartphone,599.99,Electronics,true
3,Book,19.99,Education,false
4,Chair,149.99,Furniture,true
5,Coffee Maker,79.99,Appliances,true`,
            
            sales: `Date,Amount,Customer,Product,Status
2024-01-01,150.50,ABC Corp,Consulting,Paid
2024-01-02,299.99,XYZ Ltd,Software License,Pending
2024-01-03,75.00,John Doe,Support,Paid
2024-01-04,1200.00,Tech Solutions,Development,Invoiced
2024-01-05,450.25,StartupCo,Design,Paid`,
            
            semicolon: `Name;Country;Population;Capital
USA;United States;331000000;Washington DC
China;People's Republic of China;1440000000;Beijing
India;Republic of India;1380000000;New Delhi
Indonesia;Republic of Indonesia;273000000;Jakarta
Pakistan;Islamic Republic of Pakistan;220000000;Islamabad`
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFileUpload();
    }

    bindEvents() {
        // Option changes
        document.getElementById('delimiter').addEventListener('change', (e) => {
            this.handleDelimiterChange(e.target.value);
        });

        // Real-time conversion
        document.getElementById('csv-input').addEventListener('input', () => {
            this.debounceConvert();
        });

        // Option changes trigger reconversion
        ['quote-char', 'output-format', 'has-header', 'skip-empty', 'auto-detect-types'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.debounceConvert();
            });
        });
    }

    handleDelimiterChange(value) {
        const customDelimiterInput = document.getElementById('custom-delimiter');
        if (value === 'custom') {
            customDelimiterInput.style.display = 'block';
            customDelimiterInput.addEventListener('input', () => this.debounceConvert());
        } else {
            customDelimiterInput.style.display = 'none';
        }
        this.debounceConvert();
    }

    debounceConvert() {
        clearTimeout(this.convertTimeout);
        this.convertTimeout = setTimeout(() => {
            this.convertToJSON();
        }, 500);
    }

    setupFileUpload() {
        const fileUploadArea = document.getElementById('file-upload-area');
        const fileInput = document.getElementById('file-input');

        // Drag and drop
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // File input
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
    }

    handleFileUpload(file) {
        if (!file.name.match(/\.(csv|txt)$/i)) {
            this.showError('Please select a CSV or TXT file.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showError('File size too large. Please select a file smaller than 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('csv-input').value = e.target.result;
            this.convertToJSON();
            this.showSuccess(`File "${file.name}" loaded successfully!`);
        };
        reader.onerror = () => {
            this.showError('Error reading file. Please try again.');
        };
        reader.readAsText(file);
    }

    convertToJSON() {
        const csvInput = document.getElementById('csv-input').value.trim();
        const jsonOutput = document.getElementById('json-output');
        
        if (!csvInput) {
            jsonOutput.value = '';
            this.hideStats();
            this.hideMessages();
            return;
        }

        try {
            const options = this.getConversionOptions();
            const result = this.parseCSV(csvInput, options);
            
            if (result.error) {
                this.showError(result.error);
                jsonOutput.value = '';
                this.hideStats();
                return;
            }

            const formattedJSON = this.formatJSON(result.data, options.outputFormat);
            jsonOutput.value = formattedJSON;
            
            this.showStats(result.stats);
            this.hideMessages();

        } catch (error) {
            this.showError('Error parsing CSV: ' + error.message);
            jsonOutput.value = '';
            this.hideStats();
        }
    }

    getConversionOptions() {
        const delimiter = document.getElementById('delimiter').value;
        const customDelimiter = document.getElementById('custom-delimiter').value;
        
        return {
            delimiter: delimiter === 'custom' ? customDelimiter : delimiter === '\\t' ? '\t' : delimiter,
            quoteChar: document.getElementById('quote-char').value,
            outputFormat: document.getElementById('output-format').value,
            hasHeader: document.getElementById('has-header').checked,
            skipEmpty: document.getElementById('skip-empty').checked,
            autoDetectTypes: document.getElementById('auto-detect-types').checked
        };
    }

    parseCSV(csvText, options) {
        try {
            const lines = csvText.split('\n').map(line => line.trim());
            const filteredLines = options.skipEmpty ? lines.filter(line => line.length > 0) : lines;
            
            if (filteredLines.length === 0) {
                return { error: 'No data to parse' };
            }

            // Parse the first line to determine column count
            const firstLineColumns = this.parseLine(filteredLines[0], options);
            const columnCount = firstLineColumns.length;

            let headers = [];
            let dataRows = [];

            if (options.hasHeader && filteredLines.length > 1) {
                headers = firstLineColumns;
                dataRows = filteredLines.slice(1);
            } else {
                // Generate default headers
                headers = Array.from({ length: columnCount }, (_, i) => `Column${i + 1}`);
                dataRows = filteredLines;
            }

            // Parse data rows
            const parsedData = [];
            let invalidRowCount = 0;

            for (let i = 0; i < dataRows.length; i++) {
                const line = dataRows[i];
                if (!line.trim()) continue;

                const columns = this.parseLine(line, options);
                
                // Handle rows with different column counts
                while (columns.length < headers.length) {
                    columns.push('');
                }
                if (columns.length > headers.length) {
                    columns.splice(headers.length);
                }

                const rowObject = {};
                headers.forEach((header, index) => {
                    let value = columns[index] || '';
                    
                    // Auto-detect types
                    if (options.autoDetectTypes) {
                        value = this.detectAndConvertType(value);
                    }
                    
                    rowObject[header] = value;
                });

                parsedData.push(rowObject);
            }

            const stats = {
                rows: parsedData.length,
                columns: headers.length,
                size: new Blob([JSON.stringify(parsedData)]).size
            };

            return { data: parsedData, stats, headers };

        } catch (error) {
            return { error: error.message };
        }
    }

    parseLine(line, options) {
        const delimiter = options.delimiter;
        const quote = options.quoteChar;
        const columns = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];
            
            if (quote && char === quote) {
                if (inQuotes && line[i + 1] === quote) {
                    // Escaped quote
                    current += quote;
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === delimiter && !inQuotes) {
                // End of column
                columns.push(current);
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }
        
        // Add the last column
        columns.push(current);
        
        return columns;
    }

    detectAndConvertType(value) {
        const trimmed = value.trim();
        
        if (trimmed === '') return '';
        
        // Boolean
        if (trimmed.toLowerCase() === 'true') return true;
        if (trimmed.toLowerCase() === 'false') return false;
        
        // Number
        if (!isNaN(trimmed) && !isNaN(parseFloat(trimmed))) {
            const num = parseFloat(trimmed);
            return Number.isInteger(num) ? parseInt(trimmed) : num;
        }
        
        // Date (basic detection)
        if (this.isDateString(trimmed)) {
            return trimmed; // Keep as string for now
        }
        
        return trimmed;
    }

    isDateString(str) {
        const datePatterns = [
            /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
            /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
            /^\d{2}-\d{2}-\d{4}$/ // MM-DD-YYYY
        ];
        
        return datePatterns.some(pattern => pattern.test(str));
    }

    formatJSON(data, format) {
        switch (format) {
            case 'array':
                return JSON.stringify(data, null, 2);
            case 'object':
                const obj = {};
                data.forEach((item, index) => {
                    obj[`item_${index + 1}`] = item;
                });
                return JSON.stringify(obj, null, 2);
            case 'pretty':
                return JSON.stringify(data, null, 4);
            case 'minified':
                return JSON.stringify(data);
            default:
                return JSON.stringify(data, null, 2);
        }
    }

    showStats(stats) {
        document.getElementById('rows-count').textContent = stats.rows.toLocaleString();
        document.getElementById('columns-count').textContent = stats.columns.toLocaleString();
        document.getElementById('size-info').textContent = this.formatFileSize(stats.size);
        document.getElementById('stats-panel').style.display = 'block';
    }

    hideStats() {
        document.getElementById('stats-panel').style.display = 'none';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(message) {
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        
        const successEl = document.getElementById('success-message');
        successEl.style.display = 'none';
    }

    showSuccess(message) {
        const successEl = document.getElementById('success-message');
        successEl.textContent = message;
        successEl.style.display = 'block';
        
        const errorEl = document.getElementById('error-message');
        errorEl.style.display = 'none';
    }

    hideMessages() {
        document.getElementById('error-message').style.display = 'none';
        document.getElementById('success-message').style.display = 'none';
    }
}

// Global functions
function convertToJSON() {
    if (window.csvConverter) {
        window.csvConverter.convertToJSON();
    }
}

function clearInput() {
    document.getElementById('csv-input').value = '';
    document.getElementById('json-output').value = '';
    document.getElementById('file-input').value = '';
    
    if (window.csvConverter) {
        window.csvConverter.hideStats();
        window.csvConverter.hideMessages();
    }
}

function loadExample() {
    loadExampleData('users');
}

function loadExampleData(type) {
    if (window.csvConverter && window.csvConverter.examples[type]) {
        document.getElementById('csv-input').value = window.csvConverter.examples[type];
        
        // Set appropriate delimiter for semicolon example
        if (type === 'semicolon') {
            document.getElementById('delimiter').value = ';';
        } else {
            document.getElementById('delimiter').value = ',';
        }
        
        window.csvConverter.convertToJSON();
    }
}

function copyJSON() {
    const jsonOutput = document.getElementById('json-output');
    const copyBtn = document.getElementById('copy-btn');
    
    if (!jsonOutput.value.trim()) {
        alert('No JSON to copy. Please convert CSV data first.');
        return;
    }
    
    navigator.clipboard.writeText(jsonOutput.value).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#10b981';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '#3b82f6';
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        jsonOutput.select();
        document.execCommand('copy');
        alert('JSON copied to clipboard!');
    });
}

function downloadJSON() {
    const jsonOutput = document.getElementById('json-output');
    
    if (!jsonOutput.value.trim()) {
        alert('No JSON to download. Please convert CSV data first.');
        return;
    }
    
    const blob = new Blob([jsonOutput.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.csvConverter) {
        window.csvConverter.showSuccess('JSON file downloaded successfully!');
    }
}

function validateJSON() {
    const jsonOutput = document.getElementById('json-output');
    
    if (!jsonOutput.value.trim()) {
        alert('No JSON to validate. Please convert CSV data first.');
        return;
    }
    
    try {
        JSON.parse(jsonOutput.value);
        if (window.csvConverter) {
            window.csvConverter.showSuccess('✅ JSON is valid!');
        }
    } catch (error) {
        if (window.csvConverter) {
            window.csvConverter.showError('❌ Invalid JSON: ' + error.message);
        }
    }
}

// Utility class for advanced CSV processing
class CSVUtilities {
    static detectDelimiter(csvText, maxLines = 5) {
        const delimiters = [',', ';', '\t', '|'];
        const lines = csvText.split('\n').slice(0, maxLines);
        const scores = {};
        
        delimiters.forEach(delimiter => {
            let score = 0;
            let consistency = 0;
            let lastCount = -1;
            
            lines.forEach(line => {
                const count = (line.match(new RegExp(delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
                score += count;
                
                if (lastCount === -1) {
                    lastCount = count;
                } else if (lastCount === count) {
                    consistency += 1;
                }
            });
            
            scores[delimiter] = score + consistency * 10; // Weight consistency higher
        });
        
        return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    }
    
    static suggestDataTypes(data) {
        if (!data.length) return {};
        
        const suggestions = {};
        const sampleSize = Math.min(100, data.length);
        
        Object.keys(data[0]).forEach(key => {
            const values = data.slice(0, sampleSize).map(row => row[key]).filter(val => val !== '');
            const types = {
                string: 0,
                number: 0,
                boolean: 0,
                date: 0
            };
            
            values.forEach(value => {
                if (typeof value === 'boolean' || value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                    types.boolean++;
                } else if (!isNaN(value) && !isNaN(parseFloat(value))) {
                    types.number++;
                } else if (this.isDateString(value)) {
                    types.date++;
                } else {
                    types.string++;
                }
            });
            
            suggestions[key] = Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b);
        });
        
        return suggestions;
    }
    
    static isDateString(str) {
        return !isNaN(Date.parse(str)) && isNaN(Number(str));
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.csvConverter = new CSVToJSONConverter();
});
