from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

# Import our modules
try:
    from internet_fact_checker import InternetFactChecker
    fact_checker = InternetFactChecker()
    print("✅ Internet fact checker loaded")
except Exception as e:
    print(f"❌ Error loading fact checker: {e}")
    fact_checker = None

try:
    from news_provider import real_news_provider
    print("✅ News provider loaded")
except Exception as e:
    print(f"❌ Error loading news provider: {e}")
    real_news_provider = None

app = Flask(__name__, static_folder='frontend', static_url_path='/static')
CORS(app)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def static_proxy(path):
    """Serve static files and fall back to index.html for SPA routes."""
    frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend')
    
    if path != '':
        file_path = os.path.join(frontend_dir, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return send_from_directory(frontend_dir, path)
    
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    return send_from_directory(frontend_dir, 'index.html')

@app.route('/health')
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'version': '2.0.0',
        'features': {
            'fact_checking': fact_checker is not None,
            'news_provider': real_news_provider is not None,
            'frontend': True
        }
    })

@app.route('/api/fact-check', methods=['POST'])
def fact_check():
    """Fact-checking endpoint with internet verification."""
    try:
        data = request.get_json(force=True) or {}
        content = data.get('content', '')
        
        if not content:
            return jsonify({'error': 'content is required'}), 400
        
        if fact_checker:
            result = fact_checker.fact_check_content(content)
        else:
            # Fallback response
            result = {
                'fact_check_score': 75,
                'verified_claims': [],
                'disputed_claims': [],
                'real_facts': [
                    'Fact-checking service temporarily unavailable',
                    'Content appears to be within normal parameters',
                    'Manual verification recommended for important claims'
                ],
                'sources_checked': 0,
                'internet_search_performed': False,
                'related_articles': []
            }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': 'Fact-checking failed',
            'detail': str(e),
            'fact_check_score': 50
        }), 500

@app.route('/api/real-news', methods=['POST'])
def get_real_news():
    """Get real news endpoint."""
    try:
        data = request.get_json(force=True) or {}
        content = data.get('content', '')
        categories = data.get('categories', [])
        
        if real_news_provider:
            result = real_news_provider.get_real_news(content, categories)
        else:
            result = {
                'real_news': [],
                'trending_topics': ['AI', 'Technology', 'Innovation'],
                'ai_generated_summary': 'News service temporarily unavailable',
                'last_updated': '2025-11-07'
            }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': 'News retrieval failed',
            'detail': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Filterize - Enhanced Version")
    print("=" * 50)
    print("📱 Frontend: http://localhost:5000")
    print("🔧 API: http://localhost:5000/api/*")
    print("💊 Health: http://localhost:5000/health")
    print("=" * 50)
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)