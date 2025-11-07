#!/usr/bin/env python3
"""
Simple Stable Server - Minimal version for debugging
"""

import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import mimetypes
from pathlib import Path

print("🔧 Starting Simple Stable Server...")

class SimpleHandler(BaseHTTPRequestHandler):
    """Simple HTTP request handler"""
    
    def __init__(self, *args, **kwargs):
        self.frontend_dir = Path(__file__).parent / 'frontend'
        super().__init__(*args, **kwargs)
    
    def log_message(self, format, *args):
        """Override to reduce verbose logging"""
        pass
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/health':
            self.handle_health()
        else:
            self.serve_static_file(path)
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/api/fact-check':
            self.handle_fact_check()
        elif path == '/api/real-news':
            self.handle_real_news()
        else:
            self.send_json_response({'error': 'Endpoint not found'}, 404)
    
    def handle_health(self):
        """Health check endpoint"""
        response = {
            'status': 'healthy',
            'version': '3.0.0',
            'server': 'Simple Python HTTP Server',
            'features': {
                'fact_checking': True,
                'news_provider': True,
                'frontend': True
            }
        }
        self.send_json_response(response)
    
    def handle_fact_check(self):
        """Simple fact-checking endpoint with mock data"""
        try:
            print("🔍 Received fact-check request")
            content_length = int(self.headers.get('Content-Length', 0))
            print(f"📏 Content length: {content_length}")
            
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                print(f"📥 Request data: {data}")
            else:
                data = {}
            
            content = data.get('content', '')
            print(f"📝 Content to analyze: '{content[:50]}...'")
            
            if not content:
                print("❌ No content provided")
                self.send_json_response({'error': 'content is required'}, 400)
                return
            
            # Mock fact-check result for testing
            result = {
                'fact_check_score': 85,
                'verified_claims': [
                    'AI technology is indeed advancing rapidly',
                    'This is a commonly reported trend in technology news'
                ],
                'disputed_claims': [],
                'real_facts': [
                    f'Content analyzed: "{content[:50]}..."',
                    'AI and machine learning are experiencing significant growth',
                    'Major tech companies are investing heavily in AI research',
                    'AI applications are expanding across multiple industries'
                ],
                'sources_checked': 15,
                'internet_search_performed': True,
                'related_articles': [
                    {
                        'title': 'The Future of Artificial Intelligence in 2025',
                        'url': 'https://example.com/ai-future-2025',
                        'summary': 'Comprehensive analysis of AI trends and developments',
                        'source': 'Tech News Today',
                        'relevance_score': 95
                    },
                    {
                        'title': 'Machine Learning Breakthroughs This Year',
                        'url': 'https://example.com/ml-breakthroughs',
                        'summary': 'Recent advances in machine learning technology',
                        'source': 'AI Research Weekly',
                        'relevance_score': 88
                    }
                ]
            }
            
            print(f"✅ Fact-check request processed: {content[:30]}...")
            self.send_json_response(result)
            
        except json.JSONDecodeError:
            print("❌ Invalid JSON in request")
            self.send_json_response({'error': 'Invalid JSON'}, 400)
        except Exception as e:
            print(f"❌ Error in fact-check: {e}")
            self.send_json_response({
                'error': 'Fact-checking failed',
                'detail': str(e),
                'fact_check_score': 50
            }, 500)
    
    def handle_real_news(self):
        """Simple real news endpoint with mock data"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
            else:
                data = {}
            
            result = {
                'real_news': [
                    {
                        'title': 'Major AI Development Announced',
                        'summary': 'Breaking news in artificial intelligence research',
                        'source': 'Tech News',
                        'url': 'https://example.com/ai-news',
                        'published': '2025-11-07'
                    }
                ],
                'trending_topics': ['AI', 'Technology', 'Innovation'],
                'ai_generated_summary': 'Latest developments in AI technology',
                'last_updated': '2025-11-07'
            }
            
            print("✅ Real news request processed")
            self.send_json_response(result)
            
        except Exception as e:
            print(f"❌ Error in real-news: {e}")
            self.send_json_response({
                'error': 'News retrieval failed',
                'detail': str(e)
            }, 500)
    
    def serve_static_file(self, path):
        """Serve static files from frontend directory"""
        # Clean the path
        if path == '/' or path == '':
            path = '/index.html'
        
        # Remove leading slash
        if path.startswith('/'):
            path = path[1:]
        
        # Security check - prevent directory traversal
        if '..' in path or path.startswith('/'):
            self.send_response(403)
            self.end_headers()
            return
        
        file_path = self.frontend_dir / path
        
        if file_path.exists() and file_path.is_file():
            # Determine content type
            content_type, _ = mimetypes.guess_type(str(file_path))
            if content_type is None:
                if path.endswith('.js'):
                    content_type = 'application/javascript'
                elif path.endswith('.css'):
                    content_type = 'text/css'
                elif path.endswith('.html'):
                    content_type = 'text/html'
                else:
                    content_type = 'application/octet-stream'
            
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(content)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content)
                print(f"✅ Served: {path}")
            except Exception as e:
                print(f"❌ Error serving file {file_path}: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            # File not found, serve index.html for SPA routing
            index_path = self.frontend_dir / 'index.html'
            if index_path.exists():
                try:
                    with open(index_path, 'rb') as f:
                        content = f.read()
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/html')
                    self.send_header('Content-Length', str(len(content)))
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(content)
                    print(f"✅ Served index.html for: {path}")
                except Exception as e:
                    print(f"❌ Error serving index.html: {e}")
                    self.send_response(500)
                    self.end_headers()
            else:
                print(f"❌ File not found: {path}")
                self.send_response(404)
                self.end_headers()
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response with proper headers"""
        response_data = json.dumps(data, indent=2).encode('utf-8')
        
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(response_data)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_data)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port=5000):
    """Run the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHandler)
    
    print("🚀 Starting Simple Filterize Server")
    print("=" * 50)
    print(f"📱 Frontend: http://localhost:{port}")
    print(f"🔧 API: http://localhost:{port}/api/*")
    print(f"💊 Health: http://localhost:{port}/health")
    print("=" * 50)
    print("📡 Server ready! Press Ctrl+C to stop.")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.server_close()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    run_server(port)