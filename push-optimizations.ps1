# Push optimizations to GitHub
Write-Host "Pushing optimizations to GitHub..." -ForegroundColor Green

# Add the modified files
git add frontend/src/ResponsiveApp.jsx
git add frontend/vite.config.js

# Commit the changes
git commit -m "Optimize build with code splitting and lazy loading"

# Push to GitHub
git push origin main

Write-Host "Changes pushed successfully!" -ForegroundColor Green
