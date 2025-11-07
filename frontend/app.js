// Helper constants
const circumference = 2 * Math.PI * 85; // r = 85

function setGauge(score) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const dash = (pct / 100) * circumference;
  const gauge = document.getElementById('gaugeProgress');
  if (gauge) gauge.setAttribute('stroke-dasharray', `${dash} ${circumference}`);
  const scoreEl = document.getElementById('gaugeScore');
  if (scoreEl) scoreEl.innerText = pct;
  const status = document.getElementById('credibilityStatus');
  if (!status) return;
  status.className = 'credibility-status';
  if (pct >= 75) { status.classList.add('status-high'); status.innerText = 'High credibility'; }
  else if (pct >= 50) { status.classList.add('status-medium'); status.innerText = 'Medium credibility'; }
  else { status.classList.add('status-low'); status.innerText = 'Low credibility'; }
}

function setFactor(idScore, idBar, value){
  const el = document.getElementById(idScore);
  const bar = document.getElementById(idBar);
  const v = Math.max(0, Math.min(100, Math.round(value)));
  if (el) el.innerText = v;
  if (bar) bar.style.width = v + '%';
}

function setSentiment(compound){
  const pos = Math.max(0, compound) * 100;
  const neg = Math.max(0, -compound) * 100;
  const neu = Math.max(0, 100 - pos - neg);
  const p = document.getElementById('positiveBar');
  const n = document.getElementById('negativeBar');
  const nu = document.getElementById('neutralBar');
  if (p) { p.style.width = Math.round(pos) + '%'; p.innerText = Math.round(pos) + '%'; }
  if (nu) { nu.style.width = Math.round(neu) + '%'; nu.innerText = Math.round(neu) + '%'; }
  if (n) { n.style.width = Math.round(neg) + '%'; n.innerText = Math.round(neg) + '%'; }
}

function renderWordCloud(phrases){
  const wc = document.getElementById('wordcloud');
  if (!wc) return;
  wc.innerHTML = '';
  if(!phrases || phrases.length === 0){
    wc.innerHTML = '<div class="word-item">No key phrases</div>';
    return;
  }
  phrases.forEach((p,i)=>{
    const div = document.createElement('div');
    div.className = 'word-item';
    const classes = ['word-sensational','word-pressure','word-fomo','word-urgency','word-mystery'];
    div.classList.add(classes[i % classes.length]);
    div.innerHTML = `${p}<div class="word-detail">Click to explore</div>`;
    wc.appendChild(div);
  });
}

function displayAIDetection(aiData) {
  const aiSection = document.getElementById('aiDetectionSection');
  if (!aiSection || !aiData || aiData.error) {
    if (aiSection) aiSection.classList.add('hidden');
    return;
  }
  
  aiSection.classList.remove('hidden');
  
  // Update AI probability gauge
  const aiProbability = Math.round((aiData.ai_probability || 0) * 100);
  const aiGauge = document.getElementById('aiGaugeProgress');
  const aiScore = document.getElementById('aiGaugeScore');
  const aiStatus = document.getElementById('aiStatus');
  
  if (aiGauge && aiScore) {
    const dash = (aiProbability / 100) * circumference;
    aiGauge.setAttribute('stroke-dasharray', `${dash} ${circumference}`);
    aiScore.innerText = aiProbability;
  }
  
  if (aiStatus) {
    aiStatus.className = 'ai-status';
    if (aiProbability >= 70) {
      aiStatus.classList.add('status-high-ai');
      aiStatus.innerText = 'Likely AI-generated';
    } else if (aiProbability >= 30) {
      aiStatus.classList.add('status-medium-ai');
      aiStatus.innerText = 'Possibly AI-generated';
    } else {
      aiStatus.classList.add('status-low-ai');
      aiStatus.innerText = 'Likely human-written';
    }
  }
  
  // Update detection methods
  const methodsList = document.getElementById('detectionMethods');
  if (methodsList && aiData.detection_methods) {
    methodsList.innerHTML = '';
    aiData.detection_methods.forEach(method => {
      const span = document.createElement('span');
      span.className = 'detection-method';
      span.innerText = method.replace('_', ' ');
      methodsList.appendChild(span);
    });
  }
  
  // Update confidence
  const confidenceEl = document.getElementById('aiConfidence');
  if (confidenceEl) {
    const confidence = Math.round((aiData.confidence || 0) * 100);
    confidenceEl.innerText = `${confidence}%`;
  }
  
  // Update explanation
  const explanationEl = document.getElementById('aiExplanation');
  if (explanationEl && aiData.explanation) {
    explanationEl.innerText = aiData.explanation;
  }
  
  // Update detailed scores
  const perplexityEl = document.getElementById('perplexityScore');
  const rewardEl = document.getElementById('rewardScore');
  if (perplexityEl) perplexityEl.innerText = Math.round(aiData.perplexity_score || 0);
  if (rewardEl) rewardEl.innerText = Math.round(aiData.reward_score || 0);
  
  // Update watermark indicator
  const watermarkEl = document.getElementById('watermarkStatus');
  if (watermarkEl) {
    watermarkEl.className = 'watermark-status';
    if (aiData.watermark_detected) {
      watermarkEl.classList.add('detected');
      watermarkEl.innerText = 'Detected';
    } else {
      watermarkEl.classList.add('not-detected');
      watermarkEl.innerText = 'Not detected';
    }
  }
}

async function startAnalysis(){
  const btn = document.getElementById('analyzeBtn');
  if (!btn || btn.disabled) return;
  
  // Show loading state
  btn.disabled = true;
  btn.innerHTML = '<span class="progress-indicator"></span>Analyzing...';
  
  try {
    let result;
    
    if (currentContentType === 'text') {
      const text = document.getElementById('inputText').value.trim();
      if (!text) {
        showToast('Please enter some text to analyze', 'error');
        return;
      }
      result = await analyzeText(text);
    } else if (currentContentType === 'image') {
      if (!currentFile) {
        showToast('Please select an image to analyze', 'error');
        return;
      }
      result = await analyzeImage(currentFile);
    } else if (currentContentType === 'video') {
      if (!currentFile) {
        showToast('Please select a video to analyze', 'error');
        return;
      }
      result = await analyzeVideo(currentFile);
    } else if (currentContentType === 'url') {
      const url = document.getElementById('urlInput').value.trim();
      if (!url) {
        showToast('Please enter a URL to analyze', 'error');
        return;
      }
      result = await analyzeUrl(url);
    }
    
    if (result) {
      displayResults(result);
    }
    
  } catch (error) {
    console.error('Analysis failed:', error);
    showToast('Analysis failed. Please try again.', 'error');
  } finally {
    // Reset button state
    btn.disabled = false;
    btn.innerHTML = '🚀 Analyze';
  }
}

/* --- History (localStorage) --- */
const HISTORY_KEY = 'filterize_history_v1';
function loadHistory(){
  try{ const raw = localStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) : []; }catch(_){ return []; }
}
function saveHistory(arr){ try{ localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0,30))); }catch(_){}}
function addToHistory(entry){ const h = loadHistory(); h.unshift(entry); saveHistory(h); renderHistory(); }
function clearHistory(){ try{ localStorage.removeItem(HISTORY_KEY); document.getElementById('historyList').innerText = 'No history yet'; }catch(_){}}
function renderHistory(){ const list = document.getElementById('historyList'); if(!list) return; const h = loadHistory(); if(!h || h.length===0){ list.innerText = 'No history yet'; return; } list.innerHTML = ''; h.forEach((it, idx)=>{ const div = document.createElement('div'); div.className = 'history-item'; const left = document.createElement('div'); left.innerHTML = `<div style="font-weight:800">${it.score} • ${it.used}</div><div class="meta">${it.preview}</div>`; const right = document.createElement('div'); const loadBtn = document.createElement('button'); loadBtn.className='analyze-btn small'; loadBtn.innerText='Load'; loadBtn.addEventListener('click', ()=>{ document.getElementById('inputText').value = it.full; }); const delBtn = document.createElement('button'); delBtn.className='analyze-btn small'; delBtn.style.marginLeft='8px'; delBtn.innerText='Delete'; delBtn.addEventListener('click', ()=>{ const arr = loadHistory(); arr.splice(idx,1); saveHistory(arr); renderHistory(); }); right.appendChild(loadBtn); right.appendChild(delBtn); div.appendChild(left); div.appendChild(right); list.appendChild(div); }); }

// Wire clear history button
const clearBtn = document.getElementById('clearHistoryBtn'); if (clearBtn) clearBtn.addEventListener('click', ()=>{ clearHistory(); });

// On successful analysis, add to history
function recordAnalysisToHistory(data, input){
  try{
    const entry = { score: data.score || 0, used: data.used || 'heuristic', preview: (data.summary && data.summary.slice(0,2).join(', ')) || input.slice(0,80), full: input, ts: Date.now() };
    addToHistory(entry);
  }catch(_){ }
}

// render on load
setTimeout(()=>{ renderHistory(); }, 600);

function fillExample(text){
  const el = document.getElementById('inputText');
  if (!el) return;
  el.value = text;
  showToast('Filled example — press Analyze or use Ctrl/Cmd+Enter', 'info');
}

function showToast(message, type='info'){
  const t = document.createElement('div');
  t.style.background = type==='error' ? 'linear-gradient(90deg,#ff6b6b,#ffb86b)' : 'linear-gradient(90deg,#667eea,#764ba2)';
  t.style.color = 'white';
  t.style.padding = '12px 18px';
  t.style.borderRadius = '12px';
  t.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
  t.style.marginTop = '8px';
  t.innerText = message;
  const container = document.getElementById('toast');
  if (!container) return;
  container.appendChild(t);
  setTimeout(()=>{ t.style.transition = 'opacity 0.4s ease'; t.style.opacity = '0'; setTimeout(()=>t.remove(),450); }, 4000);
}

// Onboarding modal wiring
const onboardModal = document.getElementById('onboardModal');
const OPEN_KEY = 'filterize_onboard_shown';

function showOnboard(){
  const dialog = document.getElementById('onboardDialog');
  onboardModal.classList.remove('hidden');
  if (dialog) dialog.focus();
  trapFocus(dialog || onboardModal);
}

function hideOnboard(){
  onboardModal.classList.add('hidden');
  releaseFocusTrap();
}

// Wire buttons
if (document.getElementById('openOnboard')) document.getElementById('openOnboard').addEventListener('click', ()=>{ showOnboard(); });
if (document.getElementById('onboardClose')) document.getElementById('onboardClose').addEventListener('click', ()=>{ hideOnboard(); });
if (document.getElementById('onboardTry')) document.getElementById('onboardTry').addEventListener('click', ()=>{ hideOnboard(); fillExample('Breaking: Scientists confirm chocolate cures aging — doctors shocked!'); });

// Persist choice
const dontShowCheckbox = document.getElementById('dontShowOnboard');
if (dontShowCheckbox) {
  dontShowCheckbox.addEventListener('change', (e)=>{
    try{ localStorage.setItem(OPEN_KEY, e.target.checked ? '1' : '0'); }catch(_){}
  });
}

// Auto-show logic on load
try{
  const pref = localStorage.getItem(OPEN_KEY);
  if (pref !== '1') {
    // show once after small delay to avoid interrupting page load
    setTimeout(()=>{ showOnboard(); }, 600);
  }
}catch(_){ /* ignore storage errors */ }

// Focus trap implementation
let _focusTrap = null;
function trapFocus(container){
  const focusable = container.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length-1];
  function handleKey(e){
    if(e.key === 'Tab'){
      if (e.shiftKey){ if(document.activeElement === first){ e.preventDefault(); last.focus(); } }
      else { if(document.activeElement === last){ e.preventDefault(); first.focus(); } }
    }
    if (e.key === 'Escape'){ hideOnboard(); }
  }
  _focusTrap = handleKey;
  container.addEventListener('keydown', handleKey);
}

function releaseFocusTrap(){
  const dialog = document.getElementById('onboardDialog') || onboardModal;
  if (!dialog || !_focusTrap) return;
  dialog.removeEventListener('keydown', _focusTrap);
  _focusTrap = null;
}

// Keyboard shortcut: Ctrl/Cmd + Enter to submit
const inputTextEl = document.getElementById('inputText');
if (inputTextEl) inputTextEl.addEventListener('keydown', (e)=>{
  if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){
    startAnalysis();
  }
});

// Initialize small defaults
setGauge(0);
setFactor('factor1Score','factor1Bar', 0);
setFactor('factor2Score','factor2Bar', 0);
setFactor('factor3Score','factor3Bar', 0);
setFactor('factor4Score','factor4Bar', 0);
setFactor('factor5Score','factor5Bar', 0);

// Attach analyze button
const analyzeBtn = document.getElementById('analyzeBtn');
if (analyzeBtn) analyzeBtn.addEventListener('click', startAnalysis);

// Global variables for file handling
let currentFile = null;
let currentContentType = 'text';

// Content type switching
function switchContentType(type) {
  currentContentType = type;
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(type + 'Tab').classList.add('active');
  
  // Update panels
  document.querySelectorAll('.content-panel').forEach(panel => panel.classList.add('hidden'));
  document.getElementById(type + 'Panel').classList.remove('hidden');
  
  // Clear previous file
  currentFile = null;
  clearPreviews();
}

// File upload handlers
function setupFileUploads() {
  // Image upload
  const imageUploadArea = document.getElementById('imageUploadArea');
  const imageInput = document.getElementById('imageInput');
  
  if (imageUploadArea && imageInput) {
    imageUploadArea.addEventListener('click', () => imageInput.click());
    imageUploadArea.addEventListener('dragover', handleDragOver);
    imageUploadArea.addEventListener('drop', (e) => handleFileDrop(e, 'image'));
    imageInput.addEventListener('change', (e) => handleFileSelect(e, 'image'));
  }
  
  // Video upload
  const videoUploadArea = document.getElementById('videoUploadArea');
  const videoInput = document.getElementById('videoInput');
  
  if (videoUploadArea && videoInput) {
    videoUploadArea.addEventListener('click', () => videoInput.click());
    videoUploadArea.addEventListener('dragover', handleDragOver);
    videoUploadArea.addEventListener('drop', (e) => handleFileDrop(e, 'video'));
    videoInput.addEventListener('change', (e) => handleFileSelect(e, 'video'));
  }
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
}

function handleFileDrop(e, type) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0], type);
  }
}

function handleFileSelect(e, type) {
  const files = e.target.files;
  if (files.length > 0) {
    handleFile(files[0], type);
  }
}

function handleFile(file, type) {
  // Validate file type and size
  const maxSizes = { image: 10 * 1024 * 1024, video: 50 * 1024 * 1024 }; // 10MB for images, 50MB for videos
  
  if (file.size > maxSizes[type]) {
    showToast(`File too large. Maximum size for ${type} is ${maxSizes[type] / (1024 * 1024)}MB`, 'error');
    return;
  }
  
  currentFile = file;
  showFilePreview(file, type);
}

function showFilePreview(file, type) {
  const previewId = type + 'Preview';
  const preview = document.getElementById(previewId);
  
  if (!preview) return;
  
  preview.classList.remove('hidden');
  preview.innerHTML = '';
  
  if (type === 'image') {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = 'Preview';
    preview.appendChild(img);
  } else if (type === 'video') {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.controls = true;
    video.muted = true;
    preview.appendChild(video);
  }
  
  // Add file info and remove button
  const info = document.createElement('div');
  info.className = 'preview-info';
  info.innerHTML = `
    <strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(2)} MB)
    <br>
    <button class="remove-file" onclick="clearPreviews()">Remove File</button>
  `;
  preview.appendChild(info);
}

function clearPreviews() {
  ['imagePreview', 'videoPreview'].forEach(id => {
    const preview = document.getElementById(id);
    if (preview) {
      preview.classList.add('hidden');
      preview.innerHTML = '';
    }
  });
  
  // Clear file inputs
  ['imageInput', 'videoInput'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
  
  currentFile = null;
}

// Enhanced analysis function
async function startAnalysis() {
  const btn = document.getElementById('analyzeBtn');
  if (!btn || btn.disabled) return;
  
  // Show loading state
  btn.disabled = true;
  btn.innerHTML = '<span class="progress-indicator"></span>Analyzing...';
  
  try {
    let result;
    
    if (currentContentType === 'text') {
      const text = document.getElementById('inputText').value.trim();
      if (!text) {
        showToast('Please enter some text to analyze', 'error');
        return;
      }
      result = await analyzeText(text);
    } else if (currentContentType === 'image') {
      if (!currentFile) {
        showToast('Please select an image to analyze', 'error');
        return;
      }
      result = await analyzeImage(currentFile);
    } else if (currentContentType === 'video') {
      if (!currentFile) {
        showToast('Please select a video to analyze', 'error');
        return;
      }
      result = await analyzeVideo(currentFile);
    } else if (currentContentType === 'url') {
      const url = document.getElementById('urlInput').value.trim();
      if (!url) {
        showToast('Please enter a URL to analyze', 'error');
        return;
      }
      result = await analyzeUrl(url);
    }
    
    if (result) {
      displayResults(result);
    }
    
  } catch (error) {
    console.error('Analysis failed:', error);
    showToast('Analysis failed. Please try again.', 'error');
  } finally {
    // Reset button state
    btn.disabled = false;
    btn.innerHTML = '🚀 Analyze';
  }
}

// Analysis functions for different content types
async function analyzeText(text) {
  const prefer = document.getElementById('modeSelect')?.value || 'auto';
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text, prefer })
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

async function analyzeImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/analyze-image', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

async function analyzeVideo(file) {
  const formData = new FormData();
  formData.append('video', file);
  
  const response = await fetch('/api/analyze-video', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

async function analyzeUrl(url) {
  const response = await fetch('/api/analyze-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

// Toast notification system
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  const toastEl = document.createElement('div');
  toastEl.className = `toast toast-${type}`;
  toastEl.textContent = message;
  
  toast.appendChild(toastEl);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toastEl.parentNode) {
      toastEl.parentNode.removeChild(toastEl);
    }
  }, 5000);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
  setupFileUploads();
});

// Make functions globally available
window.switchContentType = switchContentType;
window.clearPreviews = clearPreviews;
