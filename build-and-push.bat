@echo off
echo Building and pushing updated code...

cd frontend
echo Running build with optimized configuration...
npm run build

echo Committing changes to Git...
cd ..
git add frontend/vite.config.js
git add frontend/src/ResponsiveApp.jsx
git commit -m "Optimize build configuration with code splitting and lazy loading"

echo Pushing changes to GitHub...
git push

echo Done!
pause
