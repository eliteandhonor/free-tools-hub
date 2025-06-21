document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsDiv = document.getElementById('results');
    const keywordTableBody = document.getElementById('keywordTableBody');
    const totalWords = document.getElementById('totalWords');
    const uniqueWords = document.getElementById('uniqueWords');

    function analyzeKeywords() {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please enter some text to analyze');
            return;
        }

        // Clean and split text into words
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2); // Filter out words less than 3 characters

        // Count word frequencies
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });

        // Calculate density and sort by frequency
        const totalWordCount = words.length;
        const sortedWords = Object.entries(wordCount)
            .map(([word, count]) => ({
                word,
                count,
                density: ((count / totalWordCount) * 100).toFixed(2)
            }))
            .sort((a, b) => b.count - a.count);

        // Display results
        displayResults(sortedWords, totalWordCount);
    }

    function displayResults(keywords, totalWordCount) {
        totalWords.textContent = totalWordCount;
        uniqueWords.textContent = keywords.length;

        keywordTableBody.innerHTML = '';
        keywords.slice(0, 50).forEach((keyword, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${keyword.word}</strong></td>
                <td>${keyword.count}</td>
                <td>${keyword.density}%</td>
            `;
            keywordTableBody.appendChild(row);
        });

        resultsDiv.style.display = 'block';
    }

    function clearAll() {
        textInput.value = '';
        resultsDiv.style.display = 'none';
        totalWords.textContent = '0';
        uniqueWords.textContent = '0';
        keywordTableBody.innerHTML = '';
    }

    analyzeBtn.addEventListener('click', analyzeKeywords);
    clearBtn.addEventListener('click', clearAll);

    // Example text
    textInput.placeholder = 'Enter your text here to analyze keyword density. This tool will help you identify the most frequently used words and their density percentages in your content.';
});