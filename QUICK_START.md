# 🎯 Filterize - Quick Access Guide

## ⚡ Instant Start Commands

```bash
# 🚀 Quick Launch (Recommended)
python server.py

# 🌐 Access Points
Frontend:  http://localhost:5000
API:       http://localhost:5000/api/*
Health:    http://localhost:5000/health
```

## 📊 System Overview

**UNIFIED ARCHITECTURE**
```
┌─────────────────────────────────────┐
│         SINGLE FLASK APP            │
│  ┌─────────────┐  ┌─────────────────┐│
│  │  FRONTEND   │◄►│    BACKEND      ││
│  │   (Static)  │  │   (API Routes)  ││
│  └─────────────┘  └─────────────────┘│
│         ONE SERVER - ONE PORT         │
└─────────────────────────────────────┘
```

## 🛠️ Core Features

### 📝 **Text Analysis**
- AI-generated content detection
- Watermark detection
- Perplexity analysis
- Reward model scoring
- Linguistic pattern analysis

### 🖼️ **Image Analysis**
- EXIF metadata examination
- Visual pattern detection
- AI software signature detection
- Statistical analysis
- Compression artifact analysis

### 🎥 **Video Analysis**
- File pattern analysis
- Metadata examination
- AI generation indicators
- Size and format heuristics

### 🔗 **URL Analysis**
- Web content scraping
- Domain analysis
- Text extraction and AI detection
- Platform identification

## 🎛️ User Interface

**Tab-Based Interface:**
- **Text Tab**: Paste and analyze text content
- **Image Tab**: Drag-and-drop or click to upload images
- **Video Tab**: Upload and analyze video files
- **URL Tab**: Enter web addresses for content analysis

**Results Dashboard:**
- AI probability gauge (0-100%)
- Detection methods used
- Confidence scoring
- Detailed explanations
- Visual indicators

## 🔧 Technical Specifications

**Backend (Python Flask):**
- Multi-media AI detection engine
- RESTful API endpoints
- Caching system for performance
- File upload handling
- Error handling and validation

**Frontend (JavaScript/HTML/CSS):**
- Responsive design
- Real-time progress indicators
- Drag-and-drop file uploads
- Tab-based navigation
- Toast notifications

**Integration Points:**
- Single port deployment (5000)
- Unified routing system
- Static file serving
- API endpoint organization

## 📁 Key Files

| File | Purpose |
|------|---------|
| `server.py` | Main Flask application (Backend + Frontend) |
| `ai_detection.py` | Core AI detection algorithms |
| `media_detection.py` | Multi-media analysis engine |
| `frontend/index.html` | Main user interface |
| `frontend/app.js` | JavaScript logic and API calls |
| `WORKFLOW.md` | Complete workflow documentation |
| `PROJECT_STRUCTURE.md` | Detailed architecture guide |

## 🚀 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze` | POST | Text content analysis |
| `/api/analyze-image` | POST | Image AI detection |
| `/api/analyze-video` | POST | Video AI detection |
| `/api/analyze-url` | POST | URL content analysis |
| `/api/metrics` | GET | System performance metrics |
| `/health` | GET | Application health check |

## 🔍 Detection Methods

**AI Content Detection Techniques:**
1. **Watermarking**: Token distribution analysis
2. **Perplexity**: Text predictability scoring
3. **Reward Models**: Helpful/harmless/honest patterns
4. **Linguistic Analysis**: Formal language detection
5. **Visual Patterns**: Image symmetry and balance
6. **Metadata Analysis**: Software signatures and properties

## 💡 Usage Examples

**Text Analysis:**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "Your text here"}'
```

**Image Analysis:**
```bash
curl -X POST http://localhost:5000/api/analyze-image \
  -F "image=@your-image.jpg"
```

**URL Analysis:**
```bash
curl -X POST http://localhost:5000/api/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

## 🎨 Response Format

```json
{
  "ai_probability": 0.75,
  "confidence": 0.85,
  "detection_methods": ["watermark", "perplexity"],
  "explanation": "High probability of AI generation...",
  "flags": ["watermark_detected", "low_perplexity"],
  "watermark_detected": true,
  "perplexity_score": 15.2,
  "reward_score": 87.5
}
```

## 🔒 Security Features

- File type validation
- Size limits (10MB images, 50MB videos)
- Filename sanitization
- Temporary file cleanup
- Input validation
- CORS configuration

## 📊 Performance Optimizations

- Response caching
- Async file processing
- Memory management
- Error handling
- Progressive loading

---

**🎯 Filterize - Making sense of what you read in the age of AI**

**Repository:** https://github.com/Scienceenviorment/Filterize  
**Authors:** Suryansh Jain & Deepesh Kumar  
**Version:** 1.0.0