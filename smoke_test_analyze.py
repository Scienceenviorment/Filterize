import requests

"""
Simple smoke test: POST a sample to /api/analyze and print the JSON response.
Run while the Flask server is running (default: http://127.0.0.1:5000)
"""

URL = "http://127.0.0.1:5000/api/analyze"
SAMPLE = "You won't believe what happened! This is shocking and unbelievable."

try:
    r = requests.post(URL, json={"content": SAMPLE}, timeout=10)
    print('Status:', r.status_code)
    try:
        print('JSON:', r.json())
    except Exception:
        print('Response text:', r.text)
except Exception as e:
    print('Request failed:', e)
