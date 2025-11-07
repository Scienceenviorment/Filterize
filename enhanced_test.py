import requests
import time

# Test the new enhanced AI features
print("🧪 Testing Enhanced Multi-AI Features")
print("=" * 50)

# Wait a moment for server to be ready
time.sleep(1)

try:
    # Test fact-checking endpoint
    print("1. Testing Fact-Check Analysis...")
    fact_check_data = {
        "content": "Doctors hate this one weird trick! Miracle cure discovered that Big Pharma doesn't want you to know!",
        "type": "text"
    }
    r = requests.post("http://127.0.0.1:5000/api/fact-check", json=fact_check_data, timeout=10)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        result = r.json()
        print(f"   Response keys: {list(result.keys())}")
        print(f"   Provider used: {result.get('provider_used', 'N/A')}")
        print(f"   Success: {result.get('success', 'N/A')}")
    else:
        print(f"   Error: {r.text}")
        
    # Test multi-AI analysis
    print("\n2. Testing Multi-AI Analysis...")
    multi_ai_data = {
        "content": "According to a peer-reviewed study published in Nature, researchers found significant correlations between screen time and sleep quality.",
        "type": "text",
        "task": "analysis"
    }
    r = requests.post("http://127.0.0.1:5000/api/multi-ai-analyze", json=multi_ai_data, timeout=10)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        result = r.json()
        print(f"   Response keys: {list(result.keys())}")
        print(f"   Provider used: {result.get('provider_used', 'N/A')}")
        print(f"   Success: {result.get('success', 'N/A')}")
    else:
        print(f"   Error: {r.text}")
        
    # Test summarization
    print("\n3. Testing Summarization...")
    summary_data = {
        "content": "This is a long article about artificial intelligence and its impact on society. The technology has advanced rapidly in recent years, with applications in healthcare, education, and business. However, there are also concerns about job displacement and ethical implications.",
        "type": "text"
    }
    r = requests.post("http://127.0.0.1:5000/api/summarize", json=summary_data, timeout=10)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        result = r.json()
        print(f"   Response keys: {list(result.keys())}")
        print(f"   Provider used: {result.get('provider_used', 'N/A')}")
    else:
        print(f"   Error: {r.text}")
        
    # Test with specific provider
    print("\n4. Testing Specialized Provider...")
    specialized_data = {
        "content": "Breaking news: Scientists discover new method for faster than light travel!",
        "type": "text",
        "task": "fact_check",
        "provider": "specialized"
    }
    r = requests.post("http://127.0.0.1:5000/api/multi-ai-analyze", json=specialized_data, timeout=10)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        result = r.json()
        print(f"   Provider used: {result.get('provider_used', 'N/A')}")
        if 'analysis' in result:
            analysis = result['analysis']
            if 'fact_check_score' in analysis:
                print(f"   Fact check score: {analysis['fact_check_score']}")
            if 'real_facts' in analysis:
                print(f"   Real facts available: {len(analysis['real_facts'])}")
    else:
        print(f"   Error: {r.text}")
        
    print("\n✅ All tests completed!")
        
except Exception as e:
    print(f"❌ Test failed: {e}")