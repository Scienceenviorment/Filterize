from server import app
import json

app.config['TESTING'] = True
client = app.test_client()

# happy path
payload = {'content': "You won't believe this breakthrough in science!"}
resp = client.post('/api/analyze', data=json.dumps(payload), content_type='application/json')
print('happy status', resp.status_code)
print('happy json', resp.get_json())

# missing content
resp2 = client.post('/api/analyze', data=json.dumps({}), content_type='application/json')
print('missing status', resp2.status_code)
print('missing json', resp2.get_json())
