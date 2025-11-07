import requests
import time

# Simple test to check if endpoints are working
print("Testing basic functionality...")

# Wait a moment for server to be ready
time.sleep(2)

try:
    # Test health endpoint
    print("Testing health endpoint...")
    r = requests.get("http://127.0.0.1:5000/health", timeout=5)
    print(f"Health Status: {r.status_code}")
    if r.status_code == 200:
        print(f"Health Response: {r.json()}")
        
    # Test basic analyze endpoint
    print("\nTesting analyze endpoint...")
    data = {"content": "This is a test message for analysis."}
    r = requests.post("http://127.0.0.1:5000/api/analyze", json=data, timeout=10)
    print(f"Analyze Status: {r.status_code}")
    if r.status_code == 200:
        result = r.json()
        print(f"Analyze Response keys: {list(result.keys())}")
        print(f"Score: {result.get('score', 'N/A')}")
        print(f"Used method: {result.get('used', 'N/A')}")
    else:
        print(f"Error: {r.text}")
        
    # Test provider status endpoint  
    print("\nTesting providers endpoint...")
    r = requests.get("http://127.0.0.1:5000/api/providers", timeout=5)
    print(f"Providers Status: {r.status_code}")
    if r.status_code == 200:
        result = r.json()
        print(f"Providers Response: {result}")
    else:
        print(f"Error: {r.text}")
        
except Exception as e:
    print(f"Test failed: {e}")