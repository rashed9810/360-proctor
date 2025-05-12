# Change to the repository root directory
Set-Location -Path "E:\FastAPI\auto-proctoring-system"

# Add specific files
Write-Host "Adding files..."
git add "frontend/src/App.jsx"
git add "frontend/src/i18n/locales/en/translation.json"
git add "frontend/src/pages/Register.jsx"
git add "frontend/src/pages/auth/Login.jsx"
git add "frontend/src/pages/auth/Register.jsx"
git add "frontend/src/components/common/BackgroundPattern.jsx"
git add "frontend/src/components/common/IconInput.jsx"
git add "frontend/src/components/common/PasswordStrengthMeter.jsx"
git add "frontend/src/components/common/SocialLoginButtons.jsx"

# Commit the changes
Write-Host "Committing changes..."
git commit -m "Enhance auth pages with modern UI: Add SVG backgrounds, animations, and improved form validation"

# Push the changes to the remote repository
Write-Host "Pushing to remote..."
git push origin main

# Display the status
Write-Host "Done!"
git status

# Wait for user input before closing
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
