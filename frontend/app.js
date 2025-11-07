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

function setAiGauge(aiData) {
  if (!aiData) return;
  
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
      aiStatus.innerText = 'High AI probability';
    } else if (aiProbability >= 30) {
      aiStatus.classList.add('status-medium-ai');
      aiStatus.innerText = 'Medium AI probability';
    } else {
      aiStatus.classList.add('status-low-ai');
      aiStatus.innerText = 'Low AI probability';
    }
  }
  
  // Update AI details
  const confidence = document.getElementById('aiConfidence');
  const explanation = document.getElementById('aiExplanation');
  const methods = document.getElementById('aiMethods');
  const perplexity = document.getElementById('aiPerplexity');
  const watermark = document.getElementById('aiWatermark');
  
  if (confidence) {
    confidence.textContent = Math.round((aiData.confidence || 0) * 100) + '%';
  }
  
  if (explanation) {
    explanation.textContent = aiData.explanation || 'No detailed explanation available';
  }
  
  if (methods && aiData.detection_methods) {
    methods.textContent = aiData.detection_methods.join(', ') || 'None';
  }
  
  if (perplexity) {
    perplexity.textContent = aiData.perplexity_score ? aiData.perplexity_score.toFixed(2) : 'N/A';
  }
  
  if (watermark) {
    watermark.className = 'watermark-status';
    if (aiData.watermark_detected) {
      watermark.classList.add('detected');
      watermark.innerText = 'Detected';
    } else {
      watermark.classList.add('not-detected');
      watermark.innerText = 'Not detected';
    }
  }
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
    } else if (currentContentType === 'fact-check') {
      const text = document.getElementById('factCheckText').value.trim();
      if (!text) {
        showToast('Please enter content for fact-checking', 'error');
        return;
      }
      result = await analyzeFactCheck(text);
    } else if (currentContentType === 'multi-ai') {
      const text = document.getElementById('multiAiText').value.trim();
      if (!text) {
        showToast('Please enter content for multi-AI analysis', 'error');
        return;
      }
      const provider = document.getElementById('providerSelect').value;
      const task = document.getElementById('taskSelect').value;
      result = await analyzeMultiAI(text, provider, task);
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
  
  // Hide all results sections initially
  hideAllResults();
  
  // Update analyze button text based on type
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    switch(type) {
      case 'fact-check':
        analyzeBtn.innerHTML = '🔍 Fact Check';
        break;
      case 'multi-ai':
        analyzeBtn.innerHTML = '🤖 Multi-AI Analyze';
        break;
      default:
        analyzeBtn.innerHTML = '🚀 Analyze';
    }
  }
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

// New fact-checking analysis function
async function analyzeFactCheck(content) {
  const response = await fetch('/api/fact-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      content,
      type: 'text'
    })
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

// New multi-AI analysis function  
async function analyzeMultiAI(content, provider = '', task = 'analysis') {
  const response = await fetch('/api/multi-ai-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      content,
      type: 'text',
      task,
      provider: provider || undefined
    })
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

// Enhanced display results function
function displayResults(result) {
  if (!result) return;
  
  // Hide all result sections first
  hideAllResults();
  
  // Determine which results to show based on analysis type
  if (currentContentType === 'fact-check') {
    displayFactCheckResults(result);
  } else if (currentContentType === 'multi-ai') {
    displayMultiAIResults(result);
  } else {
    // Show standard results for text/image/video/url analysis
    displayStandardResults(result);
  }
  
  // Show results section
  document.getElementById('resultsSection').classList.remove('hidden');
}

function hideAllResults() {
  const resultSections = [
    'factCheckResults', 'multiAiResults'
  ];
  
  resultSections.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.classList.add('hidden');
  });
}

function displayStandardResults(result) {
  // Show traditional analysis results by ensuring standard sections are visible
  const aiDetectionSection = document.getElementById('aiDetectionCard');
  if (aiDetectionSection) {
    aiDetectionSection.classList.remove('hidden');
  }
  
  // Calculate truth vs fake percentages
  const score = result.score || 0;
  const truthPercentage = Math.max(0, Math.min(100, score));
  const fakePercentage = 100 - truthPercentage;
  
  // Update truth/fake display
  const truthPercentageEl = document.getElementById('truthPercentage');
  const fakePercentageEl = document.getElementById('fakePercentage');
  
  if (truthPercentageEl) truthPercentageEl.textContent = truthPercentage + '%';
  if (fakePercentageEl) fakePercentageEl.textContent = fakePercentage + '%';
  
  // Update credibility status
  const credibilityStatus = document.getElementById('credibilityStatus');
  if (credibilityStatus) {
    credibilityStatus.className = 'credibility-status';
    if (truthPercentage >= 75) {
      credibilityStatus.classList.add('status-high');
      credibilityStatus.textContent = 'Highly Credible Content';
    } else if (truthPercentage >= 50) {
      credibilityStatus.classList.add('status-medium');
      credibilityStatus.textContent = 'Moderately Credible Content';
    } else {
      credibilityStatus.classList.add('status-low');
      credibilityStatus.textContent = 'Low Credibility Content';
    }
  }
  
  // Update AI detection display
  if (result.ai_detection) {
    const aiProbabilityText = document.getElementById('aiProbabilityText');
    const aiConfidenceText = document.getElementById('aiConfidenceText');
    const aiExplanationText = document.getElementById('aiExplanationText');
    
    if (aiProbabilityText) {
      aiProbabilityText.textContent = Math.round((result.ai_detection.ai_probability || 0) * 100) + '%';
    }
    if (aiConfidenceText) {
      aiConfidenceText.textContent = Math.round((result.ai_detection.confidence || 0) * 100) + '%';
    }
    if (aiExplanationText) {
      aiExplanationText.textContent = result.ai_detection.explanation || 'No detailed explanation available';
    }
  }
  
  // Update sentiment display
  if (result.vader_compound !== undefined) {
    updateSentimentDisplay(result.vader_compound);
  }
  
  // Update analysis details
  const usedMethod = document.getElementById('usedMethod');
  if (usedMethod) {
    usedMethod.textContent = result.used || 'auto';
  }
  
  const detectionMethodsList = document.getElementById('detectionMethodsList');
  if (detectionMethodsList && result.ai_detection && result.ai_detection.detection_methods) {
    detectionMethodsList.textContent = result.ai_detection.detection_methods.join(', ') || 'Standard analysis';
  }
  
  const analysisTime = document.getElementById('analysisTime');
  if (analysisTime) {
    analysisTime.textContent = new Date().toLocaleTimeString();
  }
  
  // Generate real truth facts
  generateTruthFacts(result, currentContentType);
  
  // Update key insights
  updateKeyInsights(result);
  
  // Add to history for text analysis
  if (currentContentType === 'text') {
    const text = document.getElementById('inputText').value.trim();
    if (text) {
      addToHistory({
        full: text,
        preview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        score: Math.round(result.score || 0),
        used: result.used || 'unknown',
        timestamp: Date.now()
      });
    }
  }
}

function updateSentimentDisplay(vaderCompound) {
  const positive = Math.max(0, vaderCompound) * 100;
  const negative = Math.max(0, -vaderCompound) * 100;
  const neutral = Math.max(0, 100 - positive - negative);
  
  const positivePercentage = document.getElementById('positivePercentage');
  const neutralPercentage = document.getElementById('neutralPercentage');
  const negativePercentage = document.getElementById('negativePercentage');
  
  if (positivePercentage) positivePercentage.textContent = Math.round(positive) + '%';
  if (neutralPercentage) neutralPercentage.textContent = Math.round(neutral) + '%';
  if (negativePercentage) negativePercentage.textContent = Math.round(negative) + '%';
}

function generateTruthFacts(result, contentType) {
  const truthFacts = document.getElementById('truthFacts');
  const noTruthAvailable = document.getElementById('noTruthAvailable');
  
  if (!truthFacts) return;
  
  const facts = [];
  const score = result.score || 0;
  
  // Generate truth facts based on analysis
  if (score >= 75) {
    facts.push('Content shows strong indicators of authenticity and credibility');
    facts.push('Language patterns suggest natural, human-written text');
    facts.push('No significant red flags detected in the content structure');
  } else if (score >= 50) {
    facts.push('Content contains mixed credibility indicators');
    facts.push('Some elements require additional verification');
    facts.push('Exercise moderate caution when sharing this content');
  } else {
    facts.push('Content exhibits multiple suspicious characteristics');
    facts.push('High likelihood of misinformation or manipulative intent');
    facts.push('Recommend fact-checking through authoritative sources');
  }
  
  // Add AI detection insights
  if (result.ai_detection) {
    const aiProbability = result.ai_detection.ai_probability || 0;
    if (aiProbability > 0.7) {
      facts.push('Content appears to be AI-generated with high confidence');
    } else if (aiProbability > 0.3) {
      facts.push('Content may contain AI-generated elements');
    } else {
      facts.push('Content appears to be human-written');
    }
  }
  
  // Add content-specific insights
  if (contentType === 'text') {
    facts.push('Text analysis completed using advanced natural language processing');
  } else if (contentType === 'image') {
    facts.push('Image analysis included metadata and visual content examination');
  } else if (contentType === 'video') {
    facts.push('Video analysis examined both audio and visual components');
  } else if (contentType === 'url') {
    facts.push('URL content was analyzed for source credibility and context');
  }
  
  // Display facts or show no truth available message
  if (facts.length > 0) {
    truthFacts.innerHTML = facts.map(fact => `<li>${fact}</li>`).join('');
    truthFacts.classList.remove('hidden');
    if (noTruthAvailable) noTruthAvailable.classList.add('hidden');
  } else {
    truthFacts.classList.add('hidden');
    if (noTruthAvailable) noTruthAvailable.classList.remove('hidden');
  }
}

function updateKeyInsights(result) {
  const keyInsightsList = document.getElementById('keyInsightsList');
  if (!keyInsightsList) return;
  
  const insights = [];
  const score = result.score || 0;
  
  // Generate insights based on analysis results
  if (result.ai_detection) {
    const methods = result.ai_detection.detection_methods || [];
    if (methods.length > 0) {
      insights.push(`Detection methods used: ${methods.join(', ')}`);
    }
    
    if (result.ai_detection.flags && result.ai_detection.flags.length > 0) {
      insights.push(`Analysis flags: ${result.ai_detection.flags.join(', ')}`);
    }
  }
  
  // Add sentiment insights
  if (result.vader_compound !== undefined) {
    const sentiment = result.vader_compound > 0.1 ? 'positive' : 
                     result.vader_compound < -0.1 ? 'negative' : 'neutral';
    insights.push(`Content sentiment is predominantly ${sentiment}`);
  }
  
  // Add credibility insights
  if (score >= 80) {
    insights.push('Content meets high standards for factual accuracy');
  } else if (score >= 60) {
    insights.push('Content is generally reliable but may benefit from verification');
  } else if (score >= 40) {
    insights.push('Content credibility is questionable - verify before sharing');
  } else {
    insights.push('Content shows significant credibility concerns');
  }
  
  // Add analysis method insight
  insights.push(`Analysis completed using ${result.used || 'automated'} method`);
  
  // Display insights
  keyInsightsList.innerHTML = insights.map(insight => 
    `<div class="insight-item">${insight}</div>`
  ).join('');
}

function displayFactCheckResults(result) {
  // Use the new organized layout for fact-check results
  
  // Calculate truth vs fake based on fact-check score
  const factScore = result.fact_check_score || result.analysis?.fact_check_score || 0;
  const truthPercentage = Math.max(0, Math.min(100, factScore));
  const fakePercentage = 100 - truthPercentage;
  
  // Update truth/fake display
  const truthPercentageEl = document.getElementById('truthPercentage');
  const fakePercentageEl = document.getElementById('fakePercentage');
  
  if (truthPercentageEl) truthPercentageEl.textContent = truthPercentage + '%';
  if (fakePercentageEl) fakePercentageEl.textContent = fakePercentage + '%';
  
  // Update status
  const credibilityStatus = document.getElementById('credibilityStatus');
  if (credibilityStatus) {
    credibilityStatus.className = 'credibility-status';
    if (truthPercentage >= 75) {
      credibilityStatus.classList.add('status-high');
      credibilityStatus.textContent = 'Highly Accurate Information';
    } else if (truthPercentage >= 50) {
      credibilityStatus.classList.add('status-medium');
      credibilityStatus.textContent = 'Moderately Accurate Information';
    } else {
      credibilityStatus.classList.add('status-low');
      credibilityStatus.textContent = 'Low Accuracy - Potential Misinformation';
    }
  }
  
  // Display real facts from internet fact-checking
  const truthFacts = document.getElementById('truthFacts');
  if (truthFacts) {
    const facts = [];
    
    // Use internet fact-checking real facts if available
    if (result.real_facts && result.real_facts.length > 0) {
      facts.push(...result.real_facts);
    } else if (result.analysis?.real_facts && result.analysis.real_facts.length > 0) {
      facts.push(...result.analysis.real_facts);
    } else {
      // Generate insights based on fact-check score
      if (factScore >= 80) {
        facts.push('Content aligns well with verified information sources');
        facts.push('No major factual inconsistencies detected');
        facts.push('Claims appear to be supported by evidence');
      } else if (factScore >= 60) {
        facts.push('Some claims require additional verification');
        facts.push('Mixed accuracy across different statements');
        facts.push('Recommend cross-referencing with authoritative sources');
      } else {
        facts.push('Multiple factual concerns identified in the content');
        facts.push('Claims contradict established facts or reliable sources');
        facts.push('High likelihood of containing misinformation');
      }
    }
    
    // Add internet search info if available
    if (result.internet_search_performed) {
      facts.push('✓ Comprehensive internet fact-checking completed');
    }
    
    if (result.sources_checked) {
      facts.push(`✓ Verified against ${result.sources_checked} information sources`);
    }
    
    truthFacts.innerHTML = facts.map(fact => `<li>${fact}</li>`).join('');
  }
  
  // Update key insights for internet fact-checking
  const keyInsightsList = document.getElementById('keyInsightsList');
  if (keyInsightsList) {
    const insights = [
      `Internet fact-check score: ${factScore}%`,
      `Analysis method: Comprehensive internet verification`,
      `Sources checked: ${result.sources_checked || 0}`,
      `Analysis completed: ${new Date().toLocaleTimeString()}`
    ];
    
    if (result.verified_claims && result.verified_claims.length > 0) {
      insights.push(`✓ Verified claims: ${result.verified_claims.length}`);
    }
    
    if (result.disputed_claims && result.disputed_claims.length > 0) {
      insights.push(`⚠ Disputed claims: ${result.disputed_claims.length}`);
    }
    
    if (result.internet_search_performed) {
      insights.push('✓ Real-time internet verification performed');
    }
    
    keyInsightsList.innerHTML = insights.map(insight => 
      `<div class="insight-item">${insight}</div>`
    ).join('');
  }
  
  // Show fact-check specific analysis
  const analysisStatus = document.getElementById('analysisStatus');
  if (analysisStatus) {
    if (result.internet_search_performed) {
      analysisStatus.textContent = 'Internet-based comprehensive fact-check analysis complete';
    } else {
      analysisStatus.textContent = 'Comprehensive fact-check analysis complete';
    }
  }
  
  // Display real news context if available
  if (result.real_news_context) {
    displayRealNewsContext(result.real_news_context);
  }
  
  // Display related articles if available
  if (result.related_articles && result.related_articles.length > 0) {
    displayRelatedArticles(result.related_articles);
  }
}

function displayRealNewsContext(newsContext) {
  const realNewsSection = document.getElementById('realNewsSection');
  const summaryText = document.getElementById('summaryText');
  const newsList = document.getElementById('newsList');
  const trendingList = document.getElementById('trendingList');
  
  if (!realNewsSection) return;
  
  // Show the real news section
  realNewsSection.classList.remove('hidden');
  
  // Update AI-generated summary
  if (summaryText && newsContext.ai_summary) {
    summaryText.textContent = newsContext.ai_summary;
  }
  
  // Display related news
  if (newsList && newsContext.related_news) {
    if (newsContext.related_news.length > 0) {
      newsList.innerHTML = newsContext.related_news.map(news => `
        <div class="news-item">
          <div class="news-title">${news.title || 'News Update'}</div>
          <div class="news-summary">${news.summary || ''}</div>
          <div class="news-meta">
            <span class="news-source">${news.source || 'News Source'}</span>
            <span class="news-time">${formatNewsTime(news.timestamp)}</span>
          </div>
        </div>
      `).join('');
    } else {
      newsList.innerHTML = '<div class="news-item loading">No related news available at this time.</div>';
    }
  }
  
  // Display trending topics
  if (trendingList && newsContext.trending_topics) {
    if (newsContext.trending_topics.length > 0) {
      trendingList.innerHTML = newsContext.trending_topics.map(topic => 
        `<span class="trending-tag">${topic}</span>`
      ).join('');
    } else {
      trendingList.innerHTML = '<span class="trending-tag loading">No trending topics</span>';
    }
  }
}

function formatNewsTime(timestamp) {
  if (!timestamp) return 'Recently';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  } catch (e) {
    return 'Recently';
  }
}

function displayRelatedArticles(articles) {
  const relatedArticlesSection = document.getElementById('relatedArticlesSection');
  const articlesGrid = document.getElementById('articlesGrid');
  
  if (!relatedArticlesSection || !articlesGrid) return;
  
  // Show the related articles section
  relatedArticlesSection.classList.remove('hidden');
  
  // Clear loading state and display articles
  articlesGrid.innerHTML = '';
  
  if (articles.length === 0) {
    articlesGrid.innerHTML = `
      <div class="article-item loading">
        <div class="article-title">No related articles found</div>
        <div class="article-summary">Unable to find closely related articles at this time.</div>
      </div>
    `;
    return;
  }
  
  articles.forEach(article => {
    const articleElement = document.createElement('div');
    articleElement.className = 'article-item';
    
    const keyPointsHtml = article.key_points && article.key_points.length > 0 
      ? `
        <div class="article-key-points">
          <div class="key-points-title">Key Points:</div>
          <ul class="key-points-list">
            ${article.key_points.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
      ` : '';
    
    articleElement.innerHTML = `
      <div class="article-category">${article.category || 'News'}</div>
      <div class="article-title">${article.title}</div>
      <div class="article-summary">${article.summary}</div>
      <div class="article-meta">
        <span class="article-source">${article.source}</span>
        <span class="article-date">${article.publish_date || 'Recent'}</span>
      </div>
      ${keyPointsHtml}
      <div class="article-relevance">
        <span class="relevance-label">Relevance:</span>
        <span class="relevance-score">${article.relevance_score || 0}%</span>
      </div>
      <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="article-url">
        🔗 Read full article
      </a>
    `;
    
    // Add click handler to open article
    articleElement.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A') {
        window.open(article.url, '_blank', 'noopener,noreferrer');
      }
    });
    
    articlesGrid.appendChild(articleElement);
  });
}

function displayMultiAIResults(result) {
  // Use the new organized layout for multi-AI results
  
  // Calculate truth vs fake based on local comparison score
  const localScore = result.local_comparison?.score || result.analysis?.fact_check_score || 50;
  const truthPercentage = Math.max(0, Math.min(100, localScore));
  const fakePercentage = 100 - truthPercentage;
  
  // Update truth/fake display
  const truthPercentageEl = document.getElementById('truthPercentage');
  const fakePercentageEl = document.getElementById('fakePercentage');
  
  if (truthPercentageEl) truthPercentageEl.textContent = truthPercentage + '%';
  if (fakePercentageEl) fakePercentageEl.textContent = fakePercentage + '%';
  
  // Update status
  const credibilityStatus = document.getElementById('credibilityStatus');
  if (credibilityStatus) {
    credibilityStatus.className = 'credibility-status';
    if (truthPercentage >= 75) {
      credibilityStatus.classList.add('status-high');
      credibilityStatus.textContent = 'Multi-AI Analysis: High Confidence';
    } else if (truthPercentage >= 50) {
      credibilityStatus.classList.add('status-medium');
      credibilityStatus.textContent = 'Multi-AI Analysis: Moderate Confidence';
    } else {
      credibilityStatus.classList.add('status-low');
      credibilityStatus.textContent = 'Multi-AI Analysis: Low Confidence';
    }
  }
  
  // Update AI detection if available
  if (result.analysis?.ai_detection) {
    const aiProbabilityText = document.getElementById('aiProbabilityText');
    const aiConfidenceText = document.getElementById('aiConfidenceText');
    const aiExplanationText = document.getElementById('aiExplanationText');
    
    if (aiProbabilityText) {
      aiProbabilityText.textContent = Math.round((result.analysis.ai_detection.ai_probability || 0) * 100) + '%';
    }
    if (aiConfidenceText) {
      aiConfidenceText.textContent = Math.round((result.analysis.ai_detection.confidence || 0) * 100) + '%';
    }
    if (aiExplanationText) {
      aiExplanationText.textContent = result.analysis.ai_detection.explanation || 'Multi-AI analysis completed';
    }
  }
  
  // Update sentiment display from local comparison
  if (result.local_comparison?.polarity !== undefined) {
    const polarity = result.local_comparison.polarity;
    const positive = Math.max(0, polarity) * 100;
    const negative = Math.max(0, -polarity) * 100;
    const neutral = Math.max(0, 100 - positive - negative);
    
    const positivePercentage = document.getElementById('positivePercentage');
    const neutralPercentage = document.getElementById('neutralPercentage');
    const negativePercentage = document.getElementById('negativePercentage');
    
    if (positivePercentage) positivePercentage.textContent = Math.round(positive) + '%';
    if (neutralPercentage) neutralPercentage.textContent = Math.round(neutral) + '%';
    if (negativePercentage) negativePercentage.textContent = Math.round(negative) + '%';
  }
  
  // Generate multi-AI specific truth facts
  const truthFacts = document.getElementById('truthFacts');
  if (truthFacts) {
    const facts = [];
    
    facts.push(`Multi-AI analysis using ${result.provider_used || 'specialized algorithms'}`);
    facts.push(`Primary analysis score: ${truthPercentage}%`);
    
    if (result.local_comparison) {
      facts.push(`Local comparison score: ${result.local_comparison.score || 'N/A'}`);
      const sentiment = result.local_comparison.polarity > 0.1 ? 'positive' : 
                       result.local_comparison.polarity < -0.1 ? 'negative' : 'neutral';
      facts.push(`Content sentiment analysis indicates ${sentiment} tone`);
    }
    
    if (result.analysis?.ai_detection) {
      const aiProb = Math.round((result.analysis.ai_detection.ai_probability || 0) * 100);
      facts.push(`AI content detection probability: ${aiProb}%`);
    }
    
    if (result.model) {
      facts.push(`Analysis model: ${result.model}`);
    }
    
    // Add provider-specific insights
    if (result.provider_used === 'specialized') {
      facts.push('Analysis performed using built-in specialized algorithms');
      facts.push('Results cross-validated against multiple detection methods');
    } else {
      facts.push(`External AI provider analysis: ${result.provider_used}`);
    }
    
    truthFacts.innerHTML = facts.map(fact => `<li>${fact}</li>`).join('');
  }
  
  // Update key insights for multi-AI
  const keyInsightsList = document.getElementById('keyInsightsList');
  if (keyInsightsList) {
    const insights = [
      `Primary provider: ${result.provider_used || 'Auto-selected'}`,
      `Analysis model: ${result.model || 'Standard'}`,
      `Success status: ${result.success ? 'Completed' : 'Failed'}`,
      `Analysis time: ${new Date().toLocaleTimeString()}`
    ];
    
    if (result.local_comparison) {
      insights.push(`Local comparison score: ${result.local_comparison.score || 'N/A'}`);
    }
    
    if (result.analysis?.fact_check_score) {
      insights.push(`Fact-check component: ${result.analysis.fact_check_score}%`);
    }
    
    keyInsightsList.innerHTML = insights.map(insight => 
      `<div class="insight-item">${insight}</div>`
    ).join('');
  }
  
  // Update analysis status
  const analysisStatus = document.getElementById('analysisStatus');
  if (analysisStatus) {
    analysisStatus.textContent = 'Multi-AI comparative analysis complete';
  }
  
  // Update analysis details
  const usedMethod = document.getElementById('usedMethod');
  if (usedMethod) {
    usedMethod.textContent = result.provider_used || 'Multi-AI routing';
  }
  
  const analysisTime = document.getElementById('analysisTime');
  if (analysisTime) {
    analysisTime.textContent = new Date().toLocaleTimeString();
  }
}

// Load available providers on page load
async function loadProviders() {
  try {
    const response = await fetch('/api/providers');
    if (response.ok) {
      const providers = await response.json();
      updateProviderSelect(providers);
    }
  } catch (error) {
    console.warn('Could not load providers:', error);
  }
}

function updateProviderSelect(providers) {
  const select = document.getElementById('providerSelect');
  if (!select || !providers.providers) return;
  
  // Clear existing options except "Auto"
  const autoOption = select.querySelector('option[value=""]');
  select.innerHTML = '';
  if (autoOption) select.appendChild(autoOption);
  
  // Add available providers
  Object.entries(providers.providers).forEach(([key, provider]) => {
    if (provider.available) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = `${provider.name} ✅`;
      select.appendChild(option);
    }
  });
}

// Real News Functionality
async function fetchRealNews() {
  const fetchNewsBtn = document.getElementById('fetchNewsBtn');
  const summaryText = document.getElementById('summaryText');
  const newsList = document.getElementById('newsList');
  const trendingList = document.getElementById('trendingList');
  
  // Show loading state
  if (fetchNewsBtn) {
    fetchNewsBtn.disabled = true;
    fetchNewsBtn.textContent = '⏳ Loading...';
  }
  
  if (summaryText) {
    summaryText.textContent = 'Fetching latest news and context...';
  }
  
  try {
    // Get current content for context
    const inputText = document.getElementById('inputText')?.value || '';
    
    const response = await fetch('/api/real-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: inputText,
        categories: ['technology', 'science', 'world', 'health']
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const newsData = await response.json();
    
    // Display the news context
    displayRealNewsContext({
      ai_summary: newsData.ai_generated_summary,
      related_news: newsData.real_news,
      trending_topics: newsData.trending_topics,
      forward_insights: newsData.forward_looking_insights
    });
    
    showToast('Latest news updated successfully!', 'success');
    
  } catch (error) {
    console.error('Failed to fetch real news:', error);
    
    if (summaryText) {
      summaryText.textContent = 'Failed to fetch latest news. Please try again.';
    }
    
    showToast('Failed to fetch news. Please try again.', 'error');
  } finally {
    // Reset button
    if (fetchNewsBtn) {
      fetchNewsBtn.disabled = false;
      fetchNewsBtn.textContent = '🔄 Get Latest News';
    }
  }
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
  loadProviders(); // Load available AI providers
  
  // Setup real news button
  const fetchNewsBtn = document.getElementById('fetchNewsBtn');
  if (fetchNewsBtn) {
    fetchNewsBtn.addEventListener('click', fetchRealNews);
  }
  
  // Show real news section by default
  const realNewsSection = document.getElementById('realNewsSection');
  if (realNewsSection) {
    realNewsSection.classList.remove('hidden');
    // Load initial news on page load
    fetchRealNews();
  }
  
  // Initialize with text content type
  switchContentType('text');
});

// Make functions globally available
window.switchContentType = switchContentType;
window.clearPreviews = clearPreviews;
