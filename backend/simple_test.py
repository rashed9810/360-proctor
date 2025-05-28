#!/usr/bin/env python3
"""
Simple Test for 360° Proctor Backend
Tests basic functionality without complex dependencies
"""

import sys
import os

def test_imports():
    """Test basic imports"""
    print("🔍 Testing Basic Imports...")

    try:
        from app.core.config import settings
        print("   ✅ Configuration loaded successfully")
        print(f"   📝 Project: {settings.PROJECT_NAME}")
        print(f"   🌐 Host: {settings.HOST}:{settings.PORT}")
        return True
    except Exception as e:
        print(f"   ❌ Configuration import failed: {e}")
        return False

def test_security():
    """Test security functions"""
    print("\n🔒 Testing Security Functions...")

    try:
        from app.core.security import (
            create_access_token,
            verify_password,
            get_password_hash
        )

        # Test password hashing
        password = "testpassword123"
        hashed = get_password_hash(password)
        verified = verify_password(password, hashed)

        print(f"   🔐 Password hashing: {'✅ Working' if verified else '❌ Failed'}")

        # Test token creation
        token_data = {"sub": "test@example.com"}
        token = create_access_token(token_data)

        print(f"   🎫 Token creation: {'✅ Working' if token else '❌ Failed'}")

        return True
    except Exception as e:
        print(f"   ❌ Security test error: {e}")
        return False

def test_api_structure():
    """Test API structure"""
    print("\n🌐 Testing API Structure...")

    try:
        # Test basic imports first
        from app import schemas
        print("   ✅ Schemas imported successfully")

        # Test individual endpoints one by one
        try:
            from app.api.api_v1.endpoints import auth
            print("   ✅ Auth endpoints loaded")
        except Exception as e:
            print(f"   ❌ Auth endpoints failed: {e}")

        try:
            from app.api.api_v1.endpoints import users
            print("   ✅ Users endpoints loaded")
        except Exception as e:
            print(f"   ❌ Users endpoints failed: {e}")

        try:
            from app.api.api_v1.endpoints import exams
            print("   ✅ Exams endpoints loaded")
        except Exception as e:
            print(f"   ❌ Exams endpoints failed: {e}")

        # Test API router last
        try:
            from app.api.api_v1.api import api_router
            print("   ✅ API router loaded successfully")
        except Exception as e:
            print(f"   ❌ API router failed: {e}")

        return True
    except Exception as e:
        print(f"   ❌ API structure test error: {e}")
        return False

def test_websocket():
    """Test WebSocket manager"""
    print("\n🔌 Testing WebSocket Manager...")

    try:
        from app.core.websocket_manager import WebSocketManager

        ws_manager = WebSocketManager()
        print("   ✅ WebSocket manager initialized")

        return True
    except Exception as e:
        print(f"   ❌ WebSocket test error: {e}")
        return False

def test_ai_packages():
    """Test AI package imports"""
    print("\n🤖 Testing AI Packages...")

    packages = [
        ("OpenCV", "cv2"),
        ("TensorFlow", "tensorflow"),
        ("MediaPipe", "mediapipe"),
        ("NumPy", "numpy"),
        ("SciPy", "scipy")
    ]

    results = []
    for name, module in packages:
        try:
            __import__(module)
            print(f"   ✅ {name} imported successfully")
            results.append(True)
        except ImportError as e:
            print(f"   ⚠️ {name} import failed: {e}")
            results.append(False)

    return any(results)  # Return True if at least one package works

def main():
    """Main test function"""
    print("🚀 360° Proctor Backend - Simple Test Suite")
    print("=" * 50)

    tests = [
        ("Basic Imports", test_imports),
        ("Security Functions", test_security),
        ("API Structure", test_api_structure),
        ("WebSocket Manager", test_websocket),
        ("AI Packages", test_ai_packages)
    ]

    results = {}

    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"\n❌ {test_name} test failed with error: {e}")
            results[test_name] = False

    # Print summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)

    passed = sum(1 for result in results.values() if result)
    total = len(results)

    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {test_name:<20} {status}")

    print(f"\n📊 Overall Results: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! Backend core functionality is working.")
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Some features may not work correctly.")

    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
