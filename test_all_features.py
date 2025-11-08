#!/usr/bin/env python3
"""
Test script to verify all Filterize AI features are working
"""
import requests
import json
import time

BASE_URL = "http://localhost:8080"

def test_health_check():
    """Test server health"""
    print("🔍 Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health Check: PASS")
            return True
        else:
            print(f"❌ Health Check: FAIL (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Health Check: ERROR - {e}")
        return False

def test_text_analysis():
    """Test text analysis"""
    print("\n📝 Testing Text Analysis...")
    try:
        test_text = "This is a sample text to test our AI detection capabilities."
        response = requests.post(f"{BASE_URL}/api/analyze", 
                               json={"content": test_text, "type": "text"})
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Text Analysis: PASS")
            print(f"   AI Probability: {result.get('ai_probability', 'N/A')}%")
            return True
        else:
            print(f"❌ Text Analysis: FAIL (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Text Analysis: ERROR - {e}")
        return False

def test_chat_endpoint():
    """Test chat functionality"""
    print("\n💬 Testing Chat Endpoint...")
    try:
        response = requests.post(f"{BASE_URL}/api/chat", 
                               json={"message": "Hello, can you help me understand AI detection?"})
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Chat Endpoint: PASS")
            print(f"   Response: {result.get('response', 'N/A')[:100]}...")
            return True
        else:
            print(f"❌ Chat Endpoint: FAIL (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Chat Endpoint: ERROR - {e}")
        return False

def test_frontend_pages():
    """Test frontend page accessibility"""
    print("\n🌐 Testing Frontend Pages...")
    pages = [
        "/",
        "/text-analysis.html",
        "/image-analysis-unified.html", 
        "/video-analysis.html",
        "/voice-analysis.html",
        "/document-analysis-unified.html",
        "/website-analysis-unified.html",
        "/ultimate_dashboard.html"
    ]
    
    passed = 0
    for page in pages:
        try:
            response = requests.get(f"{BASE_URL}{page}")
            if response.status_code == 200:
                print(f"   ✅ {page}: ACCESSIBLE")
                passed += 1
            else:
                print(f"   ❌ {page}: NOT ACCESSIBLE (Status: {response.status_code})")
        except Exception as e:
            print(f"   ❌ {page}: ERROR - {e}")
    
    print(f"\n📊 Frontend Pages: {passed}/{len(pages)} ACCESSIBLE")
    return passed == len(pages)

def main():
    """Run all tests"""
    print("🚀 FILTERIZE AI PLATFORM - COMPREHENSIVE TESTING")
    print("=" * 50)
    
    results = []
    results.append(test_health_check())
    results.append(test_text_analysis())
    results.append(test_chat_endpoint())
    results.append(test_frontend_pages())
    
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Tests Passed: {passed}/{total}")
    print(f"📊 Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED - FILTERIZE AI IS FULLY FUNCTIONAL!")
    else:
        print(f"\n⚠️  {total-passed} TEST(S) FAILED - SOME FEATURES NEED ATTENTION")
    
    return passed == total

if __name__ == "__main__":
    # Wait a moment for server to be ready
    time.sleep(2)
    main()