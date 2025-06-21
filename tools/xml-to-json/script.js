// XML to JSON Converter Script

class XMLToJSONConverter {
    constructor() {
        this.examples = {
            simple: `<?xml version="1.0" encoding="UTF-8"?>
<book>
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <genre>Fiction</genre>
    <pages>180</pages>
    <available>true</available>
</book>`,

            attributes: `<?xml version="1.0" encoding="UTF-8"?>
<library>
    <book id="1" category="fiction" language="en">
        <title>1984</title>
        <author nationality="British">George Orwell</author>
        <price currency="USD">12.99</price>
    </book>
    <book id="2" category="science" language="en">
        <title>A Brief History of Time</title>
        <author nationality="British">Stephen Hawking</author>
        <price currency="USD">15.99</price>
    </book>
</library>`,

            nested: `<?xml version="1.0" encoding="UTF-8"?>
<company>
    <name>Tech Corp</name>
    <departments>
        <department id="eng">
            <name>Engineering</name>
            <employees>
                <employee id="001">
                    <name>Alice Johnson</name>
                    <role>Software Engineer</role>
                    <contact>
                        <email>alice@techcorp.com</email>
                        <phone>555-0001</phone>
                    </contact>
                </employee>
                <employee id="002">
                    <name>Bob Wilson</name>
                    <role>DevOps Engineer</role>
                    <contact>
                        <email>bob@techcorp.com</email>
                        <phone>555-0002</phone>
                    </contact>
                </employee>
            </employees>
        </department>
    </departments>
</company>`,

            array: `<?xml version="1.0" encoding="UTF-8"?>
<products>
    <product>
        <name>Laptop</name>
        <price>999.99</price>
        <category>Electronics</category>
    </product>
    <product>
        <name>Mouse</name>
        <price>29.99</price>
        <category>Electronics</category>
    </product>
    <product>
        <name>Keyboard</name>
        <price>79.99</price>
        <category>Electronics</category>
    </product>
    <product>
        <name>Monitor</name>
        <price>299.99</price>
        <category>Electronics</category>
    </product>
</products>`
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFileUpload();
    }

    bindEvents() {
        // Option changes trigger reconversion
        ['compact-output', 'preserve-attributes', 'ignore-whitespace', 'merge-attrs', 'array-mode', 'sanitize-values'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.debounceConvert();
            });
        });

        // Real-time conversion
        document.getElementById('xml-input').addEventListener('input', () => {
            this.debounceConvert();
        });
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
        if (!file.name.match(/\.(xml|txt)$/i)) {
            this.showError('Please select an XML or TXT file.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showError('File size too large. Please select a file smaller than 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('xml-input').value = e.target.result;
            this.convertToJSON();
            this.showSuccess(`File "${file.name}" loaded successfully!`);
        };
        reader.onerror = () => {
            this.showError('Error reading file. Please try again.');
        };
        reader.readAsText(file);
    }

    convertToJSON() {
        const xmlInput = document.getElementById('xml-input').value.trim();
        const jsonOutput = document.getElementById('json-output');
        
        if (!xmlInput) {
            jsonOutput.value = '';
            this.hideStats();
            this.hideMessages();
            return;
        }

        try {
            const options = this.getConversionOptions();
            const result = this.parseXML(xmlInput, options);
            
            if (result.error) {
                this.showError(result.error);
                jsonOutput.value = '';
                this.hideStats();
                return;
            }

            const formattedJSON = this.formatJSON(result.data, options.compactOutput);
            jsonOutput.value = formattedJSON;
            
            this.showStats(result.stats);
            this.hideMessages();

        } catch (error) {
            this.showError('Error parsing XML: ' + error.message);
            jsonOutput.value = '';
            this.hideStats();
        }
    }

    getConversionOptions() {
        return {
            compactOutput: document.getElementById('compact-output').checked,
            preserveAttributes: document.getElementById('preserve-attributes').checked,
            ignoreWhitespace: document.getElementById('ignore-whitespace').checked,
            mergeAttrs: document.getElementById('merge-attrs').checked,
            arrayMode: document.getElementById('array-mode').checked,
            sanitizeValues: document.getElementById('sanitize-values').checked
        };
    }

    parseXML(xmlString, options) {
        try {
            // Parse XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            
            // Check for parsing errors
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                return { error: 'Invalid XML: ' + parseError.textContent };
            }

            // Convert to JSON
            const result = this.xmlToJson(xmlDoc, options);
            
            // Calculate stats
            const stats = this.calculateStats(xmlDoc, result);
            
            return { data: result, stats };

        } catch (error) {
            return { error: error.message };
        }
    }

    xmlToJson(xml, options) {
        const obj = {};
        
        if (xml.nodeType === Node.ELEMENT_NODE) {
            // Handle attributes
            if (xml.attributes.length > 0 && options.preserveAttributes) {
                if (options.mergeAttrs) {
                    // Merge attributes with element content
                    for (let j = 0; j < xml.attributes.length; j++) {
                        const attribute = xml.attributes.item(j);
                        obj[attribute.nodeName] = this.sanitizeValue(attribute.nodeValue, options);
                    }
                } else {
                    // Keep attributes separate
                    obj['@attributes'] = {};
                    for (let j = 0; j < xml.attributes.length; j++) {
                        const attribute = xml.attributes.item(j);
                        obj['@attributes'][attribute.nodeName] = this.sanitizeValue(attribute.nodeValue, options);
                    }
                }
            }
            
            // Handle child nodes
            const children = {};
            const textContent = [];
            
            for (let i = 0; i < xml.childNodes.length; i++) {
                const child = xml.childNodes[i];
                
                if (child.nodeType === Node.TEXT_NODE) {
                    const text = child.nodeValue.trim();
                    if (text || !options.ignoreWhitespace) {
                        textContent.push(text);
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const childName = child.nodeName;
                    const childValue = this.xmlToJson(child, options);
                    
                    if (children[childName]) {
                        // Convert to array if multiple elements with same name
                        if (!Array.isArray(children[childName])) {
                            children[childName] = [children[childName]];
                        }
                        children[childName].push(childValue);
                    } else {
                        children[childName] = options.arrayMode ? [childValue] : childValue;
                    }
                }
            }
            
            // Combine text content and children
            const combinedText = textContent.join('').trim();
            if (combinedText && Object.keys(children).length === 0) {
                // Only text content
                return this.sanitizeValue(combinedText, options);
            } else if (combinedText && Object.keys(children).length > 0) {
                // Mixed content
                obj['#text'] = this.sanitizeValue(combinedText, options);
            }
            
            // Add children to object
            Object.assign(obj, children);
            
        } else if (xml.nodeType === Node.DOCUMENT_NODE) {
            // Handle document node
            for (let i = 0; i < xml.childNodes.length; i++) {
                const child = xml.childNodes[i];
                if (child.nodeType === Node.ELEMENT_NODE) {
                    return { [child.nodeName]: this.xmlToJson(child, options) };
                }
            }
        }
        
        return obj;
    }

    sanitizeValue(value, options) {
        if (!options.sanitizeValues) {
            return value;
        }
        
        // Auto-detect and convert data types
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
        
        // Null
        if (trimmed.toLowerCase() === 'null') return null;
        
        return trimmed;
    }

    calculateStats(xmlDoc, jsonResult) {
        const elements = xmlDoc.querySelectorAll('*').length;
        let attributes = 0;
        
        xmlDoc.querySelectorAll('*').forEach(element => {
            attributes += element.attributes.length;
        });
        
        const size = new Blob([JSON.stringify(jsonResult)]).size;
        
        return { elements, attributes, size };
    }

    formatJSON(data, compact) {
        if (compact) {
            return JSON.stringify(data);
        } else {
            return JSON.stringify(data, null, 2);
        }
    }

    showStats(stats) {
        document.getElementById('elements-count').textContent = stats.elements.toLocaleString();
        document.getElementById('attributes-count').textContent = stats.attributes.toLocaleString();
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
    if (window.xmlConverter) {
        window.xmlConverter.convertToJSON();
    }
}

function clearInput() {
    document.getElementById('xml-input').value = '';
    document.getElementById('json-output').value = '';
    document.getElementById('file-input').value = '';
    
    if (window.xmlConverter) {
        window.xmlConverter.hideStats();
        window.xmlConverter.hideMessages();
    }
}

function loadExample() {
    loadExampleData('simple');
}

function loadExampleData(type) {
    if (window.xmlConverter && window.xmlConverter.examples[type]) {
        document.getElementById('xml-input').value = window.xmlConverter.examples[type];
        window.xmlConverter.convertToJSON();
    }
}

function validateXML() {
    const xmlInput = document.getElementById('xml-input').value.trim();
    
    if (!xmlInput) {
        alert('Please enter XML data to validate.');
        return;
    }
    
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlInput, 'text/xml');
        
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            if (window.xmlConverter) {
                window.xmlConverter.showError('❌ Invalid XML: ' + parseError.textContent);
            }
        } else {
            if (window.xmlConverter) {
                window.xmlConverter.showSuccess('✅ XML is valid!');
            }
        }
    } catch (error) {
        if (window.xmlConverter) {
            window.xmlConverter.showError('❌ XML validation error: ' + error.message);
        }
    }
}

function copyJSON() {
    const jsonOutput = document.getElementById('json-output');
    const copyBtn = document.getElementById('copy-btn');
    
    if (!jsonOutput.value.trim()) {
        alert('No JSON to copy. Please convert XML data first.');
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
        alert('No JSON to download. Please convert XML data first.');
        return;
    }
    
    const blob = new Blob([jsonOutput.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-xml.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.xmlConverter) {
        window.xmlConverter.showSuccess('JSON file downloaded successfully!');
    }
}

function formatJSON() {
    const jsonOutput = document.getElementById('json-output');
    
    if (!jsonOutput.value.trim()) {
        alert('No JSON to format. Please convert XML data first.');
        return;
    }
    
    try {
        const parsed = JSON.parse(jsonOutput.value);
        jsonOutput.value = JSON.stringify(parsed, null, 2);
        
        if (window.xmlConverter) {
            window.xmlConverter.showSuccess('JSON formatted successfully!');
        }
    } catch (error) {
        if (window.xmlConverter) {
            window.xmlConverter.showError('Invalid JSON format: ' + error.message);
        }
    }
}

function validateJSON() {
    const jsonOutput = document.getElementById('json-output');
    
    if (!jsonOutput.value.trim()) {
        alert('No JSON to validate. Please convert XML data first.');
        return;
    }
    
    try {
        JSON.parse(jsonOutput.value);
        if (window.xmlConverter) {
            window.xmlConverter.showSuccess('✅ JSON is valid!');
        }
    } catch (error) {
        if (window.xmlConverter) {
            window.xmlConverter.showError('❌ Invalid JSON: ' + error.message);
        }
    }
}

// Utility class for advanced XML processing
class XMLUtilities {
    static prettifyXML(xmlString) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            const serializer = new XMLSerializer();
            
            // Format the XML
            return this.formatXMLString(serializer.serializeToString(xmlDoc));
        } catch (error) {
            return xmlString;
        }
    }
    
    static formatXMLString(xml) {
        const formatted = [];
        const lines = xml.split('>');
        let indent = 0;
        
        lines.forEach(line => {
            if (line.trim()) {
                if (line.includes('</')) {
                    indent--;
                }
                
                formatted.push('  '.repeat(Math.max(0, indent)) + line + '>');
                
                if (!line.includes('</') && !line.includes('/>')) {
                    indent++;
                }
            }
        });
        
        return formatted.join('\n').replace(/>\n/g, '>\n').trim();
    }
    
    static extractNamespaces(xmlString) {
        const namespaces = {};
        const nsRegex = /xmlns:?([^=]*)?=["']([^"']*)["']/g;
        let match;
        
        while ((match = nsRegex.exec(xmlString)) !== null) {
            const prefix = match[1] || 'default';
            const uri = match[2];
            namespaces[prefix] = uri;
        }
        
        return namespaces;
    }
    
    static removeNamespaces(xmlString) {
        return xmlString
            .replace(/\sxmlns[^=]*="[^"]*"/g, '')
            .replace(/<\/?[^:>]*:/g, match => match.replace(/[^</>]*:/, ''));
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.xmlConverter = new XMLToJSONConverter();
});
