#!/usr/bin/env python3
"""
Flask server for AI content detection and fact-checking service.
Provides endpoints for analyzing text, checking facts, and related features.
"""

import json as _json
import logging
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from ai_detection import analyze_ai_content
from ai_providers import analyze_text_with_provider
from internet_fact_checker_fixed import InternetFactChecker
from local_model import analyze_with_local_model
from news_provider import get_real_news_context

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
    cache_path = Path('cache')
    cache_path.mkdir(parents=True, exist_ok=True)
    return cache_path / 'metrics.json'


def _save_metrics():
    try:
        metrics_path = _metrics_cache_path()
        with metrics_path.open('w', encoding='utf-8') as file_handle:
            _json.dump(metrics, file_handle)
    except (OSError, IOError) as error:
        logging.getLogger(__name__).exception(
            'Failed to persist metrics: %s', error)


def _inc_metric(key, increment=1):
    metrics[key] = metrics.get(key, 0) + increment
    # persist asynchronously would be nicer but keep simple
    try:
        _save_metrics()
    except (OSError, IOError):
        pass


app = Flask(__name__, static_folder='frontend', static_url_path='/static')
CORS(app)

# Load cached metrics on startup
try:
    cached_metrics_path = _metrics_cache_path()
    if cached_metrics_path.exists():
        with cached_metrics_path.open('r', encoding='utf-8') as file_handle:
            cached_data = _json.load(file_handle)
            metrics.update(cached_data)
except (OSError, IOError, _json.JSONDecodeError):
    pass

CLICKBAIT_PATTERNS = [
    r"you won't believe", r"this is what happens",
    r"shocking", r"unbelievable", r"will blow your mind"
]
EMOTIONAL_WORDS = set([
    "love", "hate", "amazing", "terrible", "disgrace", "outrage"
])


def _get_heuristic_score(text):
    """Calculate a simple heuristic score for AI detection."""
    try:
        import textblob as tb
        blob = tb.TextBlob(text)
        
        # Basic heuristics
        sentiment = blob.sentiment
        avg_sentence_length = len(text.split()) / max(len(text.split('.')), 1)
        
        # Check for patterns
        clickbait_count = sum(
            1 for pattern in CLICKBAIT_PATTERNS
            if pattern.lower() in text.lower()
        )
        emotional_count = sum(
            1 for word in EMOTIONAL_WORDS
            if word.lower() in text.lower()
        )
        
        # Simple scoring (0-1 range)
        score = 0.5  # baseline
        if sentiment.polarity < -0.3 or sentiment.polarity > 0.7:
            score += 0.2
        if avg_sentence_length > 25:
            score += 0.1
        if clickbait_count > 0:
            score += 0.2
        if emotional_count > 2:
            score += 0.1
            
        return min(score, 1.0)
    except ImportError:
        # Fallback if textblob not available
        summary = []
        try:
            blob = tb.TextBlob(text)
            summary = blob.noun_phrases[:6]
        except (ImportError, AttributeError):
            summary = text.split()[:10]
        
        return 0.6 if len(summary) > 3 else 0.3


@app.route('/')
def index():
    """Serve the main frontend page."""
    return send_from_directory('frontend', 'index.html')


@app.route('/analyze', methods=['POST'])
def analyze():
    """Main analysis endpoint for AI content detection."""
    try:
        data = request.get_json(force=True) or {}
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid JSON data'}), 400
    
    text = data.get('text', '').strip()
    if not text:
        return jsonify({
            'error': 'Text field is required and cannot be empty'
        }), 400
    
    provider = data.get('provider')
    # optional: 'local'|'provider'|'heuristic'|'auto'
    prefer = data.get('prefer')
    
    result = None
    
    # Handle caching
    cache_key = None
    if text and provider:
        try:
            import hashlib
            import time
            from pathlib import Path as CachePath
            
            cache_key = hashlib.md5(
                f"{text}-{provider}".encode('utf-8')).hexdigest()
            cache_dir = CachePath('cache')
            cache_dir.mkdir(parents=True, exist_ok=True)
            cache_file = cache_dir / f"{cache_key}.json"
            
            # Check cache (5 minute TTL)
            if cache_file.exists():
                try:
                    cache_stat = cache_file.stat()
                    if time.time() - cache_stat.st_mtime < 300:  # 5 min
                        file_handle = cache_file.open('r', encoding='utf-8')
                        with file_handle:
                            cached_result = _json.load(file_handle)
                        _inc_metric('provider_cache_hits')
                        return jsonify(cached_result)
                except (OSError, IOError, _json.JSONDecodeError):
                    pass
            
            _inc_metric('provider_cache_misses')
            
            # Save to cache helper
            def save_to_cache(data_to_cache):
                try:
                    with cache_file.open('w', encoding='utf-8') as file_handle:
                        _json.dump(data_to_cache, file_handle)
                except (OSError, IOError):
                    pass
        except ImportError:
            cache_key = None
            
            def save_to_cache(data_to_cache):
                """Dummy cache save function when caching unavailable."""
                pass
    
    # Provider analysis with retry logic
    if provider:
        def _call_provider_with_retry(provider_name, txt, max_retries=2,
                                      backoff=0.6):
            import time
            last_exc = None
            for attempt in range(1, max_retries + 1):
                try:
                    resp = analyze_text_with_provider(
                        txt, provider=provider_name)
                    if resp:
                        return resp
                except Exception as error:
                    last_exc = error
                    app.logger.warning(
                        'provider %s attempt %s failed: %s',
                        provider_name, attempt, error)
                    if attempt < max_retries:
                        time.sleep(backoff)
            if last_exc:
                raise last_exc
            return None
    
    # Local model analysis
    if prefer in (None, 'auto', 'local') or not provider:
        try:
            if hasattr(analyze_with_local_model, '__call__'):
                # Avoid mutating a module-level variable inside the function
                # (scoping issues).
                
                # lazy import to keep runtime light when scikit-learn
                # isn't installed
                result = analyze_with_local_model(text)
                if result:
                    _inc_metric('local_used')
        except (ImportError, AttributeError):
            pass
        except Exception:
            app.logger.exception('Local model analysis failed')
    
    # Heuristic fallback
    if not result and prefer in (None, 'auto', 'heuristic'):
        try:
            heuristic_score = _get_heuristic_score(text)
            result = {
                'ai_probability': heuristic_score,
                'confidence': 0.6,
                'analysis_method': 'heuristic'
            }
            _inc_metric('heuristic_used')
        except Exception:
            app.logger.exception('Heuristic analysis failed')
    
    # Provider analysis
    should_try_provider = (
        (result is None and provider and
         prefer in (None, 'auto', 'provider')) or
        (result is None and prefer == 'provider')
    )
    if should_try_provider:
        try:
            result = _call_provider_with_retry(provider, text)
            if result:
                _inc_metric('provider_calls')
                if cache_key:
                    save_to_cache(result)
        except Exception:
            _inc_metric('provider_failures')
            if prefer == 'provider':
                app.logger.exception(
                    'external provider analysis failed, falling back')
    
    # Final fallback if everything failed
    if not result:
        try:
            heuristic_score = _get_heuristic_score(text)
            result = {
                'ai_probability': heuristic_score,
                'confidence': 0.3,
                'analysis_method': 'fallback_heuristic'
            }
            _inc_metric('heuristic_used')
        except Exception:
            result = {
                'ai_probability': 0.5,
                'confidence': 0.1,
                'analysis_method': 'default'
            }
    
    # Enhanced AI detection (optional)
    try:
        ai_result = analyze_ai_content(text)
        if ai_result:
            result['ai_detection'] = ai_result
    except Exception as error:
        app.logger.warning('AI detection failed: %s', error)
    
    # Multi-provider analysis for comparison
    if provider and result:
        try:
            other_providers = ['openai', 'claude', 'gemini']
            if provider in other_providers:
                other_providers.remove(provider)
            
            comparison_results = []
            for other_provider in other_providers[:2]:  # Limit to 2
                try:
                    other_result = analyze_text_with_provider(
                        text, provider=other_provider)
                    if other_result:
                        comparison_results.append({
                            'provider': other_provider,
                            'result': other_result
                        })
                except Exception:
                    continue
            
            if comparison_results:
                result['provider_comparison'] = comparison_results
        except Exception as error:
            app.logger.warning('AI provider analysis failed: %s', error)
    
    # Traditional AI detection
    try:
        from ai_detection import detect_ai_patterns
        traditional_result = detect_ai_patterns(text)
        if traditional_result:
            result['traditional_detection'] = traditional_result
    except (ImportError, AttributeError) as error:
        app.logger.warning('Traditional AI detection failed: %s', error)
    
    # Real news context
    try:
        news_result = get_real_news_context(text)
        if news_result:
            result['news_context'] = {
                'articles': news_result.get('articles', [])[:3],
                'summary': news_result.get('summary', ''),
                'credibility_score': news_result.get('credibility_score', 0),
                'forward_insights': news_result.get(
                    'forward_looking_insights', [])[:2],
            }
    except Exception as error:
        app.logger.warning('Real news context failed: %s', error)
    
    return jsonify(result)


@app.route('/fact-check', methods=['POST'])
def fact_check():
    """Endpoint for comprehensive fact-checking with related articles."""
    try:
        data = request.get_json(force=True) or {}
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({
                'error': 'Text field is required and cannot be empty'
            }), 400
        
        # Initialize fact checker
        fact_checker = InternetFactChecker()
        
        # Perform fact checking
        fact_result = fact_checker.check_facts(text)
        
        # Find related articles
        related_articles = fact_checker.find_related_articles(text)
        
        # Combine results
        result = {
            'fact_check': fact_result,
            'related_articles': related_articles,
            'timestamp': fact_result.get('timestamp'),
            'analysis_complete': True
        }
        
        return jsonify(result)
    
    except Exception as error:
        app.logger.exception('Fact-check endpoint failed: %s', error)
        return jsonify({
            'error': 'Fact-checking service temporarily unavailable',
            'details': str(error)
        }), 500


@app.route('/news', methods=['GET'])
def news():
    """Get real news context and articles."""
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({'error': 'Query parameter q is required'}), 400
        
        news_result = get_real_news_context(query)
        return jsonify(news_result or {})
    
    except Exception as error:
        app.logger.exception('News endpoint failed: %s', error)
        return jsonify({
            'error': 'News service temporarily unavailable'
        }), 500


@app.route('/providers', methods=['GET'])
def providers():
    """Get available AI analysis providers."""
    try:
        return jsonify({
            'providers': ['openai', 'claude', 'gemini', 'local'],
            'default': 'openai'
        })
    except Exception as error:
        app.logger.exception('Providers endpoint failed: %s', error)
        return jsonify({'error': 'Service unavailable'}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    try:
        return jsonify({
            'status': 'healthy',
            'metrics': metrics.copy()
        })
    except Exception as error:
        app.logger.exception('Health check failed: %s', error)
        return jsonify({'status': 'unhealthy'}), 500


@app.errorhandler(404)
def handle_404(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def handle_500(error):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500


@app.route('/metrics', methods=['GET'])
def get_metrics():
    """Get service metrics."""
    try:
        return jsonify(metrics.copy())
    except Exception as error:
        app.logger.exception('Metrics endpoint failed: %s', error)
        return jsonify({'error': 'Metrics unavailable'}), 500


@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file uploads for analysis."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        uploaded_file = request.files['file']
        if uploaded_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read file content
        content = uploaded_file.read().decode('utf-8', errors='ignore')
        
        # Analyze the content
        analysis_result = analyze_ai_content(content)
        
        return jsonify({
            'filename': uploaded_file.filename,
            'analysis': analysis_result,
            'content_preview': content[:200] + ('...' if len(content) > 200 else '')
        })
    
    except Exception as error:
        app.logger.exception('File upload failed: %s', error)
        return jsonify({'error': 'File processing failed'}), 500


@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """Analyze multiple texts in batch."""
    try:
        data = request.get_json(force=True) or {}
        texts = data.get('texts', [])
        
        if not isinstance(texts, list) or not texts:
            return jsonify({'error': 'texts must be a non-empty array'}), 400
        
        results = []
        for i, text in enumerate(texts[:10]):  # Limit to 10 texts
            try:
                if isinstance(text, str) and text.strip():
                    result = analyze_ai_content(text.strip())
                    results.append({
                        'index': i,
                        'text_preview': text[:100],
                        'analysis': result
                    })
                else:
                    results.append({
                        'index': i,
                        'error': 'Invalid text format'
                    })
            except Exception as error:
                results.append({
                    'index': i,
                    'error': f'Analysis failed: {error}'
                })
        
        return jsonify({'results': results})
    
    except Exception as error:
        app.logger.exception('Batch analysis failed: %s', error)
        return jsonify({'error': 'Batch processing failed'}), 500


if __name__ == '__main__':
    try:
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        app.logger.setLevel(logging.INFO)
        
        # Create cache directory
        Path('cache').mkdir(exist_ok=True)
        
        print("Server starting on http://localhost:5000")
        app.run(host='0.0.0.0', port=5000, debug=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as startup_error:
        print(f"Failed to start server: {startup_error}")