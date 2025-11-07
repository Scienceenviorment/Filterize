import json
import pytest

from server import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_analyze_happy_path(client):
    payload = {'content': "You won't believe this breakthrough in science!"}
    resp = client.post('/api/analyze', data=json.dumps(payload), content_type='application/json')
    # The endpoint should return 200 under normal circumstances. If optional
    # dependencies are missing the server still falls back to heuristics.
    assert resp.status_code in (200,)
    data = resp.get_json()
    assert isinstance(data, dict)
    # If successful, we expect at least a score and flags field
    assert 'score' in data
    assert 'flags' in data

def test_analyze_missing_content(client):
    resp = client.post('/api/analyze', data=json.dumps({}), content_type='application/json')
    assert resp.status_code == 400
    data = resp.get_json()
    assert data.get('error') == 'content is required'
