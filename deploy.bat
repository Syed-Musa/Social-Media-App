@echo off
REM Deployment script for SocialPost application on Windows

echo 🚀 Starting deployment process...

REM Check if we're in the right directory
if not exist "backend" (
    echo ❌ Error: Please run this script from the root directory of the project
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Error: Please run this script from the root directory of the project
    pause
    exit /b 1
)

echo 📦 Installing backend dependencies...
cd backend
npm install

echo 📦 Installing frontend dependencies...
cd ..\frontend
npm install

echo 🏗️ Building frontend...
npm run build

echo ✅ Deployment preparation complete!
echo.
echo Next steps:
echo 1. Create accounts on Render and MongoDB Atlas
echo 2. Set up your environment variables
echo 3. Deploy backend as a Web Service on Render
echo 4. Deploy frontend as a Static Site on Render
echo.
echo See README.md for detailed deployment instructions
pause