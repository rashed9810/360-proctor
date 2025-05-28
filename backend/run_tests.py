#!/usr/bin/env python3
"""
Comprehensive Test Runner for 360° Proctor Backend
Runs all tests and generates detailed reports
"""

import os
import sys
import subprocess
import pytest
import time
from datetime import datetime
from pathlib import Path

def setup_test_environment():
    """Setup test environment"""
    print("🔧 Setting up test environment...")

    # Create test directories
    test_dirs = ["logs", "test_reports"]
    for dir_name in test_dirs:
        Path(dir_name).mkdir(exist_ok=True)

    # Set environment variables for testing
    os.environ["TESTING"] = "true"
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"

    print("✅ Test environment setup complete")

def run_unit_tests():
    """Run unit tests with coverage"""
    print("\n🧪 Running Unit Tests...")

    # Run pytest
    test_args = [
        "-v",
        "--tb=short",
        "--cov=app",
        "--cov-report=html:test_reports/coverage_html",
        "--cov-report=term-missing",
        "--junit-xml=test_reports/unit_tests.xml",
        "tests/"
    ]

    exit_code = pytest.main(test_args)
    return exit_code == 0

def run_api_tests():
    """Run API endpoint tests"""
    print("\n🌐 Running API Tests...")

    # API test args
    test_args = [
        "-v",
        "--tb=short",
        "--junit-xml=test_reports/api_tests.xml",
        "-k", "test_api",
        "tests/"
    ]

    exit_code = pytest.main(test_args)
    return exit_code == 0

def generate_test_report(results):
    """Generate comprehensive test report"""
    print("\n📋 Generating Test Report...")

    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_tests": len(results),
            "passed": sum(1 for r in results.values() if r),
            "failed": sum(1 for r in results.values() if not r)
        },
        "results": results
    }

    # Print summary
    print(f"\n📊 Test Summary:")
    print(f"   Total Tests: {report['summary']['total_tests']}")
    print(f"   Passed: {report['summary']['passed']}")
    print(f"   Failed: {report['summary']['failed']}")

    if report['summary']['failed'] > 0:
        print(f"\n❌ Failed Tests:")
        for test_name, passed in results.items():
            if not passed:
                print(f"   - {test_name}")

    return report

def main():
    """Main test runner function"""
    print("🚀 360° Proctor Backend Test Suite")
    print("=" * 50)

    start_time = time.time()

    # Setup
    setup_test_environment()

    # Run all tests
    results = {}

    try:
        results["unit_tests"] = run_unit_tests()
        results["api_tests"] = run_api_tests()

    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error running tests: {e}")
        sys.exit(1)

    # Generate report
    report = generate_test_report(results)

    # Calculate duration
    duration = time.time() - start_time
    print(f"\n⏱️ Total test duration: {duration:.2f} seconds")

    # Exit with appropriate code
    if report['summary']['failed'] > 0:
        print("\n❌ Some tests failed")
        sys.exit(1)
    else:
        print("\n✅ All tests passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()
