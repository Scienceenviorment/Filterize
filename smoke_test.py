import requests
r = requests.post('http://localhost:5000/api/analyze', json={'content':'You won\'t believe what happened! This is shocking.'})
print(r.status_code)
print(r.json())
