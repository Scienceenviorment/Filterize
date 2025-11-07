# Filterize - Complete Project Structure & Integration Map

## 🏗️ Unified Architecture Overview

```
🎯 Filterize AI Detection System
├─ 🚀 Single Entry Point: python server.py
├─ 🌐 Unified URL: http://localhost:5000
└─ 📡 Integrated Backend + Frontend

┌─────────────────────────────────────────────────────────────┐
│                    UNIFIED FLASK APPLICATION                │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │     FRONTEND        │    │         BACKEND             │ │
│  │   (Static Files)    │    │      (API Routes)           │ │
│  │                     │    │                             │ │
│  │ ├─ index.html       │◄──►│ ├─ /api/analyze             │ │
│  │ ├─ app.js           │    │ ├─ /api/analyze-image       │ │
│  │ ├─ styles.css       │    │ ├─ /api/analyze-video       │ │
│  │ └─ logo.svg         │    │ ├─ /api/analyze-url         │ │
│  │                     │    │ ├─ /api/metrics             │ │
│  │ Tab Interface:      │    │ └─ /health                  │ │
│  │ • Text Analysis     │    │                             │ │
│  │ • Image Upload      │    │ AI Detection Engine:        │ │
│  │ • Video Upload      │    │ • ai_detection.py           │ │
│  │ • URL Analysis      │    │ • media_detection.py        │ │
│  │                     │    │ • local_model.py            │ │
│  └─────────────────────┘    │ • ai_providers.py           │ │
│                              └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Complete File Structure & Purpose

```
Filterize/                              # 🏠 Project Root
│
├── 🚀 CORE APPLICATION
│   ├── server.py                       # 🎯 Main Flask app (Backend + Frontend server)
│   ├── launch.py                       # 🚀 Unified launcher script
│   └── WORKFLOW.md                     # 📋 This documentation file
│
├── 🤖 AI DETECTION MODULES
│   ├── ai_detection.py                 # 🧠 Core AI detection algorithms
│   │   ├─ class AIContentDetector     #    • Watermark detection
│   │   ├─ def analyze_ai_content()     #    • Perplexity analysis
│   │   ├─ def _detect_watermarks()     #    • Reward model scoring
│   │   ├─ def _analyze_perplexity()    #    • Linguistic patterns
│   │   └─ def _calculate_reward_score() #   • Pattern recognition
│   │
│   ├── media_detection.py              # 📸 Multi-media analysis engine
│   │   ├─ class MediaAIDetector        #    • Image AI detection
│   │   ├─ def analyze_image()          #    • Video AI detection
│   │   ├─ def analyze_video()          #    • URL content analysis
│   │   ├─ def analyze_url()            #    • Metadata examination
│   │   └─ def _extract_text_from_html() #   • Web scraping
│   │
│   ├── local_model.py                  # 🔬 Local ML model training
│   │   ├─ def _train_quick_model()     #    • TF-IDF + LogisticRegression
│   │   ├─ def _load_or_train()         #    • Model caching
│   │   └─ def analyze_text_local()     #    • Local inference
│   │
│   └── ai_providers.py                 # 🌐 External AI provider APIs
│       ├─ def analyze_text_with_provider() # • OpenAI integration
│       ├─ def openai_analyze()         #    • Anthropic integration
│       └─ def anthropic_analyze()      #    • Provider abstraction
│
├── 🎨 FRONTEND (Static Web App)
│   ├── frontend/index.html             # 🏠 Main UI interface
│   │   ├─ Tab-based content selector   #    • Text/Image/Video/URL tabs
│   │   ├─ File upload areas            #    • Drag-and-drop interfaces
│   │   ├─ Results dashboard            #    • AI detection displays
│   │   └─ Accessibility features       #    • Screen reader support
│   │
│   ├── frontend/app.js                 # ⚡ JavaScript logic
│   │   ├─ function switchContentType() #    • Tab switching
│   │   ├─ function handleFileUpload()  #    • File handling
│   │   ├─ function startAnalysis()     #    • API communication
│   │   ├─ function displayResults()    #    • Results rendering
│   │   └─ function displayAIDetection() #   • AI detection UI
│   │
│   ├── frontend/styles.css             # 🎨 Responsive styling
│   │   ├─ Tab interface styles         #    • Modern UI components
│   │   ├─ Upload area animations       #    • Drag-and-drop styling
│   │   ├─ Results dashboard design     #    • Gauge visualizations
│   │   └─ Mobile responsiveness        #    • Cross-device support
│   │
│   └── frontend/logo.svg               # 🏷️ Branding assets
│
├── 🧪 TESTING & UTILITIES
│   ├── run_tests.py                    # 🔬 Test suite runner
│   ├── smoke_test.py                   # 💨 Basic functionality tests
│   ├── smoke_test_analyze.py           # 🔍 Analysis endpoint tests
│   ├── run_server.ps1                  # 🖥️ PowerShell server launcher
│   └── serve_frontend.ps1              # 🌐 Frontend development server
│
├── ⚙️ CONFIGURATION & SETUP
│   ├── requirements.txt                # 📦 Core Python dependencies
│   │   ├─ Flask, Flask-CORS            #    • Web framework
│   │   ├─ TextBlob, vaderSentiment     #    • Text analysis
│   │   ├─ Pillow, requests             #    • Image processing
│   │   └─ BeautifulSoup4               #    • Web scraping
│   │
│   ├── requirements-ml.txt             # 🤖 Optional ML dependencies
│   │   ├─ scikit-learn                 #    • Machine learning
│   │   ├─ numpy                        #    • Numerical computing
│   │   └─ opencv-python                #    • Computer vision
│   │
│   ├── env.example                     # 🔧 Environment variables template
│   │   ├─ AI_PROVIDER=openai           #    • External provider config
│   │   ├─ OPENAI_API_KEY=your_key      #    • API credentials
│   │   └─ PORT=5000                    #    • Server configuration
│   │
│   └── .gitignore                      # 🚫 Git ignore patterns
│
├── 💾 DATA & CACHE
│   ├── cache/                          # 📁 Caching system
│   │   ├─ provider/                    #    • External API cache
│   │   ├─ media/                       #    • Media analysis cache
│   │   └─ metrics.json                 #    • Performance metrics
│   │
│   ├── models/                         # 🧠 Trained models storage
│   │   └─ local_model.pkl              #    • Local ML model
│   │
│   ├── uploads/                        # 📁 Temporary file uploads
│   │   └─ (auto-cleanup)               #    • Temporary storage
│   │
│   └── screen/                         # 📸 Screenshot utilities
│       ├─ image.py                     #    • Image processing
│       ├─ text.py                      #    • Text extraction
│       ├─ tip.py                       #    • Tooltip utilities
│       └─ ut.py                        #    • Utility functions
│
├── 📖 DOCUMENTATION
│   ├── README.md                       # 📄 Project overview & setup
│   └── WORKFLOW.md                     # 📋 Complete workflow docs
│
└── 🔧 DEVELOPMENT UTILITIES
    ├── check_root.py                   # 🔐 Security utilities
    └── __pycache__/                    # 🗂️ Python bytecode cache
```

## 🔄 Request Flow & Data Processing

```
┌─────────────────────────────────────────────────────────────┐
│                     REQUEST LIFECYCLE                      │
└─────────────────────────────────────────────────────────────┘

1. 🌐 USER INTERACTION
   ┌─ User selects content type (Text/Image/Video/URL)
   ├─ User uploads file or enters content
   ├─ User clicks "Analyze" button
   └─ JavaScript triggers appropriate API call

2. 🚀 FRONTEND PROCESSING (app.js)
   ┌─ function startAnalysis()
   ├─ Validate input content
   ├─ Show loading indicators
   ├─ Call appropriate analysis function:
   │  ├─ analyzeText(text)
   │  ├─ analyzeImage(file)
   │  ├─ analyzeVideo(file)
   │  └─ analyzeUrl(url)
   └─ Handle response and display results

3. 🔧 BACKEND ROUTING (server.py)
   ┌─ Flask receives HTTP request
   ├─ Route to appropriate endpoint:
   │  ├─ POST /api/analyze
   │  ├─ POST /api/analyze-image
   │  ├─ POST /api/analyze-video
   │  └─ POST /api/analyze-url
   ├─ Validate request data
   └─ Call analysis modules

4. 🤖 AI DETECTION PROCESSING
   ┌─ Check cache for existing results
   ├─ Route to appropriate detector:
   │  ├─ ai_detection.py (text analysis)
   │  └─ media_detection.py (image/video/url)
   ├─ Apply multiple detection methods:
   │  ├─ Watermark detection
   │  ├─ Perplexity analysis
   │  ├─ Reward model scoring
   │  ├─ Linguistic patterns
   │  ├─ Metadata analysis
   │  └─ Visual pattern recognition
   ├─ Combine results with weighted scoring
   └─ Generate explanation and confidence

5. 💾 CACHING & STORAGE
   ┌─ Store results in cache/
   ├─ Clean up temporary files
   └─ Update performance metrics

6. 📊 RESPONSE GENERATION
   ┌─ Format JSON response
   ├─ Include AI probability score
   ├─ Add detection methods used
   ├─ Provide human-readable explanation
   └─ Return structured data

7. 🎨 RESULTS DISPLAY (app.js)
   ┌─ function displayResults(data)
   ├─ Update AI detection gauge
   ├─ Show detection methods
   ├─ Display confidence metrics
   ├─ Render explanation text
   └─ Show detailed analysis breakdown
```

## 🚀 Quick Start Commands

```bash
# 📥 Clone and Setup
git clone https://github.com/Scienceenviorment/Filterize.git
cd Filterize

# 📦 Install Dependencies
pip install -r requirements.txt
pip install -r requirements-ml.txt  # Optional

# 🚀 Launch Unified Application
python launch.py                    # Comprehensive launcher
# OR
python server.py                    # Direct server start

# 🌐 Access Application
# Frontend: http://localhost:5000
# API: http://localhost:5000/api/*
# Health: http://localhost:5000/health

# 🧪 Run Tests
python run_tests.py
python smoke_test.py
python smoke_test_analyze.py
```

## 🔧 Integration Points

### Backend ↔ Frontend Communication
- **Single Port**: Everything runs on port 5000
- **Static Serving**: Flask serves frontend files directly
- **API Routes**: All API endpoints under `/api/*`
- **SPA Routing**: Frontend handles client-side routing

### Module Integration
- **AI Detection**: Pluggable detection methods
- **Media Processing**: Unified interface for all media types
- **Caching**: Transparent caching across all modules
- **Error Handling**: Consistent error responses

### Data Flow Integration
- **Request Processing**: Unified validation and routing
- **Response Format**: Consistent JSON structure
- **File Handling**: Secure upload and cleanup
- **Performance**: Optimized with caching and async processing

This unified structure eliminates the need for separate frontend and backend servers, simplifying deployment and development while maintaining clear separation of concerns between different system components.