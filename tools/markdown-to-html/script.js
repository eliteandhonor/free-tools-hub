// Markdown to HTML Converter Script

class MarkdownConverter {
    constructor() {
        this.isRawView = false;
        this.currentTheme = 'github';
        this.debounceTimer = null;
        this.init();
    }

    init() {
        this.setupMarked();
        this.bindEvents();
        this.loadSample();
        this.applyTheme(this.currentTheme);
    }

    setupMarked() {
        // Configure marked.js options
        marked.setOptions({
            gfm: true,
            breaks: true,
            tables: true,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            highlight: function(code, lang) {
                if (Prism.languages[lang]) {
                    return Prism.highlight(code, Prism.languages[lang], lang);
                }
                return code;
            }
        });

        // Custom renderer for better HTML output
        const renderer = new marked.Renderer();
        
        // Custom table rendering
        renderer.table = function(header, body) {
            return `<div class="table-wrapper">
                        <table class="markdown-table">
                            <thead>${header}</thead>
                            <tbody>${body}</tbody>
                        </table>
                    </div>`;
        };

        // Custom code block rendering
        renderer.code = function(code, language) {
            const validLang = Prism.languages[language] ? language : 'text';
            const highlightedCode = Prism.languages[validLang] 
                ? Prism.highlight(code, Prism.languages[validLang], validLang)
                : code;
            
            return `<div class="code-block">
                        <div class="code-header">
                            <span class="code-language">${language || 'text'}</span>
                            <button class="copy-code-btn" onclick="copyCode(this)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <pre class="language-${validLang}"><code>${highlightedCode}</code></pre>
                    </div>`;
        };

        // Custom task list rendering
        renderer.listitem = function(text) {
            if (/^\[[ x]\]\s/.test(text)) {
                const checked = /^\[x\]\s/.test(text);
                const cleanText = text.replace(/^\[[ x]\]\s/, '');
                return `<li class="task-list-item">
                            <input type="checkbox" ${checked ? 'checked' : ''} disabled>
                            ${cleanText}
                        </li>`;
            }
            return `<li>${text}</li>`;
        };

        marked.use({ renderer });
    }

    bindEvents() {
        const markdownInput = document.getElementById('markdown-input');
        
        // Input events
        markdownInput.addEventListener('input', () => this.handleInput());
        markdownInput.addEventListener('scroll', () => this.syncScroll());

        // Settings
        document.getElementById('enable-gfm').addEventListener('change', () => this.updateSettings());
        document.getElementById('enable-tables').addEventListener('change', () => this.updateSettings());
        document.getElementById('enable-breaks').addEventListener('change', () => this.updateSettings());
        document.getElementById('enable-strikethrough').addEventListener('change', () => this.updateSettings());
        document.getElementById('enable-tasklists').addEventListener('change', () => this.updateSettings());
        document.getElementById('theme-select').addEventListener('change', (e) => this.applyTheme(e.target.value));

        // Action buttons
        document.getElementById('clear-input-btn').addEventListener('click', () => this.clearInput());
        document.getElementById('load-sample-btn').addEventListener('click', () => this.loadSample());
        document.getElementById('upload-file-btn').addEventListener('click', () => this.uploadFile());
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('copy-html-btn').addEventListener('click', () => this.copyHtml());
        document.getElementById('download-html-btn').addEventListener('click', () => this.downloadHtml());
        document.getElementById('toggle-view-btn').addEventListener('click', () => this.toggleView());

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e));
        });
    }

    handleInput() {
        // Debounce input to avoid too frequent updates
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.convertMarkdown();
            this.updateStats();
        }, 300);
    }

    convertMarkdown() {
        const markdownText = document.getElementById('markdown-input').value;
        const htmlOutput = document.getElementById('html-output');
        const htmlPreview = document.getElementById('html-preview');

        try {
            const html = marked.parse(markdownText);
            htmlOutput.value = this.formatHtml(html);
            htmlPreview.innerHTML = html;
            
            // Re-run Prism highlighting for dynamically added code
            Prism.highlightAllUnder(htmlPreview);
        } catch (error) {
            console.error('Markdown parsing error:', error);
            htmlOutput.value = 'Error parsing markdown: ' + error.message;
            htmlPreview.innerHTML = '<div class="error">Error parsing markdown: ' + error.message + '</div>';
        }
    }

    formatHtml(html) {
        // Basic HTML formatting for better readability
        return html
            .replace(/></g, '>\\n<')
            .replace(/\\n\\s*\\n/g, '\\n')
            .trim();
    }

    updateStats() {
        const text = document.getElementById('markdown-input').value;
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
        const lines = text.split('\\n').length;

        document.getElementById('char-count').textContent = `${chars.toLocaleString()} characters`;
        document.getElementById('word-count').textContent = `${words.toLocaleString()} words`;
        document.getElementById('line-count').textContent = `${lines.toLocaleString()} lines`;
    }

    updateSettings() {
        const settings = {
            gfm: document.getElementById('enable-gfm').checked,
            tables: document.getElementById('enable-tables').checked,
            breaks: document.getElementById('enable-breaks').checked,
            // strikethrough and tasklists are handled by GFM
        };

        marked.setOptions(settings);
        this.convertMarkdown();
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        const preview = document.getElementById('html-preview');
        
        // Remove existing theme classes
        preview.classList.remove('theme-github', 'theme-dark', 'theme-clean', 'theme-minimal');
        
        // Add new theme class
        preview.classList.add(`theme-${theme}`);
        
        document.getElementById('theme-select').value = theme;
    }

    syncScroll() {
        const input = document.getElementById('markdown-input');
        const preview = document.getElementById('html-preview');
        
        const scrollPercentage = input.scrollTop / (input.scrollHeight - input.clientHeight);
        preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
    }

    clearInput() {
        document.getElementById('markdown-input').value = '';
        this.convertMarkdown();
        this.updateStats();
        this.showNotification('Input cleared!', 'success');
    }

    loadSample() {
        const sampleMarkdown = `# Markdown to HTML Converter

This is a **comprehensive** Markdown to HTML converter with *live preview* and ~~advanced~~ features.

## Features

- [x] GitHub Flavored Markdown support
- [x] Live HTML preview
- [x] Syntax highlighting
- [ ] Export to PDF (coming soon)

## Code Example

\\`\\`\\`javascript
function convertMarkdown(text) {
    return marked.parse(text);
}

const result = convertMarkdown('# Hello World');
console.log(result);
\\`\\`\\`

## Table Example

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✅ | H1-H6 |
| Lists | ✅ | Ordered & Unordered |
| Code | ✅ | Inline and blocks |
| Tables | ✅ | GitHub style |

## Links and Images

Check out our [website](https://freetoolshub.com) for more tools!

## Blockquote

> This is a blockquote.
> It can span multiple lines.

## Horizontal Rule

---

That's all folks! 🎉`;

        document.getElementById('markdown-input').value = sampleMarkdown;
        this.convertMarkdown();
        this.updateStats();
        this.showNotification('Sample loaded!', 'success');
    }

    uploadFile() {
        document.getElementById('file-input').click();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.match(/\\.(md|txt)$/i)) {
            this.showNotification('Please select a .md or .txt file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('markdown-input').value = e.target.result;
            this.convertMarkdown();
            this.updateStats();
            this.showNotification(`File "${file.name}" loaded successfully!`, 'success');
        };
        reader.readAsText(file);
    }

    copyHtml() {
        const html = this.isRawView 
            ? document.getElementById('html-output').value
            : document.getElementById('html-output').value;

        navigator.clipboard.writeText(html).then(() => {
            this.showNotification('HTML copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = html;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('HTML copied to clipboard!', 'success');
        });
    }

    downloadHtml() {
        const html = document.getElementById('html-output').value;
        const fullHtml = this.generateCompleteHtml(html);
        
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted-markdown.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('HTML file downloaded!', 'success');
    }

    generateCompleteHtml(bodyHtml) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Markdown</title>
    <style>
        ${this.getThemeCSS()}
    </style>
</head>
<body>
    <div class="markdown-body">
        ${bodyHtml}
    </div>
</body>
</html>`;
    }

    getThemeCSS() {
        // Return CSS for the current theme
        const themes = {
            github: `
                .markdown-body { font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; line-height: 1.6; color: #24292e; max-width: 800px; margin: 0 auto; padding: 2rem; }
                .markdown-body h1, .markdown-body h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
                .markdown-body table { border-collapse: collapse; width: 100%; }
                .markdown-body th, .markdown-body td { border: 1px solid #dfe2e5; padding: 6px 13px; }
                .markdown-body th { background-color: #f6f8fa; }
                .markdown-body code { background-color: rgba(27,31,35,0.05); padding: 0.2em 0.4em; border-radius: 3px; }
                .markdown-body pre { background-color: #f6f8fa; border-radius: 6px; padding: 16px; overflow: auto; }
                .markdown-body blockquote { border-left: 0.25em solid #dfe2e5; padding: 0 1em; color: #6a737d; }
            `,
            dark: `
                .markdown-body { font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; line-height: 1.6; color: #c9d1d9; background-color: #0d1117; max-width: 800px; margin: 0 auto; padding: 2rem; }
                .markdown-body h1, .markdown-body h2 { border-bottom: 1px solid #21262d; padding-bottom: 0.3em; color: #f0f6fc; }
                .markdown-body table { border-collapse: collapse; width: 100%; }
                .markdown-body th, .markdown-body td { border: 1px solid #30363d; padding: 6px 13px; }
                .markdown-body th { background-color: #161b22; }
                .markdown-body code { background-color: rgba(110,118,129,0.4); padding: 0.2em 0.4em; border-radius: 3px; }
                .markdown-body pre { background-color: #161b22; border-radius: 6px; padding: 16px; overflow: auto; }
                .markdown-body blockquote { border-left: 0.25em solid #30363d; padding: 0 1em; color: #8b949e; }
            `,
            clean: `
                .markdown-body { font-family: Georgia, serif; line-height: 1.8; color: #333; max-width: 700px; margin: 0 auto; padding: 2rem; }
                .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: #2c3e50; margin-top: 2em; }
                .markdown-body table { border: none; width: 100%; }
                .markdown-body th, .markdown-body td { border-bottom: 1px solid #ecf0f1; padding: 12px 8px; }
                .markdown-body th { background-color: #f8f9fa; font-weight: 600; }
                .markdown-body code { background-color: #f8f9fa; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'Courier New', monospace; }
                .markdown-body pre { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; overflow: auto; }
                .markdown-body blockquote { border-left: 4px solid #3498db; padding: 0 1.5em; margin: 1.5em 0; font-style: italic; }
            `,
            minimal: `
                .markdown-body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #444; max-width: 600px; margin: 0 auto; padding: 2rem; }
                .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: #222; font-weight: 300; }
                .markdown-body table { width: 100%; border: none; }
                .markdown-body th, .markdown-body td { padding: 8px 12px; text-align: left; }
                .markdown-body th { border-bottom: 2px solid #ddd; }
                .markdown-body td { border-bottom: 1px solid #eee; }
                .markdown-body code { background-color: #f5f5f5; padding: 0.1em 0.3em; border-radius: 2px; font-size: 0.9em; }
                .markdown-body pre { background-color: #f5f5f5; border-radius: 3px; padding: 15px; overflow: auto; }
                .markdown-body blockquote { border-left: 3px solid #ddd; padding: 0 1em; color: #666; }
            `
        };
        
        return themes[this.currentTheme] || themes.github;
    }

    toggleView() {
        const preview = document.getElementById('html-preview');
        const output = document.getElementById('html-output');
        const button = document.getElementById('toggle-view-btn');
        
        this.isRawView = !this.isRawView;
        
        if (this.isRawView) {
            preview.style.display = 'none';
            output.style.display = 'block';
            button.innerHTML = '<i class="fas fa-eye"></i> Preview';
        } else {
            preview.style.display = 'block';
            output.style.display = 'none';
            button.innerHTML = '<i class="fas fa-code"></i> Raw HTML';
        }
    }

    handleQuickAction(event) {
        const action = event.currentTarget.dataset.action;
        const textarea = document.getElementById('markdown-input');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let insertion = '';
        let cursorOffset = 0;
        
        switch (action) {
            case 'heading':
                insertion = `# ${selectedText || 'Heading'}`;
                cursorOffset = selectedText ? 0 : -7;
                break;
            case 'bold':
                insertion = `**${selectedText || 'bold text'}**`;
                cursorOffset = selectedText ? 0 : -11;
                break;
            case 'italic':
                insertion = `*${selectedText || 'italic text'}*`;
                cursorOffset = selectedText ? 0 : -12;
                break;
            case 'link':
                insertion = `[${selectedText || 'link text'}](url)`;
                cursorOffset = selectedText ? -5 : -14;
                break;
            case 'image':
                insertion = `![${selectedText || 'alt text'}](image-url)`;
                cursorOffset = selectedText ? -12 : -21;
                break;
            case 'code':
                insertion = `\\n\\`\\`\\`javascript\\n${selectedText || 'code here'}\\n\\`\\`\\`\\n`;
                cursorOffset = selectedText ? 0 : -15;
                break;
            case 'table':
                insertion = `\\n| Header 1 | Header 2 |\\n|----------|----------|\\n| Cell 1   | Cell 2   |\\n`;
                cursorOffset = 0;
                break;
            case 'list':
                insertion = `\\n- ${selectedText || 'List item'}\\n- Item 2\\n- Item 3\\n`;
                cursorOffset = selectedText ? 0 : -20;
                break;
        }
        
        textarea.value = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
        
        const newPosition = start + insertion.length + cursorOffset;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
        
        this.convertMarkdown();
        this.updateStats();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
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
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
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

// Global function for copying code blocks
function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    }).catch(() => {
        console.error('Failed to copy code');
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownConverter();
});
