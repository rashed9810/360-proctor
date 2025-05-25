# 🔐 Social Authentication Setup Guide

This guide explains how to set up Google and Facebook authentication for the 360° Proctor application.

## 📋 Overview

The application supports social login through:
- **Google OAuth 2.0** - Using Google Identity Services
- **Facebook Login** - Using Facebook SDK for JavaScript

## 🚀 Quick Start (Development)

For development and testing, the application includes demo credentials that will show the social login buttons but display informational messages when clicked.

### Current Demo Setup
- Google Client ID: `demo-google-client-id`
- Facebook App ID: `demo-facebook-app-id`

## 🔧 Production Setup

### Google OAuth Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add your domain to "Authorized JavaScript origins":
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)

4. **Update Environment Variables**
   ```env
   VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
   ```

### Facebook Login Setup

1. **Create a Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click "Create App" > "Consumer" > "Next"
   - Enter app name and contact email

2. **Add Facebook Login Product**
   - In your app dashboard, click "Add Product"
   - Find "Facebook Login" and click "Set Up"

3. **Configure OAuth Settings**
   - Go to "Facebook Login" > "Settings"
   - Add Valid OAuth Redirect URIs:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)

4. **Update Environment Variables**
   ```env
   VITE_FACEBOOK_APP_ID=your-actual-facebook-app-id
   ```

## 🎨 UI Features

### Enhanced Social Login Buttons
- **Beautiful Design**: Glass morphism effects with gradient backgrounds
- **Smooth Animations**: Hover effects, loading states, and shimmer animations
- **Responsive**: Perfect scaling on all device sizes
- **Accessibility**: Keyboard navigation and screen reader support

### Button Features
- Loading spinners during authentication
- Error handling with user-friendly messages
- Automatic provider availability detection
- Consistent styling with the application theme

## 🔒 Security Features

### Token Validation
- JWT token parsing and validation
- Secure token storage in localStorage
- Automatic token refresh handling
- Provider-specific token verification

### User Data Handling
- Secure user information extraction
- Email verification requirements
- Profile picture integration
- Automatic account linking

## 🛠️ Technical Implementation

### Frontend Architecture
```
src/
├── services/
│   └── socialAuthService.js     # Main social auth service
├── components/
│   └── common/
│       └── SocialLoginButtons.jsx  # Enhanced UI component
├── api/
│   └── authService.js           # API integration
└── pages/
    └── auth/
        ├── Login.jsx            # Login page with social auth
        └── Register.jsx         # Registration page with social auth
```

### Backend Integration
- RESTful API endpoint: `POST /api/v1/auth/social-login`
- Automatic user creation/linking
- Token generation and validation
- Provider-specific user data handling

## 🎯 User Experience

### Login Flow
1. User clicks social login button
2. Beautiful loading animation appears
3. Provider's OAuth popup opens
4. User authorizes the application
5. Automatic redirect to dashboard
6. Success notification displayed

### Error Handling
- Network connectivity issues
- Provider authorization failures
- Invalid or expired tokens
- User cancellation scenarios

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly button sizing
- Mobile-optimized OAuth flows
- Progressive Web App compatibility

## 🔍 Testing

### Development Testing
1. Start the frontend development server
2. Navigate to login/register pages
3. Click social login buttons
4. Verify demo messages appear
5. Check console for detailed logs

### Production Testing
1. Configure real OAuth credentials
2. Test on multiple devices and browsers
3. Verify user data extraction
4. Test error scenarios
5. Validate security measures

## 🚨 Important Notes

- **Never commit real OAuth credentials** to version control
- Use environment variables for all sensitive data
- Test thoroughly before production deployment
- Monitor OAuth usage and quotas
- Keep SDK versions updated for security

## 📞 Support

For issues with social authentication setup:
1. Check browser console for detailed error messages
2. Verify OAuth credentials and configuration
3. Test with different browsers and devices
4. Review provider-specific documentation
5. Contact the development team for assistance
