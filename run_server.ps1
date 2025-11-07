# Start the Flask server (serves frontend and API)
# Usage: Open PowerShell in repo root and run: .\run_server.ps1

python -m venv venv 2>$null
if (Test-Path venv\Scripts\Activate.ps1) {
    Write-Output "Activating venv..."
    & .\venv\Scripts\Activate.ps1
}

pip install -r requirements.txt
python server.py
