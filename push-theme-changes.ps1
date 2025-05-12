# Push theme changes to GitHub
Write-Host "Pushing theme changes to GitHub..." -ForegroundColor Green

# Add the modified files
git add frontend/src/context/ThemeContext.jsx
git add frontend/src/components/common/ThemeToggle.jsx

# Commit the changes
git commit -m "Remove system theme option, simplify to light/dark mode only"

# Push to GitHub
git push origin main

Write-Host "Theme changes pushed successfully!" -ForegroundColor Green
