document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const scoreElement = document.getElementById('score');
    const issuesElement = document.getElementById('issues');
    const recommendationsElement = document.getElementById('recommendations');

    function analyzeSEO() {
        const url = urlInput.value.trim();
        if (!url) {
            alert('Please enter a URL to analyze');
            return;
        }

        if (!isValidUrl(url)) {
            alert('Please enter a valid URL');
            return;
        }

        loadingDiv.style.display = 'block';
        resultsDiv.style.display = 'none';

        // Simulate analysis (in real implementation, this would call an API)
        setTimeout(() => {
            performSEOAnalysis(url);
        }, 2000);
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function performSEOAnalysis(url) {
        // Mock SEO analysis results
        const analysis = {
            score: Math.floor(Math.random() * 40) + 60, // Score between 60-100
            issues: [
                'Missing meta description',
                'Title tag too long (>60 characters)',
                'No alt text for images',
                'Page load speed could be improved',
                'Missing structured data'
            ],
            recommendations: [
                'Add a compelling meta description (150-160 characters)',
                'Optimize title tag length for better SERP display',
                'Add descriptive alt text to all images',
                'Optimize images and enable compression',
                'Implement JSON-LD structured data',
                'Improve internal linking structure',
                'Add social media meta tags',
                'Ensure mobile responsiveness'
            ]
        };

        displayResults(analysis);
    }

    function displayResults(analysis) {
        loadingDiv.style.display = 'none';
        
        // Display score with color coding
        scoreElement.textContent = analysis.score;
        scoreElement.className = '';
        if (analysis.score >= 80) {
            scoreElement.classList.add('text-success');
        } else if (analysis.score >= 60) {
            scoreElement.classList.add('text-warning');
        } else {
            scoreElement.classList.add('text-danger');
        }

        // Display issues
        issuesElement.innerHTML = '';
        analysis.issues.forEach(issue => {
            const li = document.createElement('li');
            li.textContent = issue;
            li.className = 'list-group-item d-flex align-items-center';
            li.innerHTML = `<i class="fas fa-exclamation-triangle text-warning me-2"></i>${issue}`;
            issuesElement.appendChild(li);
        });

        // Display recommendations
        recommendationsElement.innerHTML = '';
        analysis.recommendations.forEach(recommendation => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex align-items-center';
            li.innerHTML = `<i class="fas fa-lightbulb text-info me-2"></i>${recommendation}`;
            recommendationsElement.appendChild(li);
        });

        resultsDiv.style.display = 'block';
    }

    analyzeBtn.addEventListener('click', analyzeSEO);
    
    // Enter key support
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            analyzeSEO();
        }
    });

    urlInput.placeholder = 'Enter URL to analyze (e.g., https://example.com)';
});