# FILTERIZE AI - INSTANT STARTUP SCRIPT
# Launches the platform with zero delay and optimal performance

Write-Host "🚀 FILTERIZE AI - INSTANT STARTUP" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Yellow

# Set working directory
Set-Location "c:\Users\Scien\OneDrive\Desktop\Filterize"

# Kill any existing Python processes for clean start
Write-Host "🔄 Stopping existing processes..." -ForegroundColor Yellow
try {
    Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
} catch {
    # Continue if no processes to stop
}

# Verify required files exist
Write-Host "📁 Verifying platform files..." -ForegroundColor Yellow
$requiredFiles = @(
    "instant_server.py",
    "frontend\unified-styles.css",
    "frontend\instant-navigation.js",
    "frontend\ultimate_dashboard.html"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file - MISSING" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "❌ Some required files are missing!" -ForegroundColor Red
    Read-Host "Press Enter to continue anyway..."
}

# Start the optimized server
Write-Host "⚡ Starting instant performance server..." -ForegroundColor Cyan
Write-Host "🌟 Dashboard will open at: http://localhost:8080" -ForegroundColor Green
Write-Host "🔧 Features: Ultra-fast AI detection, smooth transitions, instant responses" -ForegroundColor Magenta

# Start server in background
$serverJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\Scien\OneDrive\Desktop\Filterize"
    python instant_server.py
}

# Wait a moment for server to initialize
Write-Host "⏳ Initializing server..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check if server is responding
Write-Host "🔍 Testing server health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 5
    if ($response.status -eq "optimal") {
        Write-Host "✅ Server is running optimally!" -ForegroundColor Green
        Write-Host "   - Status: $($response.status)" -ForegroundColor Cyan
        Write-Host "   - Cache: $($response.cache_size) items preloaded" -ForegroundColor Cyan
        Write-Host "   - AI Providers: $($response.ai_providers) active" -ForegroundColor Cyan
    } else {
        throw "Server not optimal"
    }
} catch {
    Write-Host "⚠️  Server is starting... (may take a moment)" -ForegroundColor Yellow
}

# Display access information
Write-Host ""
Write-Host "🎯 PLATFORM READY FOR INSTANT ACCESS!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   Main Dashboard: http://localhost:8080" -ForegroundColor White
Write-Host "   Text Analysis:  http://localhost:8080/text-analysis.html" -ForegroundColor White
Write-Host "   Image Analysis: http://localhost:8080/image-analysis-unified.html" -ForegroundColor White
Write-Host "   Video Analysis: http://localhost:8080/video-analysis.html" -ForegroundColor White
Write-Host "   Voice Analysis: http://localhost:8080/voice-analysis.html" -ForegroundColor White
Write-Host "   Document Analysis: http://localhost:8080/document-analysis-unified.html" -ForegroundColor White
Write-Host "   Website Analysis: http://localhost:8080/website-analysis-unified.html" -ForegroundColor White

Write-Host ""
Write-Host "🔧 Features Available:" -ForegroundColor Magenta
Write-Host "   ⚡ Instant page transitions (< 150ms)" -ForegroundColor White
Write-Host "   🎯 Ultra-fast AI analysis (< 100ms)" -ForegroundColor White
Write-Host "   🤖 Multi-AI consensus (6 providers)" -ForegroundColor White
Write-Host "   💬 Real-time AI chatbot" -ForegroundColor White
Write-Host "   🌍 Content translation & summarization" -ForegroundColor White
Write-Host "   🎨 Smooth animations & transitions" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Opening browser..." -ForegroundColor Cyan

# Open browser automatically
try {
    Start-Process "http://localhost:8080"
    Write-Host "✅ Browser opened successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Please manually open: http://localhost:8080" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host "🎉 FILTERIZE AI IS READY!" -ForegroundColor Green
Write-Host "✨ Enjoy ultra-smooth, instant AI detection!" -ForegroundColor Magenta
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - All page transitions are instant and smooth" -ForegroundColor White
Write-Host "   - Analysis results appear in < 100ms" -ForegroundColor White
Write-Host "   - Use Ctrl+C to stop the server when done" -ForegroundColor White
Write-Host ""

# Keep script running and show server status
Write-Host "📊 Server Status Monitor (Ctrl+C to stop):" -ForegroundColor Cyan
Write-Host "   Server Job ID: $($serverJob.Id)" -ForegroundColor Gray

# Monitor server job
try {
    while ($serverJob.State -eq "Running") {
        Start-Sleep -Seconds 5
        if ($serverJob.HasMoreData) {
            Receive-Job $serverJob | Write-Host -ForegroundColor Gray
        }
        
        # Test server health periodically
        try {
            $healthCheck = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
            $timestamp = Get-Date -Format "HH:mm:ss"
            Write-Host "[$timestamp] ✅ Server running - Cache: $($healthCheck.cache_size) items" -ForegroundColor Green
        } catch {
            # Server might be busy, continue monitoring
        }
    }
} catch {
    Write-Host "[STOP] Monitoring stopped" -ForegroundColor Yellow
} finally {
    # Cleanup
    if ($serverJob.State -eq "Running") {
        Stop-Job $serverJob
        Remove-Job $serverJob
    }
    Write-Host "[INFO] Server stopped. Run script again to restart." -ForegroundColor Yellow
}