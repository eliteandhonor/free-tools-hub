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
