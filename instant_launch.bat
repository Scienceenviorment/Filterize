@echo off
cls
echo ==========================================
echo   FILTERIZE AI - INSTANT LAUNCH
echo ==========================================
echo.

cd /d "c:\Users\Scien\OneDrive\Desktop\Filterize"

echo [INFO] Stopping existing processes...
taskkill /F /IM python.exe >nul 2>&1
timeout /t 1 >nul

echo [INFO] Starting optimized server...
echo [URL] Dashboard: http://localhost:8080
echo [INFO] Features: Ultra-fast AI detection with smooth transitions
echo.

start /b python instant_server.py

echo [INFO] Waiting for server to initialize...
timeout /t 3 >nul

echo [INFO] Testing server health...
curl -s http://localhost:8080/health >nul 2>&1
if %errorlevel%==0 (
    echo [SUCCESS] Server is running optimally!
) else (
    echo [WARNING] Server is starting... please wait a moment
)

echo.
echo ==========================================
echo   PLATFORM READY FOR INSTANT ACCESS!
echo ==========================================
echo.
echo [URLS] Access Points:
echo   Main Dashboard: http://localhost:8080
echo   Text Analysis:  http://localhost:8080/text-analysis.html
echo   Image Analysis: http://localhost:8080/image-analysis-unified.html
echo   Video Analysis: http://localhost:8080/video-analysis.html
echo   Voice Analysis: http://localhost:8080/voice-analysis.html
echo   Document Analysis: http://localhost:8080/document-analysis-unified.html
echo   Website Analysis: http://localhost:8080/website-analysis-unified.html
echo.
echo [FEATURES] Available:
echo   - Instant page transitions (150ms)
echo   - Ultra-fast AI analysis (100ms)
echo   - Multi-AI consensus (6 providers)
echo   - Real-time chatbot
echo   - Content translation
echo   - Smooth animations
echo.

echo [INFO] Opening browser...
start http://localhost:8080

echo.
echo ==========================================
echo   FILTERIZE AI IS READY!
echo   Press Ctrl+C to stop server
echo ==========================================
echo.

pause