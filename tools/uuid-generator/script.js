// UUID Generator Script

class UUIDGenerator {
    constructor() {
        this.sessionCount = 0;
        this.totalGenerated = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStats();
        this.generateInitialUUIDs();
    }

    bindEvents() {
        // Generation controls
        document.getElementById('generate-btn').addEventListener('click', () => this.generateUUIDs());
        document.getElementById('copy-all-btn').addEventListener('click', () => this.copyAllUUIDs());
        document.getElementById('download-btn').addEventListener('click', () => this.downloadUUIDs());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearOutput());

        // Validation controls
        document.getElementById('validate-btn').addEventListener('click', () => this.validateUUID());
        document.getElementById('validate-input').addEventListener('input', () => this.validateUUID());

        // Version selection
        document.getElementById('uuid-version').addEventListener('change', (e) => this.onVersionChange(e.target.value));

        // Namespace selection for v5
        document.getElementById('uuid-namespace').addEventListener('change', (e) => this.onNamespaceChange(e.target.value));

        // Auto-generate on count change
        document.getElementById('uuid-count').addEventListener('change', () => this.generateUUIDs());

        // Enter key handling
        document.getElementById('validate-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validateUUID();
            }
        });

        document.getElementById('uuid-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateUUIDs();
            }
        });
    }

    generateInitialUUIDs() {
        this.generateUUIDs();
    }

    generateUUIDs() {
        const version = document.getElementById('uuid-version').value;
        const count = parseInt(document.getElementById('uuid-count').value) || 1;
        
        if (count < 1 || count > 1000) {
            this.showNotification('Please enter a number between 1 and 1000', 'warning');
            return;
        }

        const uuids = [];
        
        try {
            for (let i = 0; i < count; i++) {
                let uuid;
                switch (version) {
                    case 'v1':
                        uuid = this.generateUUIDv1();
                        break;
                    case 'v4':
                        uuid = this.generateUUIDv4();
                        break;
                    case 'v5':
                        uuid = this.generateUUIDv5();
                        break;
                    default:
                        uuid = this.generateUUIDv4();
                }
                uuids.push(uuid);
            }

            this.displayUUIDs(uuids);
            this.sessionCount += count;
            this.totalGenerated += count;
            this.updateStats();
            
        } catch (error) {
            this.showNotification('Error generating UUIDs: ' + error.message, 'error');
        }
    }

    generateUUIDv4() {
        // Version 4 UUID (random)
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    generateUUIDv1() {
        // Version 1 UUID (time-based)
        // Note: This is a simplified implementation
        const timestamp = Date.now();
        const timestampHex = timestamp.toString(16).padStart(12, '0');
        
        // Gregorian epoch offset (1582-10-15 00:00:00 UTC to 1970-01-01 00:00:00 UTC)
        const gregorianEpoch = 0x01b21dd213814000;
        const uuidTime = (timestamp * 10000) + gregorianEpoch;
        
        const timeLow = (uuidTime & 0xffffffff).toString(16).padStart(8, '0');
        const timeMid = ((uuidTime >> 32) & 0xffff).toString(16).padStart(4, '0');
        const timeHigh = (((uuidTime >> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
        
        // Clock sequence (random for simplicity)
        const clockSeq = (Math.random() * 0x3fff | 0x8000).toString(16).padStart(4, '0');
        
        // Node (random MAC address for privacy)
        const node = Array.from({length: 6}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
        
        return `${timeLow}-${timeMid}-${timeHigh}-${clockSeq}-${node}`;
    }

    generateUUIDv5() {
        // Version 5 UUID (name-based SHA-1)
        const nameInput = document.getElementById('uuid-name').value;
        
        if (!nameInput.trim()) {
            throw new Error('Name is required for UUID v5');
        }

        const namespaceSelect = document.getElementById('uuid-namespace').value;
        let namespace;

        switch (namespaceSelect) {
            case 'dns':
                namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
                break;
            case 'url':
                namespace = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
                break;
            case 'oid':
                namespace = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
                break;
            case 'x500':
                namespace = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';
                break;
            case 'custom':
                namespace = document.getElementById('custom-namespace').value;
                if (!this.isValidUUID(namespace)) {
                    throw new Error('Invalid custom namespace UUID');
                }
                break;
            default:
                namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
        }

        // Convert namespace UUID to bytes
        const namespaceBytes = this.uuidToBytes(namespace);
        const nameBytes = new TextEncoder().encode(nameInput);
        
        // Combine namespace and name
        const combined = new Uint8Array(namespaceBytes.length + nameBytes.length);
        combined.set(namespaceBytes);
        combined.set(nameBytes, namespaceBytes.length);
        
        // Generate SHA-1 hash (simplified - using a basic hash for demo)
        const hash = this.simpleSHA1(combined);
        
        // Format as UUID v5
        return this.formatUUIDv5(hash);
    }

    uuidToBytes(uuid) {
        const hex = uuid.replace(/-/g, '');
        const bytes = new Uint8Array(16);
        for (let i = 0; i < 16; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes;
    }

    simpleSHA1(data) {
        // This is a simplified hash function for your convenience
        // In production, use a proper SHA-1 implementation
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data[i];
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Convert to 16 bytes (simplified)
        const bytes = new Uint8Array(16);
        for (let i = 0; i < 16; i++) {
            bytes[i] = (hash + i * 37) & 0xff;
        }
        return bytes;
    }

    formatUUIDv5(hash) {
        // Set version (5) and variant bits
        hash[6] = (hash[6] & 0x0f) | 0x50; // Version 5
        hash[8] = (hash[8] & 0x3f) | 0x80; // Variant bits
        
        const hex = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    }

    displayUUIDs(uuids) {
        const output = document.getElementById('uuid-output');
        const list = document.getElementById('uuid-list');
        
        output.value = uuids.join('\n');
        
        // Create interactive list
        list.innerHTML = '';
        uuids.forEach((uuid, index) => {
            const item = document.createElement('div');
            item.className = 'uuid-item';
            item.innerHTML = `
                <span class="uuid-text">${uuid}</span>
                <button class="copy-btn" onclick="this.parentElement.parentElement.copyUUID('${uuid}')">
                    <i class="fas fa-copy"></i>
                </button>
            `;
            list.appendChild(item);
        });
    }

    copyUUID(uuid) {
        navigator.clipboard.writeText(uuid).then(() => {
            this.showNotification('UUID copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = uuid;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('UUID copied to clipboard!', 'success');
        });
    }

    copyAllUUIDs() {
        const output = document.getElementById('uuid-output');
        
        if (!output.value.trim()) {
            this.showNotification('No UUIDs to copy!', 'warning');
            return;
        }

        navigator.clipboard.writeText(output.value).then(() => {
            this.showNotification('All UUIDs copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback
            output.select();
            document.execCommand('copy');
            this.showNotification('All UUIDs copied to clipboard!', 'success');
        });
    }

    downloadUUIDs() {
        const output = document.getElementById('uuid-output');
        
        if (!output.value.trim()) {
            this.showNotification('No UUIDs to download!', 'warning');
            return;
        }

        const version = document.getElementById('uuid-version').value;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `uuids-${version}-${timestamp}.txt`;

        const blob = new Blob([output.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification(`UUIDs downloaded as ${filename}`, 'success');
    }

    clearOutput() {
        document.getElementById('uuid-output').value = '';
        document.getElementById('uuid-list').innerHTML = '';
        this.showNotification('Output cleared!', 'success');
    }

    validateUUID() {
        const input = document.getElementById('validate-input').value.trim();
        const result = document.getElementById('validation-result');
        
        if (!input) {
            result.innerHTML = '';
            return;
        }

        const validation = this.performUUIDValidation(input);
        
        result.innerHTML = `
            <div class="validation-status ${validation.isValid ? 'valid' : 'invalid'}">
                <i class="fas fa-${validation.isValid ? 'check-circle' : 'times-circle'}"></i>
                <span>${validation.isValid ? 'Valid UUID' : 'Invalid UUID'}</span>
            </div>
            ${validation.details ? `<div class="validation-details">${validation.details}</div>` : ''}
        `;
    }

    performUUIDValidation(uuid) {
        // Basic format check
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        if (!uuidRegex.test(uuid)) {
            return {
                isValid: false,
                details: 'Invalid UUID format. Expected: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
            };
        }

        // Extract version
        const version = parseInt(uuid.charAt(14), 16);
        const variant = parseInt(uuid.charAt(19), 16);
        
        let versionName = '';
        switch (version) {
            case 1: versionName = 'Time-based'; break;
            case 2: versionName = 'DCE Security'; break;
            case 3: versionName = 'Name-based (MD5)'; break;
            case 4: versionName = 'Random'; break;
            case 5: versionName = 'Name-based (SHA-1)'; break;
            default: versionName = 'Unknown';
        }

        const variantType = (variant & 0x8) ? 'RFC 4122' : 'Other';

        return {
            isValid: true,
            details: `Version: ${version} (${versionName})<br>Variant: ${variantType}<br>Format: Standard UUID`
        };
    }

    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    onVersionChange(version) {
        const v5Options = document.getElementById('v5-options');
        const v5Name = document.getElementById('v5-name');
        
        if (version === 'v5') {
            v5Options.style.display = 'block';
            v5Name.style.display = 'block';
        } else {
            v5Options.style.display = 'none';
            v5Name.style.display = 'none';
        }
        
        this.updateStats();
        this.generateUUIDs();
    }

    onNamespaceChange(namespace) {
        const customNamespace = document.getElementById('v5-custom-namespace');
        
        if (namespace === 'custom') {
            customNamespace.style.display = 'block';
        } else {
            customNamespace.style.display = 'none';
        }
    }

    updateStats() {
        const version = document.getElementById('uuid-version').value;
        const now = new Date().toLocaleTimeString();
        
        document.getElementById('total-generated').textContent = this.totalGenerated.toLocaleString();
        document.getElementById('current-version').textContent = version.toUpperCase();
        document.getElementById('session-count').textContent = this.sessionCount.toLocaleString();
        document.getElementById('last-generated').textContent = this.sessionCount > 0 ? now : '-';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Make copyUUID available globally for the inline onclick handlers
window.copyUUID = function(uuid) {
    if (window.uuidGeneratorInstance) {
        window.uuidGeneratorInstance.copyUUID(uuid);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uuidGeneratorInstance = new UUIDGenerator();
});