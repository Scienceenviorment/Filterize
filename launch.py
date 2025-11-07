#!/usr/bin/env python3
"""
Filterize - Unified Backend and Frontend Launcher

This script demonstrates the integrated structure where the Flask backend
serves the frontend directly, eliminating the need for separate servers.
"""

import os
import sys
import webbrowser
import time
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed."""
    required_packages = [
        'flask', 'flask_cors', 'textblob', 'vaderSentiment', 
        'pillow', 'numpy', 'beautifulsoup4', 'requests'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"❌ Missing required packages: {', '.join(missing)}")
        print("Please install them with:")
        print("pip install -r requirements.txt")
        print("pip install -r requirements-ml.txt  # Optional for enhanced features")
        return False
    
    print("✅ All required dependencies found")
    return True

def setup_environment():
    """Set up the environment and directory structure."""
    # Create necessary directories
    directories = ['cache', 'cache/provider', 'cache/media', 'uploads', 'models']
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    # Check frontend files exist
    frontend_files = ['frontend/index.html', 'frontend/app.js', 'frontend/styles.css']
    missing_frontend = [f for f in frontend_files if not Path(f).exists()]
    
    if missing_frontend:
        print(f"❌ Missing frontend files: {', '.join(missing_frontend)}")
        return False
    
    print("✅ Environment setup complete")
    return True

def show_system_info():
    """Display system information and architecture."""
    print("\n" + "="*60)
    print("🎯 FILTERIZE - AI CONTENT DETECTION SYSTEM")
    print("="*60)
    print("\n📊 SYSTEM ARCHITECTURE:")
    print("┌─ Backend (Python Flask)")
    print("│  ├─ AI Detection Engine")
    print("│  ├─ Multi-Media Analysis")
    print("│  ├─ API Endpoints")
    print("│  └─ Caching System")
    print("│")
    print("└─ Frontend (Static Web App)")
    print("   ├─ Tab-Based Interface")
    print("   ├─ File Upload System")
    print("   ├─ Real-Time Results")
    print("   └─ Responsive Design")
    
    print("\n🚀 AVAILABLE FEATURES:")
    print("• Text AI Detection (Watermarks, Perplexity, Reward Models)")
    print("• Image AI Detection (Metadata, Visual Patterns, Statistics)")
    print("• Video AI Detection (File Patterns, Metadata Analysis)")
    print("• URL Content Analysis (Web Scraping, Domain Analysis)")
    print("• Real-Time Credibility Scoring")
    print("• Interactive Results Dashboard")
    
    print("\n🌐 ACCESS POINTS:")
    print("• Frontend Application: http://localhost:5000")
    print("• API Documentation: http://localhost:5000/api/")
    print("• Text Analysis: POST /api/analyze")
    print("• Image Analysis: POST /api/analyze-image")
    print("• Video Analysis: POST /api/analyze-video")
    print("• URL Analysis: POST /api/analyze-url")

def launch_application():
    """Launch the unified Filterize application."""
    print("\n🚀 Starting Filterize Application...")
    
    # Import and start the Flask application
    try:
        from server import app
        
        # Show startup message
        print("\n" + "✅ SYSTEM READY!")
        print("="*40)
        print("🌐 Application URL: http://localhost:5000")
        print("📱 Mobile-friendly interface available")
        print("🤖 AI Detection: ACTIVE")
        print("📊 Multi-Media Support: ENABLED")
        print("⚡ Caching: ENABLED")
        print("="*40)
        
        # Auto-open browser after short delay
        def open_browser():
            time.sleep(2)
            try:
                webbrowser.open('http://localhost:5000')
                print("🌍 Opened application in default browser")
            except:
                print("💡 Please manually open: http://localhost:5000")
        
        import threading
        threading.Thread(target=open_browser, daemon=True).start()
        
        # Start the Flask application
        print("\n📡 Starting server...")
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=False  # Disable reloader to prevent double startup
        )
        
    except ImportError as e:
        print(f"❌ Failed to import server module: {e}")
        return False
    except Exception as e:
        print(f"❌ Failed to start application: {e}")
        return False
    
    return True

def main():
    """Main application launcher."""
    print("🔍 Filterize - AI Content Detection System")
    print("=" * 50)
    
    # Check system requirements
    if not check_dependencies():
        sys.exit(1)
    
    # Setup environment
    if not setup_environment():
        sys.exit(1)
    
    # Show system information
    show_system_info()
    
    # Launch application
    try:
        launch_application()
    except KeyboardInterrupt:
        print("\n\n🛑 Application stopped by user")
        print("Thank you for using Filterize!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()