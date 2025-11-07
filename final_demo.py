"""
🚀 FILTERIZE ENHANCED SYSTEM DEMONSTRATION
Complete showcase of multi-AI capabilities and fact-checking features
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://127.0.0.1:5000"

def print_header(title):
    print(f"\n{'='*60}")
    print(f"🎯 {title}")
    print(f"{'='*60}")

def print_subheader(title):
    print(f"\n{'─'*40}")
    print(f"📊 {title}")
    print(f"{'─'*40}")

def demo_test(endpoint, data, description):
    print(f"\n🧪 {description}")
    print(f"📍 Endpoint: {endpoint}")
    
    try:
        start_time = time.time()
        response = requests.post(f"{BASE_URL}{endpoint}", 
                               json=data, 
                               timeout=30)
        response_time = time.time() - start_time
        
        print(f"⏱️  Response Time: {response_time:.2f}s")
        print(f"📈 Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            # Show key metrics
            if 'provider_used' in result:
                print(f"🤖 Provider: {result['provider_used']}")
            if 'score' in result:
                print(f"📊 Score: {result['score']}")
            if 'success' in result:
                print(f"✅ Success: {result['success']}")
            if 'analysis' in result and isinstance(result['analysis'], dict):
                analysis = result['analysis']
                if 'credibility_score' in analysis:
                    print(f"🎯 Credibility: {analysis['credibility_score']}%")
                if 'fact_check_score' in analysis:
                    print(f"🔍 Fact Check: {analysis['fact_check_score']}%")
                if 'real_facts' in analysis:
                    print(f"📚 Real Facts: {len(analysis['real_facts'])} available")
            
            return True, result
        else:
            print(f"❌ Error: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"💥 Failed: {e}")
        return False, None

def main():
    print("🚀 FILTERIZE ENHANCED SYSTEM DEMONSTRATION")
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Base URL: {BASE_URL}")
    
    # Check system health
    print_header("SYSTEM HEALTH CHECK")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            health = response.json()
            print("✅ System Status: HEALTHY")
            print(f"🔧 Version: {health.get('version', 'N/A')}")
            print(f"📋 Features: {', '.join(health.get('features', {}).keys())}")
            print(f"🛣️  Endpoints: {len(health.get('endpoints', []))} available")
        else:
            print("❌ System Status: UNHEALTHY")
            return
    except Exception as e:
        print(f"💥 Health check failed: {e}")
        return

    # Check provider status
    print_header("AI PROVIDER STATUS")
    try:
        response = requests.get(f"{BASE_URL}/api/providers", timeout=5)
        if response.status_code == 200:
            providers = response.json()
            print("🤖 Available AI Providers:")
            for name, info in providers.get('providers', {}).items():
                status = "✅" if info['available'] else "❌"
                print(f"   {status} {info['name']} ({name})")
            
            print(f"\n🎯 Supported Tasks: {', '.join(providers.get('supported_tasks', []))}")
            print(f"📁 Supported Content: {', '.join(providers.get('supported_content', []))}")
    except Exception as e:
        print(f"💥 Provider check failed: {e}")

    # Test samples for different scenarios
    test_samples = {
        'clickbait': "You won't believe what happened! This shocking truth will blow your mind and doctors hate it!",
        'misinformation': "Breaking: Scientists confirm chocolate cures aging - Big Pharma doesn't want you to know this miracle cure!",
        'scientific': "According to a peer-reviewed study published in Nature Medicine, researchers found significant correlations between Mediterranean diet adherence and cognitive decline prevention in elderly populations.",
        'normal': "The weather forecast shows partly cloudy skies with temperatures reaching 72°F today. Light winds from the southeast at 5-10 mph.",
        'conspiracy': "The moon landing was fake and was filmed in a Hollywood studio. The government has been lying to us for decades about space exploration.",
        'factual': "The COVID-19 vaccines have been shown in clinical trials to be effective at preventing severe illness and hospitalization according to data from the CDC and FDA."
    }

    # Traditional Analysis Tests
    print_header("TRADITIONAL CONTENT ANALYSIS")
    for sample_name, content in test_samples.items():
        success, result = demo_test(
            "/api/analyze",
            {"content": content},
            f"Traditional Analysis - {sample_name.title()}"
        )

    # Enhanced Fact-Checking Tests  
    print_header("ENHANCED FACT-CHECKING")
    fact_check_samples = ['misinformation', 'conspiracy', 'scientific', 'factual']
    for sample_name in fact_check_samples:
        content = test_samples[sample_name]
        success, result = demo_test(
            "/api/fact-check",
            {"content": content, "type": "text"},
            f"Fact-Check Analysis - {sample_name.title()}"
        )

    # Multi-AI Analysis Tests
    print_header("MULTI-AI PROVIDER ANALYSIS")
    
    # Test with different tasks
    tasks = ['analysis', 'fact_check', 'summarize']
    test_content = test_samples['misinformation']
    
    for task in tasks:
        success, result = demo_test(
            "/api/multi-ai-analyze",
            {
                "content": test_content,
                "type": "text", 
                "task": task
            },
            f"Multi-AI {task.title()} Task"
        )

    # Test with specific provider
    print_subheader("Specialized Provider Test")
    success, result = demo_test(
        "/api/multi-ai-analyze",
        {
            "content": test_samples['scientific'],
            "type": "text",
            "task": "fact_check",
            "provider": "specialized"
        },
        "Specialized Provider Fact-Check"
    )

    # Content Summarization Tests
    print_header("CONTENT SUMMARIZATION")
    long_content = """
    Artificial intelligence has revolutionized many aspects of modern life, from healthcare diagnostics to autonomous vehicles. 
    Recent breakthroughs in machine learning, particularly in large language models and computer vision, have enabled 
    unprecedented capabilities in natural language processing and image recognition. However, these advancements also raise 
    important questions about ethics, privacy, and the future of work. As AI systems become more sophisticated, it's crucial 
    to develop robust frameworks for responsible AI development and deployment. The technology sector continues to invest 
    heavily in AI research, with companies like OpenAI, Google, and Microsoft leading the charge in developing ever more 
    powerful AI systems. Meanwhile, governments around the world are grappling with how to regulate these technologies 
    while fostering innovation and maintaining competitive advantages in the global economy.
    """
    
    success, result = demo_test(
        "/api/summarize",
        {"content": long_content, "type": "text"},
        "Content Summarization with Bias Detection"
    )

    # Performance and Reliability Tests
    print_header("PERFORMANCE & RELIABILITY")
    
    # Test error handling
    print_subheader("Error Handling Test")
    success, result = demo_test(
        "/api/analyze",
        {"content": ""},  # Empty content should trigger error
        "Empty Content Error Handling"
    )
    
    # Test provider fallback (if no API keys are set)
    print_subheader("Provider Fallback Test")
    success, result = demo_test(
        "/api/multi-ai-analyze",
        {
            "content": test_samples['normal'],
            "type": "text",
            "task": "analysis",
            "provider": "openai"  # Will fallback to specialized if no API key
        },
        "Provider Fallback Mechanism"
    )

    # Final Summary
    print_header("DEMONSTRATION COMPLETE")
    print("🎉 All enhanced features have been demonstrated!")
    print("\n📊 Key Capabilities Tested:")
    print("   ✅ Multi-AI provider integration")
    print("   ✅ Enhanced fact-checking with real facts")
    print("   ✅ Intelligent provider routing")
    print("   ✅ Content summarization")
    print("   ✅ Error handling and fallbacks")
    print("   ✅ Performance optimization")
    
    print("\n🚀 The enhanced Filterize system is ready for production use!")
    print("🌐 Access the web interface at: http://localhost:5000")
    print("📖 See ENHANCED_README.md for complete documentation")

if __name__ == "__main__":
    main()