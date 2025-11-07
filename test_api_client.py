#!/usr/bin/env python3
"""
Test Script - Direct API test without stopping server
"""

import requests
import time

def test_api():
    try:
        print("Testing health endpoint...")
        response = requests.get('http://localhost:5000/health', timeout=5)
        print(f"Health Status: {response.status_code}")
        print(f"Health Response: {response.json()}")
        
        print("\nTesting fact-check endpoint...")
        response = requests.post(
            'http://localhost:5000/api/fact-check',
            json={'content': 'AI technology is advancing rapidly'},
            timeout=10
        )
        print(f"Fact-check Status: {response.status_code}")
        print(f"Fact-check Response: {response.json()}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_api()