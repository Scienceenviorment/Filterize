import requests
r = requests.get('http://127.0.0.1:5000/')
print('status', r.status_code)
print('content-type:', r.headers.get('Content-Type'))
print('body-preview:\n', r.text[:240])
