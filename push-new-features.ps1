# Push all new features to GitHub
Write-Host "Pushing all new features to GitHub..." -ForegroundColor Green

# Add all new files
git add frontend/src/components/notifications/NotificationSystem.jsx
git add frontend/src/components/calendar/ExamCalendar.jsx
git add frontend/src/components/onboarding/OnboardingTour.jsx
git add frontend/src/components/common/KeyboardShortcuts.jsx
git add frontend/src/pages/NotificationsPage.jsx
git add frontend/src/pages/CalendarView.jsx
git add frontend/src/components/layout/ResponsiveLayout.jsx

# Add modified files
git add frontend/src/components/layout/ResponsiveNavbar.jsx
git add frontend/src/ResponsiveApp.jsx

# Commit the changes
git commit -m "Add new features: real-time notifications, calendar view, onboarding tour, keyboard shortcuts"

# Push to GitHub
git push origin main

Write-Host "All new features pushed successfully!" -ForegroundColor Green
