# 360° Proctor

A full-featured, multilingual (Bangla & English) online exam proctoring system designed specifically for the Bangladeshi education market. The system features a responsive design that works seamlessly across desktop, tablet, and mobile devices.

<div align="center">
  <img src="frontend/public/logo.svg" alt="360° Proctor Logo" width="400">
</div>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#responsive-design">Responsive Design</a> •
  <a href="#dashboard-showcase">Dashboard Showcase</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#roadmap">Roadmap</a>
</p>

## Features

<div align="center">
  <img src="https://raw.githubusercontent.com/rashed9810/360-proctor/main/docs/images/proctor.png" alt="360° Proctor Features" width="100%">
</div>

### Proctoring Capabilities

- Real-time AI-powered proctoring
  - Face detection and verification
  - Multiple people detection
  - Eye movement tracking
  - Audio analysis (speech-to-text)
  - Tab switching detection
  - Phone usage detection
- Trust Score system based on suspicious activities
- Comprehensive exam reports with screenshots and timelines
- Multilingual proctoring interface with real-time violation detection
- Fullscreen monitoring with exit detection
- Window focus tracking to prevent cheating attempts

### User Experience

- Fully responsive admin and teacher dashboards
- Multilingual support (Bangla & English) with easy language switching
- Intuitive exam management interface with consistent navigation
- Elegant back button and page header components for improved navigation
- Real-time violation alerts with notification system
- Detailed student performance analytics
- Feedback system with form validation and accessibility features

### Technical Features

- JWT Authentication and role-based access control
- WebSocket-based real-time communication
- Secure API endpoints with proper validation
- Optimized database queries for performance

## Tech Stack

### Backend

- **FastAPI** (Python) - High-performance web framework
- **PostgreSQL** - Relational database
- **WebSockets** - For real-time communication
- **JWT** - For secure authentication
- **AI models** - For proctoring features

### Frontend

- **React.js** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **react-i18next** - Internationalization
- **Recharts** - Responsive charting library
- **Axios** - HTTP client

## Responsive Design

The application features a comprehensive responsive design that works across all device sizes:

### Mobile Experience

- Slide-in drawer navigation
- Optimized tables with horizontal scrolling
- Touch-friendly controls and forms
- Stacked layouts for better readability
- Properly sized touch targets

### Tablet Experience

- Adaptive layouts that make use of available space
- Collapsible sidebar
- Responsive tables with prioritized columns
- Optimized forms and modals

### Desktop Experience

- Expanded layouts with multi-column content
- Hover-expandable sidebar
- Full-featured tables and data visualization
- Advanced filtering and search capabilities

### UI Components

- **BackButton**: Clean, integrated back navigation with proper styling and accessibility
- **PageHeader**: Consistent page headers with title and optional actions
- **FeedbackForm**: Interactive feedback system with validation and character counting
- **NotificationBell**: Real-time notification system with unread indicators
- **DarkModeToggle**: Persistent theme preference with smooth transitions

### Dashboard Showcase

<div align="center">
  <p><strong>Main Dashboard Overview</strong></p>
  <img src="https://raw.githubusercontent.com/rashed9810/360-proctor/main/docs/images/dashboard.png" alt="360° Proctor Dashboard" width="100%">
  <br><br>
  <p><strong>Exam Management Interface</strong></p>
  <img src="https://raw.githubusercontent.com/rashed9810/360-proctor/main/docs/images/dashboard2.png" alt="Exam Management Interface" width="100%">
  <br><br>
  <p><strong>Analytics and Reporting</strong></p>
  <img src="https://raw.githubusercontent.com/rashed9810/360-proctor/main/docs/images/dashboard3.png" alt="Analytics and Reporting" width="100%">
</div>

## Project Structure

```bash
360-proctor/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core functionality
│   │   ├── db/             # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── ai/             # AI models integration
│   │   └── websockets/     # WebSocket handlers
│   └── tests/              # Backend tests
├── frontend/               # React.js frontend
│   ├── public/             # Static files
│   │   ├── logo.svg        # 360° Proctor logo
│   │   └── favicon.svg     # 360° Proctor favicon
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── common/     # Common UI elements (BackButton, FeedbackForm, etc.)
│   │   │   ├── layout/     # Layout components (PageHeader, Sidebar, etc.)
│   │   │   ├── dashboard/  # Dashboard-specific components
│   │   │   └── notifications/ # Notification system components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Utility functions
│   │   ├── locales/        # Translation files
│   │   └── App.jsx         # Main application component
│   └── package.json        # Frontend dependencies
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# The .env file is already provided with default settings
# Edit .env with your database credentials if needed

# Initialize the database
python init_db.py

# Start the development server
python -m uvicorn app.main:app --reload

# Run tests
python run_tests.py
```

#### Backend Features Implemented

- **Authentication System**: JWT-based authentication with user roles (admin, teacher, student)
- **User Management**: Create, read, update users with different roles
- **Exam Management**: Create, read, update exams with various settings
- **Proctoring Infrastructure**: WebSocket-based real-time proctoring
- **Trust Score Calculation**: Algorithm to calculate trust scores based on violations
- **Violation Detection**: Detection of tab switching, audio, and other violations
- **Multilingual Support**: Backend support for English and Bangla
- **API Integration**: Complete REST API with proper error handling and validation

#### Frontend-Backend Integration Status

- ✅ **API Service Layer**: Comprehensive API service classes for all operations
- ✅ **Authentication Integration**: Real JWT-based auth with token management
- ✅ **Exam Management Integration**: Create, read, update, delete exams via API
- ✅ **User Management Integration**: Complete user CRUD operations
- ✅ **Error Handling**: Centralized error handling with user-friendly messages
- ✅ **Loading States**: Proper loading indicators throughout the application
- ✅ **Permission System**: Role-based access control integrated with UI

#### Backend Features To Be Implemented

- **Facial Detection**: Will be implemented later with GPU resources
- **Advanced Analytics**: More comprehensive analytics and reporting
- **Performance Optimization**: Further optimization for large-scale deployments
- **File Upload**: Support for exam materials and result attachments
- **Email Notifications**: Automated email alerts for exam events

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

### Accessing the Application

- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- API Documentation: `http://localhost:8000/docs`

### Testing the Integration

To test the complete backend-frontend integration:

1. **Start the Backend**:

   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

2. **Start the Frontend**:

   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Authentication**:

   - Register a new user at `http://localhost:3000/register`
   - Login with the created credentials
   - Verify JWT token is stored and API calls include authorization headers

4. **Test Exam Management**:

   - Create a new exam (requires teacher/admin role)
   - View exam list with real data from backend
   - Edit and delete exams (with proper permission checks)

5. **Test API Integration**:
   - Check browser network tab to see real API calls
   - Verify error handling with invalid data
   - Test loading states and user feedback

### Default Test Users

The system includes default users for testing:

- **Admin**: `admin@360proctor.com` / `admin123`
- **Teacher**: `teacher@360proctor.com` / `teacher123`
- **Student**: `student@360proctor.com` / `student123`

_Note: These users are created automatically when initializing the database._

## Development Guidelines

### Code Style

- Backend: Follow PEP 8 guidelines
- Frontend: ESLint and Prettier configuration provided

### Branching Strategy

- `main`: Production-ready code
- `develop`: Development branch
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-name`

### Commit Messages

Follow conventional commits format:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Roadmap

### Short-term Goals

- Enhanced mobile experience
- AI-driven cheating pattern detection
- Alerting via email or SMS

### Mid-term Goals

- Offline/unstable network tolerance
- Integration with popular LMS platforms
- Advanced analytics dashboard

### Long-term Goals

- Marketplace for exam packages
- Browser extension for enhanced proctoring
- Machine learning for personalized exam security

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Headless UI](https://headlessui.dev/)
- [react-i18next](https://react.i18next.com/)
