# Push all remaining changes to GitHub
Write-Host "Pushing all remaining changes to GitHub..." -ForegroundColor Green

# Add all modified files
git add frontend/src/components/common/ThemeToggle.jsx
git add frontend/src/components/common/UserProfileDropdown.jsx
git add frontend/src/components/dashboard/StatCard.jsx
git add frontend/src/pages/Dashboard.jsx

# Add new files
git add frontend/src/components/common/FeedbackForm.jsx
git add frontend/src/components/dashboard/QuickActionPanel.jsx

# Commit the changes
git commit -m "Implement frontend improvements and new features"

# Push to GitHub
git push origin main

Write-Host "All changes pushed successfully!" -ForegroundColor Green
