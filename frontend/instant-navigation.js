/**
 * FILTERIZE AI - INSTANT NAVIGATION SYSTEM
 * Ultra-smooth page transitions with zero delay
 */

class InstantNavigation {
    constructor() {
        this.isTransitioning = false;
        this.cache = new Map();
        this.preloadedPages = new Set();
        this.init();
    }

    init() {
        // Preload critical pages immediately
        this.preloadCriticalPages();
        
        // Setup instant navigation
        this.setupInstantNavigation();
        
        // Setup smooth page transitions
        this.setupPageTransitions();
        
        // Setup instant form responses
        this.setupInstantForms();
        
        console.log('✅ Instant Navigation System Ready');
    }

    preloadCriticalPages() {
        const criticalPages = [
            'text-analysis.html',
            'image-analysis-unified.html',
            'video-analysis.html',
            'voice-analysis.html',
            'document-analysis-unified.html',
            'website-analysis-unified.html',
            'ultimate_dashboard.html'
        ];

        criticalPages.forEach(page => {
            this.preloadPage(page);
        });
    }

    async preloadPage(url) {
        if (this.preloadedPages.has(url)) return;
        
        try {
            const response = await fetch(url);
            if (response.ok) {
                const html = await response.text();
                this.cache.set(url, html);
                this.preloadedPages.add(url);
            }
        } catch (error) {
            console.warn(`Preload failed for ${url}:`, error);
        }
    }

    setupInstantNavigation() {
        // Make all navigation buttons instant
        document.addEventListener('click', async (e) => {
            const link = e.target.closest('a, .nav-btn, .analysis-btn');
            if (!link) return;

            const href = link.getAttribute('href') || link.dataset.href;
            if (!href || href.startsWith('#') || href.startsWith('http')) return;

            e.preventDefault();
            await this.navigateInstantly(href);
        });
    }

    async navigateInstantly(url) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        try {
            // Show instant loading feedback
            this.showInstantLoader();

            // If page is preloaded, navigate immediately
            if (this.cache.has(url)) {
                this.transitionToPage(this.cache.get(url), url);
            } else {
                // Fetch and navigate
                const response = await fetch(url);
                if (response.ok) {
                    const html = await response.text();
                    this.cache.set(url, html);
                    this.transitionToPage(html, url);
                } else {
                    throw new Error(`Failed to load ${url}`);
                }
            }
        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback to normal navigation
            window.location.href = url;
        } finally {
            this.isTransitioning = false;
            this.hideInstantLoader();
        }
    }

    transitionToPage(html, url) {
        // Parse the new page
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        
        // Extract the main content
        const newContent = newDoc.querySelector('body').innerHTML;
        
        // Smooth transition
        const body = document.body;
        body.classList.add('page-transition', 'loading');
        
        setTimeout(() => {
            // Replace content
            body.innerHTML = newContent;
            
            // Update URL
            history.pushState(null, '', url);
            
            // Remove transition class
            body.classList.remove('loading');
            
            // Reinitialize page scripts
            this.reinitializePage();
            
            // Preload next potential pages
            this.preloadLinkedPages();
        }, 150);
    }

    setupPageTransitions() {
        // Add smooth transitions to all interactive elements
        document.addEventListener('DOMContentLoaded', () => {
            this.addSmoothTransitions();
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.navigateInstantly(window.location.pathname + window.location.search);
        });
    }

    addSmoothTransitions() {
        // Add transition classes to all buttons
        const buttons = document.querySelectorAll('button, .btn, .analysis-btn, .nav-btn');
        buttons.forEach(btn => {
            btn.classList.add('hover-lift');
            
            // Add instant feedback
            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'translateY(1px) scale(0.98)';
            });
            
            btn.addEventListener('mouseup', () => {
                btn.style.transform = '';
            });
        });

        // Add smooth hover effects to cards
        const cards = document.querySelectorAll('.card, .upload-area, .result-card');
        cards.forEach(card => {
            card.classList.add('hover-glow');
        });
    }

    setupInstantForms() {
        // Make all form submissions instant
        document.addEventListener('submit', async (e) => {
            const form = e.target;
            if (!form.matches('form')) return;

            e.preventDefault();
            
            const submitBtn = form.querySelector('[type="submit"], .submit-btn');
            if (submitBtn) {
                this.addInstantLoader(submitBtn);
            }

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action || '/api/analyze', {
                    method: form.method || 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    this.displayResultsInstantly(result);
                } else {
                    throw new Error('Request failed');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                this.showError('Analysis failed. Please try again.');
            } finally {
                if (submitBtn) {
                    this.removeInstantLoader(submitBtn);
                }
            }
        });
    }

    addInstantLoader(element) {
        const loader = document.createElement('span');
        loader.className = 'instant-loader';
        loader.innerHTML = '';
        element.prepend(loader);
        element.disabled = true;
    }

    removeInstantLoader(element) {
        const loader = element.querySelector('.instant-loader');
        if (loader) loader.remove();
        element.disabled = false;
    }

    showInstantLoader() {
        let loader = document.getElementById('page-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'page-loader';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: linear-gradient(90deg, var(--primary), var(--accent));
                z-index: 9999;
                animation: loadingBar 0.5s ease-out;
            `;
            document.body.appendChild(loader);
        }
    }

    hideInstantLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            setTimeout(() => loader.remove(), 200);
        }
    }

    displayResultsInstantly(data) {
        const resultsContainer = document.getElementById('results') || 
                               document.querySelector('.results-container') ||
                               document.querySelector('.analysis-results');
        
        if (!resultsContainer) return;

        // Smooth transition to results
        resultsContainer.classList.add('loading');
        
        setTimeout(() => {
            resultsContainer.innerHTML = this.formatResults(data);
            resultsContainer.classList.remove('loading');
            
            // Scroll to results smoothly
            resultsContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }

    formatResults(data) {
        return `
            <div class="result-card hover-glow">
                <h3>Analysis Results</h3>
                <div class="result-item">
                    <span class="label">AI Probability:</span>
                    <span class="value">${data.ai_probability || 'N/A'}%</span>
                </div>
                <div class="result-item">
                    <span class="label">Confidence:</span>
                    <span class="value">${data.confidence || 'N/A'}%</span>
                </div>
                <div class="result-item">
                    <span class="label">Processing Time:</span>
                    <span class="value">${data.processing_time || '< 100ms'}</span>
                </div>
                ${data.detailed_analysis ? `
                    <div class="detailed-analysis">
                        <h4>Detailed Analysis</h4>
                        <p><strong>Quality:</strong> ${data.detailed_analysis.text_quality}</p>
                        <p><strong>Recommendation:</strong> ${data.detailed_analysis.recommendation}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    reinitializePage() {
        // Reinitialize any page-specific scripts
        this.addSmoothTransitions();
        
        // Trigger any page-specific initialization
        const event = new CustomEvent('pageReady');
        document.dispatchEvent(event);
    }

    preloadLinkedPages() {
        // Preload all linked pages on current page
        const links = document.querySelectorAll('a[href], .nav-btn[data-href]');
        links.forEach(link => {
            const href = link.getAttribute('href') || link.dataset.href;
            if (href && !href.startsWith('#') && !href.startsWith('http')) {
                this.preloadPage(href);
            }
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--error-color);
            color: white;
            padding: 12px 24px;
            border-radius: var(--radius-md);
            z-index: 10000;
            box-shadow: var(--shadow-lg);
            animation: slideIn 0.3s ease-out;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }
}

// CSS animations for loading
const style = document.createElement('style');
style.textContent = `
    @keyframes loadingBar {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100vw); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize instant navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.instantNav = new InstantNavigation();
    });
} else {
    window.instantNav = new InstantNavigation();
}

// Export for use in other scripts
window.InstantNavigation = InstantNavigation;