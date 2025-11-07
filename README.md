# Media Literacy Assistant (Filterize)

This repository contains:
- A demo SPA frontend served by `server.py` (Flask) — open http://localhost:5000 after starting the server.
- A Streamlit prototype `app.py` that can load a DistilBERT model for text classification (optional, requires ML deps).

## Quick start (frontend demo - recommended)

1. Create and activate a Python virtual environment (PowerShell):

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
```

2. Install runtime requirements:

```powershell
pip install -r requirements.txt
```

3. Run the Flask server (serves the SPA at http://localhost:5000):

```powershell
python server.py
# or use the helper script
.\run_server.ps1
```

Open the URL in your browser. The server serves the SPA and the `/api/analyze` demo endpoint.

## Streamlit app (optional — heavy ML dependencies)

The Streamlit app (`app.py`) is a prototype that can load a DistilBERT model for text classification. This requires large ML packages such as `torch` or `tensorflow` and `transformers`.

1. Install ML requirements (may take time and disk space):

```powershell
pip install -r requirements-ml.txt
```

2. Run the Streamlit app:

```powershell
streamlit run app.py
```

Notes:
- If you don't have a local model at `models/distilbert_fake_news`, change the path to a pretrained HF model ID or place a model in that folder.
- The Streamlit app will not crash the server if packages are missing — it shows guidance in the sidebar.

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

