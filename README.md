# Filterize - Multi-Media AI Content Detection

An advanced content credibility analyzer with AI-generated content detection for text, images, videos, and web links.

## Features

🔍 **Multi-Media Analysis**
- **Text Analysis**: Credibility scoring, sentiment analysis, and AI content detection
- **Image Analysis**: AI-generated image detection using metadata, visual patterns, and statistical analysis
- **Video Analysis**: AI-generated video detection with file pattern analysis
- **URL Analysis**: Web content scraping and AI detection for linked articles and media

🤖 **Advanced AI Detection**
- Watermark detection based on token distribution patterns
- Perplexity analysis to identify predictable AI text
- Reward model scoring for overly helpful/harmless content
- Linguistic pattern analysis for formal AI language
- Visual pattern recognition for AI-generated images
- Metadata analysis for AI software signatures

🎯 **Credibility Scoring**
- Real-time credibility assessment (0-100 scale)
- Multi-factor analysis including source credibility, fact verification, bias detection
- Sentiment analysis with positive/negative/neutral breakdown
- Key phrase extraction and visualization

## Quick Start

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-ml.txt  # Optional for enhanced analysis
   ```

2. **Run the application**
   ```bash
   python server.py
   ```

3. **Access the application**
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:5000/api/*

## API Endpoints

### Text Analysis
```bash
POST /api/analyze
Content-Type: application/json
{
  "content": "Your text content here",
  "prefer": "auto|local|provider|heuristic"
}
```

### Image Analysis
```bash
POST /api/analyze-image
Content-Type: multipart/form-data
# Upload image file with field name "image"
```

### Video Analysis
```bash
POST /api/analyze-video
Content-Type: multipart/form-data
# Upload video file with field name "video"
```

### URL Analysis
```bash
POST /api/analyze-url
Content-Type: application/json
{
  "url": "https://example.com/article"
}
```

## Authors

- **Suryansh Jain** - Project Creator
- **Deepesh Kumar** - Co-Developer

**Filterize** - Making sense of what you read in the age of AI 🤖✨

## Serving the frontend without Flask

If you want to quickly serve just the frontend folder for static testing:

```powershell
python -m http.server 8000 --directory frontend
# then open http://localhost:8000/
```

If you see a directory listing, make sure you're serving the `frontend` folder and not the repo root.

## Dev notes & next steps
- Integrate DistilBERT behind the Flask `/api/analyze` endpoint for the SPA.
- Add persistent analysis history (SQLite) and optional user accounts.
- Improve UX/accessibility (some improvements already applied to the SPA).

If you'd like, I can automatically install ML deps into a venv and validate the Streamlit app; that requires additional time and disk space.

---
Created for Suryansh Jain & Deepesh Kumar — Filterize

## AI provider integration (optional)

This project includes `ai_providers.py` to route analysis to external providers like OpenAI. The Flask endpoint now automatically
prefers an external provider when configured and falls back to the local `simple_analyze` if not available or on error.

To enable OpenAI-based analysis:

1. Set your `OPENAI_API_KEY` environment variable in a secure way (do not commit it):

```powershell
$env:OPENAI_API_KEY = "sk-..."
```

2. Optionally set the `AI_PROVIDER` env var to explicitly choose a provider (e.g. `openai`). If `AI_PROVIDER` is not set but
	`OPENAI_API_KEY` exists, the server will prefer OpenAI automatically.

```powershell
$env:AI_PROVIDER = "openai"
```

3. Restart the Flask server. When an external provider is used the server will attempt the provider call and fall back to the
	local analyzer on any error.

Testing the provider-enabled endpoint (while the server is running):

```powershell
# POST a sample payload and print the response
python - <<'PY'
import requests
r = requests.post('http://127.0.0.1:5000/api/analyze', json={'content': "You won't believe what happened!"}, timeout=30)
print(r.status_code)
print(r.text)
PY
```

Notes:
- The OpenAI integration in `ai_providers.py` uses direct HTTP requests so you don't need the `openai` Python package.
- Provider calls may incur cost and latency; add caching and rate-limiting for production use.

## Local lightweight model (fast, optional)

For offline, fast local analysis without large ML dependencies, the project includes a tiny TF-IDF + LogisticRegression
model (`local_model.py`). It trains on a synthetic dataset the first time it's used and caches a pickle to `models/local_model.pkl`.

To enable and test the local model:

1. Install scikit-learn (lightweight compared to transformers):

```powershell
pip install scikit-learn
```

2. Start the Flask server. The server will attempt the local model first, then an external provider if configured, then the
	heuristic `simple_analyze` fallback.

3. Run the lightweight test runner (no pytest required):

```powershell
python run_tests.py
```

If scikit-learn isn't installed, the server will still work with the heuristic analyzer. The local model is optional and designed
to make the demo self-contained for quick local testing.

