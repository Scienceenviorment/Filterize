"""
Comprehensive test suite for enhanced Filterize multi-AI system.
Tests all endpoints including traditional analysis, fact-checking, 
multi-AI routing, and provider status.
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"
TIMEOUT = 30

def test_endpoint(endpoint, data, description):
    """Test a specific endpoint with given data."""
    print(f"\n🧪 Testing {description}")
    print(f"📍 Endpoint: {endpoint}")
    print(f"📝 Data: {data}")
    print("-" * 60)
    
    try:
        response = requests.post(f"{BASE_URL}{endpoint}", 
                               json=data, 
                               timeout=TIMEOUT)
        
        print(f"✅ Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"📊 Response keys: {list(result.keys())}")
            
            # Pretty print important fields
            if 'provider_used' in result:
                print(f"🤖 Provider: {result['provider_used']}")
            if 'score' in result:
                print(f"📈 Score: {result['score']}")
            if 'ai_detection' in result:
                ai_det = result['ai_detection']
                print(f"🔍 AI Detection: {ai_det.get('score', 'N/A')}")
            if 'analysis' in result:
                print(f"📄 Analysis available: {type(result['analysis'])}")
            
            return True, result
        else:
            print(f"❌ Error: {response.text}")
            return False, response.text
            
    except Exception as e:
        print(f"💥 Request failed: {e}")
        return False, str(e)

def main():
    print("🚀 FILTERIZE MULTI-AI SYSTEM TEST SUITE")
    print("=" * 70)
    
    # Test data samples
    test_samples = {
        'clickbait': "You won't believe what happened! This shocking truth will blow your mind!",
        'scientific': "According to a peer-reviewed study published in Nature, researchers found significant correlations.",
        'misinformation': "Doctors hate this one weird trick! Miracle cure discovered that Big Pharma doesn't want you to know!",
        'normal': "The weather today is sunny with a high of 75 degrees. Perfect day for a walk in the park."
    }
    
    results = {}
    
    # 1. Test traditional analyze endpoint
    for sample_name, content in test_samples.items():
        success, result = test_endpoint(
            "/api/analyze",
            {"content": content},
            f"Traditional Analysis - {sample_name}"
        )
        results[f"traditional_{sample_name}"] = (success, result)
    
    # 2. Test fact-checking endpoint
    for sample_name, content in test_samples.items():
        success, result = test_endpoint(
            "/api/fact-check",
            {"content": content, "type": "text"},
            f"Fact-Check Analysis - {sample_name}"
        )
        results[f"factcheck_{sample_name}"] = (success, result)
    
    # 3. Test multi-AI analysis with different tasks
    tasks = ['analysis', 'fact_check', 'summarize']
    for task in tasks:
        success, result = test_endpoint(
            "/api/multi-ai-analyze",
            {
                "content": test_samples['misinformation'],
                "type": "text",
                "task": task
            },
            f"Multi-AI Analysis - {task}"
        )
        results[f"multi_ai_{task}"] = (success, result)
    
    # 4. Test summarization endpoint
    success, result = test_endpoint(
        "/api/summarize",
        {
            "content": test_samples['scientific'],
            "type": "text"
        },
        "Content Summarization"
    )
    results['summarization'] = (success, result)
    
    # 5. Test provider status endpoint
    print(f"\n🧪 Testing Provider Status")
    print(f"📍 Endpoint: /api/providers")
    print("-" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/providers", timeout=TIMEOUT)
        print(f"✅ Status: {response.status_code}")
        
        if response.status_code == 200:
            providers = response.json()
            print(f"📊 Available providers:")
            for provider, status in providers.get('providers', {}).items():
                available = status.get('available', False)
                status_emoji = "✅" if available else "❌"
                print(f"  {status_emoji} {provider}: {status.get('name', provider)}")
            
            print(f"🎯 Supported tasks: {providers.get('supported_tasks', [])}")
            print(f"📁 Supported content: {providers.get('supported_content', [])}")
            
        results['providers'] = (response.status_code == 200, response.json() if response.status_code == 200 else response.text)
    except Exception as e:
        print(f"💥 Request failed: {e}")
        results['providers'] = (False, str(e))
    
    # 6. Summary of results
    print(f"\n📊 TEST SUMMARY")
    print("=" * 70)
    
    total_tests = len(results)
    successful_tests = sum(1 for success, _ in results.values() if success)
    
    print(f"Total tests: {total_tests}")
    print(f"Successful: {successful_tests}")
    print(f"Failed: {total_tests - successful_tests}")
    print(f"Success rate: {(successful_tests/total_tests)*100:.1f}%")
    
    # Show failed tests
    failed_tests = [name for name, (success, _) in results.items() if not success]
    if failed_tests:
        print(f"\n❌ Failed tests:")
        for test_name in failed_tests:
            print(f"  • {test_name}")
    else:
        print(f"\n🎉 All tests passed!")
    
    # Save detailed results
    with open('test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\n💾 Detailed results saved to test_results.json")

if __name__ == "__main__":
    main()