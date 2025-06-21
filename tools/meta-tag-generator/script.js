/**
 * Meta Tag Generator Tool
 * Professional meta tag generation for SEO optimization
 */

class MetaTagGenerator {
    constructor() {
        this.presets = {
            blog: {
                title: "Your Blog Post Title Here",
                description: "A compelling description of your blog post that summarizes the content in 150-160 characters.",
                keywords: "blog, article, content, tutorial",
                author: "Your Name",
                robots: "index, follow",
                ogType: "article"
            },
            website: {
                title: "Your Website Name | Professional Services",
                description: "Description of your website and the services or products you offer to potential customers.",
                keywords: "business, services, professional, website",
                author: "Company Name",
                robots: "index, follow",
                ogType: "website"
            },
            product: {
                title: "Product Name | Buy Online",
                description: "Detailed description of your product including key features and benefits for potential buyers.",
                keywords: "product, buy, shop, online store",
                author: "Store Name",
                robots: "index, follow",
                ogType: "product"
            },
            ecommerce: {
                title: "Online Store | Shop Products",
                description: "Shop our wide selection of high-quality products with fast shipping and excellent customer service.",
                keywords: "shop, store, products, buy online, ecommerce",
                author: "Store Name",
                robots: "index, follow",
                ogType: "website"
            }
        };
        
        this.socialPlatforms = {
            facebook: { width: 1200, height: 630 },
            X: { width: 1200, height: 675 },
            linkedin: { width: 1200, height: 627 },
            pinterest: { width: 1000, height: 1500 }
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromLocalStorage();
        this.initializePreview();
        this.setupRealTimePreview();
    }

    bindEvents() {
        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => this.generateMetaTags());

        // Clear and reset buttons
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());
        document.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('download-btn').addEventListener('click', () => this.downloadMetaTags());

        // Preset selection
        document.getElementById('preset-select').addEventListener('change', (e) => this.loadPreset(e.target.value));

        // Real-time preview toggle
        document.getElementById('live-preview').addEventListener('change', (e) => {
            this.livePreview = e.target.checked;
            if (this.livePreview) {
                this.generateMetaTags();
            }
        });

        // Form field events for live preview
        const formFields = [
            'page-title', 'meta-description', 'meta-keywords', 'meta-author',
            'canonical-url', 'og-title', 'og-description', 'og-url', 'og-image',
            'og-type', 'og-site-name', 'twitter-title', 'twitter-description',
            'twitter-image', 'twitter-creator', 'viewport', 'robots'
        ];

        formFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('input', () => this.onFieldChange());
                element.addEventListener('change', () => this.onFieldChange());
            }
        });

        // Advanced options toggle
        document.getElementById('show-advanced').addEventListener('click', () => this.toggleAdvancedOptions());

        // Social media platform buttons
        Object.keys(this.socialPlatforms).forEach(platform => {
            const btn = document.getElementById(`${platform}-btn`);
            if (btn) {
                btn.addEventListener('click', () => this.optimizeForPlatform(platform));
            }
        });

        // Character count updates
        document.getElementById('page-title').addEventListener('input', () => this.updateCharCount('title'));
        document.getElementById('meta-description').addEventListener('input', () => this.updateCharCount('description'));

        // Validation toggle
        document.getElementById('validate-tags').addEventListener('change', (e) => {
            this.validateTags = e.target.checked;
            if (this.validateTags) {
                this.validateCurrentTags();
            }
        });

        // Auto-save functionality
        setInterval(() => this.saveToLocalStorage(), 5000);
        window.addEventListener('beforeunload', () => this.saveToLocalStorage());

        // Import/Export functionality
        document.getElementById('import-btn').addEventListener('click', () => this.importMetaTags());
        document.getElementById('export-btn').addEventListener('click', () => this.exportMetaTags());
    }

    onFieldChange() {
        if (this.livePreview) {
            clearTimeout(this.previewTimeout);
            this.previewTimeout = setTimeout(() => this.generateMetaTags(), 500);
        }
        
        this.updateCharCounts();
        this.saveToLocalStorage();
        
        if (this.validateTags) {
            this.validateCurrentTags();
        }
    }

    loadPreset(presetName) {
        if (!presetName || !this.presets[presetName]) return;

        const preset = this.presets[presetName];
        
        // Fill basic fields
        document.getElementById('page-title').value = preset.title;
        document.getElementById('meta-description').value = preset.description;
        document.getElementById('meta-keywords').value = preset.keywords;
        document.getElementById('meta-author').value = preset.author;
        document.getElementById('robots').value = preset.robots;
        
        // Fill Open Graph fields
        document.getElementById('og-title').value = preset.title;
        document.getElementById('og-description').value = preset.description;
        document.getElementById('og-type').value = preset.ogType;
        
        // Fill X fields
        document.getElementById('twitter-title').value = preset.title;
        document.getElementById('twitter-description').value = preset.description;

        this.updateCharCounts();
        this.onFieldChange();
        
        this.showSuccess(`Loaded ${presetName} preset successfully!`);
        this.trackAction('load_preset', presetName);
    }

    generateMetaTags() {
        try {
            const formData = this.getFormData();
            
            if (!formData.title.trim()) {
                this.showError('Page title is required');
                return;
            }

            const metaTags = this.buildMetaTags(formData);
            this.displayMetaTags(metaTags);
            this.updatePreview(formData);
            
            if (this.validateTags) {
                this.validateGeneratedTags(formData);
            }

            this.showSuccess('Meta tags generated successfully!');
            this.trackAction('generate_meta_tags');

        } catch (error) {
            this.showError('Error generating meta tags: ' + error.message);
        }
    }

    getFormData() {
        return {
            title: document.getElementById('page-title').value.trim(),
            description: document.getElementById('meta-description').value.trim(),
            keywords: document.getElementById('meta-keywords').value.trim(),
            author: document.getElementById('meta-author').value.trim(),
            canonicalUrl: document.getElementById('canonical-url').value.trim(),
            viewport: document.getElementById('viewport').value.trim(),
            robots: document.getElementById('robots').value.trim(),
            
            // Open Graph
            ogTitle: document.getElementById('og-title').value.trim(),
            ogDescription: document.getElementById('og-description').value.trim(),
            ogUrl: document.getElementById('og-url').value.trim(),
            ogImage: document.getElementById('og-image').value.trim(),
            ogType: document.getElementById('og-type').value.trim(),
            ogSiteName: document.getElementById('og-site-name').value.trim(),
            
            // X (formerly Twitter)
            twitterTitle: document.getElementById('twitter-title').value.trim(),
            twitterDescription: document.getElementById('twitter-description').value.trim(),
            twitterImage: document.getElementById('twitter-image').value.trim(),
            twitterCreator: document.getElementById('twitter-creator').value.trim(),
            twitterCard: document.getElementById('twitter-card').value.trim() || 'summary_large_image'
        };
    }

    buildMetaTags(data) {
        const tags = [];

        // Basic Meta Tags
        if (data.title) {
            tags.push(`<title>${this.escapeHtml(data.title)}</title>`);
        }

        if (data.description) {
            tags.push(`<meta name="description" content="${this.escapeHtml(data.description)}">`);
        }

        if (data.keywords) {
            tags.push(`<meta name="keywords" content="${this.escapeHtml(data.keywords)}">`);
        }

        if (data.author) {
            tags.push(`<meta name="author" content="${this.escapeHtml(data.author)}">`);
        }

        // Viewport
        const viewport = data.viewport || 'width=device-width, initial-scale=1.0';
        tags.push(`<meta name="viewport" content="${viewport}">`);

        // Robots
        const robots = data.robots || 'index, follow';
        tags.push(`<meta name="robots" content="${robots}">`);

        // Canonical URL
        if (data.canonicalUrl) {
            tags.push(`<link rel="canonical" href="${this.escapeHtml(data.canonicalUrl)}">`);
        }

        // Open Graph Tags
        const ogTitle = data.ogTitle || data.title;
        const ogDescription = data.ogDescription || data.description;

        if (ogTitle) {
            tags.push(`<meta property="og:title" content="${this.escapeHtml(ogTitle)}">`);
        }

        if (ogDescription) {
            tags.push(`<meta property="og:description" content="${this.escapeHtml(ogDescription)}">`);
        }

        if (data.ogUrl) {
            tags.push(`<meta property="og:url" content="${this.escapeHtml(data.ogUrl)}">`);
        }

        if (data.ogImage) {
            tags.push(`<meta property="og:image" content="${this.escapeHtml(data.ogImage)}">`);
        }

        const ogType = data.ogType || 'website';
        tags.push(`<meta property="og:type" content="${ogType}">`);

        if (data.ogSiteName) {
            tags.push(`<meta property="og:site_name" content="${this.escapeHtml(data.ogSiteName)}">`);
        }

        // X (Twitter) Cards
        tags.push(`<meta name="twitter:card" content="${data.twitterCard}">`);

        const twitterTitle = data.twitterTitle || data.title;
        const twitterDescription = data.twitterDescription || data.description;

        if (twitterTitle) {
            tags.push(`<meta name="twitter:title" content="${this.escapeHtml(twitterTitle)}">`);
        }

        if (twitterDescription) {
            tags.push(`<meta name="twitter:description" content="${this.escapeHtml(twitterDescription)}">`);
        }

        const twitterImage = data.twitterImage || data.ogImage;
        if (twitterImage) {
            tags.push(`<meta name="twitter:image" content="${this.escapeHtml(twitterImage)}">`);
        }

        if (data.twitterCreator) {
            const creator = data.twitterCreator.startsWith('@') ? data.twitterCreator : '@' + data.twitterCreator;
            tags.push(`<meta name="twitter:creator" content="${creator}">`);
        }

        // Additional SEO tags
        tags.push(`<meta charset="UTF-8">`);
        tags.push(`<meta http-equiv="X-UA-Compatible" content="IE=edge">`);

        return tags;
    }

    displayMetaTags(tags) {
        const output = document.getElementById('meta-tags-output');
        const formattedTags = tags.map(tag => `    ${tag}`).join('\n');
        
        output.value = `<!DOCTYPE html>
<html lang="en">
<head>
${formattedTags}
</head>
<body>
    <!-- Your page content here -->
</body>
</html>`;

        // Show results section
        document.getElementById('results-section').style.display = 'block';
        
        // Update tag count
        document.getElementById('tag-count').textContent = tags.length;
    }

    updatePreview(data) {
        // Update search result preview
        document.getElementById('preview-title').textContent = data.title || 'Page Title';
        document.getElementById('preview-url').textContent = data.canonicalUrl || 'https://example.com/page';
        document.getElementById('preview-description').textContent = data.description || 'Page description will appear here.';

        // Update social media previews
        this.updateSocialPreview('facebook', data);
        this.updateSocialPreview('X', data);
        this.updateSocialPreview('linkedin', data);
    }

    updateSocialPreview(platform, data) {
        const previewCard = document.getElementById(`${platform}-preview`);
        if (!previewCard) return;

        const title = data.ogTitle || data.title || 'Page Title';
        const description = data.ogDescription || data.description || 'Page description';
        const image = data.ogImage || data.twitterImage || '/images/default-social.jpg';
        const url = data.ogUrl || data.canonicalUrl || 'example.com';

        previewCard.querySelector('.social-preview-title').textContent = title;
        previewCard.querySelector('.social-preview-description').textContent = description;
        previewCard.querySelector('.social-preview-url').textContent = new URL(url, 'https://example.com').hostname;
        
        const imgElement = previewCard.querySelector('.social-preview-image');
        if (imgElement) {
            imgElement.style.backgroundImage = `url(${image})`;
        }
    }

    updateCharCounts() {
        this.updateCharCount('title');
        this.updateCharCount('description');
    }

    updateCharCount(type) {
        const input = document.getElementById(type === 'title' ? 'page-title' : 'meta-description');
        const counter = document.getElementById(`${type}-count`);
        const warning = document.getElementById(`${type}-warning`);
        
        if (!input || !counter) return;

        const length = input.value.length;
        const limits = {
            title: { ideal: 60, max: 70 },
            description: { ideal: 155, max: 160 }
        };

        const limit = limits[type];
        counter.textContent = `${length}/${limit.max}`;

        // Update styling based on length
        if (length > limit.max) {
            counter.className = 'char-count over-limit';
            warning.style.display = 'block';
            warning.textContent = `${type === 'title' ? 'Title' : 'Description'} is too long and may be truncated`;
        } else if (length > limit.ideal) {
            counter.className = 'char-count near-limit';
            warning.style.display = 'block';
            warning.textContent = `Consider shortening your ${type === 'title' ? 'title' : 'description'}`;
        } else if (length < (limit.ideal * 0.5)) {
            counter.className = 'char-count too-short';
            warning.style.display = 'block';
            warning.textContent = `${type === 'title' ? 'Title' : 'Description'} could be longer for better SEO`;
        } else {
            counter.className = 'char-count optimal';
            warning.style.display = 'none';
        }
    }

    optimizeForPlatform(platform) {
        const requirements = {
            facebook: {
                imageSize: '1200x630px',
                titleMax: 100,
                descriptionMax: 300
            },
            X: {
                imageSize: '1200x675px',
                titleMax: 70,
                descriptionMax: 200
            },
            linkedin: {
                imageSize: '1200x627px',
                titleMax: 200,
                descriptionMax: 300
            },
            pinterest: {
                imageSize: '1000x1500px',
                titleMax: 100,
                descriptionMax: 500
            }
        };

        const req = requirements[platform];
        if (!req) return;

        let message = `Optimizing for ${platform}:\n`;
        message += `• Recommended image size: ${req.imageSize}\n`;
        message += `• Title should be under ${req.titleMax} characters\n`;
        message += `• Description should be under ${req.descriptionMax} characters`;

        this.showInfo(message);
        this.trackAction('optimize_platform', platform);
    }

    validateCurrentTags() {
        const data = this.getFormData();
        this.validateGeneratedTags(data);
    }

    validateGeneratedTags(data) {
        const issues = [];

        // Title validation
        if (!data.title) {
            issues.push('❌ Missing page title');
        } else if (data.title.length > 70) {
            issues.push('⚠️ Title too long (may be truncated in search results)');
        } else if (data.title.length < 30) {
            issues.push('⚠️ Title could be longer for better SEO');
        }

        // Description validation
        if (!data.description) {
            issues.push('❌ Missing meta description');
        } else if (data.description.length > 160) {
            issues.push('⚠️ Description too long (may be truncated)');
        } else if (data.description.length < 120) {
            issues.push('⚠️ Description could be longer');
        }

        // Open Graph validation
        if (!data.ogImage) {
            issues.push('⚠️ Missing Open Graph image (recommended for social sharing)');
        }

        if (!data.ogUrl) {
            issues.push('⚠️ Missing Open Graph URL');
        }

        // Canonical URL validation
        if (data.canonicalUrl && !this.isValidUrl(data.canonicalUrl)) {
            issues.push('❌ Invalid canonical URL format');
        }

        // Image URL validation
        if (data.ogImage && !this.isValidUrl(data.ogImage)) {
            issues.push('❌ Invalid Open Graph image URL');
        }

        this.displayValidation(issues);
    }

    displayValidation(issues) {
        const validationResults = document.getElementById('validation-results');
        
        if (issues.length === 0) {
            validationResults.innerHTML = '<div class="validation-success">✅ All meta tags look good!</div>';
        } else {
            validationResults.innerHTML = `
                <div class="validation-issues">
                    <h4>Validation Results:</h4>
                    <ul>
                        ${issues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        validationResults.style.display = 'block';
    }

    toggleAdvancedOptions() {
        const advancedSection = document.getElementById('advanced-options');
        const toggleBtn = document.getElementById('show-advanced');
        
        if (advancedSection.style.display === 'none' || !advancedSection.style.display) {
            advancedSection.style.display = 'block';
            toggleBtn.textContent = 'Hide Advanced Options';
        } else {
            advancedSection.style.display = 'none';
            toggleBtn.textContent = 'Show Advanced Options';
        }
    }

    // Utility methods
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearAll() {
        // Clear all form fields
        const formElements = document.querySelectorAll('#meta-form input, #meta-form textarea, #meta-form select');
        formElements.forEach(element => {
            element.value = '';
        });

        // Reset to defaults
        document.getElementById('viewport').value = 'width=device-width, initial-scale=1.0';
        document.getElementById('robots').value = 'index, follow';
        document.getElementById('og-type').value = 'website';
        document.getElementById('twitter-card').value = 'summary_large_image';

        // Hide results
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('validation-results').style.display = 'none';

        this.updateCharCounts();
        this.trackAction('clear_all');
    }

    async copyToClipboard() {
        const output = document.getElementById('meta-tags-output');
        if (!output.value.trim()) {
            this.showError('No meta tags to copy. Please generate tags first.');
            return;
        }

        try {
            await navigator.clipboard.writeText(output.value);
            this.showSuccess('Meta tags copied to clipboard!');
            this.trackAction('copy_to_clipboard');
        } catch (error) {
            // Fallback for older browsers
            output.select();
            document.execCommand('copy');
            this.showSuccess('Meta tags copied to clipboard!');
        }
    }

    downloadMetaTags() {
        const output = document.getElementById('meta-tags-output');
        if (!output.value.trim()) {
            this.showError('No meta tags to download. Please generate tags first.');
            return;
        }

        const blob = new Blob([output.value], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meta-tags.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.trackAction('download_tags');
    }

    exportMetaTags() {
        const data = this.getFormData();
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: data
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meta-tags-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.trackAction('export_config');
    }

    importMetaTags() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    if (importData.data) {
                        this.loadImportedData(importData.data);
                        this.showSuccess('Configuration imported successfully!');
                        this.trackAction('import_config');
                    } else {
                        this.showError('Invalid configuration file format');
                    }
                } catch (error) {
                    this.showError('Error reading configuration file');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    loadImportedData(data) {
        // Load all form fields from imported data
        Object.keys(data).forEach(key => {
            const mappedId = this.mapImportKey(key);
            const element = document.getElementById(mappedId);
            if (element && data[key]) {
                element.value = data[key];
            }
        });

        this.updateCharCounts();
        this.onFieldChange();
    }

    mapImportKey(key) {
        const mapping = {
            title: 'page-title',
            description: 'meta-description',
            keywords: 'meta-keywords',
            author: 'meta-author',
            canonicalUrl: 'canonical-url',
            ogTitle: 'og-title',
            ogDescription: 'og-description',
            ogUrl: 'og-url',
            ogImage: 'og-image',
            ogType: 'og-type',
            ogSiteName: 'og-site-name',
            twitterTitle: 'twitter-title',
            twitterDescription: 'twitter-description',
            twitterImage: 'twitter-image',
            twitterCreator: 'twitter-creator',
            twitterCard: 'twitter-card'
        };
        return mapping[key] || key;
    }

    initializePreview() {
        // Initialize preview sections
        document.getElementById('preview-section').style.display = 'block';
    }

    setupRealTimePreview() {
        this.livePreview = document.getElementById('live-preview').checked;
    }

    // Message display methods
    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showInfo(message) {
        this.showMessage(message, 'info');
    }

    showMessage(message, type) {
        const container = document.getElementById(`${type === 'error' ? 'error' : 'success'}-container`);
        if (container) {
            container.textContent = message;
            container.style.display = 'block';
            
            setTimeout(() => {
                container.style.display = 'none';
            }, 5000);
        }
    }

    // Storage methods
    saveToLocalStorage() {
        try {
            const data = {
                formData: this.getFormData(),
                settings: {
                    livePreview: this.livePreview,
                    validateTags: this.validateTags
                },
                timestamp: Date.now()
            };
            
            localStorage.setItem('metaTagGenerator', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('metaTagGenerator');
            if (!saved) return;
            
            const data = JSON.parse(saved);
            
            // Don't load data older than 24 hours
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('metaTagGenerator');
                return;
            }
            
            // Restore form data
            if (data.formData) {
                this.loadImportedData(data.formData);
            }
            
            // Restore settings
            if (data.settings) {
                if (data.settings.livePreview !== undefined) {
                    document.getElementById('live-preview').checked = data.settings.livePreview;
                    this.livePreview = data.settings.livePreview;
                }
                if (data.settings.validateTags !== undefined) {
                    document.getElementById('validate-tags').checked = data.settings.validateTags;
                    this.validateTags = data.settings.validateTags;
                }
            }
            
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            localStorage.removeItem('metaTagGenerator');
        }
    }

    // Analytics methods
    trackAction(action, label = null) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_action', {
                'event_category': 'Meta Tag Generator',
                'event_label': label || action,
                'value': 1
            });
        }
    }
}

// Initialize the tool when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MetaTagGenerator();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaTagGenerator;
}