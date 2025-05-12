@echo off
cd /d E:\FastAPI\auto-proctoring-system

echo Adding files...
git add frontend\src\App.jsx
git add frontend\src\i18n\locales\en\translation.json
git add frontend\src\pages\Register.jsx
git add frontend\src\pages\auth\Login.jsx
git add frontend\src\pages\auth\Register.jsx
git add frontend\src\components\common\BackgroundPattern.jsx
git add frontend\src\components\common\IconInput.jsx
git add frontend\src\components\common\PasswordStrengthMeter.jsx
git add frontend\src\components\common\SocialLoginButtons.jsx

echo Committing changes...
git commit -m "Enhance auth pages with modern UI: Add SVG backgrounds, animations, and improved form validation"

echo Pushing to remote...
git push origin main

echo Done!
git status
pause
