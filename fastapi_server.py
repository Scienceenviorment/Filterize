#!/usr/bin/env python3
"""
Filterize Server - FastAPI Version
High-performance alternative to Flask
"""

import os
import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from fastapi import FastAPI, HTTPException, Request
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import JSONResponse, FileResponse
    from pydantic import BaseModel
    import uvicorn
    FASTAPI_AVAILABLE = True
except ImportError:
    print("❌ FastAPI not available. Install with: pip install fastapi uvicorn")
    FASTAPI_AVAILABLE = False
    sys.exit(1)

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

# Pydantic models
class FactCheckRequest(BaseModel):
    content: str

class NewsRequest(BaseModel):
    content: str = ""
    categories: list = []

# Create FastAPI app
app = FastAPI(
    title="Filterize API",
    description="AI-powered fact-checking and news analysis",
    version="3.0.0"
)

# Mount static files
frontend_dir = Path(__file__).parent / 'frontend'
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")

@app.get("/")
async def read_root():
    """Serve the main page"""
    index_path = frontend_dir / 'index.html'
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "Filterize API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'version': '3.0.0',
        'server': 'FastAPI',
        'features': {
            'fact_checking': fact_checker is not None,
            'news_provider': real_news_provider is not None,
            'frontend': frontend_dir.exists()
        }
    }

@app.post("/api/fact-check")
async def fact_check_endpoint(request: FactCheckRequest):
    """Fact-checking endpoint"""
    try:
        if not request.content:
            raise HTTPException(status_code=400, detail="content is required")
        
        if fact_checker:
            result = fact_checker.fact_check_content(request.content)
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
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'Fact-checking failed',
                'detail': str(e),
                'fact_check_score': 50
            }
        )

@app.post("/api/real-news")
async def real_news_endpoint(request: NewsRequest):
    """Real news endpoint"""
    try:
        if real_news_provider:
            result = real_news_provider.get_real_news(
                request.content, 
                request.categories
            )
        else:
            result = {
                'real_news': [],
                'trending_topics': ['AI', 'Technology', 'Innovation'],
                'ai_generated_summary': 'News service temporarily unavailable',
                'last_updated': '2025-11-07'
            }
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'News retrieval failed',
                'detail': str(e)
            }
        )

@app.get("/{path:path}")
async def serve_spa(path: str):
    """Serve SPA files"""
    # Security check
    if '..' in path:
        raise HTTPException(status_code=403, detail="Access denied")
    
    file_path = frontend_dir / path
    
    if file_path.exists() and file_path.is_file():
        return FileResponse(str(file_path))
    
    # Fallback to index.html for SPA routing
    index_path = frontend_dir / 'index.html'
    if index_path.exists():
        return FileResponse(str(index_path))
    
    raise HTTPException(status_code=404, detail="File not found")

def run_server(port: int = 5000):
    """Run the FastAPI server"""
    print("🚀 Starting Filterize - FastAPI Server")
    print("=" * 50)
    print(f"📱 Frontend: http://localhost:{port}")
    print(f"🔧 API: http://localhost:{port}/api/*")
    print(f"💊 Health: http://localhost:{port}/health")
    print(f"📚 Docs: http://localhost:{port}/docs")
    print("=" * 50)
    print("📡 Server ready! Press Ctrl+C to stop.")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=False,
        access_log=False
    )

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    run_server(port)