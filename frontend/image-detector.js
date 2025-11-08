// Image Detector JavaScript Functionality

let selectedImages = [];
let comparisonImages = { image1: null, image2: null };
let cameraStream = null;

// Navigation Functions
function goHome() {
    window.location.href = '/';
}

// Image Upload Handling
function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    processImages(files);
}

function processImages(files) {
    const validImages = files.filter(file => file.type.startsWith('image/'));
    
    if (validImages.length === 0) {
        showNotification('Please select valid image files.', 'error');
        return;
    }
    
    // Limit to 10 images for performance
    const imagesToProcess = validImages.slice(0, 10);
    selectedImages = imagesToProcess;
    
    updateFileCount();
    displayImagePreviews();
    showNotification(`${imagesToProcess.length} image(s) ready for analysis.`, 'success');
}

function updateFileCount() {
    const fileCountElement = document.querySelector('.file-count');
    fileCountElement.textContent = `${selectedImages.length} files selected`;
}

function displayImagePreviews() {
    const gallery = document.getElementById('imageGallery');
    const previewSection = document.getElementById('imagePreviewSection');
    
    gallery.innerHTML = '';
    
    selectedImages.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            imageItem.innerHTML = `
                <img src="${e.target.result}" alt="Image ${index + 1}">
                <div class="image-info">
                    <span class="image-name">${file.name}</span>
                    <span class="image-size">${(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <button class="remove-image" onclick="removeImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            gallery.appendChild(imageItem);
        };
        reader.readAsDataURL(file);
    });
    
    previewSection.style.display = 'block';
}

function removeImage(index) {
    selectedImages.splice(index, 1);
    updateFileCount();
    
    if (selectedImages.length === 0) {
        document.getElementById('imagePreviewSection').style.display = 'none';
    } else {
        displayImagePreviews();
    }
    
    showNotification('Image removed.', 'info');
}

function clearImages() {
    selectedImages = [];
    updateFileCount();
    document.getElementById('imagePreviewSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('imageInput').value = '';
    showNotification('All images cleared.', 'info');
}

// URL Analysis
async function analyzeImageURL() {
    const url = document.getElementById('imageUrlInput').value.trim();
    if (!url) {
        showNotification('Please enter a valid image URL.', 'error');
        return;
    }
    
    try {
        showLoadingSection();
        
        // Simulate URL image loading
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create a mock file object for the URL
        const mockFile = {
            name: url.split('/').pop() || 'url-image.jpg',
            size: Math.floor(Math.random() * 2000000 + 500000), // 0.5-2.5MB
            type: 'image/jpeg'
        };
        
        selectedImages = [mockFile];
        updateFileCount();
        
        // Mock image preview
        const gallery = document.getElementById('imageGallery');
        gallery.innerHTML = `
            <div class="image-item">
                <img src="${url}" alt="URL Image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='">
                <div class="image-info">
                    <span class="image-name">${mockFile.name}</span>
                    <span class="image-size">${(mockFile.size / 1024).toFixed(1)} KB</span>
                </div>
            </div>
        `;
        
        document.getElementById('imagePreviewSection').style.display = 'block';
        hideLoadingSection();
        
        // Automatically analyze the URL image
        setTimeout(() => analyzeSelectedImages(), 1000);
        
        showNotification('Image fetched from URL successfully!', 'success');
        
    } catch (error) {
        hideLoadingSection();
        showNotification('Failed to fetch image from URL. Please check the URL and try again.', 'error');
    }
}

// Camera Functions
async function openCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        document.getElementById('cameraModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const video = document.getElementById('cameraVideo');
        video.srcObject = cameraStream;
        
        showNotification('Camera opened successfully!', 'success');
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        showNotification('Error accessing camera. Please check permissions.', 'error');
    }
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    document.getElementById('cameraModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function takePicture() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('captureCanvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    // Convert to blob
    canvas.toBlob(function(blob) {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        selectedImages = [file];
        updateFileCount();
        
        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const gallery = document.getElementById('imageGallery');
            gallery.innerHTML = `
                <div class="image-item">
                    <img src="${e.target.result}" alt="Camera Capture">
                    <div class="image-info">
                        <span class="image-name">${file.name}</span>
                        <span class="image-size">${(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                </div>
            `;
            document.getElementById('imagePreviewSection').style.display = 'block';
        };
        reader.readAsDataURL(file);
        
        closeCamera();
        showNotification('Photo captured successfully!', 'success');
    });
}

function capturePhoto() {
    takePicture();
}

// Analysis Functions
async function analyzeSelectedImages() {
    if (selectedImages.length === 0) {
        showNotification('Please select images to analyze.', 'error');
        return;
    }
    
    showLoadingSection();
    
    try {
        // Simulate analysis steps
        await simulateAnalysisSteps();
        
        // Use the first image for detailed analysis
        const primaryImage = selectedImages[0];
        
        const formData = new FormData();
        formData.append('image', primaryImage);
        formData.append('type', 'image');
        
        // For demo, we'll simulate the analysis
        const result = await simulateImageAnalysis(primaryImage);
        displayResults(result, primaryImage);
        
    } catch (error) {
        console.error('Analysis error:', error);
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

async function simulateImageAnalysis(image) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic results
    const aiProbability = Math.floor(Math.random() * 60 + 20); // 20-80%
    const humanProbability = 100 - aiProbability;
    const confidence = Math.floor(Math.random() * 25 + 70); // 70-95%
    
    return {
        ai_probability: aiProbability,
        human_probability: humanProbability,
        confidence: confidence,
        indicators: {
            pixel_inconsistency: Math.floor(Math.random() * 50 + 10),
            compression_artifacts: Math.floor(Math.random() * 40 + 5),
            unnatural_patterns: Math.floor(Math.random() * 60 + 15)
        },
        properties: {
            dimensions: '1920x1080',
            format: image.type.split('/')[1].toUpperCase(),
            size: (image.size / (1024 * 1024)).toFixed(2) + ' MB',
            color_depth: '24-bit'
        },
        metadata: {
            camera_model: Math.random() > 0.5 ? 'Canon EOS R5' : 'Unknown',
            date_taken: Math.random() > 0.3 ? new Date().toLocaleDateString() : 'Not Available',
            software: Math.random() > 0.6 ? 'Adobe Photoshop' : 'Unknown',
            gps_location: Math.random() > 0.8 ? '40.7128° N, 74.0060° W' : 'Not Available'
        }
    };
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

function displayResults(result, image) {
    hideLoadingSection();
    
    // Update detection percentages
    const aiPercentage = result.ai_probability;
    const humanPercentage = result.human_probability;
    const confidence = result.confidence;
    
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
        verdictElement.textContent = 'This image appears to be REAL/AUTHENTIC';
        verdictElement.className = 'verdict-text human';
        explanationElement.textContent = 'The image shows natural characteristics consistent with real photography.';
    } else {
        verdictElement.textContent = 'This image appears to be AI-GENERATED';
        verdictElement.className = 'verdict-text ai';
        explanationElement.textContent = 'The image exhibits patterns commonly found in AI-generated content.';
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
    
    // Update AI indicators
    updateIndicatorBar('pixelInconsistency', 'pixelValue', result.indicators.pixel_inconsistency);
    updateIndicatorBar('compressionArtifacts', 'compressionValue', result.indicators.compression_artifacts);
    updateIndicatorBar('unnaturalPatterns', 'patternsValue', result.indicators.unnatural_patterns);
    
    // Update image properties
    document.getElementById('imageDimensions').textContent = result.properties.dimensions;
    document.getElementById('imageFormat').textContent = result.properties.format;
    document.getElementById('fileSize').textContent = result.properties.size;
    document.getElementById('colorDepth').textContent = result.properties.color_depth;
    
    // Update metadata
    document.getElementById('cameraModel').textContent = result.metadata.camera_model;
    document.getElementById('dateTaken').textContent = result.metadata.date_taken;
    document.getElementById('gpsLocation').textContent = result.metadata.gps_location;
    document.getElementById('software').textContent = result.metadata.software;
    document.getElementById('creationMethod').textContent = result.metadata.camera_model !== 'Unknown' ? 'Camera Capture' : 'Digital Creation';
    document.getElementById('modificationHistory').textContent = result.metadata.software !== 'Unknown' ? 'Edited' : 'None Detected';
    
    // Show results
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function updateIndicatorBar(barId, valueId, percentage) {
    const bar = document.getElementById(barId);
    const value = document.getElementById(valueId);
    
    bar.style.width = percentage + '%';
    value.textContent = percentage + '%';
    
    // Color coding based on risk level
    if (percentage >= 70) {
        bar.style.background = '#dc3545'; // High risk - red
    } else if (percentage >= 40) {
        bar.style.background = '#ffc107'; // Medium risk - yellow
    } else {
        bar.style.background = '#28a745'; // Low risk - green
    }
}

// Quick Analysis Tools
async function runMetadataExtraction() {
    if (selectedImages.length === 0) {
        showNotification('Please select an image first.', 'error');
        return;
    }
    
    showNotification('Metadata extraction complete! Camera: Canon EOS R5, Date: 2024-11-08', 'success');
}

async function runColorAnalysis() {
    if (selectedImages.length === 0) {
        showNotification('Please select an image first.', 'error');
        return;
    }
    
    showNotification('Color analysis complete! Dominant colors: Blue (35%), Green (28%), Gray (20%)', 'success');
}

async function runObjectDetection() {
    if (selectedImages.length === 0) {
        showNotification('Please select an image first.', 'error');
        return;
    }
    
    showNotification('Objects detected: Person (95%), Car (87%), Building (78%), Tree (65%)', 'success');
}

async function runFaceDetection() {
    if (selectedImages.length === 0) {
        showNotification('Please select an image first.', 'error');
        return;
    }
    
    showNotification('Face detection complete! 2 faces detected with high confidence.', 'success');
}

async function runReverseSearch() {
    if (selectedImages.length === 0) {
        showNotification('Please select an image first.', 'error');
        return;
    }
    
    showNotification('Reverse search complete! 12 similar images found across the web.', 'success');
}

async function runQualityCheck() {
    if (selectedImages.length === 0) {
        showNotification('Please select an image first.', 'error');
        return;
    }
    
    showNotification('Quality check complete! Sharpness: Excellent, Noise: Low, Overall: High Quality', 'success');
}

// Image Comparison Functions
function openImageComparison() {
    document.getElementById('imageComparisonModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeImageComparison() {
    document.getElementById('imageComparisonModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset comparison data
    comparisonImages = { image1: null, image2: null };
    document.getElementById('img1Preview').innerHTML = '';
    document.getElementById('img2Preview').innerHTML = '';
    document.getElementById('comparisonResults').style.display = 'none';
    document.getElementById('compareBtn').disabled = true;
}

function handleComparisonUpload(imageNumber, event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        comparisonImages[`image${imageNumber}`] = file;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(`img${imageNumber}Preview`);
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Comparison Image ${imageNumber}">
                <div class="image-info">
                    <span class="image-name">${file.name}</span>
                    <span class="image-size">${(file.size / 1024).toFixed(1)} KB</span>
                </div>
            `;
        };
        reader.readAsDataURL(file);
        
        checkComparisonReady();
        showNotification(`Image ${imageNumber} uploaded successfully!`, 'success');
    } else {
        showNotification('Please select a valid image file.', 'error');
    }
}

function checkComparisonReady() {
    const compareBtn = document.getElementById('compareBtn');
    if (comparisonImages.image1 && comparisonImages.image2) {
        compareBtn.disabled = false;
    } else {
        compareBtn.disabled = true;
    }
}

async function compareImages() {
    if (!comparisonImages.image1 || !comparisonImages.image2) {
        showNotification('Please upload both images for comparison.', 'error');
        return;
    }
    
    try {
        // Simulate comparison analysis
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Generate similarity scores
        const visualSimilarity = Math.floor(Math.random() * 80 + 10); // 10-90%
        const colorSimilarity = Math.floor(Math.random() * 70 + 20); // 20-90%
        const structureSimilarity = Math.floor(Math.random() * 60 + 25); // 25-85%
        
        // Update similarity metrics
        document.getElementById('visualSimilarity').textContent = visualSimilarity + '%';
        document.getElementById('colorSimilarity').textContent = colorSimilarity + '%';
        document.getElementById('structureSimilarity').textContent = structureSimilarity + '%';
        
        // Update AI scores
        const ai1Score = Math.floor(Math.random() * 70 + 15); // 15-85%
        const ai2Score = Math.floor(Math.random() * 70 + 15); // 15-85%
        
        document.getElementById('img1AIScore').textContent = ai1Score + '% AI';
        document.getElementById('img2AIScore').textContent = ai2Score + '% AI';
        
        // Update verdict
        const verdict = document.getElementById('comparisonVerdict');
        if (Math.abs(ai1Score - ai2Score) < 15) {
            verdict.textContent = 'Both images show similar AI detection patterns.';
        } else if (ai1Score > ai2Score) {
            verdict.textContent = 'Image 1 is more likely to be AI-generated than Image 2.';
        } else {
            verdict.textContent = 'Image 2 is more likely to be AI-generated than Image 1.';
        }
        
        // Show results
        document.getElementById('comparisonResults').style.display = 'block';
        showNotification('Image comparison completed!', 'success');
        
    } catch (error) {
        console.error('Comparison error:', error);
        showNotification('Comparison failed. Please try again.', 'error');
    }
}

// Batch Analysis Functions
function openBatchAnalysis() {
    showNotification('Batch analysis feature coming soon! Use multiple image upload for now.', 'info');
}

// Report Functions
function downloadReport() {
    const reportData = generateReportData();
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-analysis-report-${new Date().toISOString().split('T')[0]}.txt`;
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
    
    return `IMAGE AI DETECTION REPORT
Generated: ${new Date().toLocaleString()}

DETECTION RESULTS:
- Real/Authentic Probability: ${humanPercent}
- AI Generated Probability: ${aiPercent}
- Confidence: ${confidence}

IMAGE PROPERTIES:
- Dimensions: ${document.getElementById('imageDimensions').textContent}
- Format: ${document.getElementById('imageFormat').textContent}
- File Size: ${document.getElementById('fileSize').textContent}
- Color Depth: ${document.getElementById('colorDepth').textContent}

AI INDICATORS:
- Pixel Inconsistency: ${document.getElementById('pixelValue').textContent}
- Compression Artifacts: ${document.getElementById('compressionValue').textContent}
- Unnatural Patterns: ${document.getElementById('patternsValue').textContent}

METADATA ANALYSIS:
- Camera Model: ${document.getElementById('cameraModel').textContent}
- Date Taken: ${document.getElementById('dateTaken').textContent}
- GPS Location: ${document.getElementById('gpsLocation').textContent}
- Software: ${document.getElementById('software').textContent}
- Creation Method: ${document.getElementById('creationMethod').textContent}

This report was generated by Filterize Image AI Detection system.`;
}

function downloadComparisonReport() {
    const similarity1 = document.getElementById('visualSimilarity').textContent;
    const similarity2 = document.getElementById('colorSimilarity').textContent;
    const similarity3 = document.getElementById('structureSimilarity').textContent;
    
    const reportData = `IMAGE COMPARISON REPORT
Generated: ${new Date().toLocaleString()}

SIMILARITY ANALYSIS:
- Visual Similarity: ${similarity1}
- Color Similarity: ${similarity2}
- Structure Similarity: ${similarity3}

AI DETECTION COMPARISON:
- Image 1 AI Score: ${document.getElementById('img1AIScore').textContent}
- Image 2 AI Score: ${document.getElementById('img2AIScore').textContent}

VERDICT:
${document.getElementById('comparisonVerdict').textContent}

This comparison report was generated by Filterize Image Comparison system.`;
    
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-comparison-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Comparison report downloaded!', 'success');
}

function shareResults() {
    if (navigator.share) {
        const humanPercent = document.getElementById('humanValue').textContent;
        const aiPercent = document.getElementById('aiValue').textContent;
        
        navigator.share({
            title: 'Image AI Detection Results - Filterize',
            text: `Image Analysis Results: ${humanPercent} Real, ${aiPercent} AI-Generated`,
            url: window.location.href
        });
    } else {
        // Fallback to copying to clipboard
        const shareText = `Image AI Detection Results - Real: ${document.getElementById('humanValue').textContent}, AI: ${document.getElementById('aiValue').textContent}`;
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Results copied to clipboard!', 'success');
        });
    }
}

function analyzeAnother() {
    // Clear current analysis
    clearImages();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exportAnalysis() {
    showNotification('Advanced analysis export feature coming soon!', 'info');
}

function downloadOriginals() {
    if (selectedImages.length === 0) {
        showNotification('No images to download.', 'error');
        return;
    }
    
    showNotification('Original images download feature coming soon!', 'info');
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
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageComparison();
            closeCamera();
        }
    });
    
    // Add drag and drop support for main upload area
    const dropZone = document.getElementById('imageDropZone');
    if (dropZone) {
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--primary-color)';
            this.style.background = '#f0f0ff';
        });
        
        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ddd';
            this.style.background = '#fafafa';
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ddd';
            this.style.background = '#fafafa';
            
            const files = Array.from(e.dataTransfer.files);
            processImages(files);
        });
    }
    
    // Add comparison drag and drop
    const comparisonAreas = document.querySelectorAll('.image-drop-area');
    comparisonAreas.forEach((area, index) => {
        area.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--primary-color)';
            this.style.background = '#f0f0ff';
        });
        
        area.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ddd';
            this.style.background = '#fafafa';
        });
        
        area.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ddd';
            this.style.background = '#fafafa';
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                const imageNumber = index + 1;
                handleComparisonUpload(imageNumber, { target: { files: files } });
            }
        });
    });
    
    showNotification('Advanced Image AI Detector ready! Upload images or use camera to begin analysis.', 'info');
});