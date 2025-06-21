document.addEventListener('DOMContentLoaded', function() {
    const titleInput = document.getElementById('titleInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const urlInput = document.getElementById('urlInput');
    const previewBtn = document.getElementById('previewBtn');
    const clearBtn = document.getElementById('clearBtn');
    const serpPreview = document.getElementById('serpPreview');
    const previewTitle = document.getElementById('previewTitle');
    const previewUrl = document.getElementById('previewUrl');
    const previewDescription = document.getElementById('previewDescription');
    const titleLength = document.getElementById('titleLength');
    const descriptionLength = document.getElementById('descriptionLength');

    function updatePreview() {
        const title = titleInput.value || 'Your Page Title';
        const description = descriptionInput.value || 'Your meta description will appear here...';
        const url = urlInput.value || 'https://example.com/page-url';

        // Update preview
        previewTitle.textContent = title.length > 60 ? title.substring(0, 57) + '...' : title;
        previewDescription.textContent = description.length > 160 ? description.substring(0, 157) + '...' : description;
        
        // Format URL for display
        let displayUrl = url;
        try {
            const urlObj = new URL(url);
            displayUrl = urlObj.hostname + urlObj.pathname;
            if (displayUrl.length > 50) {
                displayUrl = displayUrl.substring(0, 47) + '...';
            }
        } catch (e) {
            displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
        }
        previewUrl.textContent = displayUrl;

        // Show preview
        serpPreview.style.display = 'block';
    }

    function updateCharacterCounts() {
        const titleLen = titleInput.value.length;
        const descLen = descriptionInput.value.length;

        titleLength.textContent = titleLen;
        titleLength.className = titleLen > 60 ? 'text-danger' : titleLen > 50 ? 'text-warning' : 'text-success';

        descriptionLength.textContent = descLen;
        descriptionLength.className = descLen > 160 ? 'text-danger' : descLen > 140 ? 'text-warning' : 'text-success';
    }

    function clearAll() {
        titleInput.value = '';
        descriptionInput.value = '';
        urlInput.value = '';
        serpPreview.style.display = 'none';
        updateCharacterCounts();
    }

    // Event listeners
    titleInput.addEventListener('input', function() {
        updateCharacterCounts();
        if (titleInput.value.trim()) updatePreview();
    });

    descriptionInput.addEventListener('input', function() {
        updateCharacterCounts();
        if (descriptionInput.value.trim()) updatePreview();
    });

    urlInput.addEventListener('input', function() {
        if (urlInput.value.trim()) updatePreview();
    });

    previewBtn.addEventListener('click', updatePreview);
    clearBtn.addEventListener('click', clearAll);

    // Set placeholders and initial state
    titleInput.placeholder = 'Enter your page title (recommended: 30-60 characters)';
    descriptionInput.placeholder = 'Enter your meta description (recommended: 120-160 characters)';
    urlInput.placeholder = 'https://example.com/your-page-url';
    
    updateCharacterCounts();

    // Add example data
    titleInput.value = 'Free SEO Tools - Boost Your Website Rankings';
    descriptionInput.value = 'Discover powerful free SEO tools to analyze, optimize and improve your website performance. Get better search rankings today!';
    urlInput.value = 'https://freetoolshub.com/seo-tools';
    updateCharacterCounts();
    updatePreview();
});