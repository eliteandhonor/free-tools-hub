        class CodeBeautifier {
            constructor() {
                this.initializeTabs();
            }
            
            initializeTabs() {
                const tabButtons = document.querySelectorAll('.tab-button');
                const tabContents = document.querySelectorAll('.tab-content');

                tabButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const targetTab = button.dataset.tab;

                        // Remove active class from all buttons and contents
                        tabButtons.forEach(btn => btn.classList.remove('active'));
                        tabContents.forEach(content => content.classList.remove('active'));

                        // Add active class to clicked button and target content
                        button.classList.add('active');
                        document.getElementById(targetTab).classList.add('active');
                    });
                });
            }
            
            beautifyHTML() {
                const input = document.getElementById('html-input').value;
                const output = document.getElementById('html-output');
                
                if (!input.trim()) {
                    output.value = '';
                    this.hideStats('html');
                    return;
                }
                
                try {
                    const options = {
                        indent_size: 2,
                        indent_char: ' ',
                        max_preserve_newlines: document.getElementById('html-preserve-newlines').checked ? 2 : 0,
                        preserve_newlines: document.getElementById('html-preserve-newlines').checked,
                        keep_array_indentation: false,
                        break_chained_methods: false,
                        indent_scripts: 'keep',
                        brace_style: 'collapse',
                        space_before_conditional: true,
                        unescape_strings: false,
                        jslint_happy: false,
                        end_with_newline: true,
                        wrap_line_length: document.getElementById('html-wrap-attributes').checked ? 80 : 0,
                        indent_inner_html: document.getElementById('html-indent-inner').checked,
                        comma_first: false,
                        e4x: false,
                        indent_empty_lines: false
                    };
                    
                    const beautified = html_beautify(input, options);
                    output.value = beautified;
                    this.updateHTMLStats(beautified);
                    this.showStats('html');
                } catch (error) {
                    output.value = 'Error: Unable to beautify HTML. Please check your input.';
                    this.hideStats('html');
                }
            }
            
            beautifyCSS() {
                const input = document.getElementById('css-input').value;
                const output = document.getElementById('css-output');
                
                if (!input.trim()) {
                    output.value = '';
                    this.hideStats('css');
                    return;
                }
                
                try {
                    const options = {
                        indent_size: 2,
                        indent_char: ' ',
                        preserve_newlines: document.getElementById('css-preserve-newlines').checked,
                        max_preserve_newlines: 2,
                        newline_between_rules: document.getElementById('css-newline-rules').checked,
                        space_around_selector_separator: document.getElementById('css-space-selectors').checked,
                        end_with_newline: true
                    };
                    
                    const beautified = css_beautify(input, options);
                    output.value = beautified;
                    this.updateCSSStats(beautified);
                    this.showStats('css');
                } catch (error) {
                    output.value = 'Error: Unable to beautify CSS. Please check your input.';
                    this.hideStats('css');
                }
            }
            
            beautifyJS() {
                const input = document.getElementById('js-input').value;
                const output = document.getElementById('js-output');
                
                if (!input.trim()) {
                    output.value = '';
                    this.hideStats('js');
                    return;
                }
                
                try {
                    const options = {
                        indent_size: 2,
                        indent_char: ' ',
                        preserve_newlines: document.getElementById('js-preserve-newlines').checked,
                        max_preserve_newlines: 2,
                        brace_style: document.getElementById('js-brace-style').checked ? 'collapse' : 'expand',
                        space_in_empty_paren: false,
                        space_in_paren: false,
                        jslint_happy: false,
                        space_after_anon_function: true,
                        keep_array_indentation: false,
                        space_before_conditional: true,
                        break_chained_methods: false,
                        eval_code: false,
                        unescape_strings: false,
                        wrap_line_length: 0,
                        end_with_newline: true,
                        comma_first: false,
                        space_around_operators: document.getElementById('js-space-operators').checked
                    };
                    
                    const beautified = js_beautify(input, options);
                    output.value = beautified;
                    this.updateJSStats(beautified);
                    this.showStats('js');
                } catch (error) {
                    output.value = 'Error: Unable to beautify JavaScript. Please check your input.';
                    this.hideStats('js');
                }
            }
            
            updateHTMLStats(code) {
                const lines = code.split('\n').length;
                const chars = code.length;
                const elements = (code.match(/<[^\/!][^>]*>/g) || []).length;
                
                document.getElementById('html-lines').textContent = lines;
                document.getElementById('html-chars').textContent = chars.toLocaleString();
                document.getElementById('html-elements').textContent = elements;
            }
            
            updateCSSStats(code) {
                const lines = code.split('\n').length;
                const chars = code.length;
                const rules = (code.match(/[^{}]+{[^{}]*}/g) || []).length;
                
                document.getElementById('css-lines').textContent = lines;
                document.getElementById('css-chars').textContent = chars.toLocaleString();
                document.getElementById('css-rules').textContent = rules;
            }
            
            updateJSStats(code) {
                const lines = code.split('\n').length;
                const chars = code.length;
                const functions = (code.match(/function\s+\w+|function\s*\(|\w+\s*=>|\w+\s*:\s*function/g) || []).length;
                
                document.getElementById('js-lines').textContent = lines;
                document.getElementById('js-chars').textContent = chars.toLocaleString();
                document.getElementById('js-functions').textContent = functions;
            }
            
            showStats(type) {
                document.getElementById(`${type}-stats`).style.display = 'block';
            }
            
            hideStats(type) {
                document.getElementById(`${type}-stats`).style.display = 'none';
            }
        }
        
        // Global functions
        function beautifyHTML() {
            window.codeBeautifier.beautifyHTML();
        }
        
        function beautifyCSS() {
            window.codeBeautifier.beautifyCSS();
        }
        
        function beautifyJS() {
            window.codeBeautifier.beautifyJS();
        }
        
        function clearHTML() {
            document.getElementById('html-input').value = '';
            document.getElementById('html-output').value = '';
            window.codeBeautifier.hideStats('html');
        }
        
        function clearCSS() {
            document.getElementById('css-input').value = '';
            document.getElementById('css-output').value = '';
            window.codeBeautifier.hideStats('css');
        }
        
        function clearJS() {
            document.getElementById('js-input').value = '';
            document.getElementById('js-output').value = '';
            window.codeBeautifier.hideStats('js');
        }
        
        function copyHTML() {
            const output = document.getElementById('html-output');
            output.select();
            document.execCommand('copy');
            
            const button = event.target.closest('.btn');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.background = '#10b981';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 2000);
        }
        
        function copyCSS() {
            const output = document.getElementById('css-output');
            output.select();
            document.execCommand('copy');
            
            const button = event.target.closest('.btn');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.background = '#10b981';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 2000);
        }
        
        function copyJS() {
            const output = document.getElementById('js-output');
            output.select();
            document.execCommand('copy');
            
            const button = event.target.closest('.btn');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.background = '#10b981';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 2000);
        }
        
        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            window.codeBeautifier = new CodeBeautifier();
        });
            // Common Tool Functionality
            document.addEventListener('DOMContentLoaded', function() {
                // Add ARIA labels to buttons and inputs
                const buttons = document.querySelectorAll('button');
                buttons.forEach(button => {
                    if (!button.getAttribute('aria-label') && button.textContent.trim()) {
                        button.setAttribute('aria-label', button.textContent.trim());
                    }
                });
                
                // Add alt text to images missing it
                const images = document.querySelectorAll('img');
                images.forEach(img => {
                    if (!img.getAttribute('alt')) {
                        img.setAttribute('alt', '');
                    }
                });
                
                // Disable buttons until valid input
                const inputFields = document.querySelectorAll('input[type="text"], textarea');
                const actionButtons = document.querySelectorAll('.btn-primary, button[onclick]');
                
                function checkInputs() {
                    const hasInput = Array.from(inputFields).some(field => field.value.trim().length > 0);
                    actionButtons.forEach(button => {
                        if (button.textContent.includes('Copy') || 
                            button.textContent.includes('Download') || 
                            button.textContent.includes('Generate')) {
                            button.disabled = !hasInput;
                        }
                    });
                }
                
                inputFields.forEach(field => {
                    field.addEventListener('input', checkInputs);
                });
                
                // Initial check
                checkInputs();
                
                // Add success/error notifications
                window.showNotification = function(message, type = 'success') {
                    const notification = document.createElement('div');
                    notification.className = `notification notification-${type}`;
                    notification.innerHTML = `
                        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}" aria-hidden="true"></i>
                        <span>${message}</span>
                    `;
                    
                    notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: ${type === 'success' ? '#10b981' : '#ef4444'};
                        color: white;
                        padding: 1rem 1.5rem;
                        border-radius: 8px;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                        z-index: 1000;
                        opacity: 0;
                        transform: translateX(100%);
                        transition: all 0.3s ease;
                        max-width: 400px;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
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
                            if (notification.parentNode) {
                                document.body.removeChild(notification);
                            }
                        }, 300);
                    }, 3000);
                };
                
                // Enhanced copy functionality
                window.copyToClipboard = async function(text) {
                    try {
                        if (navigator.clipboard && window.isSecureContext) {
                            await navigator.clipboard.writeText(text);
                            showNotification('Copied to clipboard!', 'success');
                            return true;
                        } else {
                            // Fallback for older browsers
                            const textArea = document.createElement('textarea');
                            textArea.value = text;
                            textArea.style.position = 'fixed';
                            textArea.style.left = '-999999px';
                            textArea.style.top = '-999999px';
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            
                            try {
                                document.execCommand('copy');
                                textArea.remove();
                                showNotification('Copied to clipboard!', 'success');
                                return true;
                            } catch (err) {
                                textArea.remove();
                                showNotification('Failed to copy to clipboard', 'error');
                                return false;
                            }
                        }
                    } catch (err) {
                        showNotification('Failed to copy to clipboard', 'error');
                        return false;
                    }
                };
            });
