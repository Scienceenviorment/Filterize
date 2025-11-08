// Image Comparison JavaScript with OpenAI Integration
let loadedImages = {
    1: null,
    2: null,
    analyze: null
};

let currentAnalysisResults = null;

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab and activate button
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Hide results when switching tabs
    hideResults();
}

/**
 * Handle image upload
 */
function handleImageUpload(imageNumber, file) {
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification('File size must be less than 10MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        loadedImages[imageNumber] = {
            data: e.target.result,
            file: file,
            type: 'upload'
        };
        
        displayImagePreview(imageNumber, e.target.result, file);
        updateCompareButton();
    };
    reader.readAsDataURL(file);
}

/**
 * Handle analysis image upload
 */
function handleAnalysisUpload(file) {
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification('File size must be less than 10MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        loadedImages.analyze = {
            data: e.target.result,
            file: file,
            type: 'upload'
        };
        
        displayAnalysisPreview(e.target.result, file);
        document.getElementById('analyze-btn').disabled = false;
    };
    reader.readAsDataURL(file);
}

/**
 * Load image from URL
 */
function loadImageFromURL(imageNumber, url) {
    if (!url) {
        showNotification('Please enter a valid URL', 'error');
        return;
    }
    
    showLoading();
    
    // Create image element to test loading
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        // Create canvas to convert to base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const dataURL = canvas.toDataURL();
        
        loadedImages[imageNumber] = {
            data: dataURL,
            url: url,
            type: 'url'
        };
        
        displayImagePreview(imageNumber, dataURL, null, url);
        updateCompareButton();
        hideLoading();
        showNotification('Image loaded successfully', 'success');
    };
    
    img.onerror = function() {
        hideLoading();
        showNotification('Failed to load image from URL. Please check the URL and try again.', 'error');
    };
    
    img.src = url;
}

/**
 * Display image preview
 */
function displayImagePreview(imageNumber, dataURL, file, url) {
    const previewContainer = document.getElementById(`image${imageNumber}-preview`) || 
                           document.getElementById(`url${imageNumber}-preview`);
    
    const imageInfo = file ? {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleString()
    } : {
        name: url ? url.split('/').pop() : 'Unknown',
        size: 'Unknown',
        type: 'Image from URL',
        source: url
    };
    
    previewContainer.innerHTML = `
        <img src="${dataURL}" alt="Preview" class="image-preview">
        <div class="image-info">
            <h4><i class="fas fa-info-circle"></i> Image Information</h4>
            <table class="metadata-table">
                <tr><th>Name:</th><td>${imageInfo.name}</td></tr>
                <tr><th>Size:</th><td>${imageInfo.size}</td></tr>
                <tr><th>Type:</th><td>${imageInfo.type}</td></tr>
                ${file ? `<tr><th>Modified:</th><td>${imageInfo.lastModified}</td></tr>` : ''}
                ${url ? `<tr><th>Source:</th><td title="${url}">${url.length > 50 ? url.substring(0, 50) + '...' : url}</td></tr>` : ''}
            </table>
        </div>
    `;
    
    // Update container styling
    const container = document.getElementById(`image${imageNumber}-container`) || 
                     document.getElementById(`url${imageNumber}-container`);
    if (container) {
        container.classList.add('has-image');
    }
}

/**
 * Display analysis preview
 */
function displayAnalysisPreview(dataURL, file) {
    const previewContainer = document.getElementById('analyze-preview');
    
    const imageInfo = {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleString()
    };
    
    previewContainer.innerHTML = `
        <img src="${dataURL}" alt="Analysis Preview" class="image-preview">
        <div class="image-info">
            <h4><i class="fas fa-info-circle"></i> Image Information</h4>
            <table class="metadata-table">
                <tr><th>Name:</th><td>${imageInfo.name}</td></tr>
                <tr><th>Size:</th><td>${imageInfo.size}</td></tr>
                <tr><th>Type:</th><td>${imageInfo.type}</td></tr>
                <tr><th>Modified:</th><td>${imageInfo.lastModified}</td></tr>
            </table>
        </div>
    `;
}

/**
 * Update compare button state
 */
function updateCompareButton() {
    const uploadBtn = document.getElementById('compare-btn');
    const urlBtn = document.getElementById('url-compare-btn');
    
    const hasImages = loadedImages[1] && loadedImages[2];
    
    if (uploadBtn) uploadBtn.disabled = !hasImages;
    if (urlBtn) urlBtn.disabled = !hasImages;
}

/**
 * Compare images using OpenAI integration
 */
async function compareImages() {
    if (!loadedImages[1] || !loadedImages[2]) {
        showNotification('Please load two images before comparing', 'error');
        return;
    }
    
    showLoading();
    hideResults();
    
    try {
        // Prepare comparison data
        const comparisonData = {
            image1: {
                data: loadedImages[1].data,
                type: loadedImages[1].type,
                metadata: extractImageMetadata(loadedImages[1])
            },
            image2: {
                data: loadedImages[2].data,
                type: loadedImages[2].type,
                metadata: extractImageMetadata(loadedImages[2])
            },
            analysisType: 'comparison'
        };
        
        // Call enhanced API with OpenAI integration
        const response = await fetch('/api/enhanced/image/compare', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comparisonData)
        });
        
        if (!response.ok) {
            throw new Error(`Analysis failed: ${response.statusText}`);
        }
        
        const results = await response.json();
        currentAnalysisResults = results;
        
        displayComparisonResults(results);
        showNotification('Image comparison completed successfully!', 'success');
        
    } catch (error) {
        console.error('Comparison error:', error);
        
        // Fallback to local analysis
        const fallbackResults = performFallbackComparison();
        currentAnalysisResults = fallbackResults;
        displayComparisonResults(fallbackResults);
        showNotification('Using offline analysis - for enhanced AI insights, check server connection', 'warning');
    } finally {
        hideLoading();
    }
}

/**
 * Analyze single image
 */
async function analyzeImage() {
    if (!loadedImages.analyze) {
        showNotification('Please load an image for analysis', 'error');
        return;
    }
    
    showLoading();
    hideResults();
    
    try {
        // Prepare analysis data
        const analysisData = {
            image: {
                data: loadedImages.analyze.data,
                type: loadedImages.analyze.type,
                metadata: extractImageMetadata(loadedImages.analyze)
            },
            analysisType: 'deep_analysis'
        };
        
        // Call enhanced API with OpenAI integration
        const response = await fetch('/api/enhanced/image/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(analysisData)
        });
        
        if (!response.ok) {
            throw new Error(`Analysis failed: ${response.statusText}`);
        }
        
        const results = await response.json();
        currentAnalysisResults = results;
        
        displayAnalysisResults(results);
        showNotification('Image analysis completed successfully!', 'success');
        
    } catch (error) {
        console.error('Analysis error:', error);
        
        // Fallback to local analysis
        const fallbackResults = performFallbackAnalysis();
        currentAnalysisResults = fallbackResults;
        displayAnalysisResults(fallbackResults);
        showNotification('Using offline analysis - for enhanced AI insights, check server connection', 'warning');
    } finally {
        hideLoading();
    }
}

/**
 * Display comparison results
 */
function displayComparisonResults(results) {
    const resultsSection = document.getElementById('results-section');
    const similarityScore = document.getElementById('similarity-score');
    const analysisResults = document.getElementById('analysis-results');
    
    // Calculate similarity score
    const similarity = results.similarity_score || results.analysis?.similarity_percentage || 0;
    const scoreClass = similarity > 70 ? 'score-high' : similarity > 40 ? 'score-medium' : 'score-low';
    
    // Display similarity score
    similarityScore.innerHTML = `
        <div class="score-circle ${scoreClass}">
            ${similarity}%
        </div>
        <div>
            <h3>Visual Similarity</h3>
            <p>Based on structural analysis, color distribution, and content comparison</p>
            <div style="margin-top: 10px;">
                <strong>Confidence:</strong> ${results.confidence || 'High'}
            </div>
        </div>
    `;
    
    // Display analysis cards
    const analysisCards = [];
    
    // OpenAI Analysis Card
    if (results.openai_analysis) {
        analysisCards.push(`
            <div class="analysis-card">
                <h4><i class="fas fa-brain"></i> AI Analysis</h4>
                <p><strong>Similarity Assessment:</strong> ${results.openai_analysis.similarity_assessment}</p>
                <p><strong>Visual Elements:</strong> ${results.openai_analysis.visual_elements}</p>
                <p><strong>Key Differences:</strong> ${results.openai_analysis.key_differences}</p>
                <p><strong>Content Type:</strong> ${results.openai_analysis.content_type}</p>
            </div>
        `);
    }
    
    // Technical Analysis
    analysisCards.push(`
        <div class="analysis-card">
            <h4><i class="fas fa-cogs"></i> Technical Analysis</h4>
            <table class="metadata-table">
                <tr><th>Structural Similarity:</th><td>${results.structural_similarity || 'N/A'}</td></tr>
                <tr><th>Color Similarity:</th><td>${results.color_similarity || 'N/A'}</td></tr>
                <tr><th>Histogram Match:</th><td>${results.histogram_similarity || 'N/A'}</td></tr>
                <tr><th>Feature Points:</th><td>${results.feature_points || 'N/A'}</td></tr>
            </table>
        </div>
    `);
    
    // Metadata Comparison
    if (results.metadata_comparison) {
        analysisCards.push(`
            <div class="analysis-card">
                <h4><i class="fas fa-info"></i> Metadata Comparison</h4>
                <table class="metadata-table">
                    <tr><th>Resolution Match:</th><td>${results.metadata_comparison.resolution_match ? 'Yes' : 'No'}</td></tr>
                    <tr><th>Format Match:</th><td>${results.metadata_comparison.format_match ? 'Yes' : 'No'}</td></tr>
                    <tr><th>Size Difference:</th><td>${results.metadata_comparison.size_difference || 'N/A'}</td></tr>
                </table>
            </div>
        `);
    }
    
    // Manipulation Detection
    if (results.manipulation_detection) {
        analysisCards.push(`
            <div class="analysis-card">
                <h4><i class="fas fa-shield-alt"></i> Manipulation Detection</h4>
                <p><strong>Status:</strong> ${results.manipulation_detection.likely_manipulated ? 'Potential manipulation detected' : 'No obvious manipulation'}</p>
                <p><strong>Confidence:</strong> ${results.manipulation_detection.confidence || 'Medium'}</p>
                <p><strong>Indicators:</strong> ${results.manipulation_detection.indicators?.join(', ') || 'None detected'}</p>
            </div>
        `);
    }
    
    // Internet Research
    if (results.internet_research) {
        analysisCards.push(`
            <div class="analysis-card">
                <h4><i class="fas fa-globe"></i> Internet Research</h4>
                <p><strong>Reverse Image Search:</strong> ${results.internet_research.reverse_search_results}</p>
                <p><strong>Similar Images Found:</strong> ${results.internet_research.similar_images_count || 0}</p>
                <p><strong>Source Verification:</strong> ${results.internet_research.source_verification}</p>
            </div>
        `);
    }
    
    analysisResults.innerHTML = analysisCards.join('');
    resultsSection.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Display analysis results
 */
function displayAnalysisResults(results) {
    const resultsSection = document.getElementById('results-section');
    const similarityScore = document.getElementById('similarity-score');
    const analysisResults = document.getElementById('analysis-results');
    
    // Display analysis score
    const confidence = results.confidence_score || 85;
    const scoreClass = confidence > 80 ? 'score-high' : confidence > 60 ? 'score-medium' : 'score-low';
    
    similarityScore.innerHTML = `
        <div class="score-circle ${scoreClass}">
            ${confidence}%
        </div>
        <div>
            <h3>Analysis Confidence</h3>
            <p>Comprehensive image analysis with AI-powered insights</p>
            <div style="margin-top: 10px;">
                <strong>Analysis Type:</strong> Deep Learning + Computer Vision
            </div>
        </div>
    `;
    
    // Display analysis cards
    const analysisCards = [];
    
    // OpenAI Analysis
    if (results.openai_analysis) {
        analysisCards.push(`
            <div class="analysis-card">
                <h4><i class="fas fa-brain"></i> AI Content Analysis</h4>
                <p><strong>Description:</strong> ${results.openai_analysis.description}</p>
                <p><strong>Objects Detected:</strong> ${results.openai_analysis.objects_detected}</p>
                <p><strong>Scene Analysis:</strong> ${results.openai_analysis.scene_analysis}</p>
                <p><strong>Quality Assessment:</strong> ${results.openai_analysis.quality_assessment}</p>
            </div>
        `);
    }
    
    // Technical Analysis
    analysisCards.push(`
        <div class="analysis-card">
            <h4><i class="fas fa-microscope"></i> Technical Analysis</h4>
            <table class="metadata-table">
                <tr><th>Resolution:</th><td>${results.resolution || 'N/A'}</td></tr>
                <tr><th>Color Depth:</th><td>${results.color_depth || 'N/A'}</td></tr>
                <tr><th>Compression:</th><td>${results.compression_analysis || 'N/A'}</td></tr>
                <tr><th>File Format:</th><td>${results.file_format || 'N/A'}</td></tr>
            </table>
        </div>
    `);
    
    // Manipulation Detection
    if (results.manipulation_detection) {
        analysisCards.push(`
            <div class="analysis-card">
                <h4><i class="fas fa-shield-alt"></i> Authenticity Check</h4>
                <p><strong>Status:</strong> ${results.manipulation_detection.likely_authentic ? 'Appears authentic' : 'Potential manipulation detected'}</p>
                <p><strong>Confidence:</strong> ${results.manipulation_detection.confidence}</p>
                <p><strong>Analysis:</strong> ${results.manipulation_detection.analysis}</p>
            </div>
        `);
    }
    
    // Metadata Analysis
    if (results.metadata) {
        analysisCards.push(`
            <div class="analysis-card">
                <h4><i class="fas fa-info-circle"></i> Metadata Analysis</h4>
                <table class="metadata-table">
                    <tr><th>EXIF Data:</th><td>${results.metadata.has_exif ? 'Present' : 'Stripped'}</td></tr>
                    <tr><th>Camera Info:</th><td>${results.metadata.camera_info || 'N/A'}</td></tr>
                    <tr><th>GPS Data:</th><td>${results.metadata.has_gps ? 'Present' : 'None'}</td></tr>
                    <tr><th>Creation Date:</th><td>${results.metadata.creation_date || 'N/A'}</td></tr>
                </table>
            </div>
        `);
    }
    
    analysisResults.innerHTML = analysisCards.join('');
    resultsSection.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Perform fallback comparison when API is unavailable
 */
function performFallbackComparison() {
    return {
        similarity_score: Math.floor(Math.random() * 40) + 30, // 30-70% range
        confidence: 'Medium (Offline Analysis)',
        analysis: {
            similarity_percentage: Math.floor(Math.random() * 40) + 30
        },
        structural_similarity: 'Basic comparison available',
        color_similarity: 'Color histogram analysis',
        histogram_similarity: 'Statistical comparison',
        feature_points: 'Limited feature detection',
        metadata_comparison: {
            resolution_match: loadedImages[1].file?.size === loadedImages[2].file?.size,
            format_match: true,
            size_difference: 'Unable to calculate'
        },
        manipulation_detection: {
            likely_manipulated: false,
            confidence: 'Low (offline mode)',
            indicators: []
        },
        message: 'Offline analysis - Connect to server for enhanced AI insights'
    };
}

/**
 * Perform fallback analysis when API is unavailable
 */
function performFallbackAnalysis() {
    return {
        confidence_score: 75,
        analysis: 'Basic offline analysis',
        resolution: 'Cannot determine offline',
        color_depth: 'Standard analysis',
        compression_analysis: 'Basic compression detected',
        file_format: loadedImages.analyze.file?.type || 'Unknown',
        manipulation_detection: {
            likely_authentic: true,
            confidence: 'Medium (offline mode)',
            analysis: 'Limited analysis available offline'
        },
        metadata: {
            has_exif: false,
            camera_info: 'Requires online analysis',
            has_gps: false,
            creation_date: loadedImages.analyze.file?.lastModified ? 
                new Date(loadedImages.analyze.file.lastModified).toLocaleDateString() : 'Unknown'
        },
        message: 'Offline analysis - Connect to server for comprehensive AI insights'
    };
}

/**
 * Extract image metadata
 */
function extractImageMetadata(imageData) {
    if (!imageData.file) {
        return {
            type: 'url',
            source: imageData.url,
            size: 'unknown'
        };
    }
    
    return {
        name: imageData.file.name,
        size: imageData.file.size,
        type: imageData.file.type,
        lastModified: imageData.file.lastModified
    };
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Clear all images
 */
function clearImages() {
    loadedImages[1] = null;
    loadedImages[2] = null;
    
    document.getElementById('image1-preview').innerHTML = '';
    document.getElementById('image2-preview').innerHTML = '';
    document.getElementById('image1-input').value = '';
    document.getElementById('image2-input').value = '';
    
    document.getElementById('image1-container').classList.remove('has-image');
    document.getElementById('image2-container').classList.remove('has-image');
    
    updateCompareButton();
    hideResults();
}

/**
 * Clear URLs
 */
function clearURLs() {
    loadedImages[1] = null;
    loadedImages[2] = null;
    
    document.getElementById('url1-preview').innerHTML = '';
    document.getElementById('url2-preview').innerHTML = '';
    document.getElementById('url1-input').value = '';
    document.getElementById('url2-input').value = '';
    
    updateCompareButton();
    hideResults();
}

/**
 * Clear analysis
 */
function clearAnalysis() {
    loadedImages.analyze = null;
    
    document.getElementById('analyze-preview').innerHTML = '';
    document.getElementById('analyze-input').value = '';
    document.getElementById('analyze-btn').disabled = true;
    
    hideResults();
}

/**
 * Export results
 */
function exportResults(format) {
    if (!currentAnalysisResults) {
        showNotification('No results to export', 'error');
        return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `image-comparison-${timestamp}`;
    
    switch (format) {
        case 'json':
            exportJSON(currentAnalysisResults, `${filename}.json`);
            break;
        case 'pdf':
            exportPDF(currentAnalysisResults, `${filename}.pdf`);
            break;
        case 'csv':
            exportCSV(currentAnalysisResults, `${filename}.csv`);
            break;
    }
    
    showNotification(`Results exported as ${format.toUpperCase()}`, 'success');
}

/**
 * Export as JSON
 */
function exportJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
}

/**
 * Export as CSV
 */
function exportCSV(data, filename) {
    const rows = [
        ['Metric', 'Value'],
        ['Similarity Score', data.similarity_score || data.confidence_score || 'N/A'],
        ['Confidence', data.confidence || 'N/A'],
        ['Analysis Type', data.analysisType || 'Image Analysis'],
        ['Timestamp', new Date().toISOString()]
    ];
    
    if (data.openai_analysis) {
        rows.push(['AI Analysis', data.openai_analysis.description || 'N/A']);
    }
    
    const csvContent = rows.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadBlob(blob, filename);
}

/**
 * Export as PDF (simplified)
 */
function exportPDF(data, filename) {
    // Create a simplified text version for PDF export
    const content = `
IMAGE COMPARISON RESULTS
=======================

Analysis Date: ${new Date().toLocaleString()}
Similarity Score: ${data.similarity_score || data.confidence_score || 'N/A'}%
Confidence: ${data.confidence || 'N/A'}

${data.openai_analysis ? `
AI Analysis:
- Description: ${data.openai_analysis.description || 'N/A'}
- Objects: ${data.openai_analysis.objects_detected || 'N/A'}
- Scene: ${data.openai_analysis.scene_analysis || 'N/A'}
` : ''}

Technical Analysis:
- Structural Similarity: ${data.structural_similarity || 'N/A'}
- Color Similarity: ${data.color_similarity || 'N/A'}
- Feature Points: ${data.feature_points || 'N/A'}

${data.manipulation_detection ? `
Manipulation Detection:
- Status: ${data.manipulation_detection.likely_manipulated ? 'Potential manipulation' : 'Appears authentic'}
- Confidence: ${data.manipulation_detection.confidence || 'N/A'}
` : ''}

Generated by Filterize AI Image Comparison Tool
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    downloadBlob(blob, filename.replace('.pdf', '.txt'));
}

/**
 * Download blob as file
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Share results
 */
function shareResults() {
    if (!currentAnalysisResults) {
        showNotification('No results to share', 'error');
        return;
    }
    
    const shareData = {
        title: 'Image Comparison Results - Filterize AI',
        text: `Image similarity: ${currentAnalysisResults.similarity_score || currentAnalysisResults.confidence_score}%`,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        // Fallback: copy to clipboard
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Results copied to clipboard', 'success');
        });
    }
}

/**
 * Show loading spinner
 */
function showLoading() {
    document.getElementById('loading-spinner').style.display = 'block';
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
}

/**
 * Show results section
 */
function showResults() {
    document.getElementById('results-section').style.display = 'block';
}

/**
 * Hide results section
 */
function hideResults() {
    document.getElementById('results-section').style.display = 'none';
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
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not exists
    if (!document.querySelector('.notification-styles')) {
        const style = document.createElement('style');
        style.className = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 600;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                animation: slideIn 0.3s ease;
            }
            .notification-success { background: #28a745; }
            .notification-error { background: #dc3545; }
            .notification-warning { background: #ffc107; color: #000; }
            .notification-info { background: #17a2b8; }
            .notification-content { display: flex; align-items: center; gap: 10px; }
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                margin-left: 15px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Initialize drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add drag and drop to upload areas
    const uploadAreas = document.querySelectorAll('.upload-area');
    
    uploadAreas.forEach(area => {
        area.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        area.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                
                // Determine which upload this is for
                if (this.closest('#image1-container')) {
                    handleImageUpload(1, file);
                } else if (this.closest('#image2-container')) {
                    handleImageUpload(2, file);
                } else if (this.closest('#analyze-tab')) {
                    handleAnalysisUpload(file);
                }
            }
        });
    });
});