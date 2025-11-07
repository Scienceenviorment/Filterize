#!/usr/bin/env python3
"""
Test script for enhanced AI image detection
"""

import sys
import os
import time
from pathlib import Path

def test_enhanced_detection():
    """Test the enhanced AI detection module."""
    print("🧪 Testing Enhanced AI Image Detection")
    print("=" * 50)
    
    # Test 1: Module Import
    print("\n1. Testing module import...")
    try:
        from enhanced_media_detection import analyze_image_enhanced, enhanced_detector
        print("✅ Enhanced detection module imported successfully")
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    
    # Test 2: Model Loading
    print("\n2. Testing model initialization...")
    try:
        if enhanced_detector.models_loaded:
            print("✅ TensorFlow models loaded successfully")
            print(f"   - Feature extractor: {type(enhanced_detector.feature_extractor)}")
        else:
            print("⚠️ Models not loaded - using fallback methods")
    except Exception as e:
        print(f"❌ Model loading error: {e}")
    
    # Test 3: Basic Functionality
    print("\n3. Testing basic functionality...")
    try:
        # Create a simple test image
        from PIL import Image
        import io
        
        # Create a small test image
        test_img = Image.new('RGB', (100, 100), color='red')
        img_buffer = io.BytesIO()
        test_img.save(img_buffer, format='JPEG')
        test_data = img_buffer.getvalue()
        
        print(f"   - Created test image: {len(test_data)} bytes")
        
        # Test analysis
        start_time = time.time()
        result = analyze_image_enhanced(test_data, "test.jpg")
        end_time = time.time()
        
        print(f"   - Analysis completed in {end_time - start_time:.2f} seconds")
        print(f"   - AI probability: {result['ai_probability']:.2%}")
        print(f"   - Confidence: {result['confidence']:.2%}")
        print(f"   - Detection methods: {result['detection_methods']}")
        print("✅ Basic functionality test passed")
        
    except Exception as e:
        print(f"❌ Functionality test failed: {e}")
        return False
    
    # Test 4: Advanced Features
    print("\n4. Testing advanced features...")
    try:
        detailed = result.get('detailed_analysis', {})
        flags = result.get('flags', [])
        
        print(f"   - Detailed analysis sections: {list(detailed.keys())}")
        print(f"   - Detection flags: {len(flags)}")
        print("✅ Advanced features test passed")
        
    except Exception as e:
        print(f"❌ Advanced features test failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Enhanced AI Detection Test Complete!")
    return True

if __name__ == "__main__":
    success = test_enhanced_detection()
    sys.exit(0 if success else 1)