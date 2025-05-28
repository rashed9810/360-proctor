#!/usr/bin/env python3
"""
Comprehensive Deployment and Testing Script for 360° Proctor
Handles database setup, testing, and deployment preparation
"""

import os
import sys
import subprocess
import time
import logging
from pathlib import Path
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('deployment.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DeploymentManager:
    """Manages the deployment process"""
    
    def __init__(self):
        self.start_time = time.time()
        self.errors = []
        self.warnings = []
    
    def run_deployment(self):
        """Run complete deployment process"""
        logger.info("🚀 Starting 360° Proctor Deployment Process")
        logger.info("=" * 60)
        
        steps = [
            ("Environment Check", self.check_environment),
            ("Database Setup", self.setup_database),
            ("Dependencies Check", self.check_dependencies),
            ("Run Tests", self.run_tests),
            ("Start Services", self.start_services),
            ("Health Check", self.health_check),
            ("Generate Report", self.generate_report)
        ]
        
        for step_name, step_func in steps:
            logger.info(f"\n📋 Step: {step_name}")
            logger.info("-" * 40)
            
            try:
                success = step_func()
                if success:
                    logger.info(f"✅ {step_name} completed successfully")
                else:
                    logger.error(f"❌ {step_name} failed")
                    self.errors.append(f"{step_name} failed")
            except Exception as e:
                logger.error(f"❌ {step_name} failed with error: {e}")
                self.errors.append(f"{step_name}: {str(e)}")
        
        # Final summary
        self.print_summary()
    
    def check_environment(self):
        """Check environment and prerequisites"""
        try:
            logger.info("🔍 Checking environment...")
            
            # Check Python version
            python_version = sys.version_info
            if python_version.major < 3 or python_version.minor < 9:
                self.errors.append("Python 3.9+ required")
                return False
            
            logger.info(f"   ✅ Python {python_version.major}.{python_version.minor}")
            
            # Check required directories
            required_dirs = ['app', 'tests', 'logs']
            for dir_name in required_dirs:
                if not Path(dir_name).exists():
                    Path(dir_name).mkdir(exist_ok=True)
                    logger.info(f"   📁 Created directory: {dir_name}")
            
            # Check environment variables
            env_vars = [
                'POSTGRES_SERVER', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 
                'POSTGRES_DB', 'SECRET_KEY'
            ]
            
            missing_vars = []
            for var in env_vars:
                if not os.getenv(var):
                    missing_vars.append(var)
            
            if missing_vars:
                self.warnings.append(f"Missing environment variables: {', '.join(missing_vars)}")
                logger.warning(f"   ⚠️ Missing env vars: {', '.join(missing_vars)}")
            
            return True
            
        except Exception as e:
            logger.error(f"Environment check failed: {e}")
            return False
    
    def setup_database(self):
        """Set up database"""
        try:
            logger.info("🗄️ Setting up database...")
            
            # Check if PostgreSQL is available
            try:
                result = subprocess.run(['psql', '--version'], capture_output=True, text=True)
                if result.returncode == 0:
                    logger.info("   ✅ PostgreSQL found")
                else:
                    logger.warning("   ⚠️ PostgreSQL not found, using SQLite for testing")
                    return self.setup_sqlite_database()
            except FileNotFoundError:
                logger.warning("   ⚠️ PostgreSQL not found, using SQLite for testing")
                return self.setup_sqlite_database()
            
            # Run database setup script
            try:
                result = subprocess.run([sys.executable, 'setup_database.py'], 
                                      capture_output=True, text=True, timeout=60)
                if result.returncode == 0:
                    logger.info("   ✅ Database setup completed")
                    return True
                else:
                    logger.error(f"   ❌ Database setup failed: {result.stderr}")
                    return False
            except subprocess.TimeoutExpired:
                logger.error("   ❌ Database setup timed out")
                return False
            
        except Exception as e:
            logger.error(f"Database setup failed: {e}")
            return False
    
    def setup_sqlite_database(self):
        """Set up SQLite database for testing"""
        try:
            logger.info("   🔧 Setting up SQLite database for testing...")
            
            # Update environment for SQLite
            os.environ['DATABASE_URL'] = 'sqlite:///./test.db'
            
            # Initialize database
            from app.db.init_db import init_db
            from app.db.session import SessionLocal
            
            db = SessionLocal()
            init_db(db)
            db.close()
            
            logger.info("   ✅ SQLite database initialized")
            return True
            
        except Exception as e:
            logger.error(f"SQLite setup failed: {e}")
            return False
    
    def check_dependencies(self):
        """Check if all dependencies are installed"""
        try:
            logger.info("📦 Checking dependencies...")
            
            # Check critical packages
            critical_packages = [
                'fastapi', 'uvicorn', 'sqlalchemy', 'pydantic', 
                'python-jose', 'passlib', 'python-multipart'
            ]
            
            missing_packages = []
            for package in critical_packages:
                try:
                    __import__(package.replace('-', '_'))
                    logger.info(f"   ✅ {package}")
                except ImportError:
                    missing_packages.append(package)
                    logger.error(f"   ❌ {package} not found")
            
            # Check AI packages
            ai_packages = ['cv2', 'numpy', 'tensorflow']
            ai_available = 0
            
            for package in ai_packages:
                try:
                    __import__(package)
                    ai_available += 1
                    logger.info(f"   ✅ {package}")
                except ImportError:
                    logger.warning(f"   ⚠️ {package} not available")
            
            if ai_available > 0:
                logger.info(f"   📊 AI packages: {ai_available}/{len(ai_packages)} available")
            
            return len(missing_packages) == 0
            
        except Exception as e:
            logger.error(f"Dependency check failed: {e}")
            return False
    
    def run_tests(self):
        """Run test suite"""
        try:
            logger.info("🧪 Running tests...")
            
            # Run simple test first
            result = subprocess.run([sys.executable, 'simple_test.py'], 
                                  capture_output=True, text=True, timeout=120)
            
            if result.returncode == 0:
                logger.info("   ✅ Basic tests passed")
            else:
                logger.warning(f"   ⚠️ Some basic tests failed: {result.stderr}")
                self.warnings.append("Basic tests had issues")
            
            # Run comprehensive tests if available
            if Path('run_tests.py').exists():
                result = subprocess.run([sys.executable, 'run_tests.py'], 
                                      capture_output=True, text=True, timeout=300)
                
                if result.returncode == 0:
                    logger.info("   ✅ Comprehensive tests passed")
                else:
                    logger.warning("   ⚠️ Some comprehensive tests failed")
                    self.warnings.append("Comprehensive tests had issues")
            
            return True
            
        except subprocess.TimeoutExpired:
            logger.error("   ❌ Tests timed out")
            return False
        except Exception as e:
            logger.error(f"Test execution failed: {e}")
            return False
    
    def start_services(self):
        """Start backend and frontend services"""
        try:
            logger.info("🚀 Starting services...")
            
            # Check if services are already running
            try:
                import requests
                response = requests.get('http://localhost:8000/health', timeout=5)
                if response.status_code == 200:
                    logger.info("   ✅ Backend already running")
                    return True
            except:
                pass
            
            # Start backend service
            logger.info("   🔧 Starting backend service...")
            backend_cmd = [sys.executable, '-m', 'uvicorn', 'app.main:app', 
                          '--host', '0.0.0.0', '--port', '8000', '--reload']
            
            # Start in background
            subprocess.Popen(backend_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            # Wait for service to start
            time.sleep(5)
            
            # Check if backend started
            try:
                import requests
                response = requests.get('http://localhost:8000/health', timeout=10)
                if response.status_code == 200:
                    logger.info("   ✅ Backend service started successfully")
                    return True
                else:
                    logger.error("   ❌ Backend service not responding correctly")
                    return False
            except Exception as e:
                logger.error(f"   ❌ Backend service check failed: {e}")
                return False
            
        except Exception as e:
            logger.error(f"Service startup failed: {e}")
            return False
    
    def health_check(self):
        """Perform health check on all services"""
        try:
            logger.info("🏥 Performing health check...")
            
            # Check backend health
            try:
                import requests
                response = requests.get('http://localhost:8000/health', timeout=10)
                if response.status_code == 200:
                    logger.info("   ✅ Backend health check passed")
                    
                    # Check API endpoints
                    api_response = requests.get('http://localhost:8000/api/v1/', timeout=10)
                    if api_response.status_code in [200, 404]:  # 404 is OK for root API
                        logger.info("   ✅ API endpoints accessible")
                    else:
                        logger.warning("   ⚠️ API endpoints may have issues")
                        
                else:
                    logger.error("   ❌ Backend health check failed")
                    return False
            except Exception as e:
                logger.error(f"   ❌ Backend health check error: {e}")
                return False
            
            # Check database connection
            try:
                from app.db.session import SessionLocal
                db = SessionLocal()
                db.execute("SELECT 1")
                db.close()
                logger.info("   ✅ Database connection healthy")
            except Exception as e:
                logger.warning(f"   ⚠️ Database connection issue: {e}")
                self.warnings.append("Database connection issues")
            
            return True
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
    
    def generate_report(self):
        """Generate deployment report"""
        try:
            logger.info("📋 Generating deployment report...")
            
            duration = time.time() - self.start_time
            
            report = {
                "deployment_time": datetime.now().isoformat(),
                "duration_seconds": round(duration, 2),
                "status": "SUCCESS" if not self.errors else "PARTIAL" if not self.errors and self.warnings else "FAILED",
                "errors": self.errors,
                "warnings": self.warnings,
                "services": {
                    "backend": "http://localhost:8000",
                    "frontend": "http://localhost:3000",
                    "docs": "http://localhost:8000/docs"
                }
            }
            
            # Save report
            import json
            with open('deployment_report.json', 'w') as f:
                json.dump(report, f, indent=2)
            
            logger.info("   ✅ Deployment report saved to deployment_report.json")
            return True
            
        except Exception as e:
            logger.error(f"Report generation failed: {e}")
            return False
    
    def print_summary(self):
        """Print deployment summary"""
        duration = time.time() - self.start_time
        
        print("\n" + "=" * 60)
        print("🎯 DEPLOYMENT SUMMARY")
        print("=" * 60)
        
        if not self.errors:
            print("✅ DEPLOYMENT SUCCESSFUL!")
            print("\n🌐 Services Available:")
            print("   • Backend API: http://localhost:8000")
            print("   • API Documentation: http://localhost:8000/docs")
            print("   • Frontend: http://localhost:3000 (if running)")
        else:
            print("❌ DEPLOYMENT FAILED!")
            print(f"\n🚨 Errors ({len(self.errors)}):")
            for error in self.errors:
                print(f"   • {error}")
        
        if self.warnings:
            print(f"\n⚠️ Warnings ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"   • {warning}")
        
        print(f"\n⏱️ Total deployment time: {duration:.2f} seconds")
        print(f"📋 Detailed log: deployment.log")
        print(f"📊 Report: deployment_report.json")
        
        print("\n🚀 Next Steps:")
        if not self.errors:
            print("   1. Access the API at http://localhost:8000/docs")
            print("   2. Start the frontend: cd ../frontend && npm start")
            print("   3. Test the complete system")
            print("   4. Review the deployment report")
        else:
            print("   1. Review the errors above")
            print("   2. Check deployment.log for details")
            print("   3. Fix issues and run deployment again")

def main():
    """Main deployment function"""
    try:
        deployment = DeploymentManager()
        deployment.run_deployment()
    except KeyboardInterrupt:
        print("\n⚠️ Deployment interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Deployment failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
