document.addEventListener('DOMContentLoaded', function() {
    const websiteUrlInput = document.getElementById('websiteUrl');
    const urlsTextarea = document.getElementById('urlsTextarea');
    const addUrlBtn = document.getElementById('addUrlBtn');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const sitemapOutput = document.getElementById('sitemapOutput');
    const urlInput = document.getElementById('urlInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const changefreqSelect = document.getElementById('changefreqSelect');

    let urls = [];

    function addUrl() {
        const url = urlInput.value.trim();
        const priority = prioritySelect.value;
        const changefreq = changefreqSelect.value;

        if (!url) {
            alert('Please enter a URL');
            return;
        }

        if (!isValidUrl(url)) {
            alert('Please enter a valid URL');
            return;
        }

        urls.push({
            url: url,
            priority: priority,
            changefreq: changefreq,
            lastmod: new Date().toISOString().split('T')[0]
        });

        updateUrlsList();
        
        // Clear inputs
        urlInput.value = '';
        prioritySelect.value = '0.5';
        changefreqSelect.value = 'monthly';
    }

    function updateUrlsList() {
        let urlsText = '';
        urls.forEach((urlObj, index) => {
            urlsText += `${index + 1}. ${urlObj.url} (Priority: ${urlObj.priority}, Change: ${urlObj.changefreq})\n`;
        });
        urlsTextarea.value = urlsText;
    }

    function removeUrl(index) {
        urls.splice(index, 1);
        updateUrlsList();
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function generateSitemap() {
        const websiteUrl = websiteUrlInput.value.trim();
        
        if (!websiteUrl) {
            alert('Please enter your website URL');
            return;
        }

        if (urls.length === 0) {
            alert('Please add at least one URL');
            return;
        }

        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        urls.forEach(urlObj => {
            sitemap += '  <url>\n';
            sitemap += `    <loc>${urlObj.url}</loc>\n`;
            sitemap += `    <lastmod>${urlObj.lastmod}</lastmod>\n`;
            sitemap += `    <changefreq>${urlObj.changefreq}</changefreq>\n`;
            sitemap += `    <priority>${urlObj.priority}</priority>\n`;
            sitemap += '  </url>\n';
        });

        sitemap += '</urlset>';

        sitemapOutput.textContent = sitemap;
        sitemapOutput.style.display = 'block';
        copyBtn.style.display = 'inline-block';
        downloadBtn.style.display = 'inline-block';
    }

    function copyToClipboard() {
        sitemapOutput.select();
        document.execCommand('copy');
        
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }

    function downloadSitemap() {
        const content = sitemapOutput.textContent;
        const blob = new Blob([content], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sitemap.xml';
        link.click();
        window.URL.revokeObjectURL(url);
    }

    // Event listeners
    addUrlBtn.addEventListener('click', addUrl);
    generateBtn.addEventListener('click', generateSitemap);
    copyBtn.addEventListener('click', copyToClipboard);
    downloadBtn.addEventListener('click', downloadSitemap);

    // Enter key support for URL input
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addUrl();
        }
    });

    // Set placeholders
    websiteUrlInput.placeholder = 'https://example.com';
    urlInput.placeholder = 'https://example.com/page-url';

    // Add default homepage URL when website URL is entered
    websiteUrlInput.addEventListener('blur', function() {
        const websiteUrl = this.value.trim();
        if (websiteUrl && urls.length === 0) {
            urls.push({
                url: websiteUrl,
                priority: '1.0',
                changefreq: 'daily',
                lastmod: new Date().toISOString().split('T')[0]
            });
            updateUrlsList();
        }
    });
});
