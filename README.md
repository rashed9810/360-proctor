# 360° Proctor

## Overview

360° Proctor is a comprehensive online exam proctoring system designed to ensure the integrity of online exams through advanced AI-powered monitoring and analytics. The system is tailored for the Bangladeshi education market, offering multilingual support (Bangla & English) and a responsive design compatible with desktop, tablet, and mobile devices.

## Features

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
- AI-powered violation detection using OpenCV and TensorFlow
- PostgreSQL database with SQLAlchemy ORM
- FastAPI backend for high-performance API

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: FastAPI, PostgreSQL, SQLAlchemy
- **AI**: OpenCV, TensorFlow
- **Authentication**: JWT
- **Real-time Communication**: WebSockets

## Installation

### Backend

1. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the server:

   ```bash
   python simple_main.py
   ```

### Frontend

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

## Roadmap

- Implement TensorFlow-based AI models for proctoring
- Add advanced analytics dashboards
- Enhance multilingual support
- Integrate third-party services for notifications

## Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For inquiries, please contact [rashed9810](https://github.com/rashed9810).
