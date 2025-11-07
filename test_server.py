#!/usr/bin/env python3
"""
Test script to validate the analyze endpoint is working correctly.
"""

import requests
import json

def test_analyze_endpoint():
    """Test the /analyze endpoint with a simple text."""
    url = 'http://127.0.0.1:5000/analyze'
    data = {
        'text': 'This is a simple test message to analyze for AI content detection.'
    }
    
    try:
        response = requests.post(url, json=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analysis successful!")
            print(f"AI Probability: {result.get('ai_probability', 'N/A')}")
            print(f"Confidence: {result.get('confidence', 'N/A')}")
            print(f"Analysis Method: {result.get('analysis_method', 'N/A')}")
            return True
        else:
            print(f"❌ Analysis failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_health_endpoint():
    """Test the /health endpoint."""
    url = 'http://127.0.0.1:5000/health'
    
    try:
        response = requests.get(url, timeout=5)
        print(f"Health Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Health check successful!")
            print(f"Status: {result.get('status', 'N/A')}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Filterize Server Endpoints...")
    print("=" * 50)
    
    # Test health first
    health_ok = test_health_endpoint()
    print()
    
    # Test analyze if health is OK
    if health_ok:
        analyze_ok = test_analyze_endpoint()
        print()
        
        if analyze_ok:
            print("🎉 All tests passed! Server is working correctly.")
        else:
            print("❌ Analyze endpoint has issues.")
    else:
        print("❌ Server health check failed. Cannot test analyze endpoint.")