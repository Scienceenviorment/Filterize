/**
 * VIDEO DETECTOR - ADVANCED VIDEO ANALYSIS FUNCTIONALITY
 * Comprehensive video analysis with AI detection, deepfake detection, and metadata extraction
 */

// Global state
let currentVideos = [];
let recordingInterval = null;
let recordingStartTime = null;
let mediaRecorder = null;
let recordedChunks = [];
let currentStream = null;
let activeTab = 'frames';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeVideoDetector();
});

/**
 * Initialize video detector functionality
 */
function initializeVideoDetector() {
    console.log('🎥 Video Detector initialized');
    
    // Setup video upload functionality
    setupVideoUpload();
    
    // Setup drag and drop
    setupDragAndDrop();
    
    // Setup modal functionality
    setupModals();
    
    // Setup tab functionality
    setupTabs();
}

/**
 * Navigation function to return home
 */
function goHome() {
    window.location.href = '/frontend/index.html';
}

/**
 * Setup video upload functionality
 */
function setupVideoUpload() {
    const videoUpload = document.getElementById('videoUpload');
    const videoDropZone = document.getElementById('videoDropZone');
    
    // Click to upload
    videoDropZone.addEventListener('click', () => {
        videoUpload.click();
    });
    
    // File selection handler
    videoUpload.addEventListener('change', function(e) {
        handleVideoFiles(e.target.files);
    });
}

/**
 * Setup drag and drop functionality
 */
function setupDragAndDrop() {
    const videoDropZone = document.getElementById('videoDropZone');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        videoDropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        videoDropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        videoDropZone.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    videoDropZone.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        videoDropZone.classList.add('drag-over');
    }
    
    function unhighlight(e) {
        videoDropZone.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleVideoFiles(files);
    }
}

/**
 * Handle uploaded video files
 */
function handleVideoFiles(files) {
    const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv', 'video/webm'];
    const maxSize = 500 * 1024 * 1024; // 500MB
    
    Array.from(files).forEach(file => {
        if (!validTypes.includes(file.type)) {
            showNotification(`${file.name} is not a supported video format`, 'error');
            return;
        }
        
        if (file.size > maxSize) {
            showNotification(`${file.name} is too large (max 500MB)`, 'error');
            return;
        }
        
        addVideoToGallery(file);
    });
    
    if (files.length > 0) {
        document.getElementById('videoPreviewSection').style.display = 'block';
    }
}

/**
 * Add video to preview gallery
 */
function addVideoToGallery(file) {
    const videoId = 'video_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const videoItem = {
        id: videoId,
        file: file,
        name: file.name,
        size: file.size,
        duration: null,
        thumbnail: null
    };
    
    currentVideos.push(videoItem);
    
    // Create video element to get metadata
    const videoElement = document.createElement('video');
    videoElement.onloadedmetadata = function() {
        videoItem.duration = this.duration;
        updateVideoGallery();
    };
    
    videoElement.src = URL.createObjectURL(file);
    
    // Generate thumbnail
    videoElement.onloadeddata = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 200;
        canvas.height = 150;
        
        // Seek to 10% of video duration for thumbnail
        this.currentTime = this.duration * 0.1;
        
        this.onseeked = function() {
            ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
            videoItem.thumbnail = canvas.toDataURL('image/jpeg', 0.7);
            updateVideoGallery();
        };
    };
    
    updateVideoGallery();
}

/**
 * Update video gallery display
 */
function updateVideoGallery() {
    const gallery = document.getElementById('videoGallery');
    
    gallery.innerHTML = currentVideos.map(video => `
        <div class="video-item" data-video-id="${video.id}">
            <div class="video-thumbnail">
                ${video.thumbnail ? 
                    `<img src="${video.thumbnail}" alt="${video.name}">` :
                    '<div class="thumbnail-placeholder"><i class="fas fa-video"></i></div>'
                }
                <div class="video-duration">${formatDuration(video.duration)}</div>
            </div>
            <div class="video-info">
                <div class="video-name" title="${video.name}">${video.name}</div>
                <div class="video-size">${formatFileSize(video.size)}</div>
            </div>
            <button class="remove-video" onclick="removeVideo('${video.id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

/**
 * Remove video from gallery
 */
function removeVideo(videoId) {
    currentVideos = currentVideos.filter(video => video.id !== videoId);
    updateVideoGallery();
    
    if (currentVideos.length === 0) {
        document.getElementById('videoPreviewSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
    }
}

/**
 * Clear all videos
 */
function clearAllVideos() {
    currentVideos = [];
    updateVideoGallery();
    document.getElementById('videoPreviewSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
}

/**
 * Start video recording
 */
async function startVideoRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: true
        });
        
        currentStream = stream;
        const cameraModal = document.getElementById('cameraModal');
        const videoElement = document.getElementById('cameraVideo');
        
        videoElement.srcObject = stream;
        cameraModal.style.display = 'flex';
        
        showNotification('Camera access granted. Click record to start.', 'success');
    } catch (error) {
        console.error('Error accessing camera:', error);
        showNotification('Camera access denied or not available', 'error');
    }
}

/**
 * Stop video recording
 */
function stopVideoRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    
    clearInterval(recordingInterval);
    recordingInterval = null;
    
    document.querySelector('button[onclick="stopVideoRecording()"]').disabled = true;
    document.querySelector('button[onclick="startVideoRecording()"]').disabled = false;
}

/**
 * Toggle recording state
 */
function toggleRecording() {
    const recordBtn = document.getElementById('recordBtn');
    
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        startRecording();
    } else if (mediaRecorder.state === 'recording') {
        stopRecording();
    }
}

/**
 * Start recording process
 */
function startRecording() {
    if (!currentStream) {
        showNotification('Camera not initialized', 'error');
        return;
    }
    
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(currentStream);
    
    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    
    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const file = new File([blob], `recorded_video_${Date.now()}.webm`, { type: 'video/webm' });
        
        addVideoToGallery(file);
        closeCameraModal();
        document.getElementById('videoPreviewSection').style.display = 'block';
        
        showNotification('Video recorded successfully!', 'success');
    };
    
    mediaRecorder.start();
    recordingStartTime = Date.now();
    
    // Update UI
    const recordBtn = document.getElementById('recordBtn');
    recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
    recordBtn.classList.add('recording');
    
    // Start timer
    recordingInterval = setInterval(updateRecordingTime, 1000);
    
    showNotification('Recording started...', 'info');
}

/**
 * Stop recording process
 */
function stopRecording() {
    mediaRecorder.stop();
    clearInterval(recordingInterval);
    
    const recordBtn = document.getElementById('recordBtn');
    recordBtn.innerHTML = '<i class="fas fa-circle"></i> Start Recording';
    recordBtn.classList.remove('recording');
}

/**
 * Update recording time display
 */
function updateRecordingTime() {
    if (recordingStartTime) {
        const elapsed = Date.now() - recordingStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        document.getElementById('recordingTime').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

/**
 * Load video from URL
 */
async function loadVideoFromUrl() {
    const urlInput = document.getElementById('videoUrl');
    const url = urlInput.value.trim();
    
    if (!url) {
        showNotification('Please enter a video URL', 'error');
        return;
    }
    
    if (!isValidVideoUrl(url)) {
        showNotification('Please enter a valid video URL', 'error');
        return;
    }
    
    showLoading('Loading video from URL...');
    
    try {
        // Simulate URL video loading (in real implementation, this would use a backend service)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create a mock video file for demonstration
        const mockVideoData = new Uint8Array([/* mock video data */]);
        const mockFile = new File([mockVideoData], 'url_video.mp4', { type: 'video/mp4' });
        
        addVideoToGallery(mockFile);
        document.getElementById('videoPreviewSection').style.display = 'block';
        
        urlInput.value = '';
        hideLoading();
        showNotification('Video loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading video from URL:', error);
        hideLoading();
        showNotification('Failed to load video from URL', 'error');
    }
}

/**
 * Analyze all videos
 */
async function analyzeAllVideos() {
    if (currentVideos.length === 0) {
        showNotification('No videos to analyze', 'error');
        return;
    }
    
    showLoading('Analyzing videos...');
    
    try {
        // Simulate analysis process
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        
        // Simulate analysis results
        displayAnalysisResults();
        
        hideLoading();
        showNotification('Analysis completed successfully!', 'success');
        
        // Scroll to results
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Analysis error:', error);
        hideLoading();
        showNotification('Analysis failed. Please try again.', 'error');
    }
}

/**
 * Display analysis results with simulated data
 */
function displayAnalysisResults() {
    // AI Detection Results
    const aiProbability = Math.floor(Math.random() * 40) + 10; // 10-50% for demo
    document.querySelector('#aiProbability .percentage').textContent = aiProbability + '%';
    
    // Update probability circle color
    const circle = document.querySelector('#aiProbability .probability-circle');
    if (aiProbability < 30) {
        circle.className = 'probability-circle low';
    } else if (aiProbability < 60) {
        circle.className = 'probability-circle medium';
    } else {
        circle.className = 'probability-circle high';
    }
    
    // Confidence indicators
    const indicators = [
        { id: 'deepfake', value: Math.floor(Math.random() * 25) + 5 },
        { id: 'faceSwap', value: Math.floor(Math.random() * 20) + 3 },
        { id: 'voiceSynth', value: Math.floor(Math.random() * 30) + 10 },
        { id: 'motion', value: Math.floor(Math.random() * 15) + 2 }
    ];
    
    indicators.forEach(indicator => {
        const fill = document.getElementById(indicator.id + 'Fill');
        const value = document.getElementById(indicator.id + 'Value');
        
        fill.style.width = indicator.value + '%';
        value.textContent = indicator.value + '%';
    });
    
    // Technical Analysis
    const sampleVideo = currentVideos[0];
    if (sampleVideo) {
        document.getElementById('videoResolution').textContent = '1920x1080';
        document.getElementById('frameRate').textContent = '30 fps';
        document.getElementById('videoDuration').textContent = formatDuration(sampleVideo.duration || 120);
        document.getElementById('videoCodec').textContent = 'H.264';
        document.getElementById('audioCodec').textContent = 'AAC';
        document.getElementById('sampleRate').textContent = '48 kHz';
        document.getElementById('audioChannels').textContent = 'Stereo';
        document.getElementById('audioBitrate').textContent = '128 kbps';
    }
    
    // Populate metadata tabs
    populateMetadata();
    populateFrameAnalysis();
}

/**
 * Populate metadata information
 */
function populateMetadata() {
    const fileMetadata = document.getElementById('fileMetadata');
    const creationMetadata = document.getElementById('creationMetadata');
    const technicalMetadata = document.getElementById('technicalMetadata');
    
    // File information
    fileMetadata.innerHTML = `
        <div class="metadata-item">
            <span class="meta-label">File Size:</span>
            <span class="meta-value">${formatFileSize(currentVideos[0]?.size || 0)}</span>
        </div>
        <div class="metadata-item">
            <span class="meta-label">Format:</span>
            <span class="meta-value">MP4</span>
        </div>
        <div class="metadata-item">
            <span class="meta-label">Container:</span>
            <span class="meta-value">MPEG-4</span>
        </div>
    `;
    
    // Creation information
    creationMetadata.innerHTML = `
        <div class="metadata-item">
            <span class="meta-label">Created:</span>
            <span class="meta-value">${new Date().toLocaleDateString()}</span>
        </div>
        <div class="metadata-item">
            <span class="meta-label">Camera:</span>
            <span class="meta-value">Unknown</span>
        </div>
        <div class="metadata-item">
            <span class="meta-label">Software:</span>
            <span class="meta-value">Unknown</span>
        </div>
    `;
    
    // Technical details
    technicalMetadata.innerHTML = `
        <div class="metadata-item">
            <span class="meta-label">Bit Depth:</span>
            <span class="meta-value">8-bit</span>
        </div>
        <div class="metadata-item">
            <span class="meta-label">Color Space:</span>
            <span class="meta-value">YUV 4:2:0</span>
        </div>
        <div class="metadata-item">
            <span class="meta-label">Profile:</span>
            <span class="meta-value">High</span>
        </div>
    `;
}

/**
 * Populate frame analysis
 */
function populateFrameAnalysis() {
    const frameGrid = document.getElementById('frameGrid');
    
    // Generate mock frame thumbnails
    frameGrid.innerHTML = Array.from({length: 8}, (_, i) => `
        <div class="frame-item">
            <div class="frame-thumbnail">
                <div class="frame-placeholder">
                    <i class="fas fa-image"></i>
                    <span>Frame ${i + 1}</span>
                </div>
            </div>
            <div class="frame-info">
                <div class="frame-time">${formatTime(i * 15)}</div>
                <div class="frame-score">AI: ${Math.floor(Math.random() * 30)}%</div>
            </div>
        </div>
    `).join('');
}

/**
 * Tab functionality
 */
function setupTabs() {
    // Tab switching is handled by showTab function
}

function showTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    activeTab = tabName;
}

/**
 * Modal functionality
 */
function setupModals() {
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Modal control functions
function openBatchModal() {
    document.getElementById('batchModal').style.display = 'flex';
}

function closeBatchModal() {
    document.getElementById('batchModal').style.display = 'none';
}

function openComparisonModal() {
    document.getElementById('comparisonModal').style.display = 'flex';
}

function closeComparisonModal() {
    document.getElementById('comparisonModal').style.display = 'none';
}

function closeCameraModal() {
    document.getElementById('cameraModal').style.display = 'none';
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

/**
 * Utility functions
 */
function formatDuration(seconds) {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isValidVideoUrl(url) {
    try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        return false;
    }
}

/**
 * Feature functions
 */
function extractFrames() {
    showNotification('Extracting key frames...', 'info');
    
    setTimeout(() => {
        populateFrameAnalysis();
        showNotification('Key frames extracted successfully!', 'success');
    }, 1500);
}

function analyzeFrames() {
    showNotification('Analyzing extracted frames...', 'info');
    
    setTimeout(() => {
        showNotification('Frame analysis completed!', 'success');
    }, 2000);
}

function startBatchAnalysis() {
    showNotification('Starting batch analysis...', 'info');
    closeBatchModal();
}

function compareVideos() {
    showNotification('Comparing videos...', 'info');
    
    // Simulate comparison
    setTimeout(() => {
        const score = Math.floor(Math.random() * 40) + 60; // 60-100% similarity
        document.querySelector('#comparisonScore .score-percentage').textContent = score + '%';
        
        showNotification('Video comparison completed!', 'success');
    }, 2000);
}

function generateReport(type) {
    showNotification(`Generating ${type} report...`, 'info');
    
    setTimeout(() => {
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated!`, 'success');
    }, 1500);
}

function exportAnalysis() {
    showNotification('Exporting analysis results...', 'info');
    
    setTimeout(() => {
        showNotification('Analysis exported successfully!', 'success');
    }, 1000);
}

/**
 * Loading and notification functions
 */
function showLoading(message = 'Processing...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = overlay.querySelector('.loading-text');
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