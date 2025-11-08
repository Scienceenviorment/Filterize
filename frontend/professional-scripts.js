/**
 * FILTERIZE - PROFESSIONAL WEBSITE SCRIPTS
 * Modern functionality for the AI detection platform
 */

// Global state
let currentSection = 'home';
let chatbotOpen = false;
let userLoggedIn = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

/**
 * Initialize all website functionality
 */
function initializeWebsite() {
    console.log('🚀 Filterize website initialized');
    
    // Setup navigation
    setupNavigation();
    
    // Setup forms
    setupForms();
    
    // Setup Google Sign-In
    setupGoogleSignIn();
    
    // Show home section by default
    showSection('home');
    
    // Setup responsive menu
    setupResponsiveMenu();
}

/**
 * Setup navigation functionality
 */
function setupNavigation() {
    // Handle navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
}

/**
 * Show specific section and hide others
 */
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
        
        // Update active nav link
        updateActiveNavLink(sectionName);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Update active navigation link
 */
function updateActiveNavLink(sectionName) {
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current nav link
    const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

/**
 * Setup responsive menu
 */
function setupResponsiveMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

/**
 * Open specific detector service
 */
function openDetector(type) {
    showLoading();
    
    // Simulate navigation to detector
    setTimeout(() => {
        hideLoading();
        
        // Map detector types to actual pages
        const detectorPages = {
            'text': '/frontend/text-detector.html',
            'image': '/frontend/image-detector.html',
            'video': '/frontend/video-detector.html',
            'voice': '/frontend/voice-detector.html',
            'pdf': '/frontend/document-analysis-unified.html',
            'website': '/frontend/website-analysis-unified.html',
            'comparison': '/frontend/comparison-system.html'
        };
        
        const page = detectorPages[type];
        if (page) {
            window.location.href = page;
        } else {
            showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} detector coming soon!`, 'info');
        }
    }, 500);
}

/**
 * Open comparison page for specific service
 */
function openComparison(type) {
    showLoading();
    
    // Simulate navigation to comparison page
    setTimeout(() => {
        hideLoading();
        
        // Map comparison types to comparison pages
        const comparisonPages = {
            'text': '/frontend/text-comparison.html',
            'image': '/frontend/image-comparison.html',
            'video': '/frontend/video-comparison.html',
            'voice': '/frontend/voice-comparison.html',
            'pdf': '/frontend/pdf-comparison.html',
            'website': '/frontend/website-comparison.html'
        };
        
        const page = comparisonPages[type];
        if (page) {
            window.location.href = page;
        } else {
            showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} comparison coming soon!`, 'info');
        }
    }, 500);
}

/**
 * Create comparison modal
 */
function createComparisonModal(type) {
    const modal = document.createElement('div');
    modal.className = 'comparison-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-balance-scale"></i> ${type.charAt(0).toUpperCase() + type.slice(1)} Comparison</h3>
                <button class="modal-close" onclick="closeComparisonModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="comparison-grid">
                    <div class="comparison-item">
                        <h4>Item 1</h4>
                        <div class="upload-area" onclick="document.getElementById('file1').click()">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Upload first ${type}</p>
                        </div>
                        <input type="file" id="file1" style="display: none;" onchange="handleComparisonUpload(1, this)">
                        <div class="analysis-result" id="result1"></div>
                    </div>
                    <div class="comparison-item">
                        <h4>Item 2</h4>
                        <div class="upload-area" onclick="document.getElementById('file2').click()">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Upload second ${type}</p>
                        </div>
                        <input type="file" id="file2" style="display: none;" onchange="handleComparisonUpload(2, this)">
                        <div class="analysis-result" id="result2"></div>
                    </div>
                </div>
                <div class="comparison-results" id="comparisonResults">
                    <div class="comparison-placeholder">
                        <i class="fas fa-chart-bar"></i>
                        <p>Upload both items to see comparison results</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-overlay" onclick="closeComparisonModal()"></div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

/**
 * Close comparison modal
 */
function closeComparisonModal() {
    const modal = document.querySelector('.comparison-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

/**
 * Handle comparison file upload
 */
function handleComparisonUpload(itemNumber, input) {
    const file = input.files[0];
    if (!file) return;
    
    const resultDiv = document.getElementById(`result${itemNumber}`);
    resultDiv.innerHTML = `
        <div class="analyzing">
            <div class="spinner"></div>
            <p>Analyzing...</p>
        </div>
    `;
    
    // Simulate analysis
    setTimeout(() => {
        const aiProbability = Math.floor(Math.random() * 100);
        const confidence = Math.floor(Math.random() * 30) + 70;
        
        resultDiv.innerHTML = `
            <div class="result-summary">
                <h5>${file.name}</h5>
                <div class="probability">AI Probability: ${aiProbability}%</div>
                <div class="confidence">Confidence: ${confidence}%</div>
                <div class="status ${aiProbability > 50 ? 'ai-generated' : 'human-written'}">
                    ${aiProbability > 50 ? '⚠️ Likely AI Generated' : '✅ Appears Human Written'}
                </div>
            </div>
        `;
        
        // Check if both items are analyzed
        checkComparisonComplete();
    }, 2000);
}

/**
 * Check if comparison is complete
 */
function checkComparisonComplete() {
    const result1 = document.getElementById('result1');
    const result2 = document.getElementById('result2');
    const comparisonResults = document.getElementById('comparisonResults');
    
    if (result1.querySelector('.result-summary') && result2.querySelector('.result-summary')) {
        // Both analyses complete, show comparison
        const prob1 = parseInt(result1.querySelector('.probability').textContent.match(/\d+/)[0]);
        const prob2 = parseInt(result2.querySelector('.probability').textContent.match(/\d+/)[0]);
        const difference = Math.abs(prob1 - prob2);
        
        comparisonResults.innerHTML = `
            <div class="comparison-summary">
                <h4>Comparison Results</h4>
                <div class="comparison-stats">
                    <div class="stat">
                        <span class="label">Probability Difference:</span>
                        <span class="value">${difference}%</span>
                    </div>
                    <div class="stat">
                        <span class="label">Similarity:</span>
                        <span class="value">${100 - difference}%</span>
                    </div>
                    <div class="conclusion">
                        <strong>Conclusion:</strong> 
                        ${difference < 20 ? 'Similar detection patterns' : 'Significant difference detected'}
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * Generate AI content based on prompt
 */
async function generateContent() {
    const promptInput = document.getElementById('promptInput');
    const resultsDiv = document.getElementById('generationResults');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        showNotification('Please enter a prompt first', 'warning');
        return;
    }
    
    // Show loading state
    resultsDiv.innerHTML = `
        <div class="generation-loading">
            <div class="spinner"></div>
            <p>Generating content...</p>
        </div>
    `;
    
    try {
        // Call our chat API for content generation
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Generate detailed information about: ${prompt}`
            })
        });
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        // Display generated content
        resultsDiv.innerHTML = `
            <div class="generated-content">
                <h4>Generated Content</h4>
                <div class="content-text">${result.response}</div>
                <div class="content-actions">
                    <button class="btn btn-outline" onclick="copyGeneratedContent()">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="btn btn-outline" onclick="analyzeGeneratedContent()">
                        <i class="fas fa-search"></i> Analyze
                    </button>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Content generation failed:', error);
        resultsDiv.innerHTML = `
            <div class="generation-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to generate content. Please try again.</p>
            </div>
        `;
    }
}

/**
 * Copy generated content to clipboard
 */
function copyGeneratedContent() {
    const contentText = document.querySelector('.content-text');
    if (contentText) {
        navigator.clipboard.writeText(contentText.textContent).then(() => {
            showNotification('Content copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy content', 'error');
        });
    }
}

/**
 * Analyze generated content
 */
function analyzeGeneratedContent() {
    const contentText = document.querySelector('.content-text');
    if (contentText) {
        // Open text analyzer with the generated content
        const newWindow = window.open('/frontend/text-analysis.html', '_blank');
        
        // Pass the content to the new window (simplified approach)
        setTimeout(() => {
            try {
                newWindow.document.getElementById('textInput').value = contentText.textContent;
            } catch (e) {
                console.log('Could not auto-fill content');
            }
        }, 1000);
    }
}

/**
 * Setup form handling
 */
function setupForms() {
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginForm);
    }
}

/**
 * Handle contact form submission
 */
function handleContactForm(event) {
    event.preventDefault();
    
    showLoading();
    
    // Simulate form submission
    setTimeout(() => {
        hideLoading();
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        event.target.reset();
    }, 1500);
}

/**
 * Handle login form submission
 */
function handleLoginForm(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }
    
    showLoading();
    
    // Simulate login
    setTimeout(() => {
        hideLoading();
        userLoggedIn = true;
        updateLoginState();
        showNotification('Login successful!', 'success');
        showSection('home');
    }, 1500);
}

/**
 * Setup Google Sign-In
 */
function setupGoogleSignIn() {
    // Google Sign-In would be initialized here
    // For demo purposes, we'll simulate it
}

/**
 * Handle Google login
 */
function loginWithGoogle() {
    showLoading();
    
    // Simulate Google login
    setTimeout(() => {
        hideLoading();
        userLoggedIn = true;
        updateLoginState();
        showNotification('Google login successful!', 'success');
        showSection('home');
    }, 1500);
}

/**
 * Update login state in UI
 */
function updateLoginState() {
    const loginBtn = document.querySelector('.login-btn');
    if (userLoggedIn && loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Profile';
        loginBtn.onclick = () => showUserProfile();
    }
}

/**
 * Show user profile
 */
function showUserProfile() {
    showNotification('Profile feature coming soon!', 'info');
}

/**
 * Chatbot functionality
 */
function toggleChatbot() {
    const chatbotWindow = document.getElementById('chatbotWindow');
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        chatbotWindow.classList.add('open');
    } else {
        chatbotWindow.classList.remove('open');
    }
}

/**
 * Handle chat input key press
 */
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

/**
 * Send chat message
 */
async function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatbotMessages');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'message user-message';
    userMessage.innerHTML = `<div class="message-content">${message}</div>`;
    chatMessages.appendChild(userMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing';
    typingIndicator.innerHTML = `<div class="message-content">AI is typing...</div>`;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // Send to chat API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });
        
        const result = await response.json();
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add bot response
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot-message';
        botMessage.innerHTML = `<div class="message-content">${result.response || 'Sorry, I could not process your request.'}</div>`;
        chatMessages.appendChild(botMessage);
        
        // Add quick replies if available
        if (result.quick_replies && result.quick_replies.length > 0) {
            const quickReplies = document.createElement('div');
            quickReplies.className = 'quick-replies';
            quickReplies.innerHTML = result.quick_replies.map(reply => 
                `<button class="quick-reply" onclick="sendQuickReply('${reply}')">${reply}</button>`
            ).join('');
            chatMessages.appendChild(quickReplies);
        }
        
    } catch (error) {
        console.error('Chat error:', error);
        typingIndicator.remove();
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'message bot-message';
        errorMessage.innerHTML = `<div class="message-content">Sorry, I'm having trouble responding right now. Please try again later.</div>`;
        chatMessages.appendChild(errorMessage);
    }
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Send quick reply
 */
function sendQuickReply(reply) {
    const chatInput = document.getElementById('chatInput');
    chatInput.value = reply;
    sendChatMessage();
}

/**
 * Open demo
 */
function openDemo() {
    showNotification('Demo video coming soon!', 'info');
}

/**
 * Show loading overlay
 */
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('show');
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10001;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        max-width: 400px;
        animation: slideInNotification 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutNotification 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

/**
 * Get notification color based on type
 */
function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#3b82f6';
    }
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInNotification {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutNotification {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.15s ease;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .quick-replies {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 8px;
    }
    
    .quick-reply {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: background-color 0.15s ease;
    }
    
    .quick-reply:hover {
        background: var(--primary-dark);
    }
`;
document.head.appendChild(notificationStyles);