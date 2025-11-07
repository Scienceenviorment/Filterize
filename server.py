from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import re
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from ai_providers import analyze_text_with_provider
from internet_fact_checker import InternetFactChecker
from news_provider import real_news_provider
# local_model is optional and lazily imported
local_model = None
import os
import json as _json
from pathlib import Path
from werkzeug.utils import secure_filename
import tempfile
import time

# Simple in-memory metrics; persisted to cache/metrics.json when updated
metrics = {
    'provider_calls': 0,
    'provider_failures': 0,
    'provider_cache_hits': 0,
    'provider_cache_misses': 0,
    'local_used': 0,
    'heuristic_used': 0,
}

def _metrics_cache_path():
    p = Path('cache')
    p.mkdir(parents=True, exist_ok=True)
    return p / 'metrics.json'

def _save_metrics():
    try:
        p = _metrics_cache_path()
        with p.open('w', encoding='utf-8') as fh:
            _json.dump(metrics, fh)
    except Exception:
        app.logger.exception('failed to persist metrics')

def _inc_metric(key, n=1):
    metrics[key] = metrics.get(key, 0) + n
    # persist asynchronously would be nicer but keep simple
    try:
        _save_metrics()
    except Exception:
        pass

app = Flask(__name__, static_folder='frontend', static_url_path='/static')
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

analyzer = SentimentIntensityAnalyzer()
CLICKBAIT_PATTERNS = [r"you won't believe", r"this is what happens", r"shocking", r"unbelievable", r"will blow your mind"]
EMOTIONAL_WORDS = set(["love", "hate", "amazing", "terrible", "disgrace", "outrage"])


def simple_analyze(text: str):
    tb = TextBlob(text)
    polarity = tb.sentiment.polarity
    words = re.findall(r"\w+", text.lower())
    emotional_count = sum(1 for w in words if w in EMOTIONAL_WORDS)
    clickbait_count = 0
    for p in CLICKBAIT_PATTERNS:
        if re.search(p, text, re.IGNORECASE):
            clickbait_count += 1
    vader = analyzer.polarity_scores(text)

    score = 75
    flags = []
    if clickbait_count:
        score -= 10 * clickbait_count
        flags.append('clickbait')
    if emotional_count > 2:
        score -= 15
        flags.append('emotional_language')
    if vader['compound'] > 0.7 or vader['compound'] < -0.7:
        flags.append('strong_sentiment')
    if re.search(r'https?://', text):
        score += 5
    score = max(0, min(100, score + int(polarity * 10)))
    # Safely attempt to extract noun phrases; TextBlob may require NLTK corpora
    try:
        summary = tb.noun_phrases[:6]
    except Exception:
        summary = []

    return {
        'score': score,
        'polarity': polarity,
        'vader_compound': vader['compound'],
        'flags': flags,
        'summary': summary
    }


@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({'error': 'invalid JSON payload'}), 400
    text = data.get('content', '')
    prefer = data.get('prefer')  # optional: 'local'|'provider'|'heuristic'|'auto'
    if not text:
        return jsonify({'error': 'content is required'}), 400
    try:
        # provider caching + retry helper
        import hashlib
        import json as _json
        import time
        from pathlib import Path

        def _provider_cache_dir():
            d = Path('cache') / 'provider'
            d.mkdir(parents=True, exist_ok=True)
            return d

        def _cache_key(provider_name, txt):
            h = hashlib.sha256()
            h.update(provider_name.encode('utf-8'))
            h.update(b'|')
            h.update(txt.encode('utf-8'))
            return h.hexdigest()

        def _load_cached(provider_name, txt, ttl=86400):
            key = _cache_key(provider_name, txt)
            p = _provider_cache_dir() / f"{key}.json"
            if not p.exists():
                return None
            try:
                mtime = p.stat().st_mtime
                if time.time() - mtime > ttl:
                    return None
                with p.open('r', encoding='utf-8') as fh:
                    _inc_metric('provider_cache_hits')
                    return _json.load(fh)
            except Exception:
                return None

        def _save_cached(provider_name, txt, data):
            key = _cache_key(provider_name, txt)
            p = _provider_cache_dir() / f"{key}.json"
            try:
                with p.open('w', encoding='utf-8') as fh:
                    _json.dump(data, fh)
            except Exception:
                app.logger.exception('failed to write provider cache')
            finally:
                _inc_metric('provider_cache_misses')

        def _call_provider_with_retry(provider_name, txt, max_retries=2, backoff=0.6):
            # Check cache first
            cached = _load_cached(provider_name, txt)
            if cached is not None:
                return cached

            last_exc = None
            for attempt in range(1, max_retries + 2):
                try:
                    _inc_metric('provider_calls')
                    resp = analyze_text_with_provider(txt, provider=provider_name)
                    if isinstance(resp, dict):
                        _save_cached(provider_name, txt, resp)
                    return resp
                except Exception as e:
                    _inc_metric('provider_failures')
                    last_exc = e
                    app.logger.warning(f'provider {provider_name} attempt {attempt} failed: {e}')
                    if attempt <= max_retries:
                        time.sleep(backoff * (2 ** (attempt - 1)))
                    else:
                        break
            raise last_exc

        # Prefer an external provider if configured. The provider can be
        # selected via the AI_PROVIDER env var (e.g. 'openai'). If no provider
        # is set but OPENAI_API_KEY exists, prefer OpenAI. If the provider
        # call fails or returns None, fall back to the local simple_analyze.
        provider = os.environ.get('AI_PROVIDER')
        if not provider and os.environ.get('OPENAI_API_KEY'):
            provider = 'openai'

        result = None

        used = 'heuristic'
        # 1) Try local model (fast, optional)
        try:
            # Avoid mutating a module-level variable inside the function (scoping issues).
            # Do a lazy import and track availability with a local flag.
            local_model_available = False
            try:
                # lazy import to keep runtime light when scikit-learn isn't installed
                from local_model import analyze_text_local
                local_model_available = True
            except Exception:
                local_model_available = False

            if local_model_available and (prefer in (None, 'auto', 'local')):
                try:
                    result = analyze_text_local(text)
                    used = 'local'
                    _inc_metric('local_used')
                except Exception:
                    app.logger.exception('local model analysis failed')

        except Exception:
            app.logger.exception('unexpected error while invoking local model')

        # 2) Try external provider if local model didn't return a result
        if (result is None and provider and prefer in (None, 'auto', 'provider')) or (result is None and prefer == 'provider'):
            try:
                result = _call_provider_with_retry(provider, text)
                used = 'provider'
                # provider calls metric incremented in the call helper
            except Exception:
                app.logger.exception('external provider analysis failed, falling back')

        # 3) Fall back to simple heuristic analyzer
        if result is None:
            result = simple_analyze(text)
            used = 'heuristic'
            _inc_metric('heuristic_used')

        # Attach which method was used so the frontend can show it
        if isinstance(result, dict):
            result['used'] = used

        # Add AI content detection
        try:
            from ai_detection import analyze_ai_content
            ai_result = analyze_ai_content(text)
            result['ai_detection'] = ai_result
        except Exception as e:
            app.logger.warning(f'AI detection failed: {e}')
            result['ai_detection'] = {'error': 'AI detection unavailable'}

        return jsonify(result)
    except Exception as e:
        # Log the error server-side and return a safe message
        app.logger.exception('analysis failed')
        return jsonify({'error': 'analysis failed', 'detail': str(e)}), 500


@app.route('/api/fact-check', methods=['POST'])
def fact_check():
    """Enhanced fact-checking endpoint using internet-based analysis."""
    try:
        data = request.get_json(force=True) or {}
        content = data.get('content', '')
        content_type = data.get('type', 'text')
        
        if not content:
            return jsonify({'error': 'content is required'}), 400
            
        # Use internet fact-checker for comprehensive analysis
        fact_checker = InternetFactChecker()
        result = fact_checker.fact_check_content(content)
        
        # Add AI providers analysis for enhanced verification
        try:
            from ai_providers import get_fact_check_analysis
            ai_result = get_fact_check_analysis(content, content_type)
            result['ai_provider_analysis'] = ai_result
        except Exception as e:
            app.logger.warning(f'AI provider analysis failed: {e}')
            result['ai_provider_analysis'] = {'error': 'unavailable'}
        
        # Add traditional AI detection for comparison
        try:
            from ai_detection import analyze_ai_content
            ai_detection_result = analyze_ai_content(content)
            result['traditional_ai_detection'] = ai_detection_result
        except Exception as e:
            app.logger.warning(f'Traditional AI detection failed: {e}')
            result['traditional_ai_detection'] = {'error': 'unavailable'}
        
        # Add real news context for comprehensive information
        try:
            news_result = real_news_provider.get_real_news(content)
            result['real_news_context'] = {
                'related_news': news_result.get('real_news', [])[:3],
                'trending_topics': news_result.get('trending_topics', []),
                'forward_insights': news_result.get('forward_looking_insights', [])[:2],
                'ai_summary': news_result.get('ai_generated_summary', '')
            }
        except Exception as e:
            app.logger.warning(f'Real news context failed: {e}')
            result['real_news_context'] = {'error': 'unavailable'}
            
        return jsonify(result)
        
    except Exception as e:
        app.logger.exception('Internet fact-checking failed')
        return jsonify({
            'error': 'Internet fact-checking failed',
            'detail': str(e)
        }), 500


@app.route('/api/multi-ai-analyze', methods=['POST'])
def multi_ai_analyze():
    """Multi-AI agent analysis with intelligent routing."""
    try:
        data = request.get_json(force=True) or {}
        content = data.get('content', '')
        content_type = data.get('type', 'text')
        task = data.get('task', 'analysis')  # analysis, fact_check, summarize
        provider = data.get('provider', None)  # optional specific provider
        
        if not content:
            return jsonify({'error': 'content is required'}), 400
            
        from ai_providers import multi_ai_agent
        
        if provider:
            # Use specific provider
            if provider in multi_ai_agent.providers:
                provider_obj = multi_ai_agent.providers[provider]
                result = provider_obj.analyze(content, content_type, task)
                result['provider_used'] = provider
            else:
                return jsonify({
                    'error': f'Unknown provider: {provider}'
                }), 400
        else:
            # Use intelligent routing
            result = multi_ai_agent.analyze_content(
                content, content_type, task
            )
            
        # Add comparison with local analysis
        try:
            local_result = simple_analyze(content)
            result['local_comparison'] = local_result
        except Exception:
            result['local_comparison'] = {'error': 'local analysis failed'}
            
        return jsonify(result)
        
    except Exception as e:
        app.logger.exception('multi-AI analysis failed')
        return jsonify({
            'error': 'multi-AI analysis failed',
            'detail': str(e)
        }), 500


@app.route('/api/summarize', methods=['POST'])
def summarize_content():
    """Content summarization with misinformation detection."""
    try:
        data = request.get_json(force=True) or {}
        content = data.get('content', '')
        content_type = data.get('type', 'text')
        
        if not content:
            return jsonify({'error': 'content is required'}), 400
            
        from ai_providers import get_content_summary
        
        result = get_content_summary(content, content_type)
        
        # Add credibility assessment
        try:
            credibility_result = simple_analyze(content)
            result['credibility_assessment'] = credibility_result
        except Exception:
            result['credibility_assessment'] = {
                'error': 'credibility check failed'
            }
            
        return jsonify(result)
        
    except Exception as e:
        app.logger.exception('summarization failed')
        return jsonify({
            'error': 'summarization failed',
            'detail': str(e)
        }), 500


@app.route('/api/providers', methods=['GET'])
def get_available_providers():
    """Get list of available AI providers and their status."""
    try:
        from ai_providers import multi_ai_agent
        
        providers_status = {}
        for name, provider in multi_ai_agent.providers.items():
            providers_status[name] = {
                'available': provider.is_available(),
                'name': provider.name if hasattr(provider, 'name') else name
            }
            
        return jsonify({
            'providers': providers_status,
            'default_routing': True,
            'supported_tasks': ['analysis', 'fact_check', 'summarize'],
            'supported_content': ['text', 'image', 'video', 'url']
        })
        
    except Exception as e:
        app.logger.exception('failed to get providers status')
        return jsonify({
            'error': 'failed to get providers',
            'detail': str(e)
        }), 500


# Provide JSON error responses for uncaught exceptions in API routes
@app.errorhandler(500)
def handle_500(e):
    # If the request is for the API, return JSON
    if request.path.startswith('/api/'):
        return jsonify({'error': 'internal server error'}), 500
    # otherwise use default HTML response
    return "Internal Server Error", 500


@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """Analyze uploaded image for AI generation."""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        # Read image data
        image_data = file.read()
        filename = secure_filename(file.filename) if file.filename else None
        
        # Import and use media detector
        from media_detection import analyze_media_content
        result = analyze_media_content('image', image_data, filename=filename)
        
        return jsonify(result)
        
    except Exception as e:
        app.logger.exception('image analysis failed')
        return jsonify({
            'error': 'image analysis failed',
            'detail': str(e)
        }), 500


@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    """Analyze uploaded video for AI generation."""
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No video file selected'}), 400
        
        # Save video temporarily for analysis
        filename = secure_filename(file.filename) if file.filename else 'temp'
        temp_path = tempfile.mktemp(suffix=f"_{filename}")
        file.save(temp_path)
        
        try:
            # Import and use media detector
            from media_detection import analyze_media_content
            result = analyze_media_content('video', temp_path)
            return jsonify(result)
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        
    except Exception as e:
        app.logger.exception('video analysis failed')
        return jsonify({
            'error': 'video analysis failed',
            'detail': str(e)
        }), 500


@app.route('/api/analyze-url', methods=['POST'])
def analyze_url():
    """Analyze content from URL for AI generation."""
    try:
        data = request.get_json(force=True) or {}
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Basic URL validation
        if not (url.startswith('http://') or url.startswith('https://')):
            url = 'https://' + url
        
        # Import and use media detector
        from media_detection import analyze_media_content
        result = analyze_media_content('url', url)
        
        return jsonify(result)
        
    except Exception as e:
        app.logger.exception('URL analysis failed')
        return jsonify({'error': 'URL analysis failed', 'detail': str(e)}), 500


@app.route('/api/real-news', methods=['POST'])
def get_real_news():
    """Get real, current news using integrated AI"""
    try:
        data = request.get_json(force=True) or {}
        content = data.get('content', '')
        categories = data.get('categories', [])
        
        # Get real news based on content context
        news_result = real_news_provider.get_real_news(content, categories)
        
        return jsonify(news_result)
        
    except Exception as e:
        app.logger.exception('Real news retrieval failed')
        return jsonify({
            'error': 'Real news retrieval failed',
            'detail': str(e),
            'real_news': [],
            'ai_generated_summary': 'Unable to retrieve news at this time.'
        }), 500


@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    try:
        p = _metrics_cache_path()
        if p.exists():
            with p.open('r', encoding='utf-8') as fh:
                data = _json.load(fh)
                return jsonify({'metrics': data})
        return jsonify({'metrics': metrics})
    except Exception:
        app.logger.exception('failed to read metrics')
        return jsonify({'metrics': metrics}), 500


# Serve frontend static files with SPA fallback


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def static_proxy(path):
    """
    Serve static files and fall back to index.html for SPA routes.
    This creates a unified backend + frontend application.
    """
    # Define the frontend directory
    frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend')
    
    # Try to serve static file first
    if path != '':
        file_path = os.path.join(frontend_dir, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return send_from_directory(frontend_dir, path)
    
    # For API routes, return 404 if not handled by other routes
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # For all other routes (including root), serve the main SPA
    return send_from_directory(frontend_dir, 'index.html')


@app.route('/health')
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'features': {
            'text_analysis': True,
            'image_analysis': True,
            'video_analysis': True,
            'url_analysis': True,
            'ai_detection': True,
            'caching': True
        },
        'endpoints': [
            '/api/analyze',
            '/api/analyze-image', 
            '/api/analyze-video',
            '/api/analyze-url',
            '/api/metrics'
        ]
    })


if __name__ == '__main__':
    print("🚀 Starting Filterize - AI Content Detection System")
    print("=" * 50)
    print("📱 Frontend: http://localhost:5000")
    print("🔧 API: http://localhost:5000/api/*")
    print("💊 Health: http://localhost:5000/health")
    print("=" * 50)
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
