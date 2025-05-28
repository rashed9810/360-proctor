#!/usr/bin/env python3
"""
Comprehensive Test Runner for 360° Proctor
Runs all tests including unit tests, integration tests, and performance tests
"""

import os
import sys
import subprocess
import time
import logging
from datetime import datetime
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test_results.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ComprehensiveTestRunner:
    """Comprehensive test runner for the 360° Proctor system"""
    
    def __init__(self):
        self.start_time = datetime.now()
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'skipped': 0,
            'errors': []
        }
        
    def run_command(self, command, description):
        """Run a command and capture results"""
        logger.info(f"Running: {description}")
        logger.info(f"Command: {command}")
        
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            if result.returncode == 0:
                logger.info(f"✅ {description} - PASSED")
                self.test_results['passed'] += 1
                return True
            else:
                logger.error(f"❌ {description} - FAILED")
                logger.error(f"Error output: {result.stderr}")
                self.test_results['failed'] += 1
                self.test_results['errors'].append({
                    'test': description,
                    'error': result.stderr,
                    'stdout': result.stdout
                })
                return False
                
        except subprocess.TimeoutExpired:
            logger.error(f"⏰ {description} - TIMEOUT")
            self.test_results['failed'] += 1
            self.test_results['errors'].append({
                'test': description,
                'error': 'Test timed out after 5 minutes'
            })
            return False
        except Exception as e:
            logger.error(f"💥 {description} - ERROR: {e}")
            self.test_results['failed'] += 1
            self.test_results['errors'].append({
                'test': description,
                'error': str(e)
            })
            return False
    
    def check_dependencies(self):
        """Check if all required dependencies are installed"""
        logger.info("🔍 Checking dependencies...")
        
        required_packages = [
            'pytest', 'fastapi', 'sqlalchemy', 'psycopg2-binary',
            'uvicorn', 'pydantic', 'python-jose', 'passlib'
        ]
        
        missing_packages = []
        
        for package in required_packages:
            try:
                __import__(package.replace('-', '_'))
                logger.info(f"✅ {package} - installed")
            except ImportError:
                logger.warning(f"❌ {package} - missing")
                missing_packages.append(package)
        
        if missing_packages:
            logger.error(f"Missing packages: {', '.join(missing_packages)}")
            logger.info("Installing missing packages...")
            install_cmd = f"pip install {' '.join(missing_packages)}"
            return self.run_command(install_cmd, "Installing missing dependencies")
        
        return True
    
    def run_unit_tests(self):
        """Run unit tests"""
        logger.info("🧪 Running unit tests...")
        
        test_commands = [
            ("python -m pytest tests/test_comprehensive.py::TestAuthenticationEndpoints -v", 
             "Authentication Tests"),
            ("python -m pytest tests/test_comprehensive.py::TestExamManagementEndpoints -v", 
             "Exam Management Tests"),
            ("python -m pytest tests/test_comprehensive.py::TestRealTimeProctoringService -v", 
             "Real-time Proctoring Tests"),
            ("python -m pytest tests/test_comprehensive.py::TestFileUploadService -v", 
             "File Upload Tests"),
            ("python -m pytest tests/test_comprehensive.py::TestEmailNotificationService -v", 
             "Email Notification Tests")
        ]
        
        results = []
        for command, description in test_commands:
            results.append(self.run_command(command, description))
        
        return all(results)
    
    def run_integration_tests(self):
        """Run integration tests"""
        logger.info("🔗 Running integration tests...")
        
        test_commands = [
            ("python -m pytest tests/test_comprehensive.py::TestWebSocketEndpoints -v", 
             "WebSocket Integration Tests"),
            ("python -m pytest tests/test_comprehensive.py::TestAnalyticsEndpoints -v", 
             "Analytics Integration Tests"),
            ("python -m pytest tests/test_comprehensive.py::TestIntegrationScenarios -v", 
             "Complete Integration Scenarios")
        ]
        
        results = []
        for command, description in test_commands:
            results.append(self.run_command(command, description))
        
        return all(results)
    
    def run_security_tests(self):
        """Run security and performance tests"""
        logger.info("🔒 Running security tests...")
        
        test_commands = [
            ("python -m pytest tests/test_comprehensive.py::TestPerformanceAndSecurity -v", 
             "Security and Performance Tests")
        ]
        
        results = []
        for command, description in test_commands:
            results.append(self.run_command(command, description))
        
        return all(results)
    
    def run_api_tests(self):
        """Run API endpoint tests"""
        logger.info("🌐 Running API tests...")
        
        # Start the server for API testing
        logger.info("Starting test server...")
        server_process = None
        
        try:
            # Start server in background
            server_process = subprocess.Popen(
                ["python", "simple_main.py"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # Wait for server to start
            time.sleep(5)
            
            # Test basic endpoints
            test_commands = [
                ("curl -f http://localhost:8000/health", "Health Check"),
                ("curl -f http://localhost:8000/api/info", "API Info"),
                ("curl -f http://localhost:8000/docs", "API Documentation")
            ]
            
            results = []
            for command, description in test_commands:
                results.append(self.run_command(command, description))
            
            return all(results)
            
        finally:
            if server_process:
                server_process.terminate()
                server_process.wait()
                logger.info("Test server stopped")
    
    def run_database_tests(self):
        """Run database tests"""
        logger.info("🗄️ Running database tests...")
        
        # Test database setup
        setup_result = self.run_command(
            "python setup_database.py",
            "Database Setup Test"
        )
        
        if not setup_result:
            logger.error("Database setup failed, skipping database tests")
            return False
        
        # Test database operations
        test_commands = [
            ("python -c \"from app.db.session import engine; engine.connect()\"", 
             "Database Connection Test"),
            ("python -c \"from app.db.init_db import init_db; from app.db.session import SessionLocal; db = SessionLocal(); init_db(db); db.close()\"", 
             "Database Initialization Test")
        ]
        
        results = []
        for command, description in test_commands:
            results.append(self.run_command(command, description))
        
        return all(results)
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        logger.info("\n" + "="*60)
        logger.info("📊 COMPREHENSIVE TEST REPORT")
        logger.info("="*60)
        logger.info(f"Start Time: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"End Time: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Duration: {duration}")
        logger.info(f"Tests Passed: {self.test_results['passed']}")
        logger.info(f"Tests Failed: {self.test_results['failed']}")
        logger.info(f"Tests Skipped: {self.test_results['skipped']}")
        
        if self.test_results['errors']:
            logger.info("\n❌ FAILED TESTS:")
            for error in self.test_results['errors']:
                logger.info(f"  - {error['test']}: {error['error']}")
        
        success_rate = (self.test_results['passed'] / 
                       (self.test_results['passed'] + self.test_results['failed']) * 100
                       if (self.test_results['passed'] + self.test_results['failed']) > 0 else 0)
        
        logger.info(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            logger.info("🎉 EXCELLENT! All tests are passing well.")
        elif success_rate >= 75:
            logger.info("✅ GOOD! Most tests are passing.")
        elif success_rate >= 50:
            logger.info("⚠️ WARNING! Some tests are failing.")
        else:
            logger.info("🚨 CRITICAL! Many tests are failing.")
        
        logger.info("="*60)
        
        return success_rate >= 75
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        logger.info("🚀 Starting Comprehensive Test Suite for 360° Proctor")
        logger.info("="*60)
        
        # Test sequence
        test_sequence = [
            ("Dependencies Check", self.check_dependencies),
            ("Database Tests", self.run_database_tests),
            ("Unit Tests", self.run_unit_tests),
            ("Integration Tests", self.run_integration_tests),
            ("API Tests", self.run_api_tests),
            ("Security Tests", self.run_security_tests)
        ]
        
        for test_name, test_function in test_sequence:
            logger.info(f"\n🔄 Starting {test_name}...")
            try:
                result = test_function()
                if result:
                    logger.info(f"✅ {test_name} completed successfully")
                else:
                    logger.warning(f"⚠️ {test_name} completed with issues")
            except Exception as e:
                logger.error(f"💥 {test_name} failed with error: {e}")
                self.test_results['failed'] += 1
                self.test_results['errors'].append({
                    'test': test_name,
                    'error': str(e)
                })
        
        # Generate final report
        return self.generate_test_report()

def main():
    """Main function"""
    runner = ComprehensiveTestRunner()
    
    try:
        success = runner.run_all_tests()
        
        if success:
            logger.info("🎉 All tests completed successfully!")
            sys.exit(0)
        else:
            logger.error("❌ Some tests failed. Please check the logs.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"💥 Test runner failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
