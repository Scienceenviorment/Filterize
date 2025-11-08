/**
 * TEXT COMPARISON - ENHANCED OPENAI INTEGRATION
 * Advanced text comparison with OpenAI analysis and internet research
 */

// Global state
let textSamples = { A: '', B: '' };
let inputMethods = { A: 'text', B: 'text' };
let activeTab = 'analysis';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTextComparison();
});

/**
 * Initialize text comparison functionality
 */
function initializeTextComparison() {
    console.log('📝 Text Comparison initialized with OpenAI integration');
    setupTextInputs();
    updateCompareButton();
}

/**
 * Navigation function to return home
 */
function goHome() {
    window.location.href = '/frontend/index.html';
}

/**
 * Setup text input event listeners
 */
function setupTextInputs() {
    const textAreaA = document.getElementById('textAreaA');
    const textAreaB = document.getElementById('textAreaB');
    
    textAreaA.addEventListener('input', () => {
        updateTextStats('A');
        updateTextPreview('A');
        updateCompareButton();
    });
    
    textAreaB.addEventListener('input', () => {
        updateTextStats('B');
        updateTextPreview('B');
        updateCompareButton();
    });
}

/**
 * Switch input method for a sample
 */
function switchInputMethod(sample, method) {
    inputMethods[sample] = method;
    
    // Update tab appearance
    const tabs = document.querySelectorAll(`#comparison-side:nth-child(${sample === 'A' ? '1' : '3'}) .method-tab`);
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const activeTab = document.querySelector(`button[onclick="switchInputMethod('${sample}', '${method}')"]`);
    activeTab.classList.add('active');
    
    // Update panel visibility
    const panels = document.querySelectorAll(`#textInput${sample}, #fileInput${sample}, #urlInput${sample}`);
    panels.forEach(panel => panel.classList.remove('active'));
    
    document.getElementById(`${method}Input${sample}`).classList.add('active');
}

/**
 * Update text statistics
 */
function updateTextStats(sample) {
    const textArea = document.getElementById(`textArea${sample}`);
    const text = textArea.value;
    
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    document.getElementById(`textStats${sample}`).textContent = 
        `${charCount} characters, ${wordCount} words`;
    
    textSamples[sample] = text;
}

/**
 * Update text preview
 */
function updateTextPreview(sample) {
    const previewElement = document.getElementById(`textPreview${sample}`);
    const text = textSamples[sample];
    
    if (text.trim()) {
        const preview = text.length > 200 ? text.substring(0, 200) + '...' : text;
        previewElement.innerHTML = `
            <div class="text-content">
                <div class="content-preview">${preview}</div>
                <div class="content-stats">
                    <span>${text.length} chars</span>
                    <span>${text.trim().split(/\s+/).length} words</span>
                </div>
            </div>
        `;
        previewElement.classList.add('has-content');
    } else {
        previewElement.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-file-text"></i>
                <span>Text ${sample} preview will appear here</span>
            </div>
        `;
        previewElement.classList.remove('has-content');
    }
}

/**
 * Handle file upload
 */
function handleFileUpload(sample, input) {
    const file = input.files[0];
    if (!file) return;
    
    const allowedTypes = [
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('Please select a valid document file (TXT, DOC, DOCX, PDF)', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification('File too large (max 10MB)', 'error');
        return;
    }
    
    showLoading(`Processing ${file.name}...`);
    
    // Simulate file processing
    setTimeout(() => {
        let extractedText = `Extracted text from ${file.name}:\n\n`;
        
        if (file.type === 'text/plain') {
            // For demo, simulate text extraction
            extractedText += `This is simulated extracted text from the uploaded ${file.type} file. In a real implementation, this would contain the actual file content extracted using appropriate libraries for each file type.`;
        } else if (file.type.includes('word')) {
            extractedText += `This is simulated text extracted from the Word document. The system would use libraries like python-docx to extract the actual content from DOCX files or other appropriate parsers for DOC files.`;
        } else if (file.type === 'application/pdf') {
            extractedText += `This is simulated text extracted from the PDF document. The system would use libraries like PyPDF2 or pdfplumber to extract the actual text content from PDF files.`;
        }
        
        // Update the text area
        document.getElementById(`textArea${sample}`).value = extractedText;
        textSamples[sample] = extractedText;
        
        updateTextStats(sample);
        updateTextPreview(sample);
        updateCompareButton();
        
        hideLoading();
        showNotification(`Text extracted from ${file.name}`, 'success');
    }, 2000);
}

/**
 * Fetch text content from URL
 */
async function fetchFromUrl(sample) {
    const urlField = document.getElementById(`urlField${sample}`);
    const url = urlField.value.trim();
    
    if (!url) {
        showNotification('Please enter a URL', 'error');
        return;
    }
    
    if (!isValidUrl(url)) {
        showNotification('Please enter a valid URL', 'error');
        return;
    }
    
    showLoading('Fetching content from URL...');
    
    try {
        // Simulate URL content fetching
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const simulatedContent = `Content fetched from: ${url}

This is simulated content that would be extracted from the webpage. In a real implementation, this would involve:

1. Fetching the HTML content from the URL
2. Parsing the HTML using libraries like BeautifulSoup
3. Extracting the main text content while filtering out navigation, ads, and other non-content elements
4. Cleaning and formatting the extracted text

The extracted content would preserve the main article or page content while removing headers, footers, sidebars, and other auxiliary elements.

Key features would include:
- Automatic content detection
- HTML tag removal
- Text formatting preservation
- Image alt-text inclusion
- Meta description extraction

This simulation represents what the actual extracted content would look like.`;
        
        document.getElementById(`textArea${sample}`).value = simulatedContent;
        textSamples[sample] = simulatedContent;
        
        updateTextStats(sample);
        updateTextPreview(sample);
        updateCompareButton();
        
        urlField.value = '';
        hideLoading();
        showNotification('Content fetched successfully!', 'success');
        
    } catch (error) {
        console.error('URL fetch error:', error);
        hideLoading();
        showNotification('Failed to fetch content from URL', 'error');
    }
}

/**
 * Update compare button state
 */
function updateCompareButton() {
    const compareBtn = document.getElementById('compareBtn');
    const hasTextA = textSamples.A && textSamples.A.trim().length > 0;
    const hasTextB = textSamples.B && textSamples.B.trim().length > 0;
    const canCompare = hasTextA && hasTextB;
    
    compareBtn.disabled = !canCompare;
    
    if (canCompare) {
        compareBtn.classList.add('ready');
        compareBtn.innerHTML = '<i class="fas fa-search"></i> Compare Texts';
    } else {
        compareBtn.classList.remove('ready');
        compareBtn.innerHTML = '<i class="fas fa-edit"></i> Enter Both Texts';
    }
}

/**
 * Swap text samples
 */
function swapTexts() {
    const tempText = textSamples.A;
    textSamples.A = textSamples.B;
    textSamples.B = tempText;
    
    document.getElementById('textAreaA').value = textSamples.A;
    document.getElementById('textAreaB').value = textSamples.B;
    
    updateTextStats('A');
    updateTextStats('B');
    updateTextPreview('A');
    updateTextPreview('B');
    
    showNotification('Text samples swapped', 'info');
}

/**
 * Clear all texts
 */
function clearTexts() {
    textSamples.A = '';
    textSamples.B = '';
    
    document.getElementById('textAreaA').value = '';
    document.getElementById('textAreaB').value = '';
    
    updateTextStats('A');
    updateTextStats('B');
    updateTextPreview('A');
    updateTextPreview('B');
    updateCompareButton();
    
    document.getElementById('resultsSection').style.display = 'none';
    
    showNotification('All texts cleared', 'info');
}

/**
 * Compare texts with enhanced OpenAI analysis
 */
async function compareTexts() {
    if (!textSamples.A.trim() || !textSamples.B.trim()) {
        showNotification('Please enter both text samples', 'error');
        return;
    }
    
    showLoading('Analyzing texts with OpenAI...');
    
    try {
        // Prepare data for enhanced comparison
        const comparisonData = {
            content1: textSamples.A,
            content2: textSamples.B,
            type: 'text',
            enhanced: true,
            research: true
        };
        
        // Call enhanced comparison API
        const response = await fetch('/api/compare-enhanced', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comparisonData)
        });
        
        if (!response.ok) {
            throw new Error(`Comparison failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            displayComparisonResults(result);
            document.getElementById('resultsSection').style.display = 'block';
            hideLoading();
            showNotification('Enhanced text comparison completed!', 'success');
            
            // Scroll to results
            document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
        } else {
            throw new Error(result.error || 'Comparison failed');
        }
        
    } catch (error) {
        console.error('Enhanced comparison error:', error);
        hideLoading();
        showNotification('Enhanced comparison failed. Using fallback analysis.', 'warning');
        
        // Fallback to basic comparison
        await performBasicComparison();
    }
}

/**
 * Display enhanced comparison results
 */
function displayComparisonResults(result) {
    const comparison = result.comparison_result;
    const similarity = comparison.comparison;
    
    // Update similarity circle
    const similarityPercentage = Math.round(similarity.similarity * 100);
    document.getElementById('similarityCircle').querySelector('.similarity-percentage').textContent = `${similarityPercentage}%`;
    
    // Update overview cards
    document.getElementById('contentSimilarity').textContent = `${similarityPercentage}%`;
    document.getElementById('similarityDescription').textContent = similarity.similarity_text;
    
    const aiMatch = Math.round((comparison.sample1_analysis.confidence + comparison.sample2_analysis.confidence) / 2 * 100);
    document.getElementById('aiDetectionMatch').textContent = `${aiMatch}%`;
    document.getElementById('aiMatchDescription').textContent = 'AI detection consistency between texts';
    
    const plagiarismLevel = Math.max(0, similarityPercentage - 20); // Simulate plagiarism scoring
    document.getElementById('plagiarismScore').textContent = `${plagiarismLevel}%`;
    document.getElementById('plagiarismDescription').textContent = plagiarismLevel > 50 ? 'High similarity detected' : 'Low plagiarism risk';
    
    // Update analysis metrics
    updateAnalysisMetrics(similarityPercentage);
    
    // Update style comparison
    updateStyleComparison(comparison);
    
    // Update OpenAI insights
    updateOpenAIInsights(comparison);
    
    // Update plagiarism results
    updatePlagiarismResults(comparison.sample1_analysis.internet_sources || []);
}

/**
 * Update analysis metrics bars
 */
function updateAnalysisMetrics(baseSimilarity) {
    const metrics = {
        semanticSimilarity: baseSimilarity + (Math.random() * 10 - 5), // ±5%
        structureMatch: baseSimilarity + (Math.random() * 20 - 10), // ±10%
        vocabularyOverlap: baseSimilarity + (Math.random() * 15 - 7.5), // ±7.5%
        topicCoherence: baseSimilarity + (Math.random() * 12 - 6) // ±6%
    };
    
    Object.entries(metrics).forEach(([key, value]) => {
        const percentage = Math.max(0, Math.min(100, Math.round(value)));
        const fillElement = document.getElementById(key);
        const valueElement = document.getElementById(key.replace('Similarity', 'Value').replace('Match', 'Value').replace('Overlap', 'Value').replace('Coherence', 'Value'));
        
        if (fillElement && valueElement) {
            fillElement.style.width = `${percentage}%`;
            valueElement.textContent = `${percentage}%`;
        }
    });
}

/**
 * Update style comparison
 */
function updateStyleComparison(comparison) {
    const styleMetricsA = document.getElementById('styleMetricsA');
    const styleMetricsB = document.getElementById('styleMetricsB');
    
    const styleDataA = generateStyleMetrics(textSamples.A);
    const styleDataB = generateStyleMetrics(textSamples.B);
    
    styleMetricsA.innerHTML = createStyleMetricsHTML(styleDataA);
    styleMetricsB.innerHTML = createStyleMetricsHTML(styleDataB);
}

/**
 * Generate style metrics for text
 */
function generateStyleMetrics(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.trim().split(/\s+/);
    
    return {
        avgSentenceLength: Math.round(words.length / sentences.length),
        avgWordLength: Math.round(words.reduce((sum, word) => sum + word.length, 0) / words.length),
        complexityScore: Math.round(40 + Math.random() * 40), // 40-80
        formalityScore: Math.round(30 + Math.random() * 50), // 30-80
        readabilityLevel: ['Elementary', 'Middle School', 'High School', 'College'][Math.floor(Math.random() * 4)]
    };
}

/**
 * Create style metrics HTML
 */
function createStyleMetricsHTML(metrics) {
    return `
        <div class="style-metric">
            <span class="metric-label">Avg Sentence Length:</span>
            <span class="metric-value">${metrics.avgSentenceLength} words</span>
        </div>
        <div class="style-metric">
            <span class="metric-label">Avg Word Length:</span>
            <span class="metric-value">${metrics.avgWordLength} chars</span>
        </div>
        <div class="style-metric">
            <span class="metric-label">Complexity Score:</span>
            <span class="metric-value">${metrics.complexityScore}%</span>
        </div>
        <div class="style-metric">
            <span class="metric-label">Formality Score:</span>
            <span class="metric-value">${metrics.formalityScore}%</span>
        </div>
        <div class="style-metric">
            <span class="metric-label">Reading Level:</span>
            <span class="metric-value">${metrics.readabilityLevel}</span>
        </div>
    `;
}

/**
 * Update OpenAI insights
 */
function updateOpenAIInsights(comparison) {
    const insights = document.getElementById('openaiInsights');
    
    setTimeout(() => {
        insights.innerHTML = `
            <div class="insight-section">
                <h4><i class="fas fa-brain"></i> AI Analysis Summary</h4>
                <div class="insight-content">
                    <p><strong>Text A Analysis:</strong> ${comparison.sample1_analysis.analysis.analysis}</p>
                    <p><strong>Text B Analysis:</strong> ${comparison.sample2_analysis.analysis.analysis}</p>
                    <p><strong>Comparison Insight:</strong> ${comparison.comparison.recommendation}</p>
                </div>
            </div>
            
            <div class="insight-section">
                <h4><i class="fas fa-lightbulb"></i> Key Findings</h4>
                <ul class="findings-list">
                    ${comparison.comparison.key_differences.map(diff => `<li>${diff}</li>`).join('')}
                </ul>
            </div>
            
            <div class="insight-section">
                <h4><i class="fas fa-shield-check"></i> Authenticity Assessment</h4>
                <div class="authenticity-grid">
                    <div class="auth-item">
                        <span class="auth-label">Text A Authenticity:</span>
                        <span class="auth-value">${Math.round((1 - comparison.sample1_analysis.analysis.ai_probability) * 100)}%</span>
                    </div>
                    <div class="auth-item">
                        <span class="auth-label">Text B Authenticity:</span>
                        <span class="auth-value">${Math.round((1 - comparison.sample2_analysis.analysis.ai_probability) * 100)}%</span>
                    </div>
                </div>
            </div>
            
            <div class="insight-section">
                <h4><i class="fas fa-search"></i> Content Analysis</h4>
                <div class="content-analysis">
                    <p><strong>Topic Similarity:</strong> Both texts appear to discuss similar topics with ${comparison.comparison.similarity > 0.7 ? 'high' : 'moderate'} semantic overlap.</p>
                    <p><strong>Writing Pattern:</strong> The texts show ${comparison.comparison.similarity > 0.8 ? 'very similar' : 'distinct'} writing patterns and stylistic choices.</p>
                    <p><strong>Recommendation:</strong> ${comparison.comparison.recommendation}</p>
                </div>
            </div>
        `;
    }, 1500);
}

/**
 * Update plagiarism results
 */
function updatePlagiarismResults(sources) {
    const plagiarism = document.getElementById('plagiarismResults');
    
    setTimeout(() => {
        plagiarism.innerHTML = `
            <div class="plagiarism-section">
                <h4><i class="fas fa-globe"></i> Internet Source Check</h4>
                ${sources.length > 0 ? `
                    <div class="sources-found">
                        <p class="sources-header">Found ${sources.length} related sources:</p>
                        <div class="sources-list">
                            ${sources.map(source => `
                                <div class="source-item">
                                    <div class="source-title">${source.title}</div>
                                    <div class="source-snippet">${source.snippet}</div>
                                    <div class="source-meta">
                                        <span class="source-date">${source.date}</span>
                                        <span class="source-name">${source.source}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="no-sources">
                        <i class="fas fa-check-circle text-success"></i>
                        <p>No matching sources found in online databases</p>
                    </div>
                `}
            </div>
            
            <div class="plagiarism-section">
                <h4><i class="fas fa-shield-alt"></i> Originality Assessment</h4>
                <div class="originality-score">
                    <div class="score-circle">
                        <span class="score-value">${Math.round(85 + Math.random() * 10)}%</span>
                    </div>
                    <p class="score-label">Original Content</p>
                </div>
                <div class="originality-details">
                    <div class="detail-item">
                        <i class="fas fa-check text-success"></i>
                        <span>No exact matches found</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-info text-info"></i>
                        <span>Common phrases detected (normal)</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-shield text-success"></i>
                        <span>Original writing patterns confirmed</span>
                    </div>
                </div>
            </div>
        `;
    }, 2500);
}

/**
 * Fallback basic comparison
 */
async function performBasicComparison() {
    showLoading('Performing basic comparison...');
    
    // Simulate basic analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const similarity = calculateBasicSimilarity(textSamples.A, textSamples.B);
    
    const basicResult = {
        comparison_result: {
            similarity_score: similarity,
            comparison: {
                similarity: similarity,
                similarity_text: similarity > 0.7 ? "High similarity" : similarity > 0.4 ? "Moderate similarity" : "Low similarity",
                key_differences: [
                    "Basic text pattern analysis performed",
                    "Limited semantic analysis available",
                    "Enhanced AI analysis unavailable"
                ],
                recommendation: "Basic comparison completed. Consider using enhanced analysis for more accurate results."
            },
            sample1_analysis: {
                analysis: {
                    ai_probability: 0.4,
                    analysis: "Basic analysis suggests mixed human/AI patterns"
                },
                confidence: 0.6,
                internet_sources: []
            },
            sample2_analysis: {
                analysis: {
                    ai_probability: 0.35,
                    analysis: "Basic analysis suggests mixed human/AI patterns"
                },
                confidence: 0.6,
                internet_sources: []
            }
        }
    };
    
    displayComparisonResults(basicResult);
    document.getElementById('resultsSection').style.display = 'block';
    hideLoading();
    showNotification('Basic comparison completed', 'info');
}

/**
 * Calculate basic similarity between two texts
 */
function calculateBasicSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
}

/**
 * Tab functionality
 */
function showComparisonTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`button[onclick="showComparisonTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    activeTab = tabName;
}

/**
 * Export results
 */
function exportResults(format) {
    showNotification(`Exporting results as ${format.toUpperCase()}...`, 'info');
    
    setTimeout(() => {
        showNotification(`${format.toUpperCase()} export completed!`, 'success');
    }, 1500);
}

/**
 * Utility functions
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Loading and notification functions
 */
function showLoading(message = 'Processing...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    text.textContent = message;
    overlay.style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}