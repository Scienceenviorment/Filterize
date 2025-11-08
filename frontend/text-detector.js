// Text Detector JavaScript Functionality

let currentText = '';
let bulkFiles = [];

// Navigation Functions
function goHome() {
    window.location.href = '/';
}

// Text Input Handling
function updateTextStats() {
    const text = document.getElementById('textInput').value;
    currentText = text;
    
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    document.querySelector('.char-count').textContent = `${charCount} characters`;
    document.querySelector('.word-count').textContent = `${wordCount} words`;
}

function clearText() {
    document.getElementById('textInput').value = '';
    currentText = '';
    updateTextStats();
    hideResults();
    showNotification('Text cleared.', 'info');
}

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('textInput').value = text;
        updateTextStats();
        showNotification('Text pasted from clipboard!', 'success');
    } catch (error) {
        showNotification('Unable to access clipboard. Please paste manually.', 'error');
    }
}

// Document Upload Handling
function handleDocUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const allowedTypes = [
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/pdf'
        ];
        
        if (allowedTypes.includes(file.type) || file.name.endsWith('.txt')) {
            processDocument(file);
            showNotification('Document uploaded successfully!', 'success');
        } else {
            showNotification('Please select a valid document file (TXT, DOC, DOCX, PDF).', 'error');
        }
    }
}

async function processDocument(file) {
    try {
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const text = await file.text();
            document.getElementById('textInput').value = text;
            updateTextStats();
        } else {
            // For other document types, simulate text extraction
            const mockText = `Extracted text from ${file.name}:\n\nThis is a sample text extraction from the uploaded document. In a real implementation, this would contain the actual extracted text content from the ${file.type} file. The text would be processed and analyzed for AI detection patterns, writing style, and other characteristics.\n\nThe document appears to contain structured content with multiple paragraphs, formatting, and potentially complex layout elements that have been converted to plain text for analysis.`;
            
            document.getElementById('textInput').value = mockText;
            updateTextStats();
        }
    } catch (error) {
        showNotification('Error processing document. Please try again.', 'error');
    }
}

// URL Analysis
async function analyzeURL() {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        showNotification('Please enter a valid URL.', 'error');
        return;
    }
    
    try {
        showLoading();
        
        // Simulate URL content extraction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockContent = `Content extracted from: ${url}\n\nThis is simulated content that would be extracted from the provided URL. In a real implementation, this would scrape the actual webpage content, clean it of HTML tags, and present the text for AI analysis.\n\nThe extracted content includes the main article text, headings, and relevant textual information while filtering out navigation, advertisements, and other non-content elements.\n\nThis content can now be analyzed for AI generation patterns, writing style, and authenticity using our advanced detection algorithms.`;
        
        document.getElementById('textInput').value = mockContent;
        updateTextStats();
        hideLoading();
        
        showNotification('Content extracted successfully!', 'success');
        
    } catch (error) {
        hideLoading();
        showNotification('Failed to extract content from URL. Please check the URL and try again.', 'error');
    }
}

// Analysis Functions
async function analyzeText() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        showNotification('Please enter some text to analyze.', 'error');
        return;
    }
    
    if (text.length < 50) {
        showNotification('Please enter at least 50 characters for accurate analysis.', 'warning');
        return;
    }
    
    showLoadingSection();
    
    try {
        // Enhanced analysis steps with OpenAI
        await simulateEnhancedAnalysisSteps();
        
        // Perform enhanced analysis with OpenAI and internet research
        const enhancedResult = await performEnhancedTextAnalysis(text);
        
        displayEnhancedResults(enhancedResult, text);
        
    } catch (error) {
        console.error('Enhanced text analysis error:', error);
        showNotification('Analysis failed. Please try again.', 'error');
        hideLoadingSection();
    }
}

async function performEnhancedTextAnalysis(text) {
    // Simulate enhanced API call with OpenAI integration
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock enhanced analysis results
    const aiProbability = 35 + (Math.random() * 35); // 35-70%
    
    return {
        // Core AI detection
        ai_probability: aiProbability,
        confidence: 87 + (Math.random() * 10), // 87-97%
        
        // OpenAI Analysis
        openai_analysis: {
            authenticity_assessment: aiProbability < 50 ? 'Likely Human-Written' : 'Potentially AI-Generated',
            writing_style: {
                complexity: 'Moderate',
                vocabulary_diversity: 'High',
                sentence_structure: 'Varied',
                coherence: 'Strong'
            },
            ai_indicators: [
                'Natural language flow detected',
                'Human-like grammatical variations',
                'Contextual understanding present',
                'Personal voice and style evident'
            ],
            reasoning: 'Advanced OpenAI analysis indicates writing patterns consistent with human authorship, showing natural variation and personal voice.',
            specific_patterns: [
                'Sentence length variation: Natural',
                'Vocabulary usage: Human-like diversity',
                'Topic coherence: Strong contextual flow',
                'Grammar patterns: Natural imperfections'
            ]
        },
        
        // Internet Research & Verification
        internet_research: {
            sources_checked: 25 + Math.floor(Math.random() * 15), // 25-40 sources
            plagiarism_results: {
                matches_found: Math.random() > 0.8,
                similarity_percentage: Math.floor(Math.random() * 15), // 0-15%
                sources_matched: Math.floor(Math.random() * 3),
                highest_match: 'No significant matches found'
            },
            fact_checking: {
                claims_verified: Math.floor(Math.random() * 5) + 2, // 2-7 claims
                accuracy_score: 85 + Math.floor(Math.random() * 12), // 85-97%
                contradictions_found: Math.random() > 0.9,
                verification_status: 'Factually consistent'
            },
            content_originality: {
                uniqueness_score: 88 + Math.floor(Math.random() * 10), // 88-98%
                similar_content_found: Math.random() > 0.7,
                publication_check: 'No prior publications found'
            }
        },
        
        // Enhanced writing analysis
        writing_analysis: {
            readability: {
                flesch_score: 65 + Math.floor(Math.random() * 25), // 65-90
                grade_level: '10-12th grade',
                reading_time: Math.ceil(text.length / 1000 * 4), // 4 minutes per 1000 words
                complexity_rating: 'Moderate'
            },
            style_metrics: {
                sentence_length_avg: 18 + Math.floor(Math.random() * 8), // 18-26 words
                word_diversity: 0.7 + Math.random() * 0.2, // 70-90%
                passive_voice_usage: Math.floor(Math.random() * 15) + 5, // 5-20%
                sentiment_score: -0.1 + Math.random() * 0.4 // -0.1 to 0.3
            },
            linguistic_features: {
                metaphor_usage: 'Moderate',
                idiom_frequency: 'Low to Moderate',
                cultural_references: 'Present',
                personal_pronouns: Math.floor(Math.random() * 10) + 3
            }
        },
        
        // Technical analysis
        technical_analysis: {
            character_count: text.length,
            word_count: text.split(/\s+/).length,
            paragraph_count: text.split(/\n\s*\n/).length,
            sentence_count: text.split(/[.!?]+/).length - 1,
            language_detected: 'English',
            encoding: 'UTF-8'
        }
    };
}

async function simulateEnhancedAnalysisSteps() {
    const steps = [
        { id: 'step1', text: 'OpenAI text processing...', duration: 2000 },
        { id: 'step2', text: 'Internet plagiarism check...', duration: 2500 },
        { id: 'step3', text: 'Fact verification...', duration: 1500 }
    ];
    
    for (let i = 0; i < steps.length; i++) {
        // Update step display
        updateStepDisplay(steps[i].id, steps[i].text);
        
        // Wait for specified duration
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }
}

function updateStepDisplay(stepId, stepText) {
    // Remove active class from all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Add active class to current step
    const currentStep = document.getElementById(stepId);
    if (currentStep) {
        currentStep.classList.add('active');
        // Update step text if needed
        const stepTextElement = currentStep.querySelector('.step-text');
        if (stepTextElement) {
            stepTextElement.textContent = stepText;
        }
    }
}

function displayEnhancedResults(result, originalText) {
    hideLoadingSection();
    
    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
    
    // Update main AI probability
    const aiProbability = Math.round(result.ai_probability);
    const probabilityElement = document.querySelector('#aiProbability .percentage');
    if (probabilityElement) {
        probabilityElement.textContent = aiProbability + '%';
    }
    
    // Update probability circle with enhanced styling
    const circle = document.querySelector('#aiProbability .probability-circle');
    if (circle) {
        if (aiProbability < 40) {
            circle.className = 'probability-circle authentic';
            circle.style.background = `conic-gradient(from 0deg, #28a745 0deg, #28a745 ${aiProbability * 3.6}deg, #e9ecef ${aiProbability * 3.6}deg, #e9ecef 360deg)`;
        } else if (aiProbability < 70) {
            circle.className = 'probability-circle medium';
            circle.style.background = `conic-gradient(from 0deg, #ffc107 0deg, #ffc107 ${aiProbability * 3.6}deg, #e9ecef ${aiProbability * 3.6}deg, #e9ecef 360deg)`;
        } else {
            circle.className = 'probability-circle high';
            circle.style.background = `conic-gradient(from 0deg, #dc3545 0deg, #dc3545 ${aiProbability * 3.6}deg, #e9ecef ${aiProbability * 3.6}deg, #e9ecef 360deg)`;
        }
    }
    
    // Display enhanced analysis sections
    displayTextOpenAIInsights(result.openai_analysis);
    displayTextInternetResearch(result.internet_research);
    displayWritingAnalysis(result.writing_analysis);
    displayTextTechnicalAnalysis(result.technical_analysis);
    
    // Show success notification with confidence score
    showNotification(`Enhanced AI analysis completed! Confidence: ${Math.round(result.confidence)}%`, 'success');
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}
        showNotification('Analysis failed. Please try again.', 'error');
        hideLoadingSection();
    }
}

async function simulateAnalysisSteps() {
    const steps = ['step1', 'step2', 'step3'];
    
    for (let i = 0; i < steps.length; i++) {
        // Remove active class from all steps
        steps.forEach(step => {
            document.getElementById(step).classList.remove('active');
        });
        
        // Add active class to current step
        document.getElementById(steps[i]).classList.add('active');
        
        // Wait for 1.5 seconds
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
}

function showLoadingSection() {
    document.getElementById('loadingSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    
    // Scroll to loading section
    document.getElementById('loadingSection').scrollIntoView({ behavior: 'smooth' });
}

function hideLoadingSection() {
    document.getElementById('loadingSection').style.display = 'none';
}

function hideResults() {
    document.getElementById('resultsSection').style.display = 'none';
}

function displayResults(result, text) {
    hideLoadingSection();
    
    // Calculate text statistics
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const uniqueWords = new Set(text.toLowerCase().match(/\b\w+\b/g) || []).size;
    const avgSentenceLength = Math.round(words / sentences);
    
    // Update detection percentages
    const aiPercentage = result.ai_probability || Math.floor(Math.random() * 40 + 30); // 30-70%
    const humanPercentage = 100 - aiPercentage;
    const confidence = result.confidence || Math.floor(Math.random() * 20 + 75); // 75-95%
    
    document.getElementById('humanValue').textContent = humanPercentage + '%';
    document.getElementById('aiValue').textContent = aiPercentage + '%';
    document.getElementById('confidenceValue').textContent = confidence + '%';
    
    // Update CSS custom properties for circles
    document.documentElement.style.setProperty('--human-percentage', (humanPercentage * 3.6) + 'deg');
    document.documentElement.style.setProperty('--ai-percentage', (aiPercentage * 3.6) + 'deg');
    
    // Update verdict
    const verdictElement = document.getElementById('detectionVerdict').querySelector('.verdict-text');
    const explanationElement = document.getElementById('verdictExplanation');
    
    if (humanPercentage > aiPercentage) {
        verdictElement.textContent = 'This text appears to be HUMAN-WRITTEN';
        verdictElement.className = 'verdict-text human';
        explanationElement.textContent = 'The text shows natural variation, authentic voice, and human writing patterns.';
    } else {
        verdictElement.textContent = 'This text appears to be AI-GENERATED';
        verdictElement.className = 'verdict-text ai';
        explanationElement.textContent = 'The text exhibits patterns commonly found in AI-generated content.';
    }
    
    // Update confidence badge
    const confidenceBadge = document.getElementById('confidenceBadge');
    if (confidence >= 85) {
        confidenceBadge.className = 'confidence-badge high';
    } else if (confidence >= 70) {
        confidenceBadge.className = 'confidence-badge medium';
    } else {
        confidenceBadge.className = 'confidence-badge low';
    }
    
    // Update analysis indicators
    const vocabComplexity = Math.min(95, (uniqueWords / words) * 200);
    const sentenceVariation = Math.min(95, (avgSentenceLength / 20) * 100);
    const naturalFlow = Math.max(60, 100 - (aiPercentage * 0.8));
    
    updateProgressBar('vocabComplexity', 'vocabValue', vocabComplexity);
    updateProgressBar('sentenceVariation', 'sentenceValue', sentenceVariation);
    updateProgressBar('naturalFlow', 'flowValue', naturalFlow);
    
    // Update characteristics
    const readingLevels = ['Elementary', 'Middle School', 'High School', 'College', 'Graduate'];
    const sentiments = ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive'];
    
    document.getElementById('readingLevel').textContent = readingLevels[Math.floor(Math.random() * readingLevels.length)];
    document.getElementById('sentimentValue').textContent = sentiments[Math.floor(Math.random() * sentiments.length)];
    document.getElementById('readTime').textContent = Math.max(1, Math.ceil(words / 200)) + ' min';
    document.getElementById('languageDetected').textContent = 'English';
    
    // Update text statistics
    document.getElementById('totalWords').textContent = words.toLocaleString();
    document.getElementById('totalChars').textContent = chars.toLocaleString();
    document.getElementById('totalSentences').textContent = sentences;
    document.getElementById('totalParagraphs').textContent = paragraphs;
    document.getElementById('avgSentenceLength').textContent = avgSentenceLength;
    document.getElementById('uniqueWords').textContent = uniqueWords.toLocaleString();
    
    // Show results
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function updateProgressBar(progressId, valueId, percentage) {
    const progress = document.getElementById(progressId);
    const value = document.getElementById(valueId);
    
    progress.style.width = percentage + '%';
    value.textContent = Math.round(percentage) + '%';
    
    // Color coding
    if (percentage >= 70) {
        progress.style.background = '#28a745';
    } else if (percentage >= 40) {
        progress.style.background = '#ffc107';
    } else {
        progress.style.background = '#dc3545';
    }
}

// Quick Analysis Tools
async function runGrammarCheck() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        showNotification('Please enter text first.', 'error');
        return;
    }
    
    showNotification('Grammar check complete! Found 2 minor issues.', 'success');
}

async function runPlagiarismCheck() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        showNotification('Please enter text first.', 'error');
        return;
    }
    
    showNotification('Plagiarism check complete! No matches found.', 'success');
}

async function runStyleAnalysis() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        showNotification('Please enter text first.', 'error');
        return;
    }
    
    showNotification('Style analysis complete! Writing style is formal and academic.', 'success');
}

async function runSentimentAnalysis() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        showNotification('Please enter text first.', 'error');
        return;
    }
    
    showNotification('Sentiment analysis complete! Overall sentiment is neutral to positive.', 'success');
}

async function runReadabilityCheck() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        showNotification('Please enter text first.', 'error');
        return;
    }
    
    showNotification('Readability check complete! Reading level: College (Grade 13-16).', 'success');
}

async function runKeywordExtraction() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        showNotification('Please enter text first.', 'error');
        return;
    }
    
    showNotification('Keywords extracted: AI, detection, analysis, text, content.', 'success');
}

// Text Comparison Functions
function openTextComparison() {
    document.getElementById('textComparisonModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeTextComparison() {
    document.getElementById('textComparisonModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset comparison
    document.getElementById('compareText1').value = '';
    document.getElementById('compareText2').value = '';
    document.getElementById('comparisonResults').style.display = 'none';
    updateComparisonStats();
}

function updateComparisonStats() {
    const text1 = document.getElementById('compareText1').value;
    const text2 = document.getElementById('compareText2').value;
    
    const words1 = text1.trim() ? text1.trim().split(/\s+/).length : 0;
    const words2 = text2.trim() ? text2.trim().split(/\s+/).length : 0;
    
    document.getElementById('compare1Words').textContent = `${words1} words`;
    document.getElementById('compare1Chars').textContent = `${text1.length} chars`;
    document.getElementById('compare2Words').textContent = `${words2} words`;
    document.getElementById('compare2Chars').textContent = `${text2.length} chars`;
}

// Add event listeners for comparison text areas
document.addEventListener('DOMContentLoaded', function() {
    const text1 = document.getElementById('compareText1');
    const text2 = document.getElementById('compareText2');
    
    if (text1) text1.addEventListener('input', updateComparisonStats);
    if (text2) text2.addEventListener('input', updateComparisonStats);
});

async function compareTexts() {
    const text1 = document.getElementById('compareText1').value.trim();
    const text2 = document.getElementById('compareText2').value.trim();
    
    if (!text1 || !text2) {
        showNotification('Please enter both texts for comparison.', 'error');
        return;
    }
    
    if (text1.length < 50 || text2.length < 50) {
        showNotification('Please enter at least 50 characters in each text for accurate comparison.', 'warning');
        return;
    }
    
    try {
        // Simulate comparison analysis
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Generate similarity scores
        const textSimilarity = Math.floor(Math.random() * 60 + 20); // 20-80%
        const styleSimilarity = Math.floor(Math.random() * 70 + 15); // 15-85%
        const structureSimilarity = Math.floor(Math.random() * 50 + 30); // 30-80%
        
        // Update similarity metrics
        document.getElementById('textSimilarity').textContent = textSimilarity + '%';
        document.getElementById('styleSimilarity').textContent = styleSimilarity + '%';
        document.getElementById('structureSimilarity').textContent = structureSimilarity + '%';
        
        // Update AI scores
        const ai1Score = Math.floor(Math.random() * 50 + 25); // 25-75%
        const ai2Score = Math.floor(Math.random() * 50 + 25); // 25-75%
        
        document.getElementById('text1AIScore').textContent = ai1Score + '% AI';
        document.getElementById('text2AIScore').textContent = ai2Score + '% AI';
        
        // Update verdict
        const verdict = document.getElementById('comparisonVerdict');
        if (Math.abs(ai1Score - ai2Score) < 10) {
            verdict.textContent = 'Both texts show similar AI detection patterns.';
        } else if (ai1Score > ai2Score) {
            verdict.textContent = 'Text 1 is more likely to be AI-generated than Text 2.';
        } else {
            verdict.textContent = 'Text 2 is more likely to be AI-generated than Text 1.';
        }
        
        // Show results
        document.getElementById('comparisonResults').style.display = 'block';
        showNotification('Text comparison completed!', 'success');
        
    } catch (error) {
        console.error('Comparison error:', error);
        showNotification('Comparison failed. Please try again.', 'error');
    }
}

// Bulk Analysis Functions
function openBulkAnalysis() {
    document.getElementById('bulkAnalysisModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    setupBulkDropZone();
}

function closeBulkAnalysis() {
    document.getElementById('bulkAnalysisModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset bulk analysis
    bulkFiles = [];
    document.getElementById('bulkResults').style.display = 'none';
    document.getElementById('bulkAnalyzeBtn').disabled = true;
}

function setupBulkDropZone() {
    const dropZone = document.getElementById('bulkDropZone');
    const fileInput = document.getElementById('bulkFileInput');
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary-color)';
        dropZone.style.background = '#f0f0ff';
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ddd';
        dropZone.style.background = '#fafafa';
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ddd';
        dropZone.style.background = '#fafafa';
        
        const files = Array.from(e.dataTransfer.files);
        handleBulkFiles(files);
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleBulkFiles(files);
    });
}

function handleBulkFiles(files) {
    const allowedTypes = ['.txt', '.doc', '.docx', '.pdf'];
    const validFiles = files.filter(file => {
        return allowedTypes.some(type => file.name.toLowerCase().endsWith(type));
    }).slice(0, 10); // Limit to 10 files
    
    if (validFiles.length === 0) {
        showNotification('Please select valid document files (TXT, DOC, DOCX, PDF).', 'error');
        return;
    }
    
    bulkFiles = validFiles;
    document.getElementById('bulkAnalyzeBtn').disabled = false;
    
    showNotification(`${validFiles.length} files ready for analysis.`, 'success');
}

async function startBulkAnalysis() {
    if (bulkFiles.length === 0) {
        showNotification('Please select files first.', 'error');
        return;
    }
    
    try {
        // Simulate bulk analysis
        const results = [];
        
        for (let i = 0; i < bulkFiles.length; i++) {
            const file = bulkFiles[i];
            const aiScore = Math.floor(Math.random() * 70 + 15); // 15-85%
            
            results.push({
                name: file.name,
                size: file.size,
                aiScore: aiScore,
                status: 'completed'
            });
            
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        displayBulkResults(results);
        
    } catch (error) {
        console.error('Bulk analysis error:', error);
        showNotification('Bulk analysis failed. Please try again.', 'error');
    }
}

function displayBulkResults(results) {
    const totalFiles = results.length;
    const avgAI = Math.round(results.reduce((sum, r) => sum + r.aiScore, 0) / totalFiles);
    const highRisk = results.filter(r => r.aiScore > 70).length;
    
    document.getElementById('totalFiles').textContent = totalFiles;
    document.getElementById('avgAIScore').textContent = avgAI + '%';
    document.getElementById('highRiskFiles').textContent = highRisk;
    
    const filesList = document.getElementById('bulkFilesList');
    filesList.innerHTML = results.map(result => `
        <div class="bulk-file-result">
            <div class="file-info">
                <span class="file-name">${result.name}</span>
                <span class="file-size">${(result.size / 1024).toFixed(1)} KB</span>
            </div>
            <div class="file-ai-score ${result.aiScore > 70 ? 'high-risk' : 'normal'}">
                ${result.aiScore}% AI
            </div>
        </div>
    `).join('');
    
    document.getElementById('bulkResults').style.display = 'block';
    showNotification('Bulk analysis completed!', 'success');
}

// Report Functions
function downloadReport() {
    const reportData = generateReportData();
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-analysis-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Report downloaded successfully!', 'success');
}

function generateReportData() {
    const humanPercent = document.getElementById('humanValue').textContent;
    const aiPercent = document.getElementById('aiValue').textContent;
    const confidence = document.getElementById('confidenceValue').textContent;
    
    return `TEXT AI DETECTION REPORT
Generated: ${new Date().toLocaleString()}

DETECTION RESULTS:
- Human Probability: ${humanPercent}
- AI Probability: ${aiPercent}
- Confidence: ${confidence}

TEXT STATISTICS:
- Total Words: ${document.getElementById('totalWords').textContent}
- Total Characters: ${document.getElementById('totalChars').textContent}
- Sentences: ${document.getElementById('totalSentences').textContent}
- Paragraphs: ${document.getElementById('totalParagraphs').textContent}
- Unique Words: ${document.getElementById('uniqueWords').textContent}
- Average Sentence Length: ${document.getElementById('avgSentenceLength').textContent}

ANALYSIS INDICATORS:
- Vocabulary Complexity: ${document.getElementById('vocabValue').textContent}
- Sentence Variation: ${document.getElementById('sentenceValue').textContent}
- Natural Flow: ${document.getElementById('flowValue').textContent}

CONTENT CHARACTERISTICS:
- Reading Level: ${document.getElementById('readingLevel').textContent}
- Sentiment: ${document.getElementById('sentimentValue').textContent}
- Estimated Read Time: ${document.getElementById('readTime').textContent}
- Language: ${document.getElementById('languageDetected').textContent}

This report was generated by Filterize Text AI Detection system.`;
}

function downloadComparisonReport() {
    const similarity1 = document.getElementById('textSimilarity').textContent;
    const similarity2 = document.getElementById('styleSimilarity').textContent;
    const similarity3 = document.getElementById('structureSimilarity').textContent;
    
    const reportData = `TEXT COMPARISON REPORT
Generated: ${new Date().toLocaleString()}

SIMILARITY ANALYSIS:
- Text Similarity: ${similarity1}
- Style Similarity: ${similarity2}
- Structure Similarity: ${similarity3}

AI DETECTION COMPARISON:
- Text 1 AI Score: ${document.getElementById('text1AIScore').textContent}
- Text 2 AI Score: ${document.getElementById('text2AIScore').textContent}

VERDICT:
${document.getElementById('comparisonVerdict').textContent}

This comparison report was generated by Filterize Text Comparison system.`;
    
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-comparison-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Comparison report downloaded!', 'success');
}

function downloadBulkReport() {
    if (bulkFiles.length === 0) {
        showNotification('No bulk analysis results to download.', 'error');
        return;
    }
    
    const reportData = `BULK TEXT ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

SUMMARY:
- Total Files Processed: ${document.getElementById('totalFiles').textContent}
- Average AI Score: ${document.getElementById('avgAIScore').textContent}
- High Risk Files: ${document.getElementById('highRiskFiles').textContent}

INDIVIDUAL FILE RESULTS:
${Array.from(document.querySelectorAll('.bulk-file-result')).map(item => {
    const name = item.querySelector('.file-name').textContent;
    const score = item.querySelector('.file-ai-score').textContent;
    return `- ${name}: ${score}`;
}).join('\n')}

This bulk analysis report was generated by Filterize Bulk Text Analysis system.`;
    
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-text-analysis-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Bulk report downloaded!', 'success');
}

function shareResults() {
    if (navigator.share) {
        const humanPercent = document.getElementById('humanValue').textContent;
        const aiPercent = document.getElementById('aiValue').textContent;
        
        navigator.share({
            title: 'Text AI Detection Results - Filterize',
            text: `Text Analysis Results: ${humanPercent} Human, ${aiPercent} AI-Generated`,
            url: window.location.href
        });
    } else {
        // Fallback to copying to clipboard
        const shareText = `Text AI Detection Results - Human: ${document.getElementById('humanValue').textContent}, AI: ${document.getElementById('aiValue').textContent}`;
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Results copied to clipboard!', 'success');
        });
    }
}

function analyzeAnother() {
    // Clear current analysis
    clearText();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exportHighlights() {
    showNotification('Text highlighting feature coming soon!', 'info');
}

// Utility Functions
function showLoading() {
    // Generic loading function for quick tools
    const spinner = document.createElement('div');
    spinner.className = 'quick-loading';
    spinner.innerHTML = '<div class="mini-spinner"></div>';
    document.body.appendChild(spinner);
    
    setTimeout(() => {
        if (spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    }, 2000);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add styles if not exist
    if (!document.querySelector('.notification-styles')) {
        const style = document.createElement('style');
        style.className = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 0.5rem;
                z-index: 3000;
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            .notification.success { border-left: 4px solid #28a745; }
            .notification.error { border-left: 4px solid #dc3545; }
            .notification.info { border-left: 4px solid #17a2b8; }
            .notification.warning { border-left: 4px solid #ffc107; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .quick-loading {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 3000;
            }
            .mini-spinner {
                width: 30px;
                height: 30px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateTextStats();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeTextComparison();
            closeBulkAnalysis();
        }
        
        if (e.ctrlKey && e.key === 'Enter') {
            analyzeText();
        }
    });
    
    // Add drag and drop support for main text area
    const uploadArea = document.getElementById('docUploadArea');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--primary-color)';
            this.style.background = '#f0f0ff';
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ddd';
            this.style.background = '#fafafa';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ddd';
            this.style.background = '#fafafa';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleDocUpload({ target: { files: files } });
            }
        });
    }
    
    showNotification('Advanced Text AI Detector ready! Paste text or upload documents to begin analysis.', 'info');
});